# Katana Edge Branding Guide

This document defines the Katana Edge visual and copy system. Use it as the source of truth when building new pages, checkout screens, success pages, emails, and automation messages so everything stays consistent with the live website.

**Design source of truth:** `src/styles.css`, site components (`Header`, `ProductCard`, `Layout`), and checkout/success routes.

---

## 1. Brand Identity

Katana Edge is a **premium, sharp, professional** dark-luxury ecommerce brand built for **barbers and stylists**. The product line is **high-ticket professional tools** with a **Japanese-inspired blade and shear aesthetic** — precision, craftsmanship, and control.

### Brand positioning

- Premium professional shears, not mass-market retail
- Dark luxury ecommerce — confident, minimal, high-trust
- Japanese-inspired design language (precision steel, blade craft, disciplined form)
- Built for working professionals who care about edge quality and ergonomics

### Brand feeling

| Element | Expression |
|--------|------------|
| Background | Near-black matte luxury (`#0a0a0a`, `#050505`, `#000000`) |
| Accents | Gold highlights (`#D4AF37`) for CTAs, prices, borders, trust cues |
| Logo | Red Katana Edge mark — centered in navigation, inverted/screen-blended on dark backgrounds |
| Headings | Bold, uppercase, condensed display type (Oswald) |
| Layout | Clean ecommerce trust layout — spacious, structured, no clutter |

### Voice

- Direct, professional, premium
- Confident but not hype-driven
- Speak to craft, precision, and professional outcomes
- Avoid playful, cartoon, or generic Shopify tone

---

## 2. Color Palette

Colors are defined in `src/styles.css` as CSS custom properties. Use these tokens — do not invent new palette colors.

### Core colors

| Token / Name | Hex | CSS variable | Usage |
|--------------|-----|--------------|-------|
| Background black | `#0A0A0A` | `--background` | Main site background, input fields |
| Deep black | `#050505` | — | Checkout and success page sections |
| Pure black | `#000000` | — | Ticker bar, hero accents, trust panels |
| Card dark gray | `#1A1A1A` | `--card` | Cards, order summary, form sections, popovers |
| Secondary gray | `#242424` | `--secondary`, `--muted`, `--input` | Input backgrounds, secondary surfaces |
| Border | `#242424` | `--border` | Default card and input borders |
| Border strong | `#333333` | `--border-strong` | Hover borders, secondary buttons |
| Gold accent | `#D4AF37` | `--gold`, `--accent` | CTAs, prices, active nav, icons, focus rings |
| Gold foreground | `#000000` | `--gold-foreground` | Text on gold buttons |
| Gold hover | `#FFD700` → `#D4AF37` | `--gradient-gold` | Hover glow and gradient highlights |
| White text | `#FFFFFF` | `--foreground` | Primary body and heading text |
| Muted gray text | `#A0A0A0` | `--muted-foreground` | Subtext, labels, placeholders, helper copy |
| Soft silver | `#C0C0C0` | `--silver` | Optional metallic accents |
| Error red (bg) | `#7F1D1D` | `--destructive` | Destructive/error backgrounds (system) |
| Error red (text) | `#FCA5A5` | `--destructive-foreground` | Error text on destructive surfaces |
| Inline error | `text-red-400` | — | Form validation messages |
| Error banner | `bg-red-500/10`, `border-red-500/40`, `text-red-200` | — | Checkout/API error banners |
| Warning banner | `bg-amber-500/10`, `border-amber-500/40`, `text-amber-200` | — | Cancelled payment notices |
| Success green | Subtle only | — | Use sparingly; prefer gold check icon on `bg-gold/10` |

### Where to use each color

- **Black / near-black** — Page backgrounds, full-bleed sections, navbar scroll state
- **Dark gray cards** — Order cards, detail forms, product cards, drawers
- **Gold** — Primary buttons, prices, eyebrow labels, active links, cart badge, focus states, trust icons
- **White** — Headings, primary copy, input text
- **Muted gray** — Descriptions, labels, placeholders, secondary metadata
- **Red** — Errors and validation only — never as a decorative accent
- **Amber** — Payment-cancelled warnings only

