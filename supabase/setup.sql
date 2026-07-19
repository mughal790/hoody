-- ═══════════════════════════════════════════════════════════
-- HOODY — Full Setup (Schema + Seed)
-- Paste this entire file into Supabase SQL Editor and click Run
-- ═══════════════════════════════════════════════════════════

-- ─── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Profiles ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name    TEXT,
  avatar_url   TEXT,
  phone        TEXT,
  date_of_birth DATE,
  gender       TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Categories ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  description  TEXT,
  image_url    TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Products ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id    UUID REFERENCES categories(id) ON DELETE SET NULL,
  name           TEXT NOT NULL,
  slug           TEXT UNIQUE NOT NULL,
  description    TEXT,
  price          NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  original_price NUMERIC(10,2),
  sku            TEXT UNIQUE,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  images         TEXT[]  NOT NULL DEFAULT '{}',
  sizes          TEXT[]  NOT NULL DEFAULT '{}',
  colors         TEXT[]  NOT NULL DEFAULT '{}',
  tags           TEXT[]  NOT NULL DEFAULT '{}',
  is_featured    BOOLEAN NOT NULL DEFAULT FALSE,
  is_new         BOOLEAN NOT NULL DEFAULT FALSE,
  is_sale        BOOLEAN NOT NULL DEFAULT FALSE,
  rating         NUMERIC(3,2) NOT NULL DEFAULT 0,
  review_count   INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Cart Items ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart_items (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity   INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  size       TEXT,
  color      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id, size, color)
);

-- ─── Wishlist ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishlist_items (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

-- ─── Orders ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled')),
  total_amount     NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
  shipping_address JSONB,
  payment_method   TEXT DEFAULT 'card',
  payment_status   TEXT NOT NULL DEFAULT 'pending'
                     CHECK (payment_status IN ('pending','paid','failed','refunded')),
  tracking_number  TEXT,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Order Items ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity   INTEGER NOT NULL CHECK (quantity > 0),
  price      NUMERIC(10,2) NOT NULL,
  size       TEXT,
  color      TEXT
);

-- ─── Reviews ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL,
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title       TEXT,
  body        TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, user_id)
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_is_new ON products(is_new) WHERE is_new = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_is_sale ON products(is_sale) WHERE is_sale = TRUE;
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);

-- ─── Updated At Trigger ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Profile Auto-Create Trigger ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews        ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read/update their own
CREATE POLICY profiles_self ON profiles FOR ALL USING (auth.uid() = id);

-- Cart: own items only
CREATE POLICY cart_own ON cart_items FOR ALL USING (auth.uid() = user_id);

-- Wishlist: own items only
CREATE POLICY wishlist_own ON wishlist_items FOR ALL USING (auth.uid() = user_id);

-- Orders: own orders only
CREATE POLICY orders_own ON orders FOR ALL USING (auth.uid() = user_id);

-- Order items: readable if order belongs to user
CREATE POLICY order_items_own ON order_items FOR SELECT
  USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

-- Reviews: public read, authenticated write
CREATE POLICY reviews_public_read ON reviews FOR SELECT USING (TRUE);
CREATE POLICY reviews_auth_insert ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY reviews_own_update ON reviews FOR UPDATE USING (auth.uid() = user_id);

-- Products & Categories: public read
CREATE POLICY products_public_read ON products FOR SELECT USING (TRUE);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY categories_public_read ON categories FOR SELECT USING (TRUE);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;


-- ═══════════════════════════════════════════════════════════
-- HOODY — Seed Data  (50 products × 5 categories)
-- Run in: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════

