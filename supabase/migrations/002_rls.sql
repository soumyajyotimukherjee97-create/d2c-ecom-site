-- ─── Enable RLS on all tables ─────────────────────────────────────────────────
ALTER TABLE products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants  ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users      ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders            ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews           ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets   ENABLE ROW LEVEL SECURITY;

-- ─── products ─────────────────────────────────────────────────────────────────
-- Anyone can read active products (public storefront)
CREATE POLICY "products_select_active"
  ON products FOR SELECT
  USING (is_active = true);

-- service_role bypasses RLS entirely — no INSERT/UPDATE/DELETE policies needed
-- for service_role. The policies below guard anon + authenticated roles only.

-- ─── product_variants ─────────────────────────────────────────────────────────
CREATE POLICY "variants_select_active"
  ON product_variants FOR SELECT
  USING (is_active = true);

-- ─── product_ingredients ──────────────────────────────────────────────────────
-- Ingredients are public for any active product
CREATE POLICY "ingredients_select_public"
  ON product_ingredients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_ingredients.product_id
        AND products.is_active = true
    )
  );

-- ─── users ────────────────────────────────────────────────────────────────────
-- Users can only read and update their own profile row
CREATE POLICY "users_select_own"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ─── orders ───────────────────────────────────────────────────────────────────
-- Authenticated customers can read their own orders
CREATE POLICY "orders_select_own"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Both authenticated users and guests (anon role) can create orders.
-- Server-side API route validates the payload; RLS only guards the DB boundary.
CREATE POLICY "orders_insert_any"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Updates (status changes, tracking) go through the internal platform via
-- service_role which bypasses RLS. No UPDATE policy for anon/authenticated.

-- ─── order_items ──────────────────────────────────────────────────────────────
-- Customers can read items that belong to their own orders
CREATE POLICY "order_items_select_own"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "order_items_insert_any"
  ON order_items FOR INSERT
  WITH CHECK (true);

-- ─── reviews ──────────────────────────────────────────────────────────────────
-- Approved reviews are public; unapproved reviews are visible only to their author
CREATE POLICY "reviews_select_approved_or_own"
  ON reviews FOR SELECT
  USING (is_approved = true OR auth.uid() = user_id);

-- Only authenticated users can submit reviews
CREATE POLICY "reviews_insert_authenticated"
  ON reviews FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- ─── support_tickets ──────────────────────────────────────────────────────────
-- Authenticated customers can only see their own tickets
CREATE POLICY "tickets_select_own"
  ON support_tickets FOR SELECT
  USING (auth.uid() = user_id);

-- Both authenticated and anonymous (guest) users can open tickets.
-- API route enforces that guest_email is present for anonymous callers.
CREATE POLICY "tickets_insert_any"
  ON support_tickets FOR INSERT
  WITH CHECK (true);

-- Updates (status changes, assignments) are service_role only via internal platform