### Gradients and shadows

- `--gradient-gold`: `linear-gradient(135deg, #FFD700, #D4AF37, #AA7C11)`
- `--gradient-edge`: Gold hairline divider effect
- `--shadow-luxe`: Deep card elevation
- `--shadow-gold`: Gold glow on primary button hover

---

## 3. Typography

### Font families

| Role | Font | CSS class / variable |
|------|------|---------------------|
| Display / headings | Oswald (700) | `.font-display`, `--font-display` |
| Body | Inter | `--font-sans` (default body) |
| Accent script | Yellowtail | `.font-accent` — hero emphasis only, used sparingly |
| Monospace | JetBrains Mono | `.font-mono` — order references, technical IDs |

### Heading rules

- **Bold, uppercase, condensed feel** — Oswald at weight 700
- Default heading letter-spacing: `0.02em`
- Large hero/checkout headings: `text-4xl` → `text-5xl`, `tracking-wide`
- Section headings: `text-2xl`, uppercase, optional bottom border

### Navigation and UI text

- Uppercase with generous letter-spacing (`tracking-[0.15em]` to `tracking-[0.18em]`)
- Small caps feel: `text-[0.68rem]` to `text-xs` for nav links

### Body text

- Inter, clean and readable
- Default size `text-sm` for forms; `text-base` for marketing copy
- Line-height relaxed on trust/helper blocks

### Eyebrow labels

Use the `.eyebrow` utility for section pre-titles:

- Gold color, uppercase, `letter-spacing: 0.32em`, `0.7rem` size
- Example: `KATANA EDGE`, `PAYMENT SUCCESSFUL`

### CTA button text

- Uppercase, `letter-spacing: 0.18em`, semibold
- Font size ~`0.78rem`

### Copy examples

| Context | Example |
|---------|---------|
| Hero / page heading | `SECURE CHECKOUT` |
| Section heading | `1. YOUR ORDER` |
| Section heading | `2. YOUR DETAILS` |
| Primary button | `CONTINUE TO PAYMENT` |
| Secondary button | `BACK TO SHOP` |
| Eyebrow | `KATANA EDGE` |
| Success eyebrow | `PAYMENT SUCCESSFUL` |

---

## 4. Layout Rules

### Containers

- **`.container-luxe`** — `max-width: 1320px`, centered, responsive horizontal padding
- Checkout / success: `max-w-3xl` or `max-w-2xl` for focused forms
- Product grids: responsive columns within `container-luxe`

### Page structure

- **Large centered page headings** with eyebrow above
- **Strong vertical spacing** — `py-16 md:py-24` for main sections; `space-y-8` between major blocks
- **Dark card sections** — `bg-card border border-border/40 p-6 md:p-8`
- **Two-column layouts on desktop** where useful (e.g. hero, product detail); **single column on mobile**
- Forms: clean, wide, simple — one field per row on checkout

### Spacing principles

- Generous padding inside cards (`p-6` → `p-8`)
- Section dividers: `border-b border-border/20` under headings
- Item lists: `divide-y divide-border/20`

### What to avoid

- Cluttered multi-column forms on mobile
- Competing focal points
- Bright white sections that break the dark luxury feel
- Dense tables or admin-style layouts on customer-facing pages

---

## 5. Buttons

### Primary CTA — `.btn-gold`

The main action button across the site.

| Property | Value |
|----------|-------|
| Background | Gold (`#D4AF37`) |
| Text | Black (`#000000`), uppercase, letter-spaced |
| Weight | Semibold (`font-weight: 600`) |
| Shape | Rectangular, `border-radius: 2px` (slight rounding, premium edge) |
| Padding | `0.95rem 1.75rem` default; checkout uses `!py-4` full-width |
| Hover | `translateY(-1px)` + gold glow shadow — no bounce or playful animation |

