-- ─── Seed data ────────────────────────────────────────────────────────────────
-- 4 products (one per category), 2 variants each, 3–5 ingredients each.
-- All prices in paise (₹1 = 100 paise).
-- Stock is set high enough for checkout testing.

-- ─── 1. Brightening Serum (serum) ─────────────────────────────────────────────
INSERT INTO products (id, name, slug, description, category, skin_types, concerns, is_active)
VALUES (
  'a1000000-0000-0000-0000-000000000001',
  'Brightening Serum',
  'brightening-serum',
  'A lightweight, water-based serum powered by 10% L-Ascorbic Acid and 1% Alpha Arbutin. Targets hyperpigmentation, uneven tone, and post-acne marks. pH-optimised at 3.5 for maximum Vitamin C stability.',
  'serum',
  ARRAY['dry', 'oily', 'combination', 'sensitive'],
  ARRAY['dullness', 'acne', 'pores'],
  true
);

INSERT INTO product_variants (id, product_id, size_ml, price, sku, stock)
VALUES
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 30, 129900, 'BRTSERUM-30', 50),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 60, 219900, 'BRTSERUM-60', 30);

INSERT INTO product_ingredients (product_id, name, concentration, benefit, science_note, display_order)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'L-Ascorbic Acid',  10.00, 'Brightening · antioxidant',
   'Pure Vitamin C at 10% — the clinically validated threshold for melanin suppression. Unstable above pH 3.5, so we stabilise at 3.4.', 1),
  ('a1000000-0000-0000-0000-000000000001', 'Alpha Arbutin',     1.00, 'Tyrosinase inhibitor',
   'Blocks melanin synthesis at the enzyme level. Works synergistically with Vitamin C to reduce spot recurrence.', 2),
  ('a1000000-0000-0000-0000-000000000001', 'Hyaluronic Acid',   1.00, 'Humectant · plumping',
   'Low and high molecular weight HA for surface hydration and deeper moisture binding.', 3),
  ('a1000000-0000-0000-0000-000000000001', 'Niacinamide',       5.00, 'Barrier repair · pore minimising',
   'At 5%, niacinamide strengthens the skin barrier and visibly reduces pore size within 4 weeks.', 4);

-- ─── 2. Night Repair Cream (moisturiser) ──────────────────────────────────────
INSERT INTO products (id, name, slug, description, category, skin_types, concerns, is_active)
VALUES (
  'a1000000-0000-0000-0000-000000000002',
  'Night Repair Cream',
  'night-repair-cream',
  'A rich, ceramide-dense cream with 0.1% Encapsulated Retinol and Peptides. Formulated for overnight recovery — supports cell turnover, repairs the moisture barrier, and reduces the appearance of fine lines.',
  'moisturiser',
  ARRAY['dry', 'combination', 'sensitive'],
  ARRAY['aging', 'dullness', 'redness'],
  true
);

INSERT INTO product_variants (id, product_id, size_ml, price, sku, stock)
VALUES
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 30, 249900, 'NRCREAM-30', 40),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 60, 399900, 'NRCREAM-60', 20);

INSERT INTO product_ingredients (product_id, name, concentration, benefit, science_note, display_order)
VALUES
  ('a1000000-0000-0000-0000-000000000002', 'Encapsulated Retinol', 0.10, 'Cell turnover · anti-aging',
   'Microencapsulation slows release, dramatically reducing irritation vs. pure retinol at equivalent activity.', 1),
  ('a1000000-0000-0000-0000-000000000002', 'Ceramide NP',          1.00, 'Barrier repair',
   'Ceramides make up 50% of the skin''s lipid matrix. Topical replenishment strengthens the barrier in 2 weeks.', 2),
  ('a1000000-0000-0000-0000-000000000002', 'Palmitoyl Tripeptide-1', NULL, 'Collagen stimulation',
   'Biomimetic peptide that signals fibroblasts to produce collagen — without the irritation of retinoids.', 3),
  ('a1000000-0000-0000-0000-000000000002', 'Squalane',             NULL, 'Emollient · non-comedogenic',
   'Plant-derived squalane mimics skin''s natural sebum. Absorbs without greasiness.', 4),
  ('a1000000-0000-0000-0000-000000000002', 'Allantoin',            0.20, 'Soothing · healing',
   'Promotes skin cell regeneration and soothes irritation — ideal for post-retinol repair.', 5);

