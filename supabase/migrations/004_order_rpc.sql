-- ─── Order number sequence ────────────────────────────────────────────────────
-- Generates human-readable order numbers in the format ORD-YYYY-00001.
-- Uses a single global counter (does not reset per year) to guarantee uniqueness.

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- ─── Atomic order creation function ──────────────────────────────────────────
--
-- Wraps the multi-table write in a single Postgres transaction:
--   1. Lock variant rows (FOR UPDATE) and verify stock.
--   2. Insert the order row with a generated order_number.
--   3. Insert order_items (snapshotted product_name, sku, price).
--   4. Decrement stock for each variant.
--
-- SECURITY DEFINER: runs as the function owner (postgres / service role),
-- so the caller does not need direct UPDATE privilege on product_variants.
-- This lets guest users (anon key) create orders via the API route.
--
-- Raises SQLSTATE 'P0001' with a prefixed message on domain errors:
--   VARIANT_NOT_FOUND::<variant_id>
--   INSUFFICIENT_STOCK::<variant_id>
--
-- p_items JSONB array element shape:
--   { variant_id, quantity, product_name, variant_sku, unit_price, line_total }

CREATE OR REPLACE FUNCTION create_order(
  p_user_id         uuid,
  p_guest_email     text,
  p_contact_email   text,
  p_contact_phone   text,
  p_shipping_address jsonb,
  p_subtotal        integer,
  p_shipping_total  integer,
  p_total           integer,
  p_items           jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id     uuid;
  v_order_number text;
  v_item         jsonb;
  v_variant_id   uuid;
  v_quantity     integer;
  v_stock        integer;
BEGIN
  -- ── Phase 1: validate + lock all variants ──────────────────────────────────
  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items) LOOP
    v_variant_id := (v_item->>'variant_id')::uuid;
    v_quantity   := (v_item->>'quantity')::integer;

    SELECT stock INTO v_stock
    FROM product_variants
    WHERE id = v_variant_id AND is_active = true
    FOR UPDATE;                         -- row-level lock prevents double-spend

    IF NOT FOUND THEN
      RAISE EXCEPTION 'VARIANT_NOT_FOUND::%', v_variant_id;
    END IF;

    IF v_stock < v_quantity THEN
      RAISE EXCEPTION 'INSUFFICIENT_STOCK::%', v_variant_id;
    END IF;
  END LOOP;

  -- ── Phase 2: generate order number + insert order ─────────────────────────
  v_order_number := 'ORD-' || to_char(now(), 'YYYY') || '-' ||
                    lpad(nextval('order_number_seq')::text, 5, '0');

  INSERT INTO orders (
    order_number, user_id, guest_email, contact_email, contact_phone,
    shipping_address, subtotal, shipping_total, total, status
  ) VALUES (
    v_order_number,
    p_user_id,
    p_guest_email,
    p_contact_email,
    p_contact_phone,
    p_shipping_address,
    p_subtotal,
    p_shipping_total,
    p_total,
    'confirmed'
  )
  RETURNING id INTO v_order_id;

  -- ── Phase 3: insert items + decrement stock ────────────────────────────────
  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items) LOOP
    v_variant_id := (v_item->>'variant_id')::uuid;
    v_quantity   := (v_item->>'quantity')::integer;

    INSERT INTO order_items (
      order_id, variant_id, product_name, variant_sku,
      quantity, unit_price, line_total
    ) VALUES (
      v_order_id,
      v_variant_id,
      v_item->>'product_name',
      v_item->>'variant_sku',
      v_quantity,
      (v_item->>'unit_price')::integer,
      (v_item->>'line_total')::integer
    );

    UPDATE product_variants
    SET stock = stock - v_quantity
    WHERE id = v_variant_id;
  END LOOP;

  RETURN jsonb_build_object('id', v_order_id, 'order_number', v_order_number);
END;
$$;

-- Grant execute to anon + authenticated so the server client (anon key) can call
-- this function on behalf of guest and logged-in users.
GRANT EXECUTE ON FUNCTION create_order TO anon, authenticated;
