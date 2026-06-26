-- ============================================================
-- KATANA EDGE - Database Schema Migration V2
-- Expand Admin Content Editor Fields
-- ============================================================

-- 1. Add new columns to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS gallery_urls JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS availability TEXT DEFAULT 'Coming Soon' CHECK (availability IN ('Available', 'Coming Soon'));

-- 2. Add new columns to testimonials table
ALTER TABLE public.testimonials
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'Verified Professional',
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 3. Seed site_content with missing site-wide business/contact and banner keys
INSERT INTO public.site_content (key, label, value, type, section)
VALUES 
  ('contact.support.phone', 'Support Phone', '+1 (316) 368-2814', 'text', 'contact'),
  ('contact.calendly.url', 'Calendly URL', '', 'text', 'contact'),
  ('home.sale_banner.text', 'Sale Banner Text', '', 'text', 'homepage'),
  ('home.announcement.text', 'Announcement Bar Text', 'INSPIRED BY SEKI • TRUSTED WORLDWIDE • PRECISION WITHOUT COMPROMISE', 'text', 'homepage')
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  type = EXCLUDED.type,
  section = EXCLUDED.section;
