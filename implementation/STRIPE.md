# Stripe Payment Implementation Plan

## 1. Overview

We are implementing a hybrid checkout/application payment flow. This flow combines a simple application/customer information intake step on our platform with Stripe's secure payment processing.

The payment journey is structured as follows:
1. **Homepage / Modal CTA**: The user initiates the flow by clicking an "Apply Now" (or similar) Call-to-Action button.
2. **Apply Route (`/apply`)**: The user is navigated to the customer/application info form on our site. They fill out their basic contact, application, or shipping info.
3. **Session Creation (Backend)**: When the form is submitted, the server-side backend generates a Stripe Checkout Session using the designated Stripe Price ID.
4. **Stripe Checkout Redirect**: The application redirects the user to the Stripe-hosted Checkout page.
5. **Secure Payment Processing**: Stripe securely processes the user's card or alternative payment methods.
6. **Payment Outcomes**:
   - **Successful Payment**: The user is redirected back to `/success?session_id={CHECKOUT_SESSION_ID}`.
   - **Cancelled Payment**: The user is redirected back to `/apply?cancelled=true`, where the application form displays a cancellation status banner.
7. **Webhook Confirmation**: Stripe fires a `checkout.session.completed` event to our backend webhook URL.
8. **Data Persistence (Supabase)**: The backend processes the webhook event, confirms verification, and persists order details, session logs, and customer information in Supabase.
9. **Automation Dispatch (n8n)**: The backend forwards cleaned order details to the n8n webhook for downstream email confirmations and shipping label generation.

---

## 2. Why Stripe-Hosted Checkout

We utilize **Stripe-Hosted Checkout** to ensure maximum reliability, security, and velocity:
- **Zero Card Handling**: We do not collect, process, or store credit card details or bank credentials in Supabase or on our servers. All sensitive financial transactions happen securely within Stripe's PCI-DSS compliant infrastructure.
- **Lower Development Overhead**: Avoids building and testing complex credit card forms, handling frontend input validation, security tokens, or styling field layouts.
- **Optimized Conversion**: Stripe Checkout handles cross-device optimization, auto-fill, localized payment methods (Apple Pay, Google Pay, etc.), and multi-language translation out of the box.

---

## 3. Required Stripe Dashboard Setup

Before beginning the codebase modifications, set up the Stripe account and credentials:

1. **Log in or Create an Account**: Sign in to the [Stripe Dashboard](https://dashboard.stripe.com/).
2. **Toggle Test Mode**: Make sure the **Test Mode** switch is toggled on in the upper-right corner of the dashboard to use sandboxed test keys.
3. **Obtain API Keys**:
   - Navigate to **Developers** → **API keys**.
   - Copy the **Publishable key** (starts with `pk_test_`). This will be used in frontend configurations.
   - Reveal and copy the **Secret key** (starts with `sk_test_`). This must remain strictly confidential and is only used server-side.
4. **Create a Product**:
   - Go to **Products** and click **Add product**.
   - Input the product name (e.g., "Katana Edge Professional Shears").
   - Under pricing details, select **One-time** and specify the price.
   - Save the product.
   - Under the product's pricing details, copy the **Price ID** (starts with `price_`).
5. **Webhook Configuration**:
   - Go to **Developers** → **Webhooks** and click **Add endpoint**.
   - When deploying to production or a staging URL, set the endpoint URL to `https://your-domain.com/api/stripe-webhook`.
   - Select the **`checkout.session.completed`** event to listen to.
   - Once the webhook is saved, copy the **Signing secret** (starts with `whsec_`) to verify incoming request signatures on the server.
   - *(Optional local testing)*: For local development, download the Stripe CLI and run `stripe listen --forward-to localhost:5173/api/stripe-webhook` to obtain a local webhook signing secret.

---

## 4. Required Environment Variables

Add the following environment variables to your `.env` file:

```env
# STRIPE
STRIPE_SECRET_KEY=sk_test_PASTE_STRIPE_SECRET_KEY_HERE
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_PASTE_STRIPE_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_PASTE_WEBHOOK_SECRET_HERE
STRIPE_PRICE_ID=price_PASTE_STRIPE_PRICE_ID_HERE

# SITE
VITE_SITE_URL=http://localhost:5173

# SUPABASE
VITE_SUPABASE_URL=https://iwvsohxgebazsqspvpxk.supabase.co
VITE_SUPABASE_ANON_KEY=PASTE_SUPABASE_ANON_KEY_HERE
SUPABASE_SERVICE_ROLE_KEY=PASTE_SUPABASE_SERVICE_ROLE_KEY_HERE

# AUTOMATION
N8N_WEBHOOK_URL=PASTE_N8N_WEBHOOK_URL_HERE
```