-- ─── 3. Pore Refining Toner (toner) ───────────────────────────────────────────
INSERT INTO products (id, name, slug, description, category, skin_types, concerns, is_active)
VALUES (
  'a1000000-0000-0000-0000-000000000003',
  'Pore Refining Toner',
  'pore-refining-toner',
  'An alcohol-free toner with 2% Niacinamide and Zinc PCA. Balances oil production, tightens the appearance of pores, and preps skin for serums. Use morning and evening after cleansing.',
  'toner',
  ARRAY['oily', 'combination'],
  ARRAY['pores', 'acne', 'dullness'],
  true
);

INSERT INTO product_variants (id, product_id, size_ml, price, sku, stock)
VALUES
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000003', 100, 89900, 'PRTONER-100', 60),
  ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000003', 200, 149900, 'PRTONER-200', 35);

INSERT INTO product_ingredients (product_id, name, concentration, benefit, science_note, display_order)
VALUES
  ('a1000000-0000-0000-0000-000000000003', 'Niacinamide',  2.00, 'Pore minimising · sebum control',
   'At 2%, niacinamide reduces pore visibility and regulates sebum without sensitising — the sweet spot for oily skin.', 1),
  ('a1000000-0000-0000-0000-000000000003', 'Zinc PCA',     0.50, 'Sebum regulation · anti-bacterial',
   'Zinc PCA targets the root cause of oiliness at the follicle level while keeping skin calm.', 2),
  ('a1000000-0000-0000-0000-000000000003', 'Glycerin',     5.00, 'Humectant · hydration',
   'Draws moisture from the environment into the skin. Prevents the dryness that exacerbating over-cleansing causes.', 3);

-- ─── 4. Daily Defence SPF 50 (spf) ────────────────────────────────────────────
INSERT INTO products (id, name, slug, description, category, skin_types, concerns, is_active)
VALUES (
  'a1000000-0000-0000-0000-000000000004',
  'Daily Defence SPF 50',
  'daily-defence-spf-50',
  'A lightweight, broad-spectrum mineral sunscreen (SPF 50 / PA+++) with a matte finish. Formulated with Zinc Oxide and Tinosorb S. No white cast. Fragrance-free. The last step in every morning routine.',
  'spf',
  ARRAY['dry', 'oily', 'combination', 'sensitive', 'all'],
  ARRAY['aging', 'dullness'],
  true
);

INSERT INTO product_variants (id, product_id, size_ml, price, sku, stock)
VALUES
  ('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000004', 30, 129900, 'DDSPF-30',  45),
  ('b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000004', 50, 189900, 'DDSPF-50',  25);

INSERT INTO product_ingredients (product_id, name, concentration, benefit, science_note, display_order)
VALUES
  ('a1000000-0000-0000-0000-000000000004', 'Zinc Oxide',   18.00, 'Broad-spectrum UVA/UVB blocker',
   'Mineral UV filter that scatters and absorbs UV radiation. Non-irritating — the gold standard for sensitive skin.', 1),
  ('a1000000-0000-0000-0000-000000000004', 'Tinosorb S',    2.00, 'Chemical UVA stabiliser',
   'Photostable chemical filter that enhances the UVA protection of Zinc Oxide without white cast.', 2),
  ('a1000000-0000-0000-0000-000000000004', 'Niacinamide',   3.00, 'Antioxidant · barrier support',
   'Doubles as antioxidant protection against UV-induced free radicals while supporting the skin barrier.', 3),
  ('a1000000-0000-0000-0000-000000000004', 'Hyaluronic Acid', 0.50, 'Hydration maintenance',
   'Counteracts the drying effect some mineral filters cause. Keeps the finish comfortable across the day.', 4);
