-- ============================================================
-- KATANA EDGE - Database Schema Migration
-- ============================================================

-- 1. Create Protected Product Variants Table
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_key TEXT UNIQUE NOT NULL,
    size_label TEXT,
    handle_label TEXT,
    style_label TEXT,
    sku TEXT UNIQUE,
    price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
    compare_at_cents INTEGER CHECK (compare_at_cents IS NULL OR compare_at_cents >= 0),
    currency TEXT NOT NULL DEFAULT 'usd',
    stripe_product_id TEXT,
    stripe_price_id TEXT,
    active BOOLEAN NOT NULL DEFAULT false,
    inventory_quantity INTEGER CHECK (inventory_quantity IS NULL OR inventory_quantity >= 0),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- 2. Create Public-Safe View for Client Frontend
CREATE OR REPLACE VIEW public.product_variants_public AS
SELECT
    id,
    product_id,
    variant_key,
    size_label,
    handle_label,
    style_label,
    price_cents,
    compare_at_cents,
    currency,
    active,
    sort_order
FROM public.product_variants
WHERE active = true;

-- 3. Add Nullable Additive Columns to Order Items
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS variant_key TEXT,
ADD COLUMN IF NOT EXISTS selected_size TEXT,
ADD COLUMN IF NOT EXISTS selected_handle TEXT,
ADD COLUMN IF NOT EXISTS selected_style TEXT,
ADD COLUMN IF NOT EXISTS sku TEXT;

-- 4. Insert Bamboo Thinning Shear as a separate product
INSERT INTO public.products (
    slug, name, product_key, tagline, price_cents, image_url,
    short_description, long_description, active, currency,
    features, benefits, specs, faq, rating, review_count
) VALUES (
    'bamboo-thinning-shears',
    'Bamboo Thinning Shear',
    'bamboo_thinning',
    'Eco-conscious blend. Smooth, bulk texturizing.',
    41999,
    '/products/bamboo-thinning/main.webp',
    '30 Teeth: Specifically crafted for efficient bulk removal, these shears offer quick and controlled thinning.',
    'Designed to handle bulk with precision, the ergonomic construction ensures a comfortable grip, allowing hairstylists to effortlessly create texture and remove excess weight.\n\nThe perfect blend of functionality and eco-conscious design for streamlined hairstyling.',
    false,
    'usd',
    '[]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    0,
    0
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    product_key = EXCLUDED.product_key,
    tagline = EXCLUDED.tagline,
    price_cents = EXCLUDED.price_cents,
    image_url = EXCLUDED.image_url,
    short_description = EXCLUDED.short_description,
    long_description = EXCLUDED.long_description,
    active = EXCLUDED.active;

-- 5. Seed variants for Micro Slit
DO $$
DECLARE
    microslit_id UUID;
BEGIN
    SELECT id INTO microslit_id FROM public.products WHERE slug = 'micro-slit-shears';
    
    IF microslit_id IS NOT NULL THEN
        INSERT INTO public.product_variants (product_id, variant_key, size_label, price_cents, stripe_price_id, stripe_product_id, active, sort_order)
        VALUES 
            (microslit_id, 'microslit_55', '5.5', 109999, 'price_1Tf6lG2MuPGmYXKi9Gzn1o1q', 'prod_UePaCl5yG6BVWz', true, 1),
            (microslit_id, 'microslit_60', '6.0', 109999, 'price_1Tf6lG2MuPGmYXKi9Gzn1o1q', 'prod_UePaCl5yG6BVWz', true, 2),
            (microslit_id, 'microslit_65', '6.5', 109999, 'price_1Tf6lG2MuPGmYXKi9Gzn1o1q', 'prod_UePaCl5yG6BVWz', true, 3),
            (microslit_id, 'microslit_70', '7.0', 109999, 'price_1Tf6lG2MuPGmYXKi9Gzn1o1q', 'prod_UePaCl5yG6BVWz', true, 4)
        ON CONFLICT (variant_key) DO UPDATE SET
            price_cents = EXCLUDED.price_cents,
            stripe_price_id = EXCLUDED.stripe_price_id,
            stripe_product_id = EXCLUDED.stripe_product_id,
            active = EXCLUDED.active;
    END IF;
END $$;

-- 6. Update Image URLs for Micro Slit and Fujisan to the standardized WebP layout
UPDATE public.products SET image_url = '/products/micro-slit/main.webp' WHERE slug = 'micro-slit-shears';
UPDATE public.products SET image_url = '/products/fujisan/main.webp' WHERE slug = 'fujisan-thinning-shears';

