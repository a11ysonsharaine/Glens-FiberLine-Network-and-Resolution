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
