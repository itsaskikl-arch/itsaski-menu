-- ============================================================
-- ITSASKI MENU TABLES
-- Run this in the Supabase SQL Editor (project hjbegsobbmlaayezsuow)
-- ============================================================

-- Drop old simple tables if they exist
DROP TABLE IF EXISTS public.menu_items CASCADE;
DROP TABLE IF EXISTS public.menu_categories CASCADE;

-- ── CATEGORIES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_eu       text,
  name_es       text NOT NULL,
  name_en       text,
  name_fr       text,
  description_eu text,
  description_es text,
  description_en text,
  description_fr text,
  icon          text,
  display_order integer NOT NULL DEFAULT 0,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ── DISHES ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.dishes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id     uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name_eu         text,
  name_es         text NOT NULL,
  name_en         text,
  name_fr         text,
  description_eu  text,
  description_es  text,
  description_en  text,
  description_fr  text,
  price           numeric(8,2),
  image_url       text,
  allergens       jsonb NOT NULL DEFAULT '[]',
  is_vegan        boolean NOT NULL DEFAULT false,
  is_gluten_free  boolean NOT NULL DEFAULT false,
  is_spicy        boolean NOT NULL DEFAULT false,
  is_chef_pick    boolean NOT NULL DEFAULT false,
  is_available    boolean NOT NULL DEFAULT true,
  availability_type text NOT NULL DEFAULT 'all',
  display_order   integer NOT NULL DEFAULT 0,
  is_popular      boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;

-- Public read (anon)
CREATE POLICY "Public read categories"
  ON public.categories FOR SELECT TO anon USING (is_active = true);

CREATE POLICY "Public read dishes"
  ON public.dishes FOR SELECT TO anon USING (is_available = true);

-- Admin full access
CREATE POLICY "Admin all categories"
  ON public.categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin all dishes"
  ON public.dishes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── INSERT CATEGORIES ─────────────────────────────────────────
INSERT INTO public.categories (id, name_eu, name_es, name_en, name_fr, display_order, is_active) VALUES
  ('11111111-0000-0000-0000-000000000002', 'Errazioak',         'Raciones',          'Portions',       'Portions',          0,  true),
  ('11111111-0000-0000-0000-000000000004', 'Plater Konbinatuak','Platos Combinados',  'Combo Plates',   'Plats Combinés',    1,  true),
  ('dbb6cac1-bbf9-4b30-bd20-04aa2261bebf','Milanesak',          'Milanesas',          'Breaded Cutlets','Milanaises',        4,  true),
  ('11111111-0000-0000-0000-000000000003', 'Ogitartekoak',      'Bocadillos',         'Sandwiches',     'Sandwichs',         5,  true),
  ('4152c7ed-fec6-4928-bfbe-7c65508e59f9','Hanburgesak',        'Hamburguesas',       'Burgers',        'Hamburgers',        8,  true),
  ('11111111-0000-0000-0000-000000000001', 'Pintxoak',          'Pintxos',            'Pintxos',        'Pintxos',           10, true),
  ('64f006f9-610d-4c8a-b02a-cabba099084f','Plater bereziak',    'Platos especiales',  'Special dishes', 'Plats spéciaux',    9,  true),
  ('1b60e527-0a2f-4fa6-a6e7-109efe15b01a','Entsaladak',         'Ensaladas',          'Salads',         'Salades',           11, true)
ON CONFLICT (id) DO NOTHING;

-- ── INSERT DISHES ─────────────────────────────────────────────

