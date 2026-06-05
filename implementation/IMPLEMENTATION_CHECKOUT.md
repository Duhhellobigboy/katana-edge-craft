# Implementation Plan: Supabase & Stripe E-Commerce Checkout

We need to add a dedicated e-commerce checkout page to the Katana Edge website using Supabase + Stripe. 

Since this project is built on **TanStack Start** (which runs on the **Nitro** server engine with a **Vercel** deployment preset), the application is fully full-stack. We can run backend code, handle serverless APIs (like Stripe webhooks), and perform secure database operations directly in this repository without needing a separate backend.

---

## 1. Technical Architecture & Backend Approach

### Full-Stack Architecture in TanStack Start
- **Client-Side**: React components, routing, and user interface.
- **Server Functions (`createServerFn`)**: TanStack Start helper functions that run securely on the server. Used for creating Stripe Checkout Sessions, validating cart pricing, and interacting with Supabase using the service role key.
- **API routes**: Standard HTTP endpoints (for Stripe Webhook, etc.) defined using standard TanStack file-based routes (e.g. `src/routes/api/stripe-webhook.ts`) with `server.handlers`.

### Security Best Practices
- **Passwords**: Never stored manually. Supabase Auth handles email/password registration and authentication natively.
- **Card Details**: Never processed or stored in Supabase or our server. Stripe Checkout handles all payment security and PCI compliance.
- **Keys Separation**:
  - `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY`: Publicly accessible client-side variables.
  - `SUPABASE_SERVICE_ROLE_KEY` & `STRIPE_SECRET_KEY`: Server-side only, accessed via `process.env`.

---

## 2. Required Supabase Database Schema

To support checkout, order management, and automation, we will define four main tables in Supabase:

```sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES Table (Extends Supabase Auth users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Trigger to automatically create a profile when a user registers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        new.id,
        new.email,
        new.raw_user_meta_data->>'full_name'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. STRIPE CHECKOUT SESSIONS Table (Tracks session status)
CREATE TABLE public.stripe_checkout_sessions (
    id TEXT PRIMARY KEY, -- Stripe Session ID: cs_test_...
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL, -- pending, completed, expired
    amount_total INTEGER NOT NULL, -- in cents
    currency TEXT NOT NULL DEFAULT 'usd',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. ORDERS Table (Created on payment success)
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    stripe_session_id TEXT REFERENCES public.stripe_checkout_sessions(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'processing', -- processing, shipped, completed, cancelled
    payment_status TEXT NOT NULL DEFAULT 'unpaid', -- paid, unpaid, refunded
    amount_total INTEGER NOT NULL, -- in cents
    shipping_address JSONB, -- stores formatted name, line1, line2, city, state, postal_code, country
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. ORDER ITEMS Table (Details of each order)
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_slug TEXT NOT NULL, -- fujisan-thinning-scissors or micro-slit-scissors
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price INTEGER NOT NULL, -- in cents
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
```

### Row Level Security (RLS) Policies
- **Profiles**:
  - `SELECT`: Authenticated users can read their own profile.
  - `UPDATE`: Authenticated users can update their own profile.
- **Stripe Checkout Sessions**:
  - `SELECT`: Authenticated users can read their sessions.
  - `INSERT/UPDATE`: Server-side `service_role` handles Stripe events (no public insert/update allowed).
- **Orders & Order Items**:
  - `SELECT`: Authenticated users can view their orders/items.
  - `INSERT/UPDATE`: Server-side Stripe webhook handles creation (no public insert/update allowed).

---

## 3. Stripe Checkout Flow

### A. Stripe Checkout Session Creation
1. Client adds items to the Cart (stored in React state/local storage).
2. Client navigates to `/checkout` and authenticates or logs in.
3. Authenticated user clicks "Proceed to Payment".
4. Client triggers a server function `createStripeCheckoutSession({ cartItems })`:
   - Validates the user's Supabase session.
   - Fetches product details and pricing server-side from `src/lib/products.ts` (ensures the client cannot tamper with prices).
   - Creates a Stripe Checkout Session with shipping address collection enabled, customer email pre-filled, and metadata containing the `user_id` and serialized `cartItems`.
   - Inserts a record in `stripe_checkout_sessions` table with status `pending`.
   - Returns the Checkout Session URL.
5. Client redirects the browser directly to Stripe: `window.location.href = session.url`.

