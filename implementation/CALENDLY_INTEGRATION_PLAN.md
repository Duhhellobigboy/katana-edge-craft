# Calendly Integration Plan — Katana Edge

Replace the current embedded quote/contact form with a **Calendly inline embed** for booking consultations.

**Status:** Planning only — do not implement until approved.

**Constraints (non-negotiable):**
- Calendly **embed only** (no Scheduling API, no custom scheduling backend, no admin panel)
- Single Calendly Event Type URL — **configured in `.env`** (see Section 5)
- Deploy target: **Vercel**
- Preserve Katana Edge branding **around** the widget (Calendly internal UI is limited)

**Configured event URL (source of truth):**

```bash
VITE_CALENDLY_URL=https://calendly.com/dadadaad81/30min
```

---

## 1. Current Repo Inspection

### Framework & runtime

| Item | Finding |
|------|---------|
| Framework | **React 19** + **TanStack Start** (full-stack) |
| Build / dev | **Vite 7** (`npm run dev`, `npm run build`) |
| Server | **Nitro** (Vercel preset — output `.vercel/output`) |
| Routing | **TanStack Router** — file-based routes in `src/routes/` |
| Styling | **Tailwind CSS v4** via `src/styles.css` (`@import "tailwindcss"`) + component utilities (`.container-luxe`, `.eyebrow`, `.btn-gold`, `.luxe-card`) |
| Deployment | `vercel.json` — `buildCommand: npm run build`, `outputDirectory: .vercel/output` |

### Where the current form lives

The quote/contact experience is **not** a custom React form with local fields. It is centralized in:

**`src/components/site/LeadForm.tsx`**

Current behavior:
- Injects third-party script: `https://link.msgsndr.com/js/form_embed.js` (LeadConnector / GoHighLevel)
- Renders an **iframe** to: `https://api.leadconnectorhq.com/widget/form/hFqPiDNnD8aNQwDr69kT`
- iframe `data-form-name`: `"Katana Edge Newsletter"`
- Section copy in our code: eyebrow `"Exclusive Access"`, heading `"Join the professionals' list"`
- At runtime, the **iframe content** may display the user-facing form (e.g. “Get an Instant Quote Today!” with First Name, Phone, message, consent) — that UI is **hosted inside LeadConnector**, not in this repo.

There is **no** local React Hook Form / Zod validation for those fields in the codebase.

### Where `LeadForm` is used (all `variant="compact"`)

| File | Context |
|------|---------|
| `src/routes/index.tsx` | Homepage — below “Trusted By Professionals” / above FAQ |
| `src/routes/contact.tsx` | Contact page — below phone/email/chat cards |
| `src/routes/products.$slug.tsx` | Product detail pages — below testimonials / above cross-sell |

`variant="inline"` exists on the component but is **not used** anywhere today.

### Related third-party embed (do not conflate)

**`src/components/site/ChatWidget.tsx`** loads `https://widgets.leadconnectorhq.com/loader.js` for live chat. This plan targets **`LeadForm` only** unless product owner wants chat removed or relocated separately.

### Brand styles source of truth

| Resource | Purpose |
|----------|---------|
| `src/styles.css` | CSS variables: `--background`, `--card`, `--gold` (`#d4af37`), `--muted-foreground`, etc. |
| `BRANDING_GUIDE.md` | Dark luxury palette, typography (Oswald display), spacing, card patterns |
| `Layout` + Tailwind classes on pages | Section structure around embeds |

### Files / components likely to change

| Path | Role |
|------|------|
| `src/components/site/LeadForm.tsx` | **Primary** — replace LeadConnector iframe + script with Calendly embed |
| `src/components/site/CalendlyEmbed.tsx` | **New (recommended)** — isolated client-side embed + script singleton |
| `src/routes/index.tsx` | Uses `LeadForm` — may only need import swap if component is renamed |
| `src/routes/contact.tsx` | Uses `LeadForm` |
| `src/routes/products.$slug.tsx` | Uses `LeadForm` |
| `src/styles.css` | Optional — `.calendly-embed-wrap` utility if needed |
| `.env` / Vercel env | `VITE_CALENDLY_URL` + optional `VITE_BRAND_*` wrapper vars (already in `.env`) |
| `GITHUB_ISSUES_GUIDE.md` | Optional doc update after implementation |
| `BRANDING_GUIDE.md` | Optional — document consultation booking section |

**Not in scope for this change:** checkout, cart, Stripe, Supabase, `ChatWidget.tsx`, navbar.