**Used for:**

- Apply Now
- Continue to Payment
- Checkout / Proceed actions
- Back to Shop / Browse Shop
- Order Another (success page)

### Secondary CTA — `.btn-ghost-light`

| Property | Value |
|----------|-------|
| Background | Transparent |
| Border | `1px solid #333333` (strong border) |
| Text | White, uppercase, letter-spaced |
| Hover | Border and text shift to gold |

**Used for:**

- Return Home
- Secondary navigation actions
- Outline-style alternatives beside primary gold buttons

### Icon buttons (navbar)

- White default, gold on hover
- No background fill unless badge (cart count uses gold circle)

### Hover behavior

- Slight brightness / gold glow increase
- Color transitions ~300ms
- No childish animations, no excessive scale

---

## 6. Forms

### Input style

| Property | Value |
|----------|-------|
| Background | `bg-background` (`#0A0A0A`) |
| Border | `border-border/40` — thin, subtle |
| Text | White, `text-sm` |
| Placeholder | Muted gray — e.g. `John Doe`, `john@email.com` |
| Focus | `focus:border-gold`, no heavy outline ring |
| Icons | Optional left-aligned Lucide icons in muted gray |

### Labels

- Uppercase, `text-xs`, `tracking-widest`, muted gray, semibold
- Examples: `FULL NAME`, `EMAIL ADDRESS`, `PHONE`

### Validation errors

- `text-sm text-red-400` under the field
- Clear, practical message — no technical jargon

### Required checkout fields

Guest checkout collects **only**:

| Field | Required |
|-------|----------|
| Full name | Yes |
| Email address | Yes |
| Phone | Yes |
| Product / line items | Yes (from cart or URL params) |
| Quantity | Yes (cart-driven; max 20 per product) |

### Payment fields — never on our site

**Do not collect card details, CVV, or billing card data on Katana Edge pages.**

Stripe-hosted Checkout handles:

- Card number
- Expiry / CVC
- Billing address (as configured in Stripe session)
- Payment confirmation

Our site stops at customer contact info + order review, then redirects to Stripe.

---

## 7. Product Cards

Product cards use the `.luxe-card` pattern with `.product-image-wrap` for imagery.

### Card contents

1. **Product image** — full-width, aspect ratio `4/5` (grid) or `3/4` (compact), slow zoom on hover
2. **Star rating** — gold filled stars + muted review count
3. **Product name** — Oswald display, uppercase feel, `text-2xl`–`text-3xl`
4. **Tagline** — short premium description in muted gray
5. **Price** — display font, white (shop cards) or **gold** (cart/checkout)
6. **Compare-at price** — muted, line-through when on sale
7. **Quantity** — shown in cart drawer and checkout order summary, not on shop grid cards
8. **Selected / hover state** — gold border highlight, `border-color` shift, subtle lift (`translateY(-4px)`)

### Current products

| Product key | Display name | Slug | Price |
|-------------|--------------|------|-------|
| `fujisan` | Fujisan | `fujisan-thinning-shears` | $859.99 |
| `microslit` | Micro Slit | `micro-slit-shears` | $1,099.99 |

### Copy tone for descriptions

- Precision, steel, ergonomics, professional outcomes
- Short taglines: e.g. *"Effortless blending. Invisible transitions."*
- No playful or consumer-gadget language

---

## 8. Checkout Page Style

**Route:** `/checkout`

This is the branded **pre-payment landing and form page** — not the payment page itself.

### Flow

1. User reviews order (from cart or URL params)
2. User enters contact details (name, email, phone)
3. User clicks **Continue to Payment**
4. Backend creates Stripe Checkout Session
5. User is redirected to **Stripe-hosted Checkout** for payment

### Visual structure

