-- Enable Row Level Security and policies

-- Make the add_sale function run with elevated privileges so RPC can update stock atomically
ALTER FUNCTION add_sale(uuid, integer, numeric, text, numeric, text) SECURITY DEFINER;

-- Products: enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow public SELECT on products (read-only for everyone)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'public_select_products' AND tablename = 'products'
  ) THEN
    CREATE POLICY public_select_products ON products FOR SELECT USING (true);
  END IF;
END$$;

-- Allow authenticated users to INSERT/UPDATE/DELETE products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'authenticated_modify_products' AND tablename = 'products'
  ) THEN
    CREATE POLICY authenticated_modify_products ON products
      FOR ALL
      USING (auth.role() = 'authenticated')
      WITH CHECK (auth.role() = 'authenticated');
  END IF;
END$$;

-- Sales: enable RLS
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to SELECT sales; inserts should be done via RPC only
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'authenticated_select_sales' AND tablename = 'sales'
  ) THEN
    CREATE POLICY authenticated_select_sales ON sales FOR SELECT USING (auth.role() = 'authenticated');
  END IF;
END$$;

-- Grant EXECUTE on add_sale to public so client can call the RPC.
-- NOTE: this grants permission to call the function; the function runs as its owner because of SECURITY DEFINER.
-- Grant execute on add_sale only to authenticated role (requires user to be logged in)
GRANT EXECUTE ON FUNCTION add_sale(uuid, integer, numeric, text, numeric, text) TO authenticated;
