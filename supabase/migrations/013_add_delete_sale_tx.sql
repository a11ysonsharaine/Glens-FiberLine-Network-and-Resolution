-- Migration: add RPC to atomically delete a sale and restore product quantity
-- Run this in Supabase SQL editor or apply via your migrations tooling.

create or replace function public.delete_sale_tx(p_sale_id uuid)
returns void language plpgsql security definer as $$
declare
  v_sale record;
  v_prod_id uuid;
  v_qty integer;
begin
  select id, product_id, quantity into v_sale from public.sales where id = p_sale_id;
  if not found then
    raise exception 'sale not found';
  end if;

  v_prod_id := v_sale.product_id;
  v_qty := coalesce(v_sale.quantity, 0);

  -- update product qty if product exists
  if v_prod_id is not null then
    update public.products
    set quantity = coalesce(quantity,0) + v_qty,
        updated_at = now()
    where id = v_prod_id;
  end if;

  -- delete the sale row
  delete from public.sales where id = p_sale_id;
end;
$$;

-- Grant execute to anon so client-side apps (using anon key) can call this RPC.
-- Only do this if you accept the security implications described in project docs.
grant execute on function public.delete_sale_tx(uuid) to anon;
