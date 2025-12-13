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