-- ─── Categories ───────────────────────────────────────────
INSERT INTO categories (id, name, slug, description, image_url) VALUES
  ('11111111-0000-0000-0000-000000000001','Shirts', 'shirts', 'Premium quality shirts for every occasion','https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800'),
  ('11111111-0000-0000-0000-000000000002','Pants',  'pants',  'Tailored trousers and chinos',             'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800'),
  ('11111111-0000-0000-0000-000000000003','Hoodies','hoodies','Cozy hoodies and sweatshirts',            'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800'),
  ('11111111-0000-0000-0000-000000000004','Shoes',  'shoes',  'Luxury footwear for every step',          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'),
  ('11111111-0000-0000-0000-000000000005','Jackets','jackets','Statement outerwear for every season',    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800')
ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- SHIRTS  (10 products)
-- ═══════════════════════════════════════════════════════════
INSERT INTO products (id, category_id, name, slug, description, price, original_price, sku, stock_quantity, images, sizes, colors, tags, is_featured, is_new, is_sale, rating, review_count) VALUES

('aaaaaaaa-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000001',
 'Classic White Oxford Shirt','classic-white-oxford-shirt',
 'Timeless white Oxford shirt crafted from 100% premium Egyptian cotton. The perfect canvas for any wardrobe — dress it up with a blazer or wear it untucked on weekends.',
 89, NULL,'HD-SHIRT-001',120,
 ARRAY['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800','https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800'],
 ARRAY['XS','S','M','L','XL','XXL'],ARRAY['White','Blue','Grey'],
 ARRAY['formal','casual','cotton','oxford'],TRUE,TRUE,FALSE,4.8,142),

('aaaaaaaa-0000-0000-0000-000000000002','11111111-0000-0000-0000-000000000001',
 'Navy Slim Fit Dress Shirt','navy-slim-fit-dress-shirt',
 'Sharp navy dress shirt with a precision-cut slim fit. Made from a fine poplin weave with a spread collar and mother-of-pearl buttons.',
 95, NULL,'HD-SHIRT-002',80,
 ARRAY['https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800','https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800'],
 ARRAY['S','M','L','XL','XXL'],ARRAY['Navy','Black','Burgundy'],
 ARRAY['formal','slim-fit','poplin'],TRUE,FALSE,FALSE,4.7,98),

('aaaaaaaa-0000-0000-0000-000000000003','11111111-0000-0000-0000-000000000001',
 'Black Essential Tee','black-essential-tee',
 'The foundation of every great wardrobe. Crafted from ultra-soft 200gsm pima cotton with a relaxed, flattering fit that holds its shape wash after wash.',
 45, 65,'HD-SHIRT-003',200,
 ARRAY['https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800','https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800'],
 ARRAY['XS','S','M','L','XL','XXL','3XL'],ARRAY['Black','White','Grey','Navy'],
 ARRAY['casual','essentials','pima-cotton'],FALSE,FALSE,TRUE,4.5,310),

('aaaaaaaa-0000-0000-0000-000000000004','11111111-0000-0000-0000-000000000001',
 'Burgundy Flannel Shirt','burgundy-flannel-shirt',
 'Rich burgundy brushed flannel shirt, pre-washed for instant softness. Features a camp collar and chest pocket. Perfect for layering through autumn.',
 110, NULL,'HD-SHIRT-004',60,
 ARRAY['https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800','https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800'],
 ARRAY['S','M','L','XL','XXL'],ARRAY['Burgundy','Olive','Navy'],
 ARRAY['casual','flannel','winter','layering'],FALSE,TRUE,FALSE,4.6,55),

('aaaaaaaa-0000-0000-0000-000000000005','11111111-0000-0000-0000-000000000001',
 'Linen Beach Shirt','linen-beach-shirt',
 'Breathable 100% European linen shirt with a relaxed open collar. Naturally moisture-wicking and gets better with every wash.',
 85, NULL,'HD-SHIRT-005',90,
 ARRAY['https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=800','https://images.unsplash.com/photo-1563630423918-b58f07336ac9?w=800'],
 ARRAY['S','M','L','XL','XXL'],ARRAY['White','Khaki','Blue','Olive'],
 ARRAY['summer','linen','beach','casual'],TRUE,FALSE,FALSE,4.4,78),

('aaaaaaaa-0000-0000-0000-000000000006','11111111-0000-0000-0000-000000000001',
 'Charcoal Twill Overshirt','charcoal-twill-overshirt',
 'Heavy-duty garment-dyed cotton twill overshirt. Worn open as a light jacket or buttoned as a relaxed shirt. A true wardrobe workhorse.',
 130, NULL,'HD-SHIRT-006',55,
 ARRAY['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800','https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=800'],
 ARRAY['S','M','L','XL','XXL'],ARRAY['Charcoal','Olive','Tan'],
 ARRAY['overshirt','casual','layering','twill'],FALSE,TRUE,FALSE,4.7,44),

('aaaaaaaa-0000-0000-0000-000000000007','11111111-0000-0000-0000-000000000001',
 'White Resort Shirt','white-resort-shirt',
 'Relaxed Cuban-collar shirt in crisp TENCEL™ blend. Effortlessly cool for warm evenings. Features coconut shell buttons and a boxy silhouette.',
 115, NULL,'HD-SHIRT-007',70,
 ARRAY['https://images.unsplash.com/photo-1563630423918-b58f07336ac9?w=800','https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=800'],
 ARRAY['S','M','L','XL','XXL'],ARRAY['White','Ecru','Sage'],
 ARRAY['resort','cuban-collar','summer','luxury'],TRUE,FALSE,FALSE,4.5,62),

('aaaaaaaa-0000-0000-0000-000000000008','11111111-0000-0000-0000-000000000001',
 'Striped Breton Shirt','striped-breton-shirt',
 'Heritage Breton stripe in 100% organic cotton. A nautical classic reimagined with a modern relaxed fit. The kind of shirt that looks good on everyone.',
 79, NULL,'HD-SHIRT-008',110,
 ARRAY['https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800','https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800'],
 ARRAY['XS','S','M','L','XL','XXL'],ARRAY['Navy/White','Black/White'],
 ARRAY['stripe','breton','nautical','organic'],FALSE,FALSE,FALSE,4.3,89),

('aaaaaaaa-0000-0000-0000-000000000009','11111111-0000-0000-0000-000000000001',
 'Forest Green Polo Shirt','forest-green-polo-shirt',
 'Refined polo in 220gsm pique cotton. A slightly longer back hem and structured collar keep this looking sharp whether you''re on or off the course.',
 75, 95,'HD-SHIRT-009',95,
 ARRAY['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800','https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800'],
 ARRAY['S','M','L','XL','XXL'],ARRAY['Forest Green','Navy','White','Burgundy'],
 ARRAY['polo','pique','smart-casual'],FALSE,FALSE,TRUE,4.6,127),

('aaaaaaaa-0000-0000-0000-000000000010','11111111-0000-0000-0000-000000000001',
 'Washed Denim Shirt','washed-denim-shirt',
 'Garment-washed 100% cotton denim shirt. The relaxed fit and subtle fade give it an authentic worn-in feel. Doubles as a lightweight jacket.',
 98, NULL,'HD-SHIRT-010',65,
 ARRAY['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800','https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800'],
 ARRAY['S','M','L','XL','XXL'],ARRAY['Light Blue','Mid Blue','Dark Indigo'],
 ARRAY['denim','casual','washed','layering'],FALSE,TRUE,FALSE,4.5,51)

ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- PANTS  (10 products)
-- ═══════════════════════════════════════════════════════════
INSERT INTO products (id, category_id, name, slug, description, price, original_price, sku, stock_quantity, images, sizes, colors, tags, is_featured, is_new, is_sale, rating, review_count) VALUES

('bbbbbbbb-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000002',
 'Classic Black Chinos','classic-black-chinos',
 'Immaculately tailored chinos in stretch-cotton twill. A flat front, clean lines, and a perfect mid-rise make these the smartest casual pant in the game.',
 110, NULL,'HD-PANTS-001',100,
 ARRAY['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800','https://images.unsplash.com/photo-1473966968600-fa914efd9cd9?w=800'],
 ARRAY['28','30','32','34','36','38'],ARRAY['Black','Navy','Grey'],
 ARRAY['chinos','formal','stretch'],TRUE,FALSE,FALSE,4.7,115),

('bbbbbbbb-0000-0000-0000-000000000002','11111111-0000-0000-0000-000000000002',
 'Navy Slim Trousers','navy-slim-trousers',
 'Precision-cut slim trousers in a fine Italian wool-blend. A sharp taper from the knee down keeps these looking tailored without feeling restrictive.',
 125, NULL,'HD-PANTS-002',70,
 ARRAY['https://images.unsplash.com/photo-1473966968600-fa914efd9cd9?w=800','https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800'],
 ARRAY['28','30','32','34','36','38'],ARRAY['Navy','Charcoal','Black'],
 ARRAY['trousers','formal','slim','wool'],FALSE,TRUE,FALSE,4.6,67),

('bbbbbbbb-0000-0000-0000-000000000003','11111111-0000-0000-0000-000000000002',
 'Khaki Cargo Pants','khaki-cargo-pants',
 'Modern cargo pants with a sleek, utility-inspired silhouette. Six pockets, a relaxed mid-rise, and a tapered leg that keeps things sharp.',
 135, NULL,'HD-PANTS-003',55,
 ARRAY['https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=800','https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800'],
 ARRAY['28','30','32','34','36'],ARRAY['Khaki','Olive','Black'],
 ARRAY['cargo','utility','casual'],TRUE,FALSE,FALSE,4.5,82),

('bbbbbbbb-0000-0000-0000-000000000004','11111111-0000-0000-0000-000000000002',
 'Stone Linen Trousers','stone-linen-trousers',
 '100% European linen trousers for warm weather. A relaxed straight-leg cut with a comfortable elasticated waistband. Wrinkles are part of the charm.',
 98, NULL,'HD-PANTS-004',80,
 ARRAY['https://images.unsplash.com/photo-1473966968600-fa914efd9cd9?w=800','https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=800'],
 ARRAY['28','30','32','34','36','38'],ARRAY['Stone','Ecru','Navy','Olive'],
 ARRAY['linen','summer','relaxed','casual'],FALSE,FALSE,FALSE,4.4,93),

('bbbbbbbb-0000-0000-0000-000000000005','11111111-0000-0000-0000-000000000002',
 'Dark Indigo Selvedge Jeans','dark-indigo-selvedge-jeans',
 'Japanese selvedge denim in a classic straight cut. 14oz raw indigo that develops a unique patina over time. The serious denim enthusiast''s choice.',
 220, NULL,'HD-PANTS-005',35,
 ARRAY['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800','https://images.unsplash.com/photo-1473966968600-fa914efd9cd9?w=800'],
 ARRAY['28','29','30','31','32','33','34','36'],ARRAY['Indigo','Raw'],
 ARRAY['jeans','denim','selvedge','japanese'],TRUE,FALSE,FALSE,4.9,204),

('bbbbbbbb-0000-0000-0000-000000000006','11111111-0000-0000-0000-000000000002',
 'Charcoal Jogger Trousers','charcoal-jogger-trousers',
 'Elevated joggers in a dense French terry knit. Tapered leg, cuffed hems, and a functional drawstring. Smarter than sweats, more comfortable than chinos.',
 105, 130,'HD-PANTS-006',90,
 ARRAY['https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=800','https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800'],
 ARRAY['XS','S','M','L','XL','XXL'],ARRAY['Charcoal','Black','Navy'],
 ARRAY['joggers','casual','comfort','french-terry'],FALSE,FALSE,TRUE,4.5,138),

('bbbbbbbb-0000-0000-0000-000000000007','11111111-0000-0000-0000-000000000002',
 'Olive Pleated Trousers','olive-pleated-trousers',
 'Single-pleat wide-leg trousers in a medium-weight cotton-linen blend. A relaxed silhouette with a high rise that harks back to golden-age tailoring.',
 145, NULL,'HD-PANTS-007',45,
 ARRAY['https://images.unsplash.com/photo-1473966968600-fa914efd9cd9?w=800','https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800'],
 ARRAY['28','30','32','34','36'],ARRAY['Olive','Stone','Charcoal','Navy'],
 ARRAY['pleated','wide-leg','heritage','tailored'],FALSE,TRUE,FALSE,4.6,39),

('bbbbbbbb-0000-0000-0000-000000000008','11111111-0000-0000-0000-000000000002',
 'Cream Tailored Shorts','cream-tailored-shorts',
 'Tailored shorts in a stretch-cotton twill. An inseam-length of 7" keeps things refined rather than casual. The summer alternative to your best chinos.',
 85, NULL,'HD-PANTS-008',75,
 ARRAY['https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=800','https://images.unsplash.com/photo-1473966968600-fa914efd9cd9?w=800'],
 ARRAY['28','30','32','34','36','38'],ARRAY['Cream','Navy','Khaki','Black'],
 ARRAY['shorts','summer','tailored','smart-casual'],FALSE,FALSE,FALSE,4.3,67),

('bbbbbbbb-0000-0000-0000-000000000009','11111111-0000-0000-0000-000000000002',
 'Black Skinny Jeans','black-skinny-jeans',
 '2% elastane stretch denim for a true skinny fit that moves with you. A versatile jet-black that stays dark wash after wash with our colour-lock finishing.',
 95, 119,'HD-PANTS-009',85,
 ARRAY['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800','https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=800'],
 ARRAY['28','29','30','31','32','33','34'],ARRAY['Jet Black'],
 ARRAY['jeans','skinny','stretch','denim'],FALSE,FALSE,TRUE,4.4,175),

('bbbbbbbb-0000-0000-0000-000000000010','11111111-0000-0000-0000-000000000002',
 'Caramel Corduroy Trousers','caramel-corduroy-trousers',
 '8-wale corduroy trousers in a flattering mid-rise straight cut. The thick cotton pile adds subtle texture and warmth — ideal for autumn and winter dressing.',
 120, NULL,'HD-PANTS-010',50,
 ARRAY['https://images.unsplash.com/photo-1473966968600-fa914efd9cd9?w=800','https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800'],
 ARRAY['28','30','32','34','36'],ARRAY['Caramel','Forest Green','Navy','Burgundy'],
 ARRAY['corduroy','autumn','winter','texture'],FALSE,TRUE,FALSE,4.7,44)

ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- HOODIES  (10 products)
-- ═══════════════════════════════════════════════════════════
INSERT INTO products (id, category_id, name, slug, description, price, original_price, sku, stock_quantity, images, sizes, colors, tags, is_featured, is_new, is_sale, rating, review_count) VALUES

('cccccccc-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000003',
 'Essential Black Hoodie','essential-black-hoodie',
 'Heavyweight 400gsm French terry hoodie. Garment-dyed, enzyme-washed, and Sanforized. Built to last and designed to get better with age.',
 120, NULL,'HD-HOOD-001',150,
 ARRAY['https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800','https://images.unsplash.com/photo-1614975059251-7d63b1c2eba3?w=800'],
 ARRAY['XS','S','M','L','XL','XXL','3XL'],ARRAY['Black','Charcoal','Navy'],
 ARRAY['hoodie','essentials','heavyweight','french-terry'],TRUE,FALSE,FALSE,4.9,288),

('cccccccc-0000-0000-0000-000000000002','11111111-0000-0000-0000-000000000003',
 'Cloud Grey Pullover','cloud-grey-pullover',
 'Impossibly soft mid-weight brushed fleece pullover. An interior pile lining traps warmth while the exterior stays smooth and pill-resistant.',
 115, NULL,'HD-HOOD-002',100,
 ARRAY['https://images.unsplash.com/photo-1614975059251-7d63b1c2eba3?w=800','https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800'],
 ARRAY['XS','S','M','L','XL','XXL'],ARRAY['Cloud Grey','Stone','Ash'],
 ARRAY['pullover','soft','fleece','crewneck'],FALSE,TRUE,FALSE,4.7,134),

('cccccccc-0000-0000-0000-000000000003','11111111-0000-0000-0000-000000000003',
 'Oversized Cream Hoodie','oversized-cream-hoodie',
 'Intentionally oversized silhouette in a buttery-soft 380gsm loopback cotton. Dropped shoulders, a relaxed chest, and a slightly cropped body.',
 140, NULL,'HD-HOOD-003',75,
 ARRAY['https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=800','https://images.unsplash.com/photo-1614975059251-7d63b1c2eba3?w=800'],
 ARRAY['XS','S','M','L','XL','XXL'],ARRAY['Cream','White','Stone'],
 ARRAY['oversized','cozy','loopback','relaxed'],TRUE,FALSE,FALSE,4.8,91),

('cccccccc-0000-0000-0000-000000000004','11111111-0000-0000-0000-000000000003',
 'Forest Zip Hoodie','forest-zip-hoodie',
 'Full-zip hoodie in mid-weight organic French terry. A metal YKK zipper, kangaroo pocket, and clean minimalist branding. The practical hoodie, perfected.',
 125, NULL,'HD-HOOD-004',90,
 ARRAY['https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800','https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=800'],
 ARRAY['XS','S','M','L','XL','XXL'],ARRAY['Forest Green','Black','Navy'],
 ARRAY['zip-hoodie','organic','functional'],FALSE,FALSE,FALSE,4.6,77),

('cccccccc-0000-0000-0000-000000000005','11111111-0000-0000-0000-000000000003',
 'Washed Navy Hoodie','washed-navy-hoodie',
 'Pre-distressed vintage-wash navy hoodie in 350gsm cotton terry. Faded prints, a worn-in feel straight out of the bag. Authenticity built in.',
 110, 140,'HD-HOOD-005',65,
 ARRAY['https://images.unsplash.com/photo-1614975059251-7d63b1c2eba3?w=800','https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800'],
 ARRAY['S','M','L','XL','XXL'],ARRAY['Washed Navy','Faded Black','Washed Grey'],
 ARRAY['vintage','washed','faded','casual'],FALSE,FALSE,TRUE,4.5,112),

('cccccccc-0000-0000-0000-000000000006','11111111-0000-0000-0000-000000000003',
 'Sherpa Lined Hoodie','sherpa-lined-hoodie',
 'Heavyweight hoodie with a plush sherpa interior lining. External French terry, internal cloud-soft sherpa. Two fabric personalities, one incredible jacket.',
 165, NULL,'HD-HOOD-006',40,
 ARRAY['https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=800','https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800'],
 ARRAY['S','M','L','XL','XXL'],ARRAY['Camel','Charcoal','Ecru'],
 ARRAY['sherpa','lined','winter','luxury'],TRUE,FALSE,FALSE,4.8,58),

('cccccccc-0000-0000-0000-000000000007','11111111-0000-0000-0000-000000000003',
 'Burgundy Crewneck Sweatshirt','burgundy-crewneck-sweatshirt',
 'Classic crewneck in 350gsm loopback cotton. A thick ribbed collar, cuffs, and waistband for structure. Washed for softness. Heritage silhouette.',
 95, NULL,'HD-HOOD-007',110,
 ARRAY['https://images.unsplash.com/photo-1614975059251-7d63b1c2eba3?w=800','https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=800'],
 ARRAY['XS','S','M','L','XL','XXL','3XL'],ARRAY['Burgundy','Navy','Black','Charcoal'],
 ARRAY['crewneck','sweatshirt','classic','heritage'],FALSE,FALSE,FALSE,4.6,143),

('cccccccc-0000-0000-0000-000000000008','11111111-0000-0000-0000-000000000003',
 'Technical Fleece Hoodie','technical-fleece-hoodie',
 'Performance-engineered quarter-zip hoodie in recycled grid fleece. Lightweight, breathable, and moisture-wicking. Sport and style unified.',
 145, NULL,'HD-HOOD-008',55,
 ARRAY['https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800','https://images.unsplash.com/photo-1614975059251-7d63b1c2eba3?w=800'],
 ARRAY['S','M','L','XL','XXL'],ARRAY['Slate Blue','Black','Charcoal'],
 ARRAY['technical','performance','fleece','recycled'],FALSE,TRUE,FALSE,4.7,39),

('cccccccc-0000-0000-0000-000000000009','11111111-0000-0000-0000-000000000003',
 'Camel Knit Hoodie','camel-knit-hoodie',
 'Luxury hoodie in a chunky ribbed knit construction. A relaxed boxy fit with a spacious kangaroo pocket. Warmer than a sweatshirt, cozier than a jumper.',
 175, NULL,'HD-HOOD-009',35,
 ARRAY['https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=800','https://images.unsplash.com/photo-1614975059251-7d63b1c2eba3?w=800'],
 ARRAY['S','M','L','XL','XXL'],ARRAY['Camel','Cream','Charcoal'],
 ARRAY['knit','luxury','boxy','autumn'],TRUE,FALSE,FALSE,4.9,27),

('cccccccc-0000-0000-0000-000000000010','11111111-0000-0000-0000-000000000003',
 'Stone Acid Wash Hoodie','stone-acid-wash-hoodie',
 'Acid-washed 380gsm French terry hoodie with an intentionally distressed two-tone effect. No two pieces are identical. Wear your uniqueness.',
 130, 160,'HD-HOOD-010',60,
 ARRAY['https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800','https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=800'],
 ARRAY['S','M','L','XL','XXL'],ARRAY['Stone/Black','Grey/White'],
 ARRAY['acid-wash','unique','streetwear'],FALSE,TRUE,TRUE,4.5,81)

ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- SHOES  (10 products)
-- ═══════════════════════════════════════════════════════════
INSERT INTO products (id, category_id, name, slug, description, price, original_price, sku, stock_quantity, images, sizes, colors, tags, is_featured, is_new, is_sale, rating, review_count) VALUES

('dddddddd-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000004',
 'White Leather Sneakers','white-leather-sneakers',
 'Full-grain leather sneakers with a memory foam insole and a clean cupsole. The kind of sneaker that works with everything from jeans to chinos.',
 185, NULL,'HD-SHOE-001',90,
 ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800','https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800'],
 ARRAY['6','7','8','9','10','11','12'],ARRAY['White','Cream'],
 ARRAY['sneakers','leather','casual','clean'],TRUE,FALSE,FALSE,4.8,203),

('dddddddd-0000-0000-0000-000000000002','11111111-0000-0000-0000-000000000004',
 'Black Derby Shoes','black-derby-shoes',
 'Hand-finished black derby in full-grain calf leather. A Blake-stitched single leather sole with a leather heel stack. British craftsmanship at its finest.',
 220, NULL,'HD-SHOE-002',50,
 ARRAY['https://images.unsplash.com/photo-1608256465521-ea41a7a0b067?w=800','https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'],
 ARRAY['7','7.5','8','8.5','9','9.5','10','11'],ARRAY['Black','Brown'],
 ARRAY['formal','leather','derby','dress'],TRUE,FALSE,FALSE,4.9,156),

('dddddddd-0000-0000-0000-000000000003','11111111-0000-0000-0000-000000000004',
 'Tan Suede Chelsea Boots','tan-suede-chelsea-boots',
 'Premium suede Chelsea boots in warm tan. A Goodyear-welted leather sole for durability and resolability. An investment in style that only improves with age.',
 280, NULL,'HD-SHOE-003',40,
 ARRAY['https://images.unsplash.com/photo-1551107696-a4b537da3188?w=800','https://images.unsplash.com/photo-1608256465521-ea41a7a0b067?w=800'],
 ARRAY['7','7.5','8','8.5','9','9.5','10'],ARRAY['Tan','Brown','Black'],
 ARRAY['chelsea','boots','suede','goodyear'],FALSE,TRUE,FALSE,4.7,88),

('dddddddd-0000-0000-0000-000000000004','11111111-0000-0000-0000-000000000004',
 'Navy Canvas Espadrilles','navy-canvas-espadrilles',
 'Classic espadrilles in 100% cotton canvas with a traditional jute midsole. Lightweight and breathable. The essential warm-weather shoe.',
 95, NULL,'HD-SHOE-004',120,
 ARRAY['https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800','https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'],
 ARRAY['7','8','9','10','11','12'],ARRAY['Navy','White','Olive','Black'],
 ARRAY['espadrilles','canvas','summer','casual'],FALSE,FALSE,FALSE,4.3,94),

('dddddddd-0000-0000-0000-000000000005','11111111-0000-0000-0000-000000000004',
 'Cognac Brogue Oxford','cognac-brogue-oxford',
 'Perforated brogue detailing on a classic five-eyelet Oxford last. Burnished cognac leather with a leather-lined interior and Dainite rubber sole.',
 265, NULL,'HD-SHOE-005',30,
 ARRAY['https://images.unsplash.com/photo-1608256465521-ea41a7a0b067?w=800','https://images.unsplash.com/photo-1551107696-a4b537da3188?w=800'],
 ARRAY['7','7.5','8','8.5','9','9.5','10','10.5','11'],ARRAY['Cognac','Tan'],
 ARRAY['oxford','brogue','formal','leather'],TRUE,FALSE,FALSE,4.8,72),

('dddddddd-0000-0000-0000-000000000006','11111111-0000-0000-0000-000000000004',
 'Black High-Top Sneakers','black-high-top-sneakers',
 'Premium leather high-top with an ankle-padded collar and a vulcanised rubber sole. Heritage basketball DNA meets contemporary minimalism.',
 195, 240,'HD-SHOE-006',65,
 ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800','https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800'],
 ARRAY['7','8','9','10','11','12'],ARRAY['Black','White','Navy'],
 ARRAY['high-top','sneakers','streetwear'],FALSE,FALSE,TRUE,4.6,118),

('dddddddd-0000-0000-0000-000000000007','11111111-0000-0000-0000-000000000004',
 'Desert Boots Sand','desert-boots-sand',
 'The classic Clarks-style desert boot reimagined in premium nubuck leather. A crepe rubber sole that ages beautifully. Simple, wearable, timeless.',
 165, NULL,'HD-SHOE-007',55,
 ARRAY['https://images.unsplash.com/photo-1551107696-a4b537da3188?w=800','https://images.unsplash.com/photo-1608256465521-ea41a7a0b067?w=800'],
 ARRAY['7','7.5','8','8.5','9','9.5','10','11'],ARRAY['Sand','Brown','Black'],
 ARRAY['desert-boots','nubuck','crepe','casual'],FALSE,TRUE,FALSE,4.5,63),

('dddddddd-0000-0000-0000-000000000008','11111111-0000-0000-0000-000000000004',
 'Chunky Sole Loafers','chunky-sole-loafers',
 'Slip-on loafers with an exaggerated platform sole in contrast white rubber. Burnished calf leather upper with a signature penny keeper. Louder luxury.',
 250, NULL,'HD-SHOE-008',25,
 ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800','https://images.unsplash.com/photo-1608256465521-ea41a7a0b067?w=800'],
 ARRAY['7','8','9','10','11'],ARRAY['Black','Cognac','White'],
 ARRAY['loafers','platform','luxury','statement'],TRUE,FALSE,FALSE,4.7,44),

('dddddddd-0000-0000-0000-000000000009','11111111-0000-0000-0000-000000000004',
 'Running Sneakers Pro','running-sneakers-pro',
 'Engineered mesh upper with responsive foam midsole. Whether you''re on the track or the street, these perform as well as they look.',
 175, 210,'HD-SHOE-009',75,
 ARRAY['https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800','https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'],
 ARRAY['7','7.5','8','8.5','9','9.5','10','10.5','11','12'],ARRAY['Black/White','Grey/Blue','White/Red'],
 ARRAY['running','performance','mesh','sport'],FALSE,FALSE,TRUE,4.4,189),

('dddddddd-0000-0000-0000-000000000010','11111111-0000-0000-0000-000000000004',
 'Burgundy Monk Strap Shoes','burgundy-monk-strap-shoes',
 'Double monk-strap shoes in a rich burgundy calf leather. Two polished gold buckles and a squared-off last. The most characterful shoe in formal dressing.',
 295, NULL,'HD-SHOE-010',20,
 ARRAY['https://images.unsplash.com/photo-1608256465521-ea41a7a0b067?w=800','https://images.unsplash.com/photo-1551107696-a4b537da3188?w=800'],
 ARRAY['7','7.5','8','8.5','9','9.5','10','11'],ARRAY['Burgundy','Black','Tan'],
 ARRAY['monk-strap','formal','luxury','character'],FALSE,TRUE,FALSE,4.9,31)

ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- JACKETS  (10 products)
-- ═══════════════════════════════════════════════════════════
INSERT INTO products (id, category_id, name, slug, description, price, original_price, sku, stock_quantity, images, sizes, colors, tags, is_featured, is_new, is_sale, rating, review_count) VALUES

('eeeeeeee-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000005',
 'Classic Black Bomber','classic-black-bomber',
 'The bomber jacket, perfected. Premium nylon shell with a supple leather collar, heavy-gauge ribbed cuffs, and a clean satin lining. An icon.',
 210, NULL,'HD-JACK-001',60,
 ARRAY['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800','https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=800'],
 ARRAY['XS','S','M','L','XL','XXL'],ARRAY['Black','Navy','Olive'],
 ARRAY['bomber','jacket','nylon','iconic'],TRUE,FALSE,FALSE,4.8,167),

('eeeeeeee-0000-0000-0000-000000000002','11111111-0000-0000-0000-000000000005',
 'Navy Wool Peacoat','navy-wool-peacoat',
 'Naval heritage peacoat in dense double-faced Italian wool. Six-button front, notch lapels, and a half-belt back for shape. Built for winters that mean business.',
 280, NULL,'HD-JACK-002',40,
 ARRAY['https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800','https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800'],
 ARRAY['XS','S','M','L','XL','XXL'],ARRAY['Navy','Black','Charcoal'],
 ARRAY['peacoat','wool','heritage','winter'],TRUE,FALSE,FALSE,4.9,112),

('eeeeeeee-0000-0000-0000-000000000003','11111111-0000-0000-0000-000000000005',
 'Black Leather Biker Jacket','black-leather-biker-jacket',
 'Full-grain cowhide biker jacket with an asymmetric zip, belted waist, and moto-stitch detailing. Raw, rebellious, and precisely refined.',
 490, NULL,'HD-JACK-003',20,
 ARRAY['https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=800','https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800'],
 ARRAY['XS','S','M','L','XL','XXL'],ARRAY['Black','Brown'],
 ARRAY['leather','biker','moto','luxury'],TRUE,TRUE,FALSE,4.9,244),

('eeeeeeee-0000-0000-0000-000000000004','11111111-0000-0000-0000-000000000005',
 'Camel Wool Overcoat','camel-wool-overcoat',
 'Statement camel overcoat in pure Italian wool. A single-breasted peak lapel, knee-length silhouette, and concealed button closure. Commanding presence.',
 420, NULL,'HD-JACK-004',25,
 ARRAY['https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800','https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800'],
 ARRAY['XS','S','M','L','XL','XXL'],ARRAY['Camel','Charcoal','Navy'],
 ARRAY['overcoat','wool','luxury','statement'],TRUE,FALSE,FALSE,4.8,89),

('eeeeeeee-0000-0000-0000-000000000005','11111111-0000-0000-0000-000000000005',
 'Olive Field Jacket','olive-field-jacket',
 'Military-inspired field jacket in stone-washed cotton canvas. Four bellows pockets, a removable waistband, and a corduroy collar. Functional heritage.',
 195, NULL,'HD-JACK-005',50,
 ARRAY['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800','https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800'],
 ARRAY['S','M','L','XL','XXL'],ARRAY['Olive','Khaki','Black'],
 ARRAY['field-jacket','military','utility','canvas'],FALSE,TRUE,FALSE,4.6,73),

('eeeeeeee-0000-0000-0000-000000000006','11111111-0000-0000-0000-000000000005',
 'Charcoal Trench Coat','charcoal-trench-coat',
 'Contemporary trench in a water-resistant cotton-gabardine. A double-breasted front, storm flap, and D-ring belt. London meets the modern wardrobe.',
 340, NULL,'HD-JACK-006',30,
 ARRAY['https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800','https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800'],
 ARRAY['XS','S','M','L','XL','XXL'],ARRAY['Charcoal','Camel','Navy'],
 ARRAY['trench','coat','water-resistant','classic'],FALSE,FALSE,FALSE,4.7,56),

('eeeeeeee-0000-0000-0000-000000000007','11111111-0000-0000-0000-000000000005',
 'Tan Suede Trucker Jacket','tan-suede-trucker-jacket',
 'Western-stitched trucker jacket in soft tan suede. Four-pocket front, stud button closure, and a tailored chest yoke. Americana with European refinement.',
 320, NULL,'HD-JACK-007',22,
 ARRAY['https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=800','https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800'],
 ARRAY['XS','S','M','L','XL'],ARRAY['Tan','Brown','Black'],
 ARRAY['trucker','suede','western','americana'],TRUE,FALSE,FALSE,4.8,38),

('eeeeeeee-0000-0000-0000-000000000008','11111111-0000-0000-0000-000000000005',
 'Grey Down Puffer Jacket','grey-down-puffer-jacket',
 '700 fill-power duck down puffer in a ripstop nylon shell. Lightweight warmth with a packable design — compresses to the size of a water bottle.',
 260, 320,'HD-JACK-008',45,
 ARRAY['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800','https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800'],
 ARRAY['S','M','L','XL','XXL'],ARRAY['Grey','Black','Navy'],
 ARRAY['puffer','down','packable','winter'],FALSE,FALSE,TRUE,4.5,103),

('eeeeeeee-0000-0000-0000-000000000009','11111111-0000-0000-0000-000000000005',
 'Burgundy Harrington Jacket','burgundy-harrington-jacket',
 'The classic Harrington in a burgundy stretch-cotton gabardine. A stand collar, raglan sleeves, and a tartan cotton lining. British prep, perfected.',
 175, NULL,'HD-JACK-009',55,
 ARRAY['https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800','https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800'],
 ARRAY['XS','S','M','L','XL','XXL'],ARRAY['Burgundy','Navy','Black','Racing Green'],
 ARRAY['harrington','heritage','british','casual'],FALSE,TRUE,FALSE,4.6,47),

('eeeeeeee-0000-0000-0000-000000000010','11111111-0000-0000-0000-000000000005',
 'Raw Denim Jacket','raw-denim-jacket',
 '14oz Japanese selvedge denim trucker jacket. Unwashed, un-sanforized raw denim that molds to your body over time. A jacket that becomes yours alone.',
 285, NULL,'HD-JACK-010',18,
 ARRAY['https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=800','https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800'],
 ARRAY['XS','S','M','L','XL','XXL'],ARRAY['Raw Indigo'],
 ARRAY['denim','raw','selvedge','japanese'],FALSE,TRUE,FALSE,4.9,22)

ON CONFLICT (slug) DO NOTHING;
