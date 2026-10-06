DELETE FROM public.invoice_items WHERE package_id='263c70ce-2505-4d19-908f-c520b074784c';
UPDATE public.customer_notifications SET package_id='be85548a-4750-469f-a0ef-6da469eaee20' WHERE package_id='263c70ce-2505-4d19-908f-c520b074784c';
DELETE FROM public.packages WHERE id='263c70ce-2505-4d19-908f-c520b074784c';
UPDATE public.packages SET pieces=2, weight_kg=7.9, cbm=0.028, external_tracking='YT7647153201083, YT7647243795144', description='Body wash & Body Lotion', notes='Consolidated' WHERE id='be85548a-4750-469f-a0ef-6da469eaee20';
SELECT public.recompute_invoice_totals('aaf65ce8-5f22-405a-8a2b-5c47c11f95d0');