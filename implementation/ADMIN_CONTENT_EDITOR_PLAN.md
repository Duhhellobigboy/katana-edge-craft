# Implementation Plan: Admin Content Editor (Restricted Copywriting Scope)

This document outlines the architecture, database schema, security plan, and file changes required to build a cloud-persisted Admin Content Editor for the Katana Edge website. 

The main purpose of this implementation is to allow the client to rewrite copywriting across the website and save it to Supabase from the live Vercel `/admin` page.

---

## 🔒 Crucial Scope Boundaries & Constraints

To prevent configuration errors that could break checkouts or checkout metrics, the following rules are strictly enforced:

1. **Copywriting & Content Only**: This phase is limited strictly to updating text copy, benefits, specifications, and descriptions.
2. **Fixed Product Catalog**: The client/admin **cannot add new products** or **delete existing products** through the interface.
3. **No Pricing Modifications**: The client/admin **cannot edit pricing** (price cents) or currency.
4. **Stripe Settings Locked**: The client/admin **cannot view or edit Stripe Product IDs or Stripe Price IDs**. These values remain managed securely in the codebase and environment variables.
5. **No Stripe Synchronization**: No features for automatic Stripe product importing, webhook syncing, or product lifecycle triggers will be built.
6. **No Transactional Modifications**: The admin console will have **no write access** to database tables for `checkout_sessions`, `orders`, or `order_items`.
7. **Checkout Independence**: All customer-facing checkout processes, Stripe redirects, and Calendly workflows remain completely untouched and separate. Customer checkout remains **guest-only**.
8. **Developer-Managed Extensions**: Adding new items, changing prices, or modifying Stripe API models in the future will be handled exclusively by a developer through Git/GitHub.

---

## 1. Current Project Inspection

- **Framework**: TanStack Start (Vite 7 + Nitro engine with Vercel deployment preset).
- **Routing System**: TanStack Router file-based routing inside `src/routes/`.
- **Server/API Route Style**: Serverless API routes defined using `createFileRoute("/route")` with `server.handlers` and server-side RPC functions using `createServerFn`.
- **Existing Env Loading**: Public environment variables prefix with `VITE_` (for client). Secrets loaded inside server functions and API endpoints using Node's `process.env`.
- **Auth Status**: E-commerce checkouts and application flows are entirely guest-only. No custom user databases or auth profiles tables exist.

---

## 2. Existing Admin Login/Session Files

The current admin login framework resides in the following files:
- `src/lib/admin.server.ts`: Handles session token crypto (HMAC SHA-256) and parses request cookies. Exposes `checkAdminSession(request)`.
- `src/lib/admin.functions.ts`: Defines `checkAdminAuth` server function used for client-side route queries.
- `src/routes/login.tsx`: Renders the login UI card, validating credentials.
- `src/routes/admin.tsx`: Securely guards the `/admin` workspace route via a `beforeLoad` check.
- `src/routes/api/admin/login.ts`: POST API route checking the password and setting the `admin_session` cookie.
- `src/routes/api/admin/logout.ts`: POST API route expiring the `admin_session` cookie.

---

## 3. Existing Supabase Server/Client Setup

We communicate with Supabase using:
- **Client-Side** (`src/lib/supabase.ts`): Initialized using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to read public configurations or trigger checkouts.
- **Server-Side** (`src/lib/supabase.server.ts`): Initialized using the administrative `SUPABASE_SERVICE_ROLE_KEY` to perform write operations (such as processing Stripe orders or webhooks) bypassing public RLS limits.

---

## 4. Existing Product Data Source

- **Codebase Data**: Currently defined in `src/lib/products.ts` (defines `Product` type and static `products` array).
- **Supabase Data**: The live `products` table in database `iwvsohxgebazsqspvpxk` contains the following columns:
  - `id` (uuid, primary key)
  - `name` (text)
  - `slug` (text)
  - `description` (text)
  - `image_url` (text, nullable)
  - `price_cents` (integer)
  - `currency` (text)
  - `active` (boolean)
  - `stripe_price_id` (text, nullable)
  - `stripe_product_id` (text, nullable)
  - `product_key` (text, nullable) - e.g. `microslit` or `fujisan`

---

## 5. Existing Hardcoded Copy Locations

The static copywriting we will migrate to Supabase is located in:
- **Homepage copy**: `src/routes/index.tsx` (Hero title, subtitle, CTA text)
- **About copy**: `src/routes/about.tsx` (About details, brand statements)
- **FAQs**: `src/routes/faq.tsx` (Hardcoded array of questions and answers)
- **Reviews**: `src/routes/reviews.tsx` (Hardcoded array of barber testimonials)
- **Contact details**: `src/routes/contact.tsx` (Support email address)
- **Product copywriting**: `src/lib/products.ts` (tagline, descriptions, specs, features, benefits, FAQs)

---

## 6. Database Schema and SQL Migration Needed

Run the following SQL migration in the Supabase query editor to set up the admin editor tables:

