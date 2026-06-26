# Implementation Plan: Admin Editor Expansion

This document outlines the design and step-by-step plan to expand the Katana Edge admin content editor. The goal is to allow Kai to safely edit public website copywriting, media paths, FAQs, reviews, and contact information without touching any checkout logic, payment settings, Stripe keys, or database schemas.

---

## 1. Current Admin Architecture

The current admin system consists of:
- **Authentication**: Protected via cookie-based sessions (cookie `admin_session`) validated server-side in `src/routes/admin.tsx` and API routes using an HMAC signature verified against `ADMIN_SESSION_SECRET`.
- **Admin UI Page** (`src/routes/admin.tsx`): Built with React and styling Tailwind/Vanilla CSS. It is split into two tabs:
  1. *Homepage & Brand*: Edit general copywriting keys stored in the `site_content` database table.
  2. *Product Copy*: Select from a product catalog and edit standard copywriting fields (`name`, `tagline`, `shortDescription`, `longDescription`, `image`, `features`, `benefits`, `specs`, `faq`).
- **Backend API Routes**:
  - `src/routes/api/admin/content.ts` (POST): Accepts an array of updates to upsert into the `site_content` table.
  - `src/routes/api/admin/products.ts` (POST): Accepts validation schema (using Zod) and updates fields in the `products` table for a specific product slug.
- **Frontend Querying**: Pages fetch data from `site_content`, `faqs`, `testimonials`, and `products` via Supabase client utilities or server functions (e.g., `getAllDbProducts` in `src/lib/products.ts` and `fetchSiteContent` in `src/lib/content.ts`).

---

## 2. Current Editable Fields

Currently, the admin panel exposes the following editable inputs:
- **General Content** (mapped to `site_content` table keys):
  - `home.hero.title`
  - `home.hero.subtitle`
  - `home.hero.cta`
  - `about.brand.statement`
  - `contact.support.email`
  - `seo.title`
  - `seo.description`
- **Product Details**:
  - Display Title (`name`)
  - Tagline (`tagline`)
  - Short Summary (`short_description`)
  - Full Description (`long_description`)
  - Product Image URL (`image_url`)
  - Features array (JSONB list of `{ title, description }`)
  - Benefits array (JSONB list of `{ title, description }`)
  - Specifications array (JSONB list of `{ label, value }`)
  - Product-specific FAQs array (JSONB list of `{ q, a }`)

---

## 3. New Editable Fields to Add

We will expand the editor to support:
1. **Product Content**:
   - Product gallery image paths (support JSONB array of strings)
   - Product demo video URL (support string)
   - Product availability label (Available vs. Coming Soon) -> *Safety note: This will be controlled by a new `availability` text field, independent from the checkout-enabling `active` boolean.*
2. **Homepage Content**:
   - Homepage hero title, subtitle, CTA text (currently editable)
   - Sale banner text (new key: `home.sale_banner.text`)
   - Announcement bar text (new key: `home.announcement.text`, replacing static ticker)
3. **Site-wide Business/Contact Content**:
   - Contact email (currently editable, will integrate to all footer and contact templates)
   - Phone number (new key: `contact.support.phone`, replacing hardcoded phone number)
   - Calendly URL (new key: `contact.calendly.url`, fallback to `import.meta.env.VITE_CALENDLY_URL`)
   - About page copy (currently editable statement, plus potential addition of detailed brand description)
4. **FAQ Content**:
   - Full CRUD/management (add, edit, hide, reorder, delete) for database FAQs in `faqs` table.
5. **Testimonials/Reviews**:
   - Full CRUD/management (add, edit, hide, reorder, delete) for database reviews in `testimonials` table, adding support for `role` (location/title) and `avatar_url`.

---

## 4. Strictly Restricted Fields (Non-Editable)