| Block | Style |
|-------|-------|
| Page background | `bg-[#050505]` full-height section |
| Header area | Centered eyebrow + large `SECURE CHECKOUT` heading |
| Subcopy | Muted gray, explains Stripe redirect |
| Order card | `1. YOUR ORDER` — line items, quantities, gold prices |
| Details card | `2. YOUR DETAILS` — three inputs with icons |
| Trust strip | Dark panel + gold shield icon |
| CTA | Full-width gold `CONTINUE TO PAYMENT` |
| Loading | Gold spinner + uppercase muted status text |
| Empty cart | Centered card + `BROWSE SHOP` gold CTA |

### Trust message (required copy)

> Secured with SSL encryption. Payment is processed on Stripe — we never see or store your card details.

### Supporting copy (below main heading)

> Review your order, enter your details, and continue to Stripe-hosted payment. Card details are never collected on this site.

---

## 9. Stripe Checkout Messaging

Use consistent language across checkout UI, loading states, and cancel returns.

| Context | Copy |
|---------|------|
| Primary CTA | `Continue to Payment` |
| Loading state | `Redirecting to Stripe…` |
| Pre-payment reassurance | `You'll be redirected to Stripe for secure payment.` |
| Card safety | `Card details are never collected on this site.` |
| Cancel return (`?cancelled=true`) | `Payment was cancelled. You can try again below.` |
| API failure | `Stripe checkout failed. Check server logs for the exact Stripe error.` (or user-friendly variant: `Stripe checkout failed. Please try again or contact support.`) |

Stripe's own hosted page branding is controlled by Stripe — our job is consistent **pre-redirect** and **post-return** messaging in Katana Edge styling.

---

## 10. Success Page Style

**Route:** `/success?session_id={CHECKOUT_SESSION_ID}`

### Required elements

| Element | Copy / style |
|---------|--------------|
| Eyebrow | `PAYMENT SUCCESSFUL` (gold `.eyebrow`) |
| Heading | `THANK YOU` or `PAYMENT SUCCESSFUL` — large Oswald uppercase |
| Message | `Your payment has been processed. A confirmation email will be sent shortly with your order details.` |
| Order reference | Optional card with Stripe `session_id` in monospace |
| Warranty trust block | Gold shield icon + premium warranty copy |
| Primary CTA | Gold button — `ORDER ANOTHER` or `BACK TO SHOP` |
| Secondary CTA | Ghost button — `RETURN HOME` |
| Support line | Muted text + gold phone link |

### Visual style

- Same dark background (`#050505`)
- Centered layout, `max-w-2xl`
- Gold icon in circular `bg-gold/10 border-gold/40` badge
- Dark cards for reference and trust blocks

---

## 11. Error Style

### Visual treatment

```
Background: dark red tint (bg-red-500/10 or --destructive)
Border:     red (border-red-500/40)
Text:       light red / red-200
Icon:       AlertTriangle, left-aligned
```

### Copy rules

- Clear, practical, no secret keys or stack traces
- Tell the user what to do next

### Examples

| Scenario | Message |
|----------|---------|
| Stripe failure | `Stripe checkout failed. Please try again or contact support.` |
| Validation | `Full name is required.` |
| Empty cart | `No items to checkout` + link to shop |
| Generic | `Something went wrong. Please try again.` |

### Warning (non-error) style

Payment cancelled uses **amber** (not red):

- `bg-amber-500/10`, `border-amber-500/40`, `text-amber-200`

---

## 12. Email Style

Emails and automation messages (n8n, transactional) should mirror the brand tone and structure.

### Subject lines

- Clean, professional, brand-first
- Example: `Katana Edge Order Confirmation`

### Body tone

- Premium, direct, professional
- Short paragraphs
- No emojis, no exclamation overload, no casual slang

### Required content (order confirmation)

- Customer name
- Product name(s) and quantity
- Order total
- Confirmation that payment was received
- Support contact (phone / email)
- Optional: Stripe session or internal order reference

### Visual alignment (HTML emails)

- Dark or near-white background acceptable for email clients; prefer dark header bar with gold accent line
- Gold for total price and CTA link
- Katana Edge wordmark in header
- Keep layout single-column, mobile-safe

---

