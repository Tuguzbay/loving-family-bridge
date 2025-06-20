
-- Create a function to find family by code that bypasses RLS
-- This is needed for children to join families using family codes
CREATE OR REPLACE FUNCTION public.find_family_by_code(code_param text)
RETURNS TABLE(
  id uuid,
  family_code text,
  parent_id uuid,
  created_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT f.id, f.family_code, f.parent_id, f.created_at
  FROM public.families f
  WHERE f.family_code = code_param;
$$;
