-- Migration 009 (dev-only): Allow public/anon to INSERT into sales for local testing
-- WARNING: This is for development only. Remove or tighten for production.

-- Create a permissive policy that allows inserts into the sales table
CREATE POLICY allow_public_insert_sales ON public.sales
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Grant table-level INSERT privilege to the anon role (dev only)
GRANT INSERT ON public.sales TO anon;

-- Optional: allow public SELECT for quick verification (can be removed)
CREATE POLICY allow_public_select_sales ON public.sales
  FOR SELECT
  TO public
  USING (true);
GRANT SELECT ON public.sales TO anon;
