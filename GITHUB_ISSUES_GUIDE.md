# GitHub Issues Guide: Stripe + Supabase Apply Flow

Implementation guide for the **Apply → Stripe Checkout → Success → Webhook → Supabase → n8n** payment flow.

---

## Pre-Implementation Audit (2026-06-05)

> **Status:** Discovery complete. **Do not start coding** until open questions below are resolved and Stripe env vars are populated.

### Tool & connection verification

| Check | Result |
|-------|--------|
| **GitHub MCP** | **Not connected** in this workspace. No GitHub MCP server in Cursor MCP config. `gh` CLI is **installed** (`/opt/homebrew/bin/gh`) but **not authenticated** (`gh auth login` required). Git remote: `https://github.com/Duhhellobigboy/katana-edge-craft.git`. Live issues (2026-06-05): **#1** open (product pages); **no Sentry issue** — create **Issue 14** below. |
| **Stripe MCP** | **Not available.** No Stripe MCP server in workspace MCP folder. `stripe` CLI is **not installed**. Stripe work must use Dashboard + manual CLI install. |
| **Supabase MCP** | **Connected** (OAuth authenticated). Project `iwvsohxgebazsqspvpxk` — `ACTIVE_HEALTHY`, Postgres 17, region `us-west-2`. |
| **Local dev** | **Runs.** `npm run dev` → Vite ready at **`http://localhost:8080/`** (not 5173). `GET /` and `GET /checkout` return **200**. |
| **Docker** | **Docker daemon available**, but repo has **no `Dockerfile` or `docker-compose.yml`**. App cannot be container-tested until a container setup is added. |

### Current project findings

| Area | Verified state |
|------|----------------|
| Framework | **TanStack Start** on **Vite 7** + **Nitro** (Vercel preset) — confirmed via `package.json`, `vite.config.ts` |
| Routing | TanStack Router file routes under `src/routes/` |
| Dev port | **`8080`** (Lovable sandbox config). Code fallbacks still default to `5173` in `checkout.functions.ts` when `VITE_SITE_URL` is unset |
| Packages | `@supabase/supabase-js` and `stripe` **already installed** — no new installs needed for baseline flow |
| Homepage CTA | Links to `/products` ("Shop Now") — **no "Apply Now" modal or `/apply` route** |
| Apply page | **Missing** — `src/routes/apply.tsx` does not exist |
| Legacy checkout | `src/routes/checkout.tsx` — cart + Supabase Auth + dynamic `price_data` line items |
| Legacy success | `src/routes/checkout.success.tsx` → `/checkout/success` |
| Webhook | `src/routes/api/stripe-webhook.ts` → `POST /api/stripe-webhook` |
| Server functions | `src/lib/checkout.functions.ts` — cart/auth-oriented `createStripeCheckoutSession`, `getOrderDetailsBySession` |
| Env file | **`.env` only** (listed in `.gitignore`). **No `.env.local`** present |

### Critical schema mismatch (code vs live Supabase)

The live database schema **does not match** what `IMPLEMENTATION_CHECKOUT.md` or the current webhook/server code expect.

| Expected by code / old docs | Live Supabase (`iwvsohxgebazsqspvpxk`) |
|-----------------------------|----------------------------------------|
| `stripe_checkout_sessions` | **`checkout_sessions`** (different name & columns) |
| `orders.status`, `orders.amount_total`, `orders.shipping_address` (JSONB) | **`orders.fulfillment_status`**, **`orders.total_cents`**, flat `shipping_*` columns |
| `order_items.product_slug`, `order_items.unit_price` | **`order_items.product_id`**, **`order_items.unit_price_cents`**, **`order_items.total_price_cents`** |
| `applications` table (recommended for apply flow) | **Does not exist** |
| `on_auth_user_created` on `profiles` | **`profiles` exists** (RLS on); trigger present but has security advisor warnings |

**Impact:** Current webhook and `createStripeCheckoutSession` will **fail on DB writes** even after Stripe keys are set. Schema alignment must happen **before** apply-flow feature work.

**Live tables (public):** `profiles`, `products`, `checkout_sessions`, `orders`, `order_items` — all RLS-enabled, 0 rows in checkout/orders.

**`products` seed:** one row (`sample-product`, $149.99) with **`stripe_price_id` = null**.

### Missing / incomplete environment variables

Audited `.env` at project root (values not reproduced here — secrets stay local):

