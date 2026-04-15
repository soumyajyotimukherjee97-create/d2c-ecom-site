-- Add image_url to products table.
-- Stores the public URL of the product's primary image (Supabase Storage).
-- Nullable — products without an uploaded image return null from the API.
ALTER TABLE products
  ADD COLUMN image_url text;
