# Implementation Plan - Expanding Katana Edge to 7 Products

This plan details the path to adding 5 new products to the Katana Edge website, expanding the catalog from 2 to 7 products, while keeping **Micro Slit** and **Fujisan** as prominent, featured Best Sellers.

It defines the architectural steps, codebase mappings, Stripe validation schemas, database schema migrations, and admin editor refactoring required to make these products editable and purchasable securely, without breaking any existing checkouts.

---

## 🔒 Crucial Scope Boundaries & Constraints

1.  **Do Not Modify Micro Slit and Fujisan Checkout**: Existing pricing, Stripe IDs, slugs, and database rows for Micro Slit and Fujisan must remain completely untouched.
2.  **Best Sellers Stay Front and Center**: Micro Slit and Fujisan must remain at the top of the homepage and catalog, featured with "BEST SELLER" badges.
3.  **New Products are Visually Secondary**: The five new products are displayed as secondary listings on `/products` and are not featured on the homepage. They default to a "Coming Soon" state if Stripe price configurations are missing.
4.  **No Kaze References**: Kaze is completely removed from the product catalog, directories, keys, and database registration scripts.

---

## 1. Current Product & Catalog Architecture

*   **Static Codebase Catalog**: Currently defined in `src/lib/products.ts`, which exports the `Product` type and the static `products` array containing:
    1.  `micro-slit-shears` (Micro Slit)
    2.  `fujisan-thinning-shears` (Fujisan)
*   **Database Integration**: Products fetch metadata from the database via `fetchDbProductBySlug(slug, fallback)` in `src/routes/products.$slug.tsx`.

---

## 2. Product Data Model Extensions

To support the sorting and badges, we will extend the `Product` type in `src/lib/products.ts` with optional properties:

```typescript
export type Product = {
  // ... existing fields ...
  featured?: boolean;
  bestSeller?: boolean;
  displayOrder?: number;
};
```

### Initial Configuration Values:
1.  **Micro Slit**: `featured: true`, `bestSeller: true`, `displayOrder: 1`
2.  **Fujisan**: `featured: true`, `bestSeller: true`, `displayOrder: 2`
3.  **Thunder**: `featured: false`, `bestSeller: false`, `displayOrder: 3`
4.  **Double Swivel**: `featured: false`, `bestSeller: false`, `displayOrder: 4`
5.  **Naruto**: `featured: false`, `bestSeller: false`, `displayOrder: 5`
6.  **Karakuri**: `featured: false`, `bestSeller: false`, `displayOrder: 6`
7.  **Bamboo**: `featured: false`, `bestSeller: false`, `displayOrder: 7`

---

## 3. Homepage & Shop Page Layout Strategy

### Homepage (`src/routes/index.tsx`)
*   **Prominent Displays**: Only display the two flagship shears (**Micro Slit** and **Fujisan**) in the main hero/showcase section, styled with prominent cards and an elegant **BEST SELLER** badge overlay.
*   **Explore Collections**: Add a prominent CTA button underneath the flagship products: `"SHOP ALL SHEARS"` linking directly to `/products`.

### Catalog Page (`src/routes/products.index.tsx`)
*   **Ordering**: Render products sorted by `displayOrder` so that **Micro Slit** and **Fujisan** always occupy the first two slots.
*   **Badges**: Micro Slit and Fujisan display a prominent, elegant ivory-gold **BEST SELLER** badge.
*   **Visual Hierarchy**: The five new products will render as secondary cards in the grid structure. If they do not have active Stripe pricing configured, they will render with a `COMING SOON` status.

---

## 4. Product-Key & Slug Strategy

The slug and server-side product key mappings:

| Product Name | Slug (URL) | Product Key (Server) | Status Default | Price (USD) |
|---|---|---|---|---|
| **Micro Slit** | `micro-slit-shears` | `microslit` | Active | $1,099.99 |
| **Fujisan** | `fujisan-thinning-shears` | `fujisan` | Active | $859.99 |
| **Thunder** | `thunder-shears` | `thunder` | Inactive / Coming Soon | $679.99 |
| **Double Swivel** | `double-swivel-shears` | `double_swivel` | Inactive / Coming Soon | $879.99 |
| **Naruto** | `naruto-shears` | `naruto` | Inactive / Coming Soon | $579.99 |
| **Karakuri** | `karakuri-shears` | `karakuri` | Inactive / Coming Soon | $719.99 |
| **Bamboo** | `bamboo-shears` | `bamboo` | Inactive / Coming Soon | $519.99 |

---

## 5. Image Assets Mappings

Each product has a dedicated directory inside `public/products/`. The user-provided images are mapped as follows:

1.  **Thunder**:
    *   Main: `public/products/thunder/main.webp` (Copied from uploaded `media__1781328483622.jpg`, previously described as Kaze)
2.  **Double Swivel**:
    *   Main: `public/products/double-swivel/main.webp` (Copied from uploaded `media__1781328441555.jpg`)
3.  **Naruto**:
    *   Main: `public/products/naruto/main.webp` (Copied from uploaded `media__1781328598986.jpg`)
4.  **Karakuri**:
    *   Main: `public/products/karakuri/main.webp` (Copied from uploaded `media__1781328641535.jpg`)
5.  **Bamboo**:
    *   Main: `public/products/bamboo/main.webp` (Copied from uploaded `media__1781328654824.jpg`)

---

## 6. Exact Files Changing

*   **`src/lib/products.ts`**: Add definitions for the 5 new products including `featured`, `bestSeller`, and `displayOrder`, along with secure server-side fetching functions (`getAllDbProducts`, `getDbProductBySlug`, and `getAdminDbProducts`).
*   **`src/routes/index.tsx`**: Render only `featured` products, and add the `"SHOP ALL SHEARS"` link.
*   **`src/routes/products.index.tsx`**: Read database products via server function, sort by `displayOrder`, and render.
*   **`src/components/site/ProductCard.tsx`**: Add `BEST SELLER` / `COMING SOON` badges and wrap reviews section in `product.reviewCount > 0` condition check.
*   **`src/routes/products.$slug.tsx`**: Disable cart actions and quantity controls for inactive products, render single-image galleries for single-image products, and conditional reviews.
*   **`src/routes/admin.tsx`**: Refactor dashboard loader to load all products via server function, enabling dynamic copywriting edits.
*   **`src/routes/api/admin/products.ts`**: Already supports the 5 new slugs; verify and keep intact.
*   **`public/products/`**: Holds high-quality webp product images mapped from the supplied photos.

---

## 7. Supabase Database Status
The 5 product rows exist in the `public.products` table with their correct pricing and active=false configuration. No database operations are performed.

## 8. Stripe Environment Variables Status
No Stripe variables or checkout config modifications are required for this display-only phase.

---

## 9. Verification & Rollback Plans

### Verification Checklist
*   Verify that `micro-slit-shears` and `fujisan-thinning-shears` remain fully purchasable and first in catalog.
*   Verify only Micro Slit and Fujisan display on the homepage.
*   Verify that all 5 new products render with "Coming Soon" badges on `/products` and their details pages have "Coming Soon" disabled buttons.
*   Verify the `/admin` copywriting dashboard dynamically updates details for all 7 models.
*   Verify that `npm run build` compiles cleanly.
