# Implementation Plan: Kai's Brand Update (Final Reduced Scope)

This document outlines the final approved visual, copywriting, and informational updates required to update the Katana Edge website in alignment with Kai's branding requests. All cart, checkout, Stripe, and new product registrations are excluded.

---

## 🔒 Crucial Checkout, Cart, and Stripe Safety Rules

To preserve payment and cart integrity:
1. **No Cart Modification**: The cart system and state hooks remain untouched.
2. **No Checkout Modification**: Payment request validation, webhooks, and the checkout page remain unchanged.
3. **Only Existing Products Purchasable**: Only the *Micro Slit* and *Fujisan* shears remain purchasable on the storefront.
4. **No Stripe Environment Keys**: No new Stripe Product/Price environment variables are required.
5. **Admin Console Isolated**: The `/admin` console remains copywriting-only and cannot edit prices, stripe IDs, or add new products.

---

## 1. Current Project Inspection

- **Framework**: TanStack Start.
- **Theme Variables**: Configured using Tailwind v4 custom variables in `src/styles.css`.
- **Product Mappings**: Kept in `src/lib/products.ts` and loaded dynamically from Supabase.

---

## 2. Exact Files to Modify

### Theme Styling
- `src/styles.css`: Swap the bright yellow/gold properties for the soft premium ivory gold.

### Copywriting, Stories, and Testimonials
- `src/routes/index.tsx`: Update homepage copy to stylist focus, add Seki blade history section, update trust metrics banner, and replace the Hawaiian testimonial.
- `src/routes/about.tsx`: Update philosophy text to pivot towards hairstylists and describe Seki metallurgy history.
- `src/lib/content.ts`: Clean up fallback testimonials list (remove Noriaki Nagayama, add Evelyn Carter review).

### Product Page Information
- `src/lib/products.ts`: Update gallery array for Micro Slit to show exactly 3 images.
- `src/routes/products.$slug.tsx`: Render static size buttons (5.5" and 6.5") for Micro Slit as informational-only (toggles visual state on the page, but adding to cart still orders standard `micro-slit-shears`).

---

## 3. Ivory Gold Color Update Plan

We will update color variables in [styles.css](file:///Users/davidkid9111/ai_website/katana-edge-craft/src/styles.css) to shift from a bright gold tone to a premium champagne/ivory gold tone:

```css
:root {
  --gold: #E5D3B3; /* Ivory gold / soft champagne tone */
  --accent: #E5D3B3;
  --ring: #E5D3B3;

  /* Premium luxury gradient and glow styles */
  --gradient-gold: linear-gradient(135deg, #F0E6D2 0%, #E5D3B3 50%, #C8B28D 100%);
  --shadow-gold: 0 0 60px -10px rgba(229, 211, 179, 0.35);
}
```

This transforms links, borders, selections, buttons, and badges uniformly across all views.

---

## 4. Copywriting & Seki Swords Story Plan

We will weave high-end stylist-centric copywriting and Seki heritage details into the core pages:
1. **Target Pivot**: Reframe phrasing from "barbers" to "hairstylists, barbers, and cutting professionals" on index and about pages.
2. **Seki, Japan Swords Story**:
   - Introduce Seki, Japan as the historic blade capital since the samurai era.
   - Describe the sword-making traditions (convex hand-honed blade geometries, master forging, heat tempering) inherited by our modern scissors.
   - Weave this narrative into a content block on the homepage.
3. **Stronger Trust Metrics Banner**:
   - "1,000+ Satisfied Stylists & Barbers"
   - "4.9/5 Verified Star Rating"
   - "1,000+ Stylists Globally"

---

## 5. Testimonials Cleanup Plan

1. **Remove Hawaiian Testimonial**: Remove the profile entry for `Noriaki Nagayama` (Hawaiian retirement copy) and its associated avatar link `testimonialProfessional3.png`.
2. **Instagram Review Placeholder**: Substitute a stylist review:
   - **Reviewer**: "Evelyn Carter"
   - **Role**: "Senior Stylist & Educator · Los Angeles"
   - **Quote**: "The edge retention on the Micro Slit is unbelievable. I cut through heavy dry textures all day with zero hand strain."

---

## 6. Micro Slit Gallery & Sizes View

1. **3-Image Product Gallery**: Limit the photo carousel array of Micro Slit to exactly 3 photos showing macro blade slits, full profile, and handle ergonomics.
2. **Informational Size Selector**:
   - Render button selector widgets showing **5.5"** and **6.5"** options on the product page.
   - Clicking these toggles state on the page but **does not affect cart additions or pricing**. Adding to cart still adds the standard `micro-slit-shears` item.

---

## 7. Testing Checklist

- [ ] **Accent Color Refinement**: Confirm borders, buttons, and hover outlines rendering in soft champagne `#E5D3B3` ivory tone.
- [ ] **Stylist Story Check**: Verify Seki blade capital content is readable on homepage and about pages.
- [ ] **Informational Size Options**: Verify Micro Slit size options toggle cleanly but do not create cart conflicts or alter item keys.
- [ ] **Testimonial Check**: Confirm the retirement testimonial is removed.
- [ ] **Cart & Checkout Success**: Add Micro Slit to cart and complete checkout redirect to Stripe checkout without errors.