---

## 2. Recommended Embed Approach

### Options compared

| Approach | Pros | Cons |
|----------|------|------|
| **A. Calendly official inline embed** (`widget.js` + `.calendly-inline-widget`) | Official, responsive height, event listeners, documented | Requires careful single-script loading in SPA |
| **B. Raw iframe** (`https://calendly.com/...`) | Simple markup | Fixed height issues, weaker mobile behavior, less Calendly integration |
| **C. Third-party React npm wrapper** | React-friendly API | Extra dependency, may lag Calendly updates, unnecessary for one URL |

### Recommendation: **A — Official inline embed inside a small React wrapper**

**Why this is safest for Katana Edge:**

1. **TanStack Start / SPA navigation** — `LeadForm` can mount/unmount as users route between `/`, `/contact`, and product pages. A dedicated `CalendlyEmbed` component with a **singleton script loader** prevents duplicate `widget.js` injection (same problem pattern as today’s `form_embed.js` per mount).
2. **SSR** — Calendly must run **client-only** (`useEffect` or lazy client component). No server render of external scripts.
3. **Vercel** — Static embed + client hydration works with current Nitro/Vercel output; no API routes required.
4. **Official inline widget** auto-resizes better than a dumb iframe on mobile.
5. **No Scheduling API** — embed satisfies requirement without backend secrets.

### Styling limits (set expectations)

**We can style:**
- Section background, padding, max-width
- Heading / subtext (our typography)
- Outer card: dark bg, gold border, shadow
- Min-height container to reduce layout shift

**We cannot fully style via site CSS:**
- Calendly internal fields, buttons, calendar grid
- Those are controlled in **Calendly Dashboard → Appearance** (colors, hide details, etc.)

Align Calendly dashboard theme to dark/neutral where possible to match the wrapper.

---

## 3. Step-by-Step Implementation Tasks

### Phase 1 — Component & config

- [x] `VITE_CALENDLY_URL` added to `.env` → `https://calendly.com/dadadaad81/30min`
- [x] Optional brand wrapper vars added to `.env` (`VITE_BRAND_PRIMARY`, `VITE_BRAND_TEXT`, `VITE_BRAND_BG`)
- [ ] Document variables in `GITHUB_ISSUES_GUIDE.md` (env table)
- [ ] Create `src/components/site/CalendlyEmbed.tsx` (client-only embed logic)
- [ ] Refactor `LeadForm.tsx` to render branded wrapper + `CalendlyEmbed` (or rename to `ConsultationBooking.tsx` if clearer)

### Phase 2 — Remove old form

- [ ] Remove LeadConnector `form_embed.js` injection from `LeadForm.tsx`
- [ ] Remove LeadConnector iframe markup and hardcoded form ID `hFqPiDNnD8aNQwDr69kT`
- [ ] Confirm no other references to `leadconnectorhq.com` in `LeadForm` (chat widget stays separate)

### Phase 3 — Branded section copy

- [ ] Update eyebrow (suggestion: `Consultation` or keep premium tone)
- [ ] Heading: **“Book Your Consultation”**
- [ ] Subtext: **“Choose a time that works for you. Your booking is handled securely through Calendly.”**
- [ ] Wrap widget in dark card: `bg-card border border-gold/30` (or `border-gold/40`)
- [ ] Use `container-luxe` + `max-w-4xl mx-auto` for layout parity with current section

### Phase 4 — Embed wiring

- [ ] Load `https://assets.calendly.com/assets/external/widget.js` **once** globally (module-level flag or `window` guard)
- [ ] Initialize `Calendly.initInlineWidget({ url, parentElement, ... })` after script onload
- [ ] Set `minHeight` on container (~630px desktop, ~700px+ mobile — tune in QA)
- [ ] Pass URL from `import.meta.env.VITE_CALENDLY_URL` → `https://calendly.com/dadadaad81/30min`
- [ ] Apply wrapper colors from `VITE_BRAND_PRIMARY`, `VITE_BRAND_TEXT`, `VITE_BRAND_BG` (inline styles or CSS variables on container)

### Phase 5 — Resilience

- [ ] Add load timeout (e.g. 8–10s) — if widget never initializes, show fallback UI
- [ ] Fallback copy: **“Booking calendar failed to load. Please refresh the page or contact us directly.”**
- [ ] Fallback link: `tel:+13163682814` and `mailto:hello@katanaedge.com` (matches contact page)
- [ ] Avoid duplicate init on React Strict Mode double-mount (guard with ref)

