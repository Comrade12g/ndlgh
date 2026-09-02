ALTER TABLE public.warehouses
  ADD COLUMN IF NOT EXISTS name_local text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS mark_prefix text,
  ADD COLUMN IF NOT EXISTS address_local text,
  ADD COLUMN IF NOT EXISTS receiving_hours text,
  ADD COLUMN IF NOT EXISTS phones text,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 100;

UPDATE public.warehouses SET
  name = 'NDL Guangzhou / Foshan Warehouse',
  name_local = '广州伊妙仓库',
  city = 'Foshan (Guangzhou)',
  mark_prefix = 'GHO0007',
  address = 'Yimiao Warehouse, No.2 Warehouse, Jiyue Industrial Park, Dabu Heng San Road, Nanhai District, Foshan City (Navigation: Yimiao Warehouse). Large trucks please use truck navigation; there is a height limit nearby.',
  address_local = '佛山市南海区大步横三路极悦产业园2号仓伊妙仓库(导航定位:伊妙仓库) 大货车请使用货车导航,附近有限高',
  receiving_hours = 'Mon–Sat, 9:00–18:00 (public holidays notified separately)',
  phones = '伊妙 18126656902 / 18126656903',
  notes = 'Please make sure the shipping mark is clearly written on the outer packaging of every package. For special goods, inform your sales representative in advance — the warehouse does not identify or inspect goods. Cash-on-delivery (COD) packages are not accepted.',
  sort_order = 10
WHERE code = 'CN';

INSERT INTO public.warehouses (code, name, name_local, country, city, mark_prefix, address, address_local, receiving_hours, phones, notes, sort_order)
VALUES ('YW', 'NDL Yiwu Warehouse', '伊妙义乌仓库', 'China', 'Yiwu, Zhejiang', 'YHO0007',
  'Yimiao Warehouse, Hongda Wool Textile, No.3 Suyuan Street, Suxi Town, Yiwu City, Jinhua, Zhejiang Province (first room on the right after entering the main gate).',
  '浙江省金华市义乌市苏溪镇苏院街3号宏达毛纺伊妙仓库(进大门右手边第一间)',
  'Mon–Sat, 9:00–18:00 (public holidays notified separately)',
  '伊妙 18857959183 / 小陈 15557941791',
  'Please ensure the shipping mark is clearly indicated on the outer packaging of every package. For special goods, notify your sales representative in advance — the warehouse does not identify goods. Cash-on-delivery (COD) parcels are not accepted.',
  20)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name, name_local = EXCLUDED.name_local, city = EXCLUDED.city,
  mark_prefix = EXCLUDED.mark_prefix, address = EXCLUDED.address, address_local = EXCLUDED.address_local,
  receiving_hours = EXCLUDED.receiving_hours, phones = EXCLUDED.phones, notes = EXCLUDED.notes,
  sort_order = EXCLUDED.sort_order;

UPDATE public.warehouses SET
  name = 'NDL Accra Warehouse',
  city = 'Accra',
  address = 'John Evans Atta Mills High Street, Accra, Ghana',
  receiving_hours = 'Mon–Sat, 9:00–18:00',
  sort_order = 90
WHERE code = 'GH';

UPDATE public.warehouses SET sort_order = 50 WHERE code IN ('AE','UK');