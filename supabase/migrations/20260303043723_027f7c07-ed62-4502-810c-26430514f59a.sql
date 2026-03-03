-- Fix 1: Add missing DELETE policy on admin_settings
CREATE POLICY "Admins can delete settings"
ON public.admin_settings
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: Harden handle_new_user_profile trigger with input validation
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT;
  v_full_name TEXT;
BEGIN
  v_email := NEW.email;

  v_full_name := NEW.raw_user_meta_data ->> 'full_name';

  IF v_full_name IS NOT NULL THEN
    v_full_name := TRIM(v_full_name);
    IF LENGTH(v_full_name) > 255 THEN
      v_full_name := SUBSTRING(v_full_name, 1, 255);
    END IF;
    IF LENGTH(v_full_name) = 0 THEN
      v_full_name := NULL;
    END IF;
  END IF;

  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, v_email, v_full_name);

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;