-- Combined migrations for tech-stock-manager-02
-- Apply these statements in order to initialize the database schema, seed data, create policies, views and tweaks.

-- 001_init.sql
-- Enable pgcrypto for gen_random_uuid()
create extension if not exists "pgcrypto";

-- Products table
create table if not exists products (
	id uuid primary key default gen_random_uuid(),
	name text not null,
	category text,
	quantity integer not null default 0,
	cost_price numeric,
	selling_price numeric,
	supplier text,
	serial_number text,
	min_stock_level integer default 0,
	created_at timestamptz default now(),
	updated_at timestamptz default now()
);

-- Sales table
create table if not exists sales (
	id uuid primary key default gen_random_uuid(),
	product_id uuid references products(id) on delete set null,
	product_name text,
	quantity integer not null,
	unit_price numeric,
	total_amount numeric,
	customer_name text,
	created_at timestamptz default now()
);

-- Atomic RPC to add a sale and decrement product stock inside a transaction
create or replace function add_sale(
	p_product_id uuid,
	p_quantity integer,
	p_unit_price numeric,
	p_product_name text,
	p_total_amount numeric,
	p_customer_name text
) returns table(
	id uuid,
	product_id uuid,
	quantity integer,
	unit_price numeric,
	total_amount numeric,
	created_at timestamptz
) language plpgsql as $$
declare
	v_product products%rowtype;
begin
	select * into v_product from products where id = p_product_id for update;
	if not found then
		raise exception 'product not found';
	end if;
	if v_product.quantity < p_quantity then
		raise exception 'insufficient stock';
	end if;

	update products set quantity = v_product.quantity - p_quantity, updated_at = now() where id = p_product_id;

	return query
		insert into sales(product_id, product_name, quantity, unit_price, total_amount, customer_name, created_at)
		values (p_product_id, p_product_name, p_quantity, p_unit_price, p_total_amount, p_customer_name, now())
		returning id, product_id, quantity, unit_price, total_amount, created_at;
end;
$$;

-- Indexes for common queries
create index if not exists idx_products_category on products(category);
create index if not exists idx_products_quantity on products(quantity);
create index if not exists idx_sales_created_at on sales(created_at);

-- 002_seed.sql
-- Seed products (use explicit UUIDs so sample sales can reference them)
insert into products(id, name, category, quantity, cost_price, selling_price, supplier, serial_number, min_stock_level, created_at, updated_at) values
	('11111111-1111-1111-1111-111111111111','Hikvision 4MP Dome Camera',NULL,15,85,120,'Hikvision Distributor','HK-4MP-001',5, now(), now()),
	('22222222-2222-2222-2222-222222222222','TP-Link Archer AX50 Router','WiFi Routers',8,95,140,'TP-Link Official',NULL,3, now(), now()),
	('33333333-3333-3333-3333-333333333333','JBL Flip 6 Bluetooth Speaker','Speakers',3,80,130,'JBL Electronics',NULL,5, now(), now()),
	('44444444-4444-4444-4444-444444444444','Cat6 Ethernet Cable 50m','Cables',25,15,28,'Cable World',NULL,10, now(), now()),
	('55555555-5555-5555-5555-555555555555','Ubiquiti UniFi Access Point','Networking',2,150,220,'Ubiquiti Networks','UB-UAP-005',3, now(), now()),
	('66666666-6666-6666-6666-666666666666','HDMI Cable 2m Premium','Accessories',40,5,12,'Cable World',NULL,15, now(), now());

-- Seed sample sales referencing seeded product ids
insert into sales(id, product_id, product_name, quantity, unit_price, total_amount, customer_name, created_at) values
	('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1','11111111-1111-1111-1111-111111111111','Hikvision 4MP Dome Camera',2,120,240,'John Smith', now()),
	('aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2','44444444-4444-4444-4444-444444444444','Cat6 Ethernet Cable 50m',3,28,84,NULL, now() - interval '1 day');

-- 003_policies.sql
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

-- 004_views.sql
-- Dashboard view for aggregated stats
create or replace view dashboard_stats as
select
	(select count(*) from products) as total_products,
	(select coalesce(sum(quantity * coalesce(cost_price,0)),0) from products) as total_value,
	(select count(*) from products where quantity <= coalesce(min_stock_level,0)) as low_stock_items,
	(select coalesce(sum(total_amount),0) from sales where created_at >= date_trunc('day', now())) as today_sales,
	(select coalesce(sum(total_amount),0) from sales where created_at >= now() - interval '7 days') as weekly_sales,
	(select coalesce(sum(total_amount),0) from sales where created_at >= now() - interval '30 days') as monthly_sales;

-- Grant select on view to public (front-end can query via REST or RPC)
grant select on dashboard_stats to public;

-- 005_make_supplier_optional.sql
-- Migration 005: Make supplier nullable in products

ALTER TABLE public.products
	ALTER COLUMN supplier DROP NOT NULL;

-- If you need to set existing empty strings to NULL, run:
-- UPDATE public.products SET supplier = NULL WHERE supplier = '';

-- End of combined migrations