### Phase 6 — Mobile & performance

- [ ] Test horizontal overflow on small screens (`overflow-x-hidden` on wrapper if needed)
- [ ] Reserve min-height before script loads to reduce CLS
- [ ] Remove unused LeadConnector script from bundle/DOM on route change

### Phase 7 — Verification

- [ ] Complete QA checklist (Section 7)
- [ ] Vercel preview deployment
- [ ] Mirror `.env` Calendly + brand vars on Vercel (Production + Preview) and redeploy
- [ ] Confirm Calendly confirmation email received for `dadadaad81/30min` event

---

## 4. Files and Components to Add or Modify

### New files

```
src/components/site/CalendlyEmbed.tsx   # Client-only Calendly inline widget
```

Optional:

```
src/lib/calendly.ts                     # URL helper + script loader singleton (if embed file grows)
```

### Modify

```
src/components/site/LeadForm.tsx          # Replace iframe form → Calendly wrapper + copy
src/routes/index.tsx                      # No logic change if LeadForm API unchanged
src/routes/contact.tsx                    # Same
src/routes/products.$slug.tsx             # Same
.env                                      # VITE_CALENDLY_URL + VITE_BRAND_* (configured)
```

### Do not modify (unless explicitly approved)

```
src/components/site/ChatWidget.tsx        # Separate LeadConnector chat — out of scope
src/routes/checkout.tsx                   # Stripe guest checkout
src/routes/api/*                          # No Calendly API routes
```

### Suggested `CalendlyEmbed` responsibilities

1. Read `import.meta.env.VITE_CALENDLY_URL` (`https://calendly.com/dadadaad81/30min`); if missing/invalid, show fallback immediately
2. Append Calendly script once
3. Initialize inline widget with that URL via `Calendly.initInlineWidget({ url: calendlyUrl, parentElement, ... })`
4. Expose loading / error state for fallback message
5. Cleanup: do not remove global script on unmount (Calendly recommendation); only clear widget container if re-init needed

### Suggested brand env usage (`LeadForm` wrapper)

Read optional public vars for wrapper styling (fallback to `styles.css` tokens if unset):

| Variable | Value in `.env` | Usage |
|----------|-----------------|-------|
| `VITE_BRAND_PRIMARY` | `#D4AF37` | Gold border, eyebrow accent, hairline |
| `VITE_BRAND_TEXT` | `#FFFFFF` | Heading / subtext on dark section |
| `VITE_BRAND_BG` | `#050505` | Section or inner card background |

Example:

```tsx
const brandBg = import.meta.env.VITE_BRAND_BG ?? "#050505";
const brandPrimary = import.meta.env.VITE_BRAND_PRIMARY ?? "#D4AF37";
```

### Suggested `LeadForm` structure after change

```tsx
<section id="contact" className="scroll-mt-28 py-12 md:py-20 bg-card border-y border-border">
  <div className="container-luxe max-w-4xl mx-auto text-center">
    <p className="eyebrow">Consultation</p>
    <h2 className="font-display ...">Book Your Consultation</h2>
    <p className="text-muted-foreground ...">Choose a time that works for you...</p>
    <div className="mt-8 border border-gold/30 bg-background p-4 md:p-6">
      <CalendlyEmbed />
    </div>
  </div>
</section>
```

(Pseudocode — final classes to match `BRANDING_GUIDE.md`.)

---

## 5. Environment / Config Needed

### Variables (configured in `.env`)

All are **public** `VITE_*` values — safe for the client bundle. **No Calendly API key or Scheduling API token is required.**

```bash
# =========================================================
# CALENDLY
# =========================================================

VITE_CALENDLY_URL=https://calendly.com/dadadaad81/30min

# Optional brand values for Calendly wrapper styling
VITE_BRAND_PRIMARY=#D4AF37
VITE_BRAND_TEXT=#FFFFFF
VITE_BRAND_BG=#050505
```

### Embed URL breakdown

| Part | Value |
|------|-------|
| Calendly username | `dadadaad81` |
| Event type slug | `30min` |
| Full inline embed URL | `https://calendly.com/dadadaad81/30min` |

This URL is passed to the **inline embed only** (`Calendly.initInlineWidget` or `data-url` on `.calendly-inline-widget`). Do **not** call Calendly’s REST Scheduling API.

### Where to configure