-- PINTXOS (display_order 10)
INSERT INTO public.dishes (id, category_id, name_eu, name_es, description_eu, description_es, price, allergens, is_gluten_free, is_chef_pick, display_order) VALUES
  ('3aa21928-d924-425e-a776-c1e710bd9212','11111111-0000-0000-0000-000000000001','Patata Tortilla','Tortilla de patata','Etxeko patata tortilla','Tortilla de patata casera',2.20,'["eggs"]',true,false,1),
  ('fe602785-ea7c-4123-b59c-f635047bed0d','11111111-0000-0000-0000-000000000001','Albondiga','Albóndiga','Etxeko saltsan','En salsa casera',2.50,'["gluten","eggs"]',false,false,2),
  ('03e17e6a-aec1-4d47-a371-103ab9b45eb9','11111111-0000-0000-0000-000000000001','Txistorra','Chistorra','Nafarroako txistorra','Chistorra navarra',2.50,'[]',true,false,3),
  ('bfcd5c21-c58a-4d6f-96e8-87681df6a7dc','11111111-0000-0000-0000-000000000001','Txorizo egosia','Chorizo cocido','Txorizo egosia tradizionala','Chorizo cocido tradicional',2.50,'[]',true,false,4),
  ('16c5d220-a6a7-48f7-be1f-673bc983f3a1','11111111-0000-0000-0000-000000000001','Quiche','Quiche','Etxeko quiche','Quiche casera',3.00,'["gluten","dairy","eggs"]',false,false,5),
  ('fd24283d-2911-49f7-a617-4ae493839458','11111111-0000-0000-0000-000000000001','Kroketa','Croqueta','Etxeko kroketa krematsua','Croqueta cremosa casera',2.50,'["gluten","dairy","eggs"]',false,true,6),
  ('d265b414-818d-45cd-ab38-2520a25dcf1d','11111111-0000-0000-0000-000000000001','Oilasko brotxeta','Brocheta de pollo','Oilasko brotxeta errea','Brocheta de pollo a la plancha',2.80,'[]',true,false,7),
  ('ea4df5f1-7505-4216-9a7d-cda88d32cdea','11111111-0000-0000-0000-000000000001','Torreznoak','Torreznos','Torreznoak kurruskari','Torreznos crujientes',3.50,'[]',true,false,8),
  ('b196d030-de34-431e-a7cd-b80f198c0cba','11111111-0000-0000-0000-000000000001','Azpizuna roquefortarekin','Solomillo con roquefort','Azpizun xerra roquefort saltsarekin','Medallón de solomillo con salsa roquefort',7.50,'[]',false,false,9),
  ('89521f3e-b2b1-435b-82be-ccea1aaaebdd','11111111-0000-0000-0000-000000000001','Belarri-brotxeta','Brocheta de oreja',NULL,NULL,3.20,'[]',false,false,10),
  ('d7b678f7-7fc3-4656-8202-4c3ed619db48','11111111-0000-0000-0000-000000000001','Belarria saltsan','Oreja en salsa',NULL,NULL,3.20,'[]',false,false,11)
ON CONFLICT (id) DO NOTHING;

-- RACIONES
INSERT INTO public.dishes (id, category_id, name_eu, name_es, description_eu, description_es, price, allergens, is_vegan, is_gluten_free, is_spicy, is_chef_pick, display_order) VALUES
  ('a2f94896-a4d7-42e8-85b4-bd76b6bba077','11111111-0000-0000-0000-000000000002','Natxoak','Nachos','Natxoak gazta, guacamole eta pico de gallo-rekin','Nachos con queso, guacamole y pico de gallo',9.80,'["dairy"]',false,false,true,false,1),
  ('16f97f60-f8ca-4663-82a6-a0358c7e3c73','11111111-0000-0000-0000-000000000002','Patatak 3 saltsarekin','Patatas 3 salsas','Patatak alioli, brava eta barbakoa saltsarekin','Patatas con alioli, brava y barbacoa',7.00,'["eggs"]',false,true,true,false,2),
  ('388f0e58-cc08-49ce-85d6-60f19d4f5b52','11111111-0000-0000-0000-000000000002','Oilasko fingersak','Fingers de pollo','Oilasko finger kurruskari saltsarekin','Crujientes fingers de pollo con salsa',9.50,'["gluten","eggs"]',false,false,false,false,3),
  ('8aaea9a2-e062-428f-9284-8b92bb5bd733','11111111-0000-0000-0000-000000000002','Albondigak','Albóndigas','Albondiga errazio etxeko saltsan','Ración de albóndigas en salsa casera',9.00,'["gluten","eggs"]',false,false,false,false,4),
  ('9265964e-b7ab-4182-8f4e-f231e199346f','11111111-0000-0000-0000-000000000002','Humusa azenario makiltxoekin','Hummus con palitos de zanahoria','Etxeko humusa azenario fresko makiltxoekin','Hummus casero con palitos de zanahoria fresca',7.90,'["sesame"]',true,true,false,false,5),
  ('b29839f1-a18f-43b4-b9c9-b2d902d11d0d','11111111-0000-0000-0000-000000000002','Txanpi nahaskia','Revuelto de champis','Basoko perretxikoekin egindako arrautza nahaskia','Huevos revueltos con setas silvestres',8.50,'["eggs"]',false,true,false,false,7),
  ('8bdb3e83-4995-45aa-af3d-329ce3352c19','11111111-0000-0000-0000-000000000002','Oilasko hegalak','Alitas de pollo','6 oilasko hegal kurruskari saltsa bereziarekin','6 alitas de pollo crujientes con salsa especial',9.20,'[]',false,true,true,true,8),
  ('73c84063-d3ae-4550-95bc-ca13c6830f5f','11111111-0000-0000-0000-000000000002','Belarria saltsan','Oreja en salsa',NULL,NULL,9.80,'[]',false,false,false,false,9),
  ('83df7004-79b9-4b4d-8175-a756a8790e32','11111111-0000-0000-0000-000000000002','Tripakiak','Callos',NULL,NULL,9.80,'[]',false,false,false,false,10),
  ('73564396-5042-44b5-98b0-4e3e73455b27','11111111-0000-0000-0000-000000000002','Oilasko frijitua patatekin','Pollo frito con patatas','3 oilasko zati frijitu patatekin','3 piezas de pollo frito con patatas',10.90,'[]',false,false,false,false,11)