| Variable | Status |
|----------|--------|
| `VITE_SUPABASE_URL` | **Set** |
| `VITE_SUPABASE_ANON_KEY` | **Set** |
| `SUPABASE_SERVICE_ROLE_KEY` | **Set** |
| `N8N_WEBHOOK_URL` | **Set** (`https://n8n.supplyexchain.com/webhook/...`) |
| `STRIPE_SECRET_KEY` | **Empty** |
| `STRIPE_WEBHOOK_SECRET` | **Empty** |
| `STRIPE_PRICE_ID` | **Empty** |
| `VITE_STRIPE_PUBLISHABLE_KEY` | **Missing** (optional for hosted Checkout redirect; add if client-side Stripe.js is needed later) |
| `VITE_SITE_URL` | **Missing** — must be set to **`http://localhost:8080`** for current local dev |

**Action before coding:** Fill all empty Stripe vars from Dashboard / Stripe CLI. Set `VITE_SITE_URL=http://localhost:8080` to match the running dev server.

### Required Stripe Dashboard setup

1. Enable **Test Mode** in [Stripe Dashboard](https://dashboard.stripe.com/).
2. **Developers → API keys:** copy `pk_test_...` → `VITE_STRIPE_PUBLISHABLE_KEY`; `sk_test_...` → `STRIPE_SECRET_KEY`.
3. **Products:** create a one-time product + Price for the apply flow (e.g. Katana Edge application fee or single shear SKU). Copy `price_...` → `STRIPE_PRICE_ID`.
   - Optionally mirror the same Price ID into `public.products.stripe_price_id` if using DB-driven pricing.
4. **Webhooks (production/staging):** endpoint `https://<domain>/api/stripe-webhook`, event `checkout.session.completed` (optional: `checkout.session.async_payment_succeeded`). Copy signing secret → `STRIPE_WEBHOOK_SECRET`.
5. **Local testing:** install Stripe CLI, then:
   ```bash
   stripe listen --forward-to localhost:8080/api/stripe-webhook
   ```
   Use the CLI-printed `whsec_...` as `STRIPE_WEBHOOK_SECRET` locally (differs from Dashboard endpoint secret).

### Required Supabase setup

1. **Project access:** `iwvsohxgebazsqspvpxk` is reachable; MCP authenticated.
2. **Schema decision (blocking):** choose one path:
   - **A)** Migrate/adapt **code** to existing `checkout_sessions` / `orders` / `order_items` column names, **or**
   - **B)** Add migration to create `stripe_checkout_sessions` + align `orders`/`order_items` to what code expects, **or**
   - **C)** New unified schema for apply flow (e.g. `applications` + updated session table) and refactor webhook + server functions together.
3. **`applications` table:** decide if apply-form data lives in a dedicated table or in `checkout_sessions` (`customer_email`, `customer_name`, `phone`, `metadata`).
4. **`products.stripe_price_id`:** populate for sellable SKUs or rely solely on `STRIPE_PRICE_ID` env for apply flow.
5. **RLS:** keep writes server-only (service role in webhook/server functions). Review security advisor warnings on `handle_new_user` when touching auth.
6. **`profiles` / auth:** legacy checkout requires login; apply flow may be **guest** — decide before building `/apply`.

### Docker testing checklist

> Docker is **not yet configured** for this repo. Use this checklist once a `Dockerfile` or compose file exists.

- [ ] Add `Dockerfile` / `docker-compose.yml` (not present today).
- [ ] Inject env via `--env-file .env` or compose `environment:` / `env_file:`.
- [ ] Map host port to app port (dev currently binds **8080**): e.g. `-p 8080:8080`.
- [ ] Set `VITE_SITE_URL` to the **browser URL** (e.g. `http://localhost:8080`).
- [ ] Rebuild image after changing any `VITE_*` var (baked at build time).
- [ ] Stripe CLI on host: `stripe listen --forward-to localhost:8080/api/stripe-webhook`.
- [ ] Smoke: homepage → `/apply` → Stripe test Checkout → `/success?session_id=...`.
- [ ] Cancel path: `/apply?cancelled=true`.
- [ ] Confirm Supabase rows in `checkout_sessions` / `orders` (after schema alignment).
- [ ] Confirm n8n receives POST (URL already in `.env`).

**Until Docker exists:** run E2E on local `npm run dev` at port **8080**.

### Exact implementation order (revised — post-audit)