To protect payment plumbing and site integrity, the following fields **must never** be exposed or editable:
- `STRIPE_SECRET_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`
- Stripe Price IDs (e.g. `stripe_price_id` on variants)
- Stripe Product IDs (e.g. `stripe_product_id` on variants)
- Supabase anonymous key or service role key
- n8n Webhook URL
- Checkout route logic and webhook callback routes
- Internal product database keys/IDs
- Slugs (unless explicitly developer-approved)
- Database schema structure
- Admin login credentials/secrets
- Product deletion (from database entirely, only toggling `active` status)
- Hard checkout activation (i.e. changing `active` status of a product/variant in the DB)

---

## 5. Recommended Database/Storage Approach

- All general copywriting, contact info, Calendly URLs, and banners will continue to use the key-value `site_content` table.
- Product-specific fields (like `video_url`, `gallery_urls`, and `availability`) will be stored directly as columns in the `products` table.
- FAQs will be read and written in the `faqs` table, sorted by `sort_order`.
- Testimonials will be read and written in the `testimonials` table, sorted by `sort_order`.

---

## 6. Supabase Schema Changes Required

We will run a SQL migration in Supabase to add the required columns:

```sql
-- 1. Expand Products Table with copy & media attributes
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS gallery_urls JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS availability TEXT DEFAULT 'Coming Soon' CHECK (availability IN ('Available', 'Coming Soon'));

-- 2. Expand Testimonials Table to store roles and avatar paths
ALTER TABLE public.testimonials
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'Verified Professional',
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 3. Seed site_content with missing contact and banner keys
INSERT INTO public.site_content (key, label, value, type, section)
VALUES 
  ('contact.support.phone', 'Support Phone', '+1 (316) 368-2814', 'text', 'contact'),
  ('contact.calendly.url', 'Calendly URL', '', 'text', 'contact'),
  ('home.sale_banner.text', 'Sale Banner Text', '', 'text', 'homepage'),
  ('home.announcement.text', 'Announcement Bar Text', 'INSPIRED BY SEKI • TRUSTED WORLDWIDE • PRECISION WITHOUT COMPROMISE', 'text', 'homepage')
ON CONFLICT (key) DO NOTHING;
```

---

## 7. Admin UI Layout Proposal

We will update the Admin panel layout in `src/routes/admin.tsx` with a multi-tab sidebar navigation:

- **Sidebar Tabs**:
  1. 🏠 **Homepage & Banner**: Hero copy, CTA, Sale Banner text, Announcement Bar ticker.
  2. 📞 **Contact & About**: Email, Phone Number, Calendly Link, About copy.
  3. 📦 **Products Editor**: Select product dropdown, edit core text, specifications list, media URLs (main image, gallery JSON, video link), and public availability dropdown.
  4. 💬 **Testimonials Manager**: Tabular view of all reviews. Add new review, edit name/quote/rating/role/avatar/active status, drag or button-reorder, and hide/toggle.
  5. ❓ **FAQ Manager**: Tabular view of all FAQs. Add new FAQ, edit question/answer/sort order/active status, reorder, and hide/toggle.

---

## 8. Product Content Editor Plan

- Add dropdown input for `availability`: `Available` or `Coming Soon`.
- Render the standard copywriting forms and specifications editors.
- When saving:
  - Submit `availability` to `src/routes/api/admin/products.ts`.
  - The API handler parses and updates the `availability` column in Supabase.
  - The frontend `ProductCard.tsx` and `products.$slug.tsx` will display labels and disable/enable adding to cart based on the new logic.

---

## 9. Product Media Editor Plan

- Introduce a field for **Product Image URL** (currently available) and a list editor for **Gallery Images** (JSONB string array).
- Gallery Editor UI:
  - Text input to add a new image path.
  - List of current gallery paths with a deletion (Trash) icon next to each.
  - Simple reordering options.
- The API handler validates that these paths are valid strings (either matching local `/products/...` format or valid absolute URLs).

---

## 10. Product Demo Video Editor Plan

- Input field: **Demo Video URL** (type: text/URL).
- Validates that the input is a valid URL or safe local path (e.g. `/assets/...` or `/products/...`).
- Feeds into the `video_url` column in the database, which maps to `video` in the client application.

