CREATE OR REPLACE FUNCTION public.generate_shipping_mark()
 RETURNS text LANGUAGE sql SET search_path TO 'public'
AS $$ SELECT 'ND' || LPAD(nextval('public.shipping_mark_seq')::text, 4, '0'); $$;

CREATE TEMP TABLE _mark_map AS
SELECT id, shipping_mark AS old_mark,
       'ND' || LPAD(row_number() OVER (ORDER BY created_at, id)::text, 4, '0') AS new_mark
FROM public.profiles;

UPDATE public.packages p SET shipping_mark = m.new_mark
FROM _mark_map m WHERE upper(p.shipping_mark) = upper(m.old_mark) AND m.old_mark IS NOT NULL;

UPDATE public.profiles pr SET shipping_mark = m.new_mark
FROM _mark_map m WHERE pr.id = m.id;

SELECT setval('public.shipping_mark_seq', GREATEST((SELECT count(*) FROM _mark_map), 1));

DROP TABLE _mark_map;