Do not follow the old issue order blindly. **Schema + secrets first.**

| Step | Work | Blocker? |
|------|------|----------|
| **0** | Resolve open questions below (schema path, auth model, pricing source) | **Yes** |
| **1** | Populate Stripe env vars + `VITE_SITE_URL=http://localhost:8080` | **Yes** |
| **2** | Stripe Dashboard: product/price, webhook or CLI secret | **Yes** |
| **3** | **Supabase schema alignment** — fix table/column mismatch between code and live DB | **Yes** |
| **4** | Install **Stripe CLI** (and optionally `gh` for GitHub issues) | Recommended |
| **5** | Add Docker setup if container testing is required | Optional |
| **6** | Issue 7 — `createApplyCheckoutSession` server function (`STRIPE_PRICE_ID`, `/success` + `/apply` URLs) | After 1–3 |
| **7** | Issue 6 — `/apply` page + form | After 6 |
| **8** | Issue 8 — `/success` page (migrate from `/checkout/success`) | After 6 |
| **9** | Issue 10 — Webhook updates for apply metadata + aligned tables | After 3 |
| **10** | Issue 5 — Homepage "Apply Now" modal/CTA | After 6–7 |
| **11** | Issue 9 — `/checkout` migration or redirect | After apply path works |
| **12** | Issue 11 — n8n payload (application fields) | After 9 |
| **13** | Issue 12 — E2E local (+ Docker when available) | After 6–11 |
| **14** | Issue 13 — Security review | Last |

### Open questions before coding

1. **Schema strategy:** Adapt code to live `checkout_sessions` / `orders` / `order_items`, or migrate DB to match existing code (`stripe_checkout_sessions`, JSONB shipping, etc.)?
2. **Apply flow auth:** Guest checkout (email on form only) vs require Supabase sign-in like legacy `/checkout`?
3. **Price source:** Single `STRIPE_PRICE_ID` env var vs `products.stripe_price_id` from Supabase vs hardcoded product in `src/lib/products.ts`?
4. **Product SKU for apply:** Which item/price represents the apply payment (one shear, deposit, application fee)?
5. **Cart checkout:** Retire `/checkout` and cart flow, or run **parallel** shop + apply journeys?
6. **`applications` table:** Create dedicated table or store apply data in `checkout_sessions.metadata`?
7. **Docker:** Is a `Dockerfile` required for your workflow, or is local `npm run dev` on 8080 sufficient?
8. **GitHub issues tracking:** Install `gh` CLI and/or enable GitHub MCP for this repo?
9. **Success URL:** Confirm final path is `/success` (per `STRIPE.md`) and deprecate `/checkout/success`.
10. **n8n:** Is the existing `N8N_WEBHOOK_URL` the correct production automation endpoint for apply orders?

---

> **Constraints (do not violate)**
> - Use Stripe-hosted Checkout only — no custom card form.
> - Do not store card details in Supabase.
> - Do not expose `STRIPE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY` in frontend code.
> - Keep `/apply` as the application/form page.
> - Keep `/success` as the success page.
> - Reuse existing components and server utilities where they still fit; do not discard working code unless it is broken or duplicate.

---

## Target Flow

```
Homepage / modal CTA ("Apply Now")
  → /apply (customer/application form)
  → "Continue to Payment" (server creates Stripe Checkout Session)
  → Stripe-hosted Checkout
  → success: /success?session_id={CHECKOUT_SESSION_ID}
  → cancel:  /apply?cancelled=true
  → Stripe webhook confirms payment
  → backend saves order to Supabase
  → backend optionally POSTs clean order payload to n8n
```

---

## Issue 1: Confirm Project Structure

**Goal:** Map the repo before writing code. Document findings in this file or a short audit note.

### Checklist

- [ ] Identify framework and routing system.
- [ ] Confirm whether this is Next.js App Router, Vite, or another setup.
- [ ] Confirm current local dev port.
- [ ] Confirm Docker startup command.
- [ ] Confirm existing modal component location.
- [ ] Confirm existing checkout/apply page files.
- [ ] Confirm existing Supabase client files.
- [ ] Confirm whether backend/API routes already work.
- [ ] Document findings before coding.

### Known snapshot (verified 2026-06-05 — see Pre-Implementation Audit above)

| Area | Current state |
|------|---------------|
| Framework | **TanStack Start** on **Vite 7** + **Nitro** (Vercel preset) — **not** Next.js |
| Routing | **TanStack Router** file-based routes under `src/routes/` |
| Default dev port | **`http://localhost:8080`** (Lovable/Vite). Code fallbacks still use `5173` if `VITE_SITE_URL` unset — set env explicitly |
| Docker | No `Dockerfile` / `docker-compose` — Docker daemon available but app not containerized yet |
| Homepage CTA | `src/routes/index.tsx` — hero links to `/products`; no "Apply Now" modal yet |
| Modal primitives | `src/components/ui/dialog.tsx` (Radix Dialog) — reuse for homepage modal |
| Apply page | **Does not exist** — needs `src/routes/apply.tsx` |
| Checkout page | `src/routes/checkout.tsx` — cart + Supabase Auth + Stripe redirect (legacy e-commerce flow) |
| Success page | `src/routes/checkout.success.tsx` → route path `/checkout/success` (needs migration to `/success`) |
| Stripe webhook | `src/routes/api/stripe-webhook.ts` → `POST /api/stripe-webhook` |
| Server functions | `src/lib/checkout.functions.ts` (`createStripeCheckoutSession`, `getOrderDetailsBySession`) |
| Stripe server helper | `src/lib/stripe.server.ts` |
| Supabase browser client | `src/lib/supabase.ts` (anon key only) |
| Supabase server client | `src/lib/supabase.server.ts` (service role — server-only) |
| Cart references | `src/components/site/CartDrawer.tsx`, `src/components/site/Header.tsx` link to `/checkout` |
| Existing docs | `implementation/STRIPE.md`, `implementation/IMPLEMENTATION_CHECKOUT.md` (cart-checkout era — cross-check, do not blindly overwrite) |

### Docker / local testing notes

- [ ] Record how you start the app in Docker (e.g. `docker run -p 8080:8080 ...` or `docker compose up`).
- [ ] Set `VITE_SITE_URL` to the URL Stripe can redirect back to (e.g. `http://localhost:8080` inside Docker, or your tunnel URL).
- [ ] Stripe Checkout `success_url` / `cancel_url` must use the same host as `VITE_SITE_URL`.
- [ ] For webhooks in Docker: forward Stripe CLI to the **published host port**, e.g. `stripe listen --forward-to localhost:8080/api/stripe-webhook`.
- [ ] If the app binds to `5173` inside the container, map it explicitly (`-p 8080:5173`) and set `VITE_SITE_URL=http://localhost:8080`.

### Acceptance criteria

- We know exactly where pages, components, API routes, and env files live.
- We have a written decision on port, Docker command, and whether `/checkout` is redirected or removed.

---

## Issue 2: Environment Variables

**Goal:** Configure secrets and public keys without leaking server-only values to the client bundle.

### Checklist

- [ ] Create or update `.env.local` (or `.env`) at project root — TanStack Start / Vite loads `VITE_*` vars at build and dev time.
- [ ] Add Supabase variables.
- [ ] Add Stripe variables.
- [ ] Add site URL variable.
- [ ] Add n8n webhook variable.
- [ ] Make sure server-only secrets are never imported into frontend code.
- [ ] Pass the same env vars into your Docker container (`--env-file .env.local` or compose `environment:` block).
- [ ] Add `.env.local` to `.gitignore` if not already ignored.

### Env template

```env
# SUPABASE
VITE_SUPABASE_URL=https://iwvsohxgebazsqspvpxk.supabase.co
VITE_SUPABASE_ANON_KEY=PASTE_SUPABASE_ANON_KEY_HERE
SUPABASE_SERVICE_ROLE_KEY=PASTE_SUPABASE_SERVICE_ROLE_KEY_HERE

# STRIPE
STRIPE_SECRET_KEY=sk_test_PASTE_STRIPE_SECRET_KEY_HERE
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_PASTE_STRIPE_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_PASTE_WEBHOOK_SECRET_HERE
STRIPE_PRICE_ID=price_PASTE_STRIPE_PRICE_ID_HERE

# SITE
VITE_SITE_URL=http://localhost:8080

# AUTOMATION
N8N_WEBHOOK_URL=PASTE_N8N_WEBHOOK_URL_HERE

# CALENDLY (inline embed — client-safe)
VITE_CALENDLY_URL=https://calendly.com/dadadaad81/30min
VITE_BRAND_PRIMARY=#D4AF37
VITE_BRAND_TEXT=#FFFFFF
VITE_BRAND_BG=#050505
```