## 13. Navigation Style

### Header structure

Fixed top navbar with:

1. **Ticker bar** — black background, scrolling uppercase marquee (white + gold alternating)
2. **Main bar** — three-column grid: nav left, logo center, actions right

### Nav links (desktop + mobile)

| Link | Route |
|------|-------|
| Home | `/` |
| Shop | `/products` |
| About | `/about` |
| Contact | `/contact` |

### Center logo

- Katana Edge logo image, centered
- Links to home
- Subtle hover scale

### Right-side actions

| Element | Behavior |
|---------|----------|
| Search icon | Visual / future search — white → gold hover |
| User icon | Visual only — **not** linked to auth |
| Cart icon | Opens cart drawer; gold badge with item count |
| Apply Now | Gold CTA button |

### Apply Now routing

**Apply Now should route to `/checkout`.**

Do not add login, account, or profile functionality. The user icon is decorative unless a future non-auth feature needs it.

### Nav link style

- `text-[0.68rem]` uppercase, `tracking-[0.15em]`
- White default, gold on hover and active route
- Mobile: stacked vertical menu with same rules

### Cart drawer

- Dark background `#0A0A0A`
- Gold accents for prices and CTAs
- Proceed action routes toward checkout

---

## 14. Guest Checkout Rules

Katana Edge uses **guest checkout only**. Branding and UX must never imply accounts or login.

### Do not build

- User accounts
- Login / sign-up pages
- User profiles or dashboards
- Auth-gated checkout

### How persistence works

| Layer | Mechanism |
|-------|-----------|
| Cart | `localStorage` key: `katana_edge_cart` |
| Checkout session | `localStorage` key: `katana_checkout_session_id` (UUID) |
| Server | Supabase stores `products`, `checkout_sessions`, `orders`, `order_items` via service role |
| Payment | Stripe Checkout + webhooks |

### Data flow (branded experience)

1. Guest adds items to cart
2. Guest opens `/checkout` with order summary
3. Guest submits name, email, phone
4. Server upserts `checkout_sessions`, creates Stripe session
5. Guest pays on Stripe
6. Webhook writes `orders` / `order_items`
7. Guest lands on `/success`

### Trust implications for copy

- Never say "sign in to complete purchase"
- Never show account menus
- Always emphasize secure Stripe redirect

---

## 15. Do Not Do

| Rule | Reason |
|------|--------|
| Do not use bright random colors | Breaks dark luxury palette |
| Do not use generic Shopify-looking layouts | Katana Edge is premium and distinctive |
| Do not use playful / cartoon UI | Audience is working professionals |
| Do not collect card data on-site | PCI scope + trust — Stripe handles payment |
| Do not add login / profile pages | Guest checkout only |
| Do not expose secret keys in UI or logs | Security |
| Do not break the dark premium Katana Edge feel | Brand consistency |
| Do not use lowercase headings for main titles | Display type is uppercase |
| Do not add bouncy or gimmicky animations | Hover glow and subtle lift only |
| Do not show Stripe API errors verbatim to users | Sanitize; log server-side |

---

## Quick Reference — CSS Utilities

| Class | Purpose |
|-------|---------|
| `.container-luxe` | Max-width page container |
| `.btn-gold` | Primary gold CTA |
| `.btn-ghost-light` | Secondary outline CTA |
| `.luxe-card` | Dark product/content card |
| `.eyebrow` | Gold section pre-title |
| `.font-display` | Oswald heading font |
| `.font-accent` | Yellowtail script accent |
| `.hairline` | Gold gradient divider |
| `.product-image-wrap` | Product image container |

---

## Quick Reference — Design Tokens

```css
--background: #0a0a0a;
--foreground: #ffffff;
--card: #1a1a1a;
--gold: #d4af37;
--muted-foreground: #a0a0a0;
--border: #242424;
--destructive: #7f1d1d;
```

---

*Last updated from live site styles — June 2026. Review this guide when adding new routes, email templates, or automation copy.*
