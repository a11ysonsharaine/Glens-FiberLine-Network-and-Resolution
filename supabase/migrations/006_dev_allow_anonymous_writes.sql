-- Migration 006 (DEV ONLY): Allow anonymous writes to `products`
-- WARNING: This removes the authenticated-only restriction and should ONLY be used
-- for local development or testing. Do NOT deploy this to production.

-- Drop the restrictive authenticated policy if it exists, then add a permissive dev policy
DROP POLICY IF EXISTS authenticated_modify_products ON products;

CREATE POLICY dev_modify_products ON products
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Also allow calling add_sale RPC from anonymous clients for dev convenience
GRANT EXECUTE ON FUNCTION add_sale(uuid, integer, numeric, text, numeric, text) TO public;

-- To revert (secure) run:
-- DROP POLICY IF EXISTS dev_modify_products ON products;
-- CREATE POLICY authenticated_modify_products ON products
--   FOR ALL
--   USING (auth.role() = 'authenticated')
--   WITH CHECK (auth.role() = 'authenticated');
-- REVOKE EXECUTE ON FUNCTION add_sale(uuid, integer, numeric, text, numeric, text) FROM public;