### Server-only vs client-safe

| Variable | Client-safe? | Used in |
|----------|--------------|---------|
| `VITE_SUPABASE_URL` | Yes | `src/lib/supabase.ts`, server |
| `VITE_SUPABASE_ANON_KEY` | Yes | `src/lib/supabase.ts` |
| `SUPABASE_SERVICE_ROLE_KEY` | **No** | `src/lib/supabase.server.ts`, webhooks, server functions only |
| `STRIPE_SECRET_KEY` | **No** | `src/lib/stripe.server.ts`, server functions, webhook |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Yes | Only if needed client-side (Checkout redirect flow may not need it) |
| `STRIPE_WEBHOOK_SECRET` | **No** | `src/routes/api/stripe-webhook.ts` |
| `STRIPE_PRICE_ID` | **No** | Server function when creating Checkout Session |
| `VITE_SITE_URL` | Yes | Redirect URLs (also read server-side via `process.env`) |
| `N8N_WEBHOOK_URL` | **No** | Webhook handler only |
| `VITE_CALENDLY_URL` | Yes | `src/lib/calendly.ts`, `CalendlyEmbed` inline widget |
| `VITE_BRAND_PRIMARY` | Yes | `LeadForm` wrapper accent (optional) |
| `VITE_BRAND_TEXT` | Yes | `LeadForm` heading color (optional) |
| `VITE_BRAND_BG` | Yes | `LeadForm` section background (optional) |

### Acceptance criteria

- App starts with all required vars set in Docker and locally.
- Grep confirms no `SUPABASE_SERVICE_ROLE_KEY` or `STRIPE_SECRET_KEY` in `src/components/` or other client-only modules.

---

## Issue 3: Supabase Schema & RLS

**Goal:** Ensure tables exist for sessions, orders, and application data.

### Checklist

- [ ] Confirm Supabase project (`iwvsohxgebazsqspvpxk`) is accessible from Docker network.
- [ ] Verify or create `profiles` table + `on_auth_user_created` trigger.
- [ ] Verify or create `stripe_checkout_sessions` table.
- [ ] Verify or create `orders` table.
- [ ] Verify or create `order_items` table (if line items are still used).
- [ ] Decide whether apply-flow needs an `applications` table (customer name, email, phone, notes) — **recommended** for data collected before payment.
- [ ] Apply RLS: users read own rows; writes from webhook use service role only.
- [ ] Run SQL from `implementation/IMPLEMENTATION_CHECKOUT.md` if tables are missing.

### Suggested `applications` table (if not present)

```sql
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  notes TEXT,
  stripe_session_id TEXT REFERENCES public.stripe_checkout_sessions(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, checkout_pending, paid, cancelled
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
```

### Acceptance criteria

- Tables exist and service role can insert/update from webhook.
- No policy allows anonymous clients to write orders or sessions directly.

---

## Issue 4: Stripe Dashboard Setup

**Goal:** Dashboard config matches the apply flow (single Price ID, not dynamic cart pricing).

### Checklist

- [ ] Enable Stripe **Test Mode**.
- [ ] Copy **Publishable** and **Secret** keys into env.
- [ ] Create product + **one-time Price**; copy `STRIPE_PRICE_ID`.
- [ ] Configure webhook endpoint for deployed URL: `https://<domain>/api/stripe-webhook`.
- [ ] Subscribe to `checkout.session.completed` (and optionally `checkout.session.async_payment_succeeded`).
- [ ] Copy webhook **signing secret** into `STRIPE_WEBHOOK_SECRET`.
- [ ] For local/Docker testing: `stripe listen --forward-to localhost:<PORT>/api/stripe-webhook` and use the CLI signing secret locally.

### Acceptance criteria

- Test Checkout Session can be created with `STRIPE_PRICE_ID` from a server function.
- Webhook events verify successfully when secret is set.

---

## Issue 5: Homepage & Modal CTA → `/apply`

**Goal:** Add "Apply Now" entry point without breaking existing shop CTAs.

### Checklist

- [ ] Add modal (or prominent CTA) on homepage using `src/components/ui/dialog.tsx` and existing design tokens (`btn-gold`, `font-display`, etc.).
- [ ] Wire primary button label to **"Apply Now"** (or agreed copy).
- [ ] On click: navigate to `/apply` (modal can close then route, or link directly).
- [ ] Keep existing "Shop Now" / `/products` CTAs unless product asks to replace them.
- [ ] Optionally add "Apply Now" to header or final CTA section in `src/routes/index.tsx`.
- [ ] Test navigation from Docker-served homepage.

