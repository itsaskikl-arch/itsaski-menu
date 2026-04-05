-- Run this SQL in the Supabase SQL Editor for project hjbegsobbmlaayezsuow

CREATE TABLE IF NOT EXISTS public.menu_categories (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  description   text,
  display_order integer NOT NULL DEFAULT 0,
  visible       boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.menu_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id   uuid NOT NULL REFERENCES public.menu_categories(id) ON DELETE CASCADE,
  name          text NOT NULL,
  description   text,
  price         numeric(8,2),
  is_available  boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  featured      boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Public (anon) can read visible categories and available items
CREATE POLICY "Public read menu_categories"
  ON public.menu_categories FOR SELECT TO anon
  USING (visible = true);

CREATE POLICY "Public read menu_items"
  ON public.menu_items FOR SELECT TO anon
  USING (is_available = true);

-- Authenticated (admin) can do everything
CREATE POLICY "Admin all menu_categories"
  ON public.menu_categories FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Admin all menu_items"
  ON public.menu_items FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
