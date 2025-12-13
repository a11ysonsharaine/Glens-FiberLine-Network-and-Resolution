-- Migration 011 (cleanup): Revoke dev-only anon privileges and drop permissive dev policies
-- Run this after you confirm testing is complete.

-- Revoke anon table-level privileges granted for dev testing
REVOKE INSERT, SELECT ON public.sales FROM anon;

-- Revoke anon execute on the add_sale function
REVOKE EXECUTE ON FUNCTION public.add_sale(uuid, integer, numeric, text, numeric, text) FROM anon;

-- Drop the permissive dev policies we created
DROP POLICY IF EXISTS allow_public_insert_sales ON public.sales;
DROP POLICY IF EXISTS allow_public_select_sales ON public.sales;

-- Note: Leave authenticated grants in place if you want signed-in users to call the RPC.