| Environment | Location | Required vars |
|-------------|----------|---------------|
| Local dev | Project root `.env` | All four vars above (already present) |
| Vercel Production | Project → Settings → Environment Variables | Same values — **must match `.env`** |
| Vercel Preview | Same | Same URL unless a separate test event is desired |

### Vercel notes

- `VITE_*` vars are inlined at **build time** — changing them requires a **redeploy**
- No server secret needed for embed-only approach
- Copy all four vars to **Production** and **Preview** before merging implementation

### Fallback if env is unset

`CalendlyEmbed` should detect missing or empty `import.meta.env.VITE_CALENDLY_URL` and show the fallback message (Section 9). Do not hardcode the URL in component source — always read from env so Vercel can override per environment.

### Changing the event later

1. Update `VITE_CALENDLY_URL` in `.env` and Vercel env settings
2. Redeploy (Vite bakes `VITE_*` at build time)
3. No code change if component only reads `import.meta.env.VITE_CALENDLY_URL`

---

## 6. Branding Plan

### Section treatment

Match **Katana Edge** dark luxury (see `BRANDING_GUIDE.md`):

| Element | Spec |
|---------|------|
| Section background | `bg-card` or `bg-[#0a0a0a]` with `border-y border-border` |
| Container | `container-luxe`, centered, `max-w-4xl` |
| Eyebrow | `.eyebrow` — gold, uppercase, letter-spaced |
| Heading | `.font-display` uppercase — **BOOK YOUR CONSULTATION** |
| Subtext | `text-muted-foreground`, readable line length |
| Widget wrapper | Background from `VITE_BRAND_BG` (`#050505`), border from `VITE_BRAND_PRIMARY` (`#D4AF37`), text from `VITE_BRAND_TEXT` (`#FFFFFF`) |
| Gold accent line | Optional `.hairline` gradient divider above widget (use `VITE_BRAND_PRIMARY`) |
| CSS fallback | If brand env vars missing, use `styles.css` tokens (`--gold`, `--background`, `--foreground`) |

### Calendly dashboard (outside repo)

In Calendly → Event Type → Appearance:
- Prefer dark or neutral background
- Hide Calendly branding if plan allows
- Match button color to gold `#D4AF37` if customization is available

### Avoid

- Plain white full-width form block floating on black page without a card wrapper
- Competing CTAs directly above/below widget (keep one clear booking action)

### Placement consistency

Because `LeadForm` appears on **homepage, contact, and product pages**, the same branded Calendly section will show in all three unless we later split variants (see Open Questions).

---

## 7. QA Checklist

### Browsers & devices

- [ ] Desktop — Chrome (latest)
- [ ] Desktop — Safari (latest)
- [ ] Mobile — Safari (iOS)
- [ ] Mobile — Chrome (Android)

### Functional

- [ ] Calendly inline widget loads and shows available times
- [ ] Can complete a test booking end-to-end
- [ ] Calendly confirmation screen appears after booking
- [ ] Confirmation email received from Calendly
- [ ] Time zone displays correctly (verify against Calendly account TZ settings)
- [ ] Back button / browser history behavior acceptable after booking
- [ ] Navigating away and back (SPA) does not break widget or duplicate scripts

### Technical

- [ ] No console errors related to Calendly or CSP
- [ ] `widget.js` loads **once** per full page session (check Network tab on route changes)
- [ ] No duplicate Calendly iframes in DOM after visiting home → contact → product
- [ ] Widget fits mobile viewport — no horizontal scroll
- [ ] Acceptable CLS — reserved min-height before load
- [ ] Lighthouse performance not severely degraded on pages with embed

### Deployment

- [ ] `npm run build` succeeds locally
- [ ] Vercel preview deploy loads `https://calendly.com/dadadaad81/30min` from `VITE_CALENDLY_URL`
- [ ] All four Calendly/brand `VITE_*` vars set on Vercel Production before go-live

### Privacy / cookies

- [ ] Calendly cookie banner / third-party cookies behavior acceptable
- [ ] Privacy policy / contact page still accurate (third-party scheduling mentioned if required)

### Regression

- [ ] Checkout (`/checkout`) unaffected
- [ ] Cart unaffected
- [ ] Chat widget still works (if kept)
- [ ] Product pages still render correctly below embed

---

## 8. Rollout Plan

