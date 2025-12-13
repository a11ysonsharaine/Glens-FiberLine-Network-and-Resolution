-- Migration 005: Make supplier nullable in products

ALTER TABLE public.products
  ALTER COLUMN supplier DROP NOT NULL;

-- If you need to set existing empty strings to NULL, run:
-- UPDATE public.products SET supplier = NULL WHERE supplier = '';