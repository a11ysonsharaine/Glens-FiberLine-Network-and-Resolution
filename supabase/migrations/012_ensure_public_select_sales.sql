-- Migration 012 (dev): Ensure anon can SELECT from sales (idempotent)
-- Safe for re-running; intended for development/debugging only.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'sales' AND policyname = 'allow_public_select_sales'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY allow_public_select_sales
      ON public.sales
      FOR SELECT
      TO public
      USING (true);
    $sql$;
  END IF;
END;
$$;

-- Grant SELECT to anon (idempotent)
GRANT SELECT ON public.sales TO anon;

-- Ensure RPC execute for anon during dev testing
GRANT EXECUTE ON FUNCTION public.add_sale(uuid, integer, numeric, text, numeric, text) TO anon;
