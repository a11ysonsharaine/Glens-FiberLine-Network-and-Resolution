-- Migration 008: Fix ambiguous column reference in add_sale function
-- Replaces the add_sale function to avoid ambiguous reference to "id" (PL/pgSQL creates an "id" variable for OUT columns)

create or replace function add_sale(
  p_product_id uuid,
  p_quantity integer,
  p_unit_price numeric,
  p_product_name text,
  p_total_amount numeric,
  p_customer_name text
)
  returns table(
  id uuid,
  product_id uuid,
  quantity integer,
  unit_price numeric,
  total_amount numeric,
  created_at timestamptz
)
  language plpgsql security definer as $$
declare
  v_product products%rowtype;
begin
  -- qualify table column to avoid ambiguity with OUT parameter names
  select * into v_product from products where products.id = p_product_id for update;
  if not found then
    raise exception 'product not found';
  end if;
  if v_product.quantity < p_quantity then
    raise exception 'insufficient stock';
  end if;

  update products set quantity = v_product.quantity - p_quantity, updated_at = now() where products.id = p_product_id;

  return query
    insert into sales(product_id, product_name, quantity, unit_price, total_amount, customer_name, created_at)
    values (p_product_id, p_product_name, p_quantity, p_unit_price, p_total_amount, p_customer_name, now())
    returning sales.id AS id, sales.product_id AS product_id, sales.quantity AS quantity, sales.unit_price AS unit_price, sales.total_amount AS total_amount, sales.created_at AS created_at;
end;
$$;

-- Grant execute to anon for dev/testing (remove or restrict in production)
grant execute on function public.add_sale(uuid, integer, numeric, text, numeric, text) to anon;
