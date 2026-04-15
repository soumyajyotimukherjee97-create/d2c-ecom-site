-- ─── Extensions ───────────────────────────────────────────────────────────────
-- pgcrypto is available by default in Supabase; enables gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── updated_at trigger helper ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ─── products ─────────────────────────────────────────────────────────────────
CREATE TABLE products (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  slug        text        NOT NULL UNIQUE,
  description text,
  category    text        NOT NULL CHECK (category IN ('serum', 'moisturiser', 'toner', 'spf')),
  skin_types  text[]      DEFAULT '{}',
  concerns    text[]      DEFAULT '{}',
  is_active   boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── product_variants ─────────────────────────────────────────────────────────
CREATE TABLE product_variants (
  id         uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid    NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size_ml    integer NOT NULL,
  -- price in paise (₹1 = 100 paise) — integers only, never floats
  price      integer NOT NULL CHECK (price > 0),
  sku        text    NOT NULL UNIQUE,
  stock      integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_active  boolean NOT NULL DEFAULT true
);

-- ─── product_ingredients ──────────────────────────────────────────────────────
CREATE TABLE product_ingredients (
  id            uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    uuid    NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name          text    NOT NULL,
  concentration decimal(5,2),
  benefit       text,
  science_note  text,
  display_order integer NOT NULL DEFAULT 0
);

-- ─── users (extends auth.users) ───────────────────────────────────────────────
-- Supabase Auth owns auth.users. We create a public profile table for
-- customer-specific fields and keep it in sync via a trigger.
CREATE TABLE public.users (
  id         uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      text        UNIQUE,
  skin_type  text        CHECK (skin_type IN ('dry', 'oily', 'combination', 'sensitive')),
  concerns   text[]      DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Auto-create public.users row when a new auth user signs up
CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();

-- ─── orders ───────────────────────────────────────────────────────────────────
CREATE TABLE orders (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number     text        NOT NULL UNIQUE,
  user_id          uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_email      text,
  status           text        NOT NULL DEFAULT 'confirmed'
                               CHECK (status IN ('confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  subtotal         integer     NOT NULL CHECK (subtotal >= 0),
  shipping_total   integer     NOT NULL DEFAULT 0 CHECK (shipping_total >= 0),
  total            integer     NOT NULL CHECK (total >= 0),
  -- JSON: { line1, line2, city, state, pin, country: "IN" }
  shipping_address jsonb       NOT NULL,
  contact_email    text        NOT NULL,
  contact_phone    text,
  tracking_id      text,
  carrier          text,
  notes            text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),

  -- Either a logged-in user or a guest email must be present
  CONSTRAINT orders_identity_check CHECK (user_id IS NOT NULL OR guest_email IS NOT NULL)
);

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── order_items ──────────────────────────────────────────────────────────────
CREATE TABLE order_items (
  id           uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     uuid    NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id   uuid    REFERENCES product_variants(id) ON DELETE SET NULL,
  -- Snapshotted at order time — never rely on live product data for order history
  product_name text    NOT NULL,
  variant_sku  text    NOT NULL,
  quantity     integer NOT NULL CHECK (quantity > 0),
  unit_price   integer NOT NULL CHECK (unit_price > 0),
  line_total   integer NOT NULL CHECK (line_total > 0)
);

-- ─── reviews ──────────────────────────────────────────────────────────────────
CREATE TABLE reviews (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating      integer     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title       text,
  body        text,
  is_approved boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ─── support_tickets ──────────────────────────────────────────────────────────
CREATE TABLE support_tickets (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid        REFERENCES orders(id) ON DELETE SET NULL,
  user_id     uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_email text,
  subject     text        NOT NULL,
  body        text        NOT NULL,
  status      text        NOT NULL DEFAULT 'open'
                          CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority    text        NOT NULL DEFAULT 'normal'
                          CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_to uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),

  -- Guest ticket must carry an email; authenticated ticket must have user_id
  CONSTRAINT tickets_identity_check CHECK (user_id IS NOT NULL OR guest_email IS NOT NULL)
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_products_slug         ON products(slug);
CREATE INDEX idx_products_category     ON products(category) WHERE is_active = true;
CREATE INDEX idx_products_skin_types   ON products USING GIN(skin_types);
CREATE INDEX idx_products_concerns     ON products USING GIN(concerns);
CREATE INDEX idx_variants_product_id   ON product_variants(product_id);
CREATE INDEX idx_variants_sku          ON product_variants(sku);
CREATE INDEX idx_ingredients_product   ON product_ingredients(product_id, display_order);
CREATE INDEX idx_orders_user_id        ON orders(user_id);
CREATE INDEX idx_orders_status         ON orders(status);
CREATE INDEX idx_orders_created_at     ON orders(created_at DESC);
CREATE INDEX idx_order_items_order_id  ON order_items(order_id);
CREATE INDEX idx_reviews_product_id    ON reviews(product_id) WHERE is_approved = true;
CREATE INDEX idx_support_status        ON support_tickets(status, priority);