### B. Stripe Webhook Handling (`/api/stripe-webhook`)
Stripe calls our POST endpoint at `/api/stripe-webhook` upon successful checkout.
1. The server retrieves the raw request body and the `stripe-signature` header.
2. The server verifies the event signature using `stripe.webhooks.constructEvent` and `STRIPE_WEBHOOK_SECRET`.
3. If verified, the server processes the `checkout.session.completed` (or `checkout.session.async_payment_succeeded`) event:
   - Fetches the Checkout Session object from Stripe (including line items if needed, or parses metadata).
   - Updates `stripe_checkout_sessions` status to `completed` in Supabase.
   - Creates a record in `orders` (setting status = `processing`, payment_status = `paid`, and parsing Stripe's shipping details).
   - Creates records in `order_items` matching the purchased products.
   - Calls the **n8n Automation Webhook** to trigger post-purchase workflows (email confirmation, shipping label creation, etc.).
4. Returns a `200 OK` response to Stripe.

---

## 4. Success and Cancelled States

- **Cancelled Payment State**:
  - If a user cancels in the Stripe Checkout interface, they are redirected back to `/checkout?cancelled=true`.
  - We display a prominent warning banner explaining the payment was not completed and allowing them to try again.
- **Success Page (`/checkout/success`)**:
  - Stripe redirects to `/checkout/success?session_id=cs_test_...`.
  - The page calls a server function to fetch the order details associated with the session ID.
  - Displays a premium, themed confirmation screen showing order items, shipping details, and estimated delivery, along with subtle micro-animations (e.g. scaling checkmark).

---

## 5. n8n Automation Webhook

Once the order is successfully written to the database during the Stripe Webhook processing, the server will trigger the `N8N_WEBHOOK_URL` via a POST request:

```json
// POST payload to n8n
{
  "orderId": "uuid-order-id",
  "stripeSessionId": "cs_test_...",
  "customer": {
    "userId": "uuid-user-id",
    "email": "customer@example.com",
    "name": "John Doe"
  },
  "shippingAddress": {
    "name": "John Doe",
    "line1": "123 Main St",
    "line2": null,
    "city": "San Francisco",
    "state": "CA",
    "postalCode": "94103",
    "country": "US"
  },
  "items": [
    {
      "productSlug": "fujisan-thinning-scissors",
      "productName": "Fujisan Thinning Scissors",
      "quantity": 1,
      "unitPrice": 18900
    }
  ],
  "totals": {
    "subtotal": 18900,
    "shipping": 0,
    "tax": 0,
    "total": 18900
  },
  "timestamp": "2026-06-05T20:48:46Z"
}
```

---

## 6. Required Environment Variables

Add the following to `.env`:

```env
# SUPABASE
VITE_SUPABASE_URL=https://iwvsohxgebazsqspvpxk.supabase.co
VITE_SUPABASE_ANON_KEY=PASTE_SUPABASE_ANON_KEY_HERE
SUPABASE_SERVICE_ROLE_KEY=PASTE_SUPABASE_SERVICE_ROLE_KEY_HERE

# STRIPE
STRIPE_SECRET_KEY=sk_test_PASTE_STRIPE_SECRET_KEY_HERE
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_PASTE_STRIPE_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_PASTE_WEBHOOK_SECRET_HERE

# SITE
VITE_SITE_URL=http://localhost:5173

# AUTOMATION
N8N_WEBHOOK_URL=https://n8n.supplyexchain.com/webhook/99ad3022-a7d5-457d-b0c0-9ab51c58e910
```

---

## 7. Files to Create and Modify

### New Files to Create

1. **`src/hooks/useCart.tsx`**
   - Context provider for managing the shopping cart items in local storage.
   - Provides hooks: `useCart`, methods: `addItem`, `removeItem`, `updateQuantity`, `clearCart`.

2. **`src/components/site/CartDrawer.tsx`**
   - Slide-over drawer (using Radix/Vaul) linked to the header's cart icon. Shows cart items, subtotal, and a checkout button.

3. **`src/lib/supabase.ts`**
   - Client-side Supabase client initialization using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

4. **`src/lib/supabase.server.ts`**
   - Server-side Supabase client using the service role key (`SUPABASE_SERVICE_ROLE_KEY`). Used in Stripe webhooks and server functions.

5. **`src/lib/stripe.server.ts`**
   - Stripe instance initialization using `STRIPE_SECRET_KEY`.

6. **`src/lib/checkout.functions.ts`**
   - `createStripeCheckoutSession`: Server function (`createServerFn`) to create Stripe sessions.
   - `getOrderDetailsBySession`: Server function to fetch order details for the success page.

7. **`src/routes/checkout.tsx`**
   - E-commerce checkout route.
   - If user is not authenticated: Shows a beautiful, black-and-gold styled Supabase Auth login/signup form.
   - If user is authenticated: Displays shipping selection, cart overview, and the "Pay with Stripe" CTA.
   - Handles the cancelled URL query parameter `?cancelled=true`.

8. **`src/routes/checkout.success.tsx`**
   - Success redirect page, displays ordered items and success checkmark.

9. **`src/routes/api/stripe-webhook.ts`**
   - Server route handling `POST` webhook requests from Stripe.

### Existing Files to Modify

1. **`package.json`**
   - Add packages: `@supabase/supabase-js`, `stripe`.

2. **`src/components/site/Header.tsx`**
   - Connect the cart icon to open the new `CartDrawer`.
   - Update user profile icon to link to `/checkout` or dashboard, displaying loading/auth status.

3. **`src/routes/products.$slug.tsx`**
   - Connect the "Add to Cart" button to the new `useCart` hook to actually add the product.

---

## 8. Verification & Test Plan

1. **Cart System**: Verify products add, remove, and adjust quantities correctly with local storage persistence.
2. **Authentication**: Sign up a test user in `/checkout` and ensure their record is created in Supabase Auth & public `profiles` table.
3. **Session Creation**: Verify clicking "Pay with Stripe" calls `createStripeCheckoutSession`, writes a record in `stripe_checkout_sessions`, and redirects to the Stripe hosted page.
4. **Webhook Testing**: Use Stripe CLI (`stripe listen --forward-to localhost:5173/api/stripe-webhook`) to test local webhook handling. Verify database tables (`orders`, `order_items`, updated `stripe_checkout_sessions`) are populated.
5. **n8n Verification**: Verify webhook call is sent to the automation URL on payment completion.
6. **Success Page**: Verify redirection back to `/checkout/success?session_id=...` displays order summary.
