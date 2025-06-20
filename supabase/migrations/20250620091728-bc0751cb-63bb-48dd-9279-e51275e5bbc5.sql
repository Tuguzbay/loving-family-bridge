
-- Fix the search_path security issue for all functions
-- This prevents potential security vulnerabilities by ensuring functions use a stable search path

-- Update is_family_member function to set search_path
CREATE OR REPLACE FUNCTION public.is_family_member(family_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_members fm
    WHERE fm.family_id = family_id_param AND fm.user_id = user_id_param
  );
$$;

-- Update is_family_owner function to set search_path
CREATE OR REPLACE FUNCTION public.is_family_owner(family_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.families f
    WHERE f.id = family_id_param AND f.parent_id = user_id_param
  );
$$;

-- Update generate_family_code function to set search_path
CREATE OR REPLACE FUNCTION public.generate_family_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  code TEXT;
BEGIN
  LOOP
    code := 'FAM-' || TO_CHAR(EXTRACT(YEAR FROM NOW()), 'YYYY') || '-' || 
            UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    
    -- Check if code already exists
    IF NOT EXISTS (SELECT 1 FROM public.families WHERE family_code = code) THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$;
