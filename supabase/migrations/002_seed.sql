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