### Acceptance criteria

- User can reach `/apply` from homepage/modal in one click.
- No Stripe secrets loaded on homepage.

---

## Issue 6: Build `/apply` Application Page

**Goal:** Customer/application form that ends with "Continue to Payment" — not a card form.

### Checklist

- [ ] Create `src/routes/apply.tsx` with `createFileRoute("/apply")`.
- [ ] Reuse layout from `src/components/site/Layout.tsx` and styling patterns from `src/routes/checkout.tsx` (sections, cards, typography).
- [ ] Collect application fields (e.g. full name, email, phone, optional notes/shipping intent).
- [ ] Validate with `react-hook-form` + `zod` (already in project).
- [ ] Handle `?cancelled=true` search param — show cancellation banner (mirror `checkout.tsx` pattern).
- [ ] Button copy: **"Continue to Payment"** — does not collect card data.
- [ ] On submit: call server function to create Stripe Checkout Session (Issue 7).
- [ ] On success: `window.location.href = session.url` (Stripe-hosted Checkout).
- [ ] Do **not** embed Stripe Elements or custom card inputs.

### Acceptance criteria

- Form renders at `/apply`.
- Cancelled return shows clear message and allows retry.
- Submit redirects to Stripe Checkout URL.

---

## Issue 7: Server Function — Create Apply Checkout Session

**Goal:** Server-side session creation using `STRIPE_PRICE_ID` and application metadata.

### Checklist

- [ ] Extend or add server function in `src/lib/checkout.functions.ts` (or `apply.functions.ts` if cleaner).
- [ ] Input schema: application fields (name, email, phone, etc.) — not cart line items.
- [ ] Use `getStripeClient()` from `src/lib/stripe.server.ts`.
- [ ] Create session with `mode: "payment"` and `line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }]`.
- [ ] Set `customer_email` from form.
- [ ] Enable `shipping_address_collection` if physical fulfillment applies.
- [ ] Set `metadata` with application id / form fields (avoid PII overload — store detail in Supabase, reference id in metadata).
- [ ] Set URLs:
  - `success_url`: `${VITE_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`
  - `cancel_url`: `${VITE_SITE_URL}/apply?cancelled=true`
- [ ] Insert `stripe_checkout_sessions` row with status `pending`.
- [ ] Optionally insert/update `applications` row linked to session id.
- [ ] Return `{ url: session.url }` only — never return secret key.

### Reuse note

Existing `createStripeCheckoutSession` is **cart + auth** oriented. Prefer a dedicated `createApplyCheckoutSession` rather than breaking the cart flow until `/checkout` is retired.

### Acceptance criteria

- Server function creates valid session in test mode.
- Redirect URLs use `/success` and `/apply`, not `/checkout/success` or `/checkout`.

---

## Issue 8: Build `/success` Page

**Goal:** Post-payment confirmation at `/success?session_id=...`.

### Checklist

- [ ] Create `src/routes/success.tsx` with `createFileRoute("/success")` **or** rename/migrate `checkout.success.tsx`.
- [ ] Reuse UI from existing `src/routes/checkout.success.tsx` where possible.
- [ ] Read `session_id` from search params.
- [ ] Fetch order/session details via server function (`getOrderDetailsBySession` or apply-specific variant).
- [ ] Handle webhook lag (show Stripe session fallback while DB sync pending — existing pattern).
- [ ] Remove cart-clearing logic if apply flow is not cart-based (or clear only if cart still used elsewhere).
- [ ] Update copy for application/order confirmation context.

### Acceptance criteria

- Stripe success redirect lands on `/success` and displays order/application confirmation.
- Page works when opened immediately after payment (webhook may still be processing).

---

## Issue 9: Migrate or Retire `/checkout`

**Goal:** Align routes with apply flow; avoid duplicate entry points.

### Checklist

- [ ] Audit all links to `/checkout` (`Header.tsx`, `CartDrawer.tsx`, any marketing copy).
- [ ] Decide per link: redirect to `/apply`, keep for shop cart, or remove.
- [ ] If `/checkout` is obsolete for this product: add redirect route `/checkout` → `/apply` or remove file after updating references.
- [ ] Update `createStripeCheckoutSession` cancel/success URLs if that function remains for cart until deprecation.
- [ ] Regenerate route tree (`routeTree.gen.ts` updates on dev/build).
- [ ] Confirm nothing in production (Vercel) depends on old URLs before removing.