ON CONFLICT (id) DO NOTHING;

-- BOCADILLOS
INSERT INTO public.dishes (id, category_id, name_eu, name_es, description_eu, description_es, price, allergens, is_vegan, is_gluten_free, is_chef_pick, display_order) VALUES
  ('bc6c85e6-2d57-4258-9e92-39620c10a79a','11111111-0000-0000-0000-000000000003','Lomoa, gazta, hirugiharra eta piper berdea','Lomo, queso, bacon y pimiento verde',NULL,NULL,7.50,'["gluten","dairy"]',false,false,false,1),
  ('f0b3f40e-6f1e-4bec-8d70-6c992409f3c2','11111111-0000-0000-0000-000000000003','Oilasko bularra, gazta, letxuga, tomatea eta aliolia','Pechuga pollo, queso, lechuga, tomate y alioli',NULL,NULL,7.90,'["gluten","dairy","eggs"]',false,false,false,2),
  ('42921ba1-7380-4219-b2fc-f0baed475932','11111111-0000-0000-0000-000000000003','Patata-tortilla','Tortilla de patata',NULL,NULL,7.00,'["gluten","eggs"]',false,false,false,3),
  ('75f97933-bbe3-4d0c-8d1b-3b346074e361','11111111-0000-0000-0000-000000000003','Tortilla askotarikoak','Tortillas variadas','Aukeratu zure gustuko tortilla','Elige tu tortilla preferida',8.00,'["gluten","eggs"]',false,false,false,4),
  ('b20ae5e4-44d0-442c-ae55-bb402bc0ea45','11111111-0000-0000-0000-000000000003','Oilasko bular enpanatua, hirugiharra, gazta etxeko saltsan','Pechuga empanada, bacon, queso en salsa de la casa','Ogitarteko berezia etxeko saltsarekin','Bocadillo especial con salsa de la casa',8.50,'["gluten","dairy","eggs"]',false,false,true,5),
  ('61a14faf-3bbd-4d28-afc0-46707d7f24f6','11111111-0000-0000-0000-000000000003','Kalabazina, txanpinoiak, piper berdea eta gorria, tipula gorria','Calabacín, champis, pimiento verde y rojo, cebolla morada','Barazki freskoekin egindako ogitarteko begetarianoa','Bocadillo vegetariano con verduras frescas',8.50,'["gluten"]',true,false,false,6)
ON CONFLICT (id) DO NOTHING;

-- PLATOS COMBINADOS
INSERT INTO public.dishes (id, category_id, name_eu, name_es, description_eu, description_es, price, allergens, is_gluten_free, is_chef_pick, display_order) VALUES
  ('803ff036-be62-4cef-a4d9-59445f25444b','11111111-0000-0000-0000-000000000004','Solomo + patatak','Lomo + patatas','Solomo plantxan patata frijituekin','Lomo a la plancha con patatas fritas',10.50,'[]',true,false,1),
  ('f8ace2ea-5619-4284-91f1-16706f1b5699','11111111-0000-0000-0000-000000000004','Oilasko bularra + patatak','Pechuga de pollo + patatas','Oilasko bular plantxan patata frijituekin','Pechuga de pollo a la plancha con patatas fritas',10.50,'[]',true,false,2),
  ('b0edf950-f4df-4623-85b1-281f2ccc8b74','11111111-0000-0000-0000-000000000004','Solomillo + patatak','Solomillo + patatas','Solomillo plantxan patata frijituekin','Solomillo a la plancha con patatas fritas',13.50,'[]',true,true,3),
  ('e6ae4104-9d8c-411b-ac00-ba28468cd786','11111111-0000-0000-0000-000000000004','Osagai gehigarriak','Ingredientes adicionales','Arrautza, kroketa, piperrak...','Huevo, croqueta, pimientos...',0.60,'[]',false,false,99)