1. **Branch** — implement on feature branch (e.g. `calendly-booking-embed`)
2. **Local** — `.env` already has `VITE_CALENDLY_URL=https://calendly.com/dadadaad81/30min`; run `npm run dev`, verify all three `LeadForm` placements
3. **PR** — open PR with screenshots (desktop + mobile) and QA notes
4. **Vercel Preview** — set all four `VITE_CALENDLY_URL` + `VITE_BRAND_*` vars to match `.env`
5. **Stakeholder approval** — confirm branding wrapper + booking flow on preview URL
6. **Production** — same env values on Vercel Production
7. **Redeploy** — trigger production build (env vars baked at build time)
8. **Live verification** — one real test booking on `dadadaad81/30min` + confirmation email
9. **Merge** — only after preview approved
10. **Post-merge** — remove or archive LeadConnector form in GHL dashboard if no longer needed (ops step, outside repo)

---

## 9. Fallback Plan

If Calendly script fails, URL is missing, or widget does not initialize within timeout:

**Display:**

> Booking calendar failed to load. Please refresh the page or contact us directly.

**Include:**
- Phone: [+1 (316) 368-2814](tel:+13163682814)
- Email: [hello@katanaedge.com](mailto:hello@katanaedge.com)

**Styling:** Same error pattern as checkout — dark red tint optional, or muted card with `AlertTriangle` icon for consistency.

**Do not** fall back to the old LeadConnector iframe automatically (clean cutover).

---

## 10. Future Upgrades (optional, not in v1)

| Upgrade | Notes |
|---------|-------|
| **Prefill name/email** | If we collect fields before embed, pass `prefill` query params or Calendly `data-url` params — requires privacy review |
| **Analytics** | Track `calendly.event_scheduled` via `window` listener on Calendly postMessage / official event hooks |
| **Thank-you page** | Calendly redirect to `/consultation-confirmed` on Katana Edge after booking |
| **UTM tracking** | Append `utm_source=katana-edge&utm_medium=website` to embed URL |
| **Webhooks** | Calendly webhooks → n8n / email automations (requires server endpoint — separate project) |
| **Multiple event types** | Separate URLs for salon vs education consults — would need UI selector or multiple pages |
| **Contact page only** | Split `LeadForm` vs `CalendlyBooking` if product pages should not show scheduler |
| **Calendly popup widget** | Alternative UX — button opens modal instead of inline (not requested for v1) |

---

## Reference — Calendly inline embed (implementation hint)

Official pattern (for developers during implementation):

```html
<link href="https://assets.calendly.com/assets/external/widget.css" rel="stylesheet">
<script src="https://assets.calendly.com/assets/external/widget.js" async></script>
<div class="calendly-inline-widget"
     data-url="https://calendly.com/dadadaad81/30min"
     style="min-width:320px;height:630px;">
</div>
```

In React, prefer `Calendly.initInlineWidget({ url: import.meta.env.VITE_CALENDLY_URL, ... })` after script load instead of static duplicate scripts per component instance. **Do not** use the Calendly Scheduling API.

Example init (implementation reference):

```ts
Calendly.initInlineWidget({
  url: import.meta.env.VITE_CALENDLY_URL, // https://calendly.com/dadadaad81/30min
  parentElement: containerRef.current,
});
```

---

## Open Questions (resolve before coding)

1. **Placement scope** — Should Calendly replace `LeadForm` on **all three** locations (home, contact, every product page), or **contact page only**?
2. ~~**Real Calendly URL**~~ — **Resolved:** `https://calendly.com/dadadaad81/30min` via `VITE_CALENDLY_URL`
3. **LeadConnector cleanup** — Deactivate old GHL form `hFqPiDNnD8aNQwDr69kT` in dashboard after cutover?
4. **Chat widget** — Keep `ChatWidget.tsx` LeadConnector chat alongside Calendly?
5. **Section ID** — Keep `id="contact"` on compact variant for anchor links / header CTAs?
6. **Calendly appearance** — Who will configure dark theme / brand colors inside Calendly dashboard? (Wrapper uses `VITE_BRAND_*`; internal Calendly UI still dashboard-controlled.)
7. **Privacy policy** — Does site policy need an update for Calendly as a third-party processor?

---

## Approval gate

**Do not implement until:**
- [ ] This plan is approved
- [ ] Remaining open questions above are answered
- [x] `VITE_CALENDLY_URL` agreed — `https://calendly.com/dadadaad81/30min`
- [x] Brand wrapper env vars agreed — `VITE_BRAND_PRIMARY`, `VITE_BRAND_TEXT`, `VITE_BRAND_BG`

---

*Document version: 1.1 — June 2026 — updated with production Calendly URL and brand env vars from `.env`.*
