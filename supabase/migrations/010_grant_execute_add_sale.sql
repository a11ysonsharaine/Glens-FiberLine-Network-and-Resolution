-- Migration 010: Ensure anon/authenticated can execute add_sale RPC (dev/testing)
-- Grants EXECUTE for the specific signature used by the client.

GRANT EXECUTE ON FUNCTION public.add_sale(uuid, integer, numeric, text, numeric, text) TO anon;
GRANT EXECUTE ON FUNCTION public.add_sale(uuid, integer, numeric, text, numeric, text) TO authenticated;

-- Note: Run this in the SQL editor to apply. Remove or tighten in production as appropriate.