ON CONFLICT (id) DO NOTHING;

-- HAMBURGUESAS
INSERT INTO public.dishes (id, category_id, name_eu, name_es, description_eu, description_es, price, allergens, is_chef_pick, display_order) VALUES
  ('d263dda5-ce4a-4c80-9e31-f76e81832b51','4152c7ed-fec6-4928-bfbe-7c65508e59f9','Hanburgesa osatua','Hamburguesa completa','Gazta, letxuga, tomatea eta tipula','Queso, lechuga, tomate y cebolla',10.90,'[]',false,1),
  ('3d71a93c-10ab-433e-9da5-5c2ba8c0a552','4152c7ed-fec6-4928-bfbe-7c65508e59f9','Hanburgesa Berezia','Hamburguesa Especial','Cheddar gazta, letxuga, tomatea, tipula, hirugiharra eta arrautza','Cheddar, lechuga, tomate, cebolla, bacon y huevo',12.50,'[]',false,2),
  ('96c72118-5fd8-4a13-92f3-a2c270b7c74b','4152c7ed-fec6-4928-bfbe-7c65508e59f9','Gazta-hanburgesa','Hamburguesa con queso','Gaztarekin','Con queso',8.50,'[]',false,3)
ON CONFLICT (id) DO NOTHING;

-- MILANESAS
INSERT INTO public.dishes (id, category_id, name_eu, name_es, description_eu, description_es, price, allergens, is_chef_pick, display_order) VALUES
  ('f79c1db8-98c3-4033-afe1-b6294e933c17','dbb6cac1-bbf9-4b30-bd20-04aa2261bebf','Milanesa Napolitarra','Milanesa Napolitana','Xerra ogitua, etxeko tomatearekin eta mozzarella gazta gratinatuarekin','Filete empanado con tomate de la casa y mozzarella gratinado',13.50,'["gluten","dairy","eggs"]',false,1),
  ('8e096d97-3752-4b07-a736-37c6426a9806','dbb6cac1-bbf9-4b30-bd20-04aa2261bebf','Mila-festa Barbakoa','Milanesa Barbacoa','Xerra empanatua, 2 arrautza, barbakoa saltsa eta kurrunkari tipula','Filete empanado con 2 huevos, salsa barbacoa y cebolla crujiente',14.50,'["eggs","gluten"]',false,2),
  ('90c92fb5-f475-4b79-a2dc-332dd8b92954','dbb6cac1-bbf9-4b30-bd20-04aa2261bebf','Milanesa Roquefort','Milanesa Roquefort','Xerra empanatua roquefort saltsarekin, rukulua, cherry tomateak, urdaiazpikoa','Filete empanado con salsa roquefort, rúcula, tomate cherry, jamón serrano',14.50,'["gluten","eggs","dairy"]',false,3)
ON CONFLICT (id) DO NOTHING;

-- PLATOS ESPECIALES
INSERT INTO public.dishes (id, category_id, name_eu, name_es, price, allergens, is_chef_pick, display_order) VALUES
  ('50286b45-8e87-408b-b2b8-cb66838d287c','64f006f9-610d-4c8a-b02a-cabba099084f','Oilasko Txukoa','Pollo Chuco',14.50,'[]',true,1)
ON CONFLICT (id) DO NOTHING;

-- ENSALADAS
INSERT INTO public.dishes (id, category_id, name_eu, name_es, description_eu, description_es, price, allergens, is_chef_pick, display_order) VALUES
  ('812aef72-b1f8-4ab0-a6c7-96e5d5628b4f','1b60e527-0a2f-4fa6-a6e7-109efe15b01a','Entsalada Mistoa','Ensalada Mixta','Letxuga, tomatea, tipula, hegaluzea eta arrautza','Lechuga, tomate, cebolla, atún y huevo',8.50,'["eggs"]',false,1)
ON CONFLICT (id) DO NOTHING;