```sql
-- 1. SITE CONTENT Table (For general text blocks, titles, contact emails, SEO)
CREATE TABLE public.site_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    label TEXT,
    value TEXT,
    type TEXT NOT NULL DEFAULT 'text', -- text, textarea, html
    section TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Select policy: Allow anyone to read
CREATE POLICY "Allow public read access to site_content" 
ON public.site_content FOR SELECT USING (true);

-- Write policies: Authenticated service role only (handled by API routes)

-- 2. FAQs Table (For general site FAQs)
CREATE TABLE public.faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Select policy: Allow anyone to read
CREATE POLICY "Allow public read access to faqs" 
ON public.faqs FOR SELECT USING (true);

-- 3. TESTIMONIALS Table (For general reviews)
CREATE TABLE public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    quote TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Select policy: Allow anyone to read
CREATE POLICY "Allow public read access to testimonials" 
ON public.testimonials FOR SELECT USING (true);

-- 4. ALIGN PRODUCTS TABLE (Add copywriting-only columns)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS tagline TEXT,
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS long_description TEXT,
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS benefits JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS use_cases JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS specs JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS faq JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS compare_at_cents INTEGER;
```

---

## 7. Seed/Default Content Strategy

We will write SQL seed statements using the default copy. If these records are loaded into Supabase, the page loader will fetch them; if not, the system will use codebase fallbacks.

```sql
-- Seed Site Content
INSERT INTO public.site_content (key, label, value, type, section) VALUES
('home.hero.title', 'Hero Title', 'Precision Crafted. Professionally Trusted.', 'text', 'home'),
('home.hero.subtitle', 'Hero Subtitle', 'Premium Japanese-inspired professional barber scissors and shears.', 'textarea', 'home'),
('home.hero.cta', 'Hero CTA Button', 'Shop Now', 'text', 'home'),
('about.brand.statement', 'About Brand Statement', 'We believe your shears are an extension of your hand.', 'textarea', 'about'),
('contact.support.email', 'Support Email', 'support@katanaedge.com', 'text', 'contact'),
('seo.title', 'Default SEO Title', 'Katana Edge — Professional Barber Scissors & Shears', 'text', 'seo'),
('seo.description', 'Default SEO Description', 'Premium Japanese-inspired barber scissors and shears.', 'textarea', 'seo')
ON CONFLICT (key) DO NOTHING;

-- Seed Products Copy
-- Note: Fujisan & Microslit prices are already bound locally; we update copy columns matching product_key
UPDATE public.products 
SET 
  tagline = 'Effortless blending. Invisible transitions.',
  short_description = 'Precision-engineered 30-tooth thinning shears for seamless blends...',
  long_description = 'The Fujisan is built for the moment between cuts...',
  features = '[{"title": "30 V-Cut Teeth", "description": "Calibrated 25-30% removal per pass"}]'::jsonb,
  specs = '[{"label": "Length", "value": "6.0 inches"}, {"label": "Steel", "value": "440C Japanese"}]'::jsonb,
  faq = '[{"q": "How much hair does it remove?", "a": "Roughly 25-30%."}]'::jsonb
WHERE product_key = 'fujisan';

UPDATE public.products 
SET 
  tagline = 'Surgical precision. Invisible texture.',
  short_description = 'Micro-serrated straight blades for clean perimeter work...',
  long_description = 'The Micro Slit is what you reach for when the cut has to be perfect...',
  features = '[{"title": "Laser-Etched Serrations", "description": "Grips hair instantly"}]'::jsonb,
  specs = '[{"label": "Length", "value": "6.0 inches"}, {"label": "Steel", "value": "ATS-314 Cobalt"}]'::jsonb,
  faq = '[{"q": "Are they suitable for slide cutting?", "a": "No, serrations grip the hair."}]'::jsonb
WHERE product_key = 'microslit';
```

---

## 8. Admin Editor Architecture

The `/admin` dashboard will feature a tabbed panel designed with the brand's dark luxury style:
1. **Sidebar/Tab Menu**:
   - 🏠 Homepage Copy
   - ✂️ Product Copy
   - 💬 FAQs List
   - 🌟 Testimonials
   - ⚙️ Contact & SEO
2. **Tab 1: Homepage Copy**:
   - Form fields mapping `home.hero.title`, `home.hero.subtitle`, `home.hero.cta`.
   - Single "Save Homepage Details" button.
3. **Tab 2: Product Copy**:
   - Dropdown selection strictly limited to existing items (**Micro Slit** and **Fujisan** only).
   - *Constraint Check: Product addition, product deletion, price edits, currency settings, Stripe product IDs, and Stripe price IDs are completely excluded from the code and UI.*
   - Inputs for:
     - Name display text
     - Tagline
     - Short description
     - Long description
     - Features (Array editor)
     - Benefits (Array editor)
     - Specifications (Array editor)
     - FAQ items (Array editor)
     - Image URL
4. **Tab 3: FAQs**:
   - List view of all general FAQs.
   - Interactive widgets to Add New FAQ, Edit Question/Answer, Sort Order, Delete.
5. **Tab 4: Testimonials**:
   - List view of barber reviews.
   - Add/Edit name, review text, and star ratings.