---

## 11. Homepage and Sale Banner Editor Plan

- Add fields for **Sale Banner Text** and **Announcement Bar Text** under the Homepage tab.
- Sale Banner UI:
  - Input field for text (e.g. "SUMMER SALE: USE CODE SUMMA20 FOR 20% OFF").
  - If text is empty, the Sale Banner will automatically hide.
  - Render Sale Banner on top of pages if text is set.
- Announcement Bar:
  - Updates the key `home.announcement.text` in `site_content`.
  - The ticker in `Header.tsx` will fetch this key and display it scrolling across the top.

---

## 12. Contact Email and Phone Number Editor Plan

- **Email Input**: Mapped to `contact.support.email`.
- **Phone Input**: Mapped to `contact.support.phone`.
- When updated, they update `site_content` in Supabase.
- We will replace the hardcoded strings in:
  - `src/routes/contact.tsx`
  - `src/routes/success.tsx`
  - `src/components/site/Footer.tsx`
  - `src/components/site/CalendlyEmbed.tsx`
  with values loaded from `site_content` (or fell back to default strings if database values are missing).

---

## 13. Calendly URL Editor Plan

- Add input field for **Calendly URL** in the Contact tab.
- Save to `contact.calendly.url` key in `site_content`.
- Modify `src/lib/calendly.ts` and `src/components/site/CalendlyEmbed.tsx` to read from the site content loader data if available, falling back to `import.meta.env.VITE_CALENDLY_URL` if empty or disabled.

---

## 14. About Page Editor Plan

- Keep and format the input for **Brand / About Statement** (`about.brand.statement` in `site_content`).
- Ensure it feeds into `src/routes/about.tsx` properly.

---

## 15. FAQ Editor Plan

- Create `src/routes/api/admin/faqs.ts` endpoint to handle:
  - `POST` / `PUT`: Save or create FAQ row.
  - `DELETE`: Delete or toggle `is_active = false` for FAQ.
- UI in Admin panel:
  - List of database FAQs with inputs for question, answer, sort order, and active toggle.
  - "Add FAQ" button at the bottom of the list.

---

## 16. Testimonial/Review Editor Plan

- Create `src/routes/api/admin/testimonials.ts` endpoint to handle:
  - `POST` / `PUT`: Save/create testimonials.
  - `DELETE`: Delete or toggle `is_active = false` for testimonial.
- UI in Admin panel:
  - List of reviews showing: Avatar (input text path), Customer Name, Customer Role/Location, Rating (1-5 star dropdown), Quote/Review text, and active toggle.
  - "Add Testimonial" button at the bottom.

---

## 17. Validation Rules (Client & Server side)

Using Zod in API handlers and local form states:
- **Email**: Must match `z.string().email("Must be a valid email format")`.
- **Phone Number**: Validate format allowing common structures: `z.string().regex(/^[\d\s()+-.]+$/, "Invalid phone format")`.
- **Images/Videos**: Must match `z.string().regex(/^\//, "Must start with a leading slash (local path)").or(z.string().url("Must be a valid URL"))`.
- **Calendly URL**: Must match `z.string().url().regex(/^https:\/\/calendly\.com\//, "Must be a valid Calendly booking URL")`.
- **Availability label**: Must be exactly `Available` or `Coming Soon`.
- **Strings/Text**: Limit lengths (e.g. Tagline max 200, Quote max 500, FAQ answer max 1000) to prevent overflow attacks.
- **Sanitization**: Strip any dangerous characters/script tags from incoming texts to prevent XSS.

---

## 18. Security Rules

- **Access Protection**: All modifying requests (`POST`/`PUT`/`DELETE`) to API routes must require verification of the `admin_session` cookie via `checkAdminSession(request)`.
- **Stripe & Supabase Locks**:
  - No database updates can touch Stripe Price/Product IDs or webhook configurations.
  - No frontend forms will contain inputs or state variables representing environment secrets.
  - Slugs remain read-only or developer-controlled. Slugs are never editable in the admin panel to avoid breaking active routing/links.