### Acceptance criteria

- Primary payment journey uses `/apply` → Stripe → `/success`.
- No broken internal links after migration.

---

## Issue 10: Stripe Webhook — Confirm Payment & Persist Order

**Goal:** Webhook remains source of truth for paid orders.

### Checklist

- [ ] Review `src/routes/api/stripe-webhook.ts` — already handles `checkout.session.completed`.
- [ ] Ensure handler works with apply-flow metadata (application id vs cart items).
- [ ] Update order creation to link `applications` record when metadata includes application id.
- [ ] Keep signature verification enabled when `STRIPE_WEBHOOK_SECRET` is set.
- [ ] Return `200` quickly; log errors without exposing internals.
- [ ] Test with Stripe CLI against Docker-published port.

### Acceptance criteria

- Test payment creates/updates `stripe_checkout_sessions`, `orders`, and related rows.
- Invalid signatures are rejected.

---

## Issue 11: n8n Automation Hook

**Goal:** Optional downstream automation with clean payload.

### Checklist

- [ ] Confirm `N8N_WEBHOOK_URL` is set in Docker env when automation is wanted.
- [ ] Reuse existing n8n POST block in webhook handler.
- [ ] Extend payload to include application fields (name, email, phone) from Supabase or session metadata.
- [ ] Ensure webhook failure does not fail Stripe response (log only).
- [ ] Test n8n receives payload on test checkout.

### Acceptance criteria

- n8n webhook fires on successful payment when URL is configured.
- Payload excludes card numbers or Stripe secret values.

---

## Issue 12: End-to-End Testing (Local & Docker)

**Goal:** Verify full flow before production.

### Checklist

- [ ] Start app locally or in Docker with full `.env.local`.
- [ ] Homepage → Apply Now → `/apply`.
- [ ] Submit form → redirect to Stripe test Checkout.
- [ ] Pay with test card `4242 4242 4242 4242`.
- [ ] Land on `/success?session_id=cs_test_...`.
- [ ] Cancel path: abort Checkout → `/apply?cancelled=true`.
- [ ] Run `stripe listen --forward-to localhost:<PORT>/api/stripe-webhook`.
- [ ] Confirm Supabase rows updated.
- [ ] Confirm n8n received payload (if configured).
- [ ] Smoke-test from a browser hitting Docker-mapped port (not only Vite default 5173).

### Docker checklist

- [ ] Env file mounted or injected into container.
- [ ] `VITE_SITE_URL` matches browser URL used for testing.
- [ ] Stripe CLI forwarding targets mapped port on host.
- [ ] If using a tunnel (ngrok, Cloudflare Tunnel), update `VITE_SITE_URL` and Stripe webhook endpoint accordingly.

### Acceptance criteria

- Full happy path and cancel path work in test mode from Docker environment.
- No secret keys visible in browser devtools or network responses.

---

## Issue 13: Security & Pre-Ship Review

**Goal:** Final guardrails before merge/deploy.

### Checklist

- [ ] No card data stored in Supabase or application logs.
- [ ] `STRIPE_SECRET_KEY` and `SUPABASE_SERVICE_ROLE_KEY` only in server modules (`*.server.ts`, API routes, server functions).
- [ ] `VITE_*` vars contain only public keys and URLs.
- [ ] Webhook verifies `stripe-signature` in production.
- [ ] RLS prevents tampering with orders from browser client.
- [ ] `STRIPE_PRICE_ID` used server-side — client cannot set arbitrary amounts.
- [ ] Production `VITE_SITE_URL` set to real domain before going live.

### Acceptance criteria

- Security checklist passed.
- Ready for production Stripe keys and live webhook endpoint when business approves.

---

## Issue 14: Set Up Sentry Error Monitoring

**GitHub:** Create on repo if missing — title: `Set up Sentry error monitoring`. Close when checklist is complete.

**Goal:** Capture client and server errors in production (and optionally dev) via Sentry, with source maps on Vercel.

**Current state (2026-06-05):**

- `@sentry/react` **already in** `package.json` — **not initialized** in app entry.
- `src/lib/error-capture.ts` — local error buffer for Nitro/h3; can be bridged to Sentry.
- `.env` may include `SENTRY_AUTH_TOKEN` for CI/source-map upload — **no `VITE_SENTRY_DSN`** wired yet.
- Sentry project platform: **React** (matches TanStack Start client bundle).