6. **API Handlers**:
   - Operations communicate with protected endpoints (`/api/admin/content`, `/api/admin/products`, `/api/admin/faqs`, `/api/admin/testimonials`) via POST requests.
   - Upon successful save, displays a transient green notification overlay.

---

## 9. Public Website Content Loading Strategy

To keep the page load times optimal and secure against database downtime, we will use a **"Hybrid Fallback Strategy"**:

1. **Loader Integration**:
   - We will write TanStack Router `loader` routines on public routes.
   - The loaders will query Supabase for page-relevant rows.
2. **Fallback Logic**:
   - If the database returns null, is empty, or the fetch fails, the frontend automatically falls back to our local codebase constants (e.g. hardcoded FAQ array, default Hero copy).
   - This ensures the website never crashes due to database network anomalies.

```typescript
// Example fallback loader utility:
export async function getSiteCopy(key: string, fallbackValue: string): Promise<string> {
  try {
    const { data } = await supabase
      .from("site_content")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    return data?.value || fallbackValue;
  } catch (error) {
    return fallbackValue;
  }
}
```

---

## 10. Product Copy Editing Strategy

To prevent administrative changes from breaking Stripe webhooks or pricing:
- The checkout backend uses the environment-provided Stripe Price IDs (`STRIPE_MICROSLIT_PRICE_ID`, `STRIPE_FUJISAN_PRICE_ID`) to verify and create sessions.
- In the `/admin` editor, we completely exclude inputs for prices, Stripe IDs, and currency.
- Copy edits only write to textual columns (`tagline`, `description`, `features` JSONB arrays, etc.).

---

## 11. Security Plan

- **HTTP-only Session Validation**: Every API route handler under `/api/admin/` first executes `checkAdminSession(request)` using the signed cookie. Unauthorized attempts are rejected with `401 Unauthorized`.
- **Server-Side Supabase Operations**: Data modifications are executed on the Nitro server using the `SUPABASE_SERVICE_ROLE_KEY` bypass, keeping write capabilities disabled in public clients.
- **Credential Safety**: `ADMIN_SESSION_SECRET` and `SUPABASE_SERVICE_ROLE_KEY` are accessed strictly in server modules (`*.server.ts` or API route files) and never imported in client views.

---

## 12. Files Likely to Create/Modify

### New Files to Create

1. **`src/lib/content.ts`**
   - Public content fetchers and fallback constants.
2. **`src/routes/api/admin/content.ts`**
   - API handler protecting write operations to the `site_content` table.
3. **`src/routes/api/admin/products.ts`**
   - API handler protecting write operations to the `products` table copy columns.
4. **`src/routes/api/admin/faqs.ts`**
   - API handler managing inserts/updates/deletes in the `faqs` table.
5. **`src/routes/api/admin/testimonials.ts`**
   - API handler managing testimonials in the `testimonials` table.

### Existing Files to Modify

1. **`src/routes/admin.tsx`**
   - Replace the protected placeholder with the complete content editor UI (forms, tabs, save logic).
2. **`src/routes/index.tsx`**
   - Load homepage copy from loader using hybrid fallbacks.
3. **`src/routes/about.tsx`**
   - Load brand statements from loader.
4. **`src/routes/faq.tsx`**
   - Load FAQ items from loader.
5. **`src/routes/reviews.tsx`**
   - Load reviews list from loader.
6. **`src/routes/products.$slug.tsx`**
   - Fetch product details from Supabase inside the loader, falling back to static config if not present.

---

## 13. Env Variables Needed

Use the existing configured environment variables in the `.env` file:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

*No new environment variables are required.*

---

## 14. Testing Checklist

- [ ] **Access Gate**: Going to `/admin` without logging in redirects to `/login`.
- [ ] **Homepage Save**: Edit hero title in admin workspace, click save, verify change persists on the home page after reload.
- [ ] **Product Copy Save**: Edit product tagline, verify details update on product detail slug page.
- [ ] **FAQ Actions**: Add a new FAQ, edit it, re-sort it, delete it, and verify changes reflect on `/faq`.
- [ ] **Testimonial Actions**: Add, edit, delete testimonials, and check the `/reviews` page.
- [ ] **Fallbacks Verification**: Set invalid Supabase keys in local `.env` to simulate a DB crash; confirm the public website loads static copy correctly.
- [ ] **Webhook Safety**: Run E2E test cart checkout; verify Stripe checkout redirect and payments webhook function without pricing errors.

---

## 15. Deployment Checklist

1. Execute the SQL migration statements in your Supabase project sql editor.
2. Confirm `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` variables are active in Vercel settings.
3. Deploy the content editor branch.
4. Log into `/login` on your production site, configure copy via `/admin`, and verify updates reflect instantly.

---

## 16. Open Questions Before Coding

> [!WARNING]
> **1. Image Management**: Should the client be able to upload images (which requires configuring Supabase Storage buckets), or can they simply input the Image URL path in the form?
> 
> **2. Specifications Editing**: Since specifications lists represent structural objects (e.g. `Length`, `Steel`, `Weight`), should we provide raw JSON input edit fields or a list mapping key-value fields? Key-value forms are usually safer for non-technical clients.