- **No Product Deletion**: Admin UI will not feature a hard-delete button for products. They can only set availability to "Coming Soon" or toggle product visibility off (if developer active status is disabled).

---

## 19. Testing Checklist

- [ ] **Admin Authentication**: Confirm admin dashboard redirects to `/login` if cookie is missing/expired; confirm login allows login and sets cookie properly.
- [ ] **Product Copy Editing**: Confirm updating name, tagline, description, and specs updates Supabase and displays immediately on the client product page.
- [ ] **Availability Toggling (Safety Rule)**:
  - [ ] Set availability of "Micro Slit" to "Coming Soon". Check that badge displays "Coming Soon" and purchase button is replaced by "Coming Soon" warning.
  - [ ] Set availability of "Thunder" to "Available". Confirm that page badge displays "Available" but checkout is still blocked/disabled since `active` flag remains `false` in database.
- [ ] **Banners**: Set sale banner text; confirm it renders. Clear sale banner text; confirm it disappears.
- [ ] **Announcement Ticker**: Change ticker text; confirm the marquee changes on refresh.
- [ ] **Calendly Link**: Add a dynamic Calendly link; confirm embedding works; clear it; confirm it falls back to env variable URL.
- [ ] **FAQ CRUD**: Add a new FAQ; edit question; save and check `/faq` page. Hide FAQ; verify it disappears from public page.
- [ ] **Testimonial CRUD**: Add new review with specific rating, role, and avatar path. Verify it renders in `/reviews` page.
- [ ] **Stripe Checkout Integration**: Ensure adding active items to cart still redirects to Stripe Checkout and coupon `SUMMA20` is valid.
- [ ] **Build Check**: Run `npm run build` locally to guarantee TypeScript compilation checks pass.

---

## 20. Deployment Steps

1. Run the database migration script in the Supabase SQL editor.
2. Deploy expanded codebase modifications.
3. Verify Vercel production logs for any environment warnings.
4. Access the expanded admin panel and perform checks.

---

## 21. Rollback Plan

- **Database**: Run a rollback SQL script to drop newly added columns or revert default fields.
- **Code**: Git revert commits to restore original `src/routes/admin.tsx`, `src/routes/api/admin/products.ts`, and helper utilities.

---

## 22. Files Likely to Change

1. 💻 `src/routes/admin.tsx` - Expanded UI tabs and states.
2. 🔌 `src/routes/api/admin/products.ts` - Zod schema extension and db updates.
3. 🔌 `src/routes/api/admin/content.ts` - Support for new site-wide keys.
4. 🔌 `src/routes/api/admin/faqs.ts` [NEW] - API handler for FAQ CRUD.
5. 🔌 `src/routes/api/admin/testimonials.ts` [NEW] - API handler for review CRUD.
6. ⚙️ `src/lib/products.ts` - Update db model types and fetching functions (mapping `video_url`, `gallery_urls`, `availability`).
7. ⚙️ `src/lib/content.ts` - Update fetching functions for testimonials (support `role`, `avatar_url`) and FAQs.
8. ⚙️ `src/lib/calendly.ts` - Integrate site-content fallback for booking url.
9. 🎨 `src/components/site/ProductCard.tsx` - Use new availability field for badge.
10. 🖼️ `src/routes/products.$slug.tsx` - Use new availability field for cart buttons.
11. 📞 `src/routes/contact.tsx` - Read phone and email from database.
12. 🎉 `src/routes/success.tsx` - Read phone and email from database.
13. 🗺️ `src/components/site/Footer.tsx` - Read phone and email from database.
14. 🧭 `src/components/site/Header.tsx` - Render announcement ticker from database and display Sale Banner if text exists.
15. 🏠 `src/routes/index.tsx` - Make testimonials and FAQs dynamic by calling `fetchTestimonials` and `fetchFaqs` in route loader.