### Checklist

- [ ] Create Sentry project (platform: **React**) for `katana-edge-craft`.
- [ ] Add env vars locally and on Vercel:
  - [ ] `VITE_SENTRY_DSN` (public DSN for browser)
  - [ ] `SENTRY_AUTH_TOKEN` (source maps / releases — server/CI only)
  - [ ] `SENTRY_ORG` / `SENTRY_PROJECT` if using Sentry Vite plugin
- [ ] Initialize `@sentry/react` in client entry (e.g. `src/main.tsx` or router root) with environment-aware `enabled` (off or sampled in dev).
- [ ] Wrap app with `Sentry.ErrorBoundary` or equivalent for React render errors.
- [ ] Optionally add **Node/Nitro** Sentry for API routes (`create-checkout-session`, `stripe-webhook`) — `@sentry/node` or Vercel integration.
- [ ] Wire `consumeLastCapturedError()` / server handlers to `Sentry.captureException` where appropriate.
- [ ] Configure Vite/Sentry plugin for **source map upload** on production builds.
- [ ] Connect **Vercel ↔ Sentry** integration (releases, env sync).
- [ ] Verify: trigger test error in browser → appears in Sentry Issues.
- [ ] Verify: API route error (test mode) → appears if server SDK enabled.
- [ ] Confirm no secret tokens in `VITE_*` or client bundle.

### Create this issue on GitHub (after `gh auth login`)

```bash
gh auth login
gh issue create --repo Duhhellobigboy/katana-edge-craft \
  --title "Set up Sentry error monitoring" \
  --label "enhancement" \
  --body "$(cat <<'EOF'
## Goal
Set up Sentry for client (and optionally server) error monitoring on katana-edge-craft.

## Current state
- `@sentry/react` is in package.json but not initialized
- `src/lib/error-capture.ts` exists for Nitro error recovery
- `SENTRY_AUTH_TOKEN` may be in `.env`; DSN not wired yet

## Checklist
- [ ] Create Sentry project (React)
- [ ] Add `VITE_SENTRY_DSN` (+ `SENTRY_AUTH_TOKEN`, org/project) to `.env` and Vercel
- [ ] Initialize Sentry in client entry with dev/prod sampling
- [ ] Error boundary for React
- [ ] Optional: Nitro/API route Sentry (`@sentry/node` or Vercel integration)
- [ ] Source maps on production build
- [ ] Vercel ↔ Sentry integration
- [ ] Test: browser + API errors appear in Sentry
- [ ] No secrets in client env

## Reference
See `GITHUB_ISSUES_GUIDE.md` → Issue 14.

Close this issue when Sentry is fully wired and verified in production/preview.
EOF
)"
```

### Acceptance criteria

- Production/preview errors visible in Sentry with readable stack traces (source maps).
- DSN and auth token handling follow same pattern as other secrets (`VITE_*` public only).
- Issue closed after smoke test on deployed preview.

---

## Implementation Order (Suggested)

> **Superseded by [Exact implementation order (revised — post-audit)](#exact-implementation-order-revised--post-audit)** in the Pre-Implementation Audit section. Do not start Issue 5–13 until schema alignment and Stripe env vars are complete.

---

## Related Files (Quick Reference)

| Purpose | Path |
|---------|------|
| Apply page (to create) | `src/routes/apply.tsx` |
| Success page (to create/migrate) | `src/routes/success.tsx` |
| Legacy checkout | `src/routes/checkout.tsx` |
| Legacy success | `src/routes/checkout.success.tsx` |
| Webhook | `src/routes/api/stripe-webhook.ts` |
| Server functions | `src/lib/checkout.functions.ts` |
| Stripe helper | `src/lib/stripe.server.ts` |
| Supabase browser | `src/lib/supabase.ts` |
| Supabase server | `src/lib/supabase.server.ts` |
| Dialog UI | `src/components/ui/dialog.tsx` |
| Homepage | `src/routes/index.tsx` |
| Prior docs | `implementation/STRIPE.md`, `implementation/IMPLEMENTATION_CHECKOUT.md` |
| Error capture (pre-Sentry) | `src/lib/error-capture.ts` |
| Sentry guide | `GITHUB_ISSUES_GUIDE.md` → Issue 14 |
