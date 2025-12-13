-- Migration 007 (DEV ONLY): Allow public SELECT on `sales` for development
-- WARNING: This weakens Row Level Security. Use only for local development/testing.

-- Remove restrictive select policy if present
DROP POLICY IF EXISTS authenticated_select_sales ON sales;

-- Create permissive select policy for dev
CREATE POLICY dev_select_sales ON sales
  FOR SELECT
  USING (true);

-- To revert (secure) run:
-- DROP POLICY IF EXISTS dev_select_sales ON sales;
-- CREATE POLICY authenticated_select_sales ON sales FOR SELECT USING (auth.role() = 'authenticated');
