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
