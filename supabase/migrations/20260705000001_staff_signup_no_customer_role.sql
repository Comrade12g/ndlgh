-- Every signup currently gets the 'customer' role auto-assigned by
-- handle_new_user(), regardless of which form was used. That's correct
-- for the public customer sign-up flow, but wrong for employees — an
-- employee account shouldn't be a "customer" at all. This adds an escape
-- hatch: if the sign-up passed account_type: 'staff' in its metadata
-- (see the new staff sign-up page), skip the customer role assignment
-- entirely. An admin then assigns the real staff role via
-- Admin > Users & roles, same as before.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'phone'
  );

  IF NEW.raw_user_meta_data->>'account_type' IS DISTINCT FROM 'staff' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'customer')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;
