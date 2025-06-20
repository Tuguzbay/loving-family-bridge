
-- Drop all existing policies on all tables to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view family member profiles" ON public.profiles;

DROP POLICY IF EXISTS "Family members can view their family" ON public.families;
DROP POLICY IF EXISTS "Parents can create families" ON public.families;
DROP POLICY IF EXISTS "Users can view families they belong to" ON public.families;
DROP POLICY IF EXISTS "Users can create their own families" ON public.families;

DROP POLICY IF EXISTS "Family members can view family membership" ON public.family_members;
DROP POLICY IF EXISTS "Users can join families" ON public.family_members;
DROP POLICY IF EXISTS "Users can view family members they belong to" ON public.family_members;
DROP POLICY IF EXISTS "Users can insert themselves into families" ON public.family_members;
DROP POLICY IF EXISTS "Family owners can insert members" ON public.family_members;

-- Create security definer functions to prevent recursion
CREATE OR REPLACE FUNCTION public.is_family_member(family_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_members fm
    WHERE fm.family_id = family_id_param AND fm.user_id = user_id_param
  );
$$;

CREATE OR REPLACE FUNCTION public.is_family_owner(family_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.families f
    WHERE f.id = family_id_param AND f.parent_id = user_id_param
  );
$$;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles table
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can view family member profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.family_members fm1
    JOIN public.family_members fm2 ON fm1.family_id = fm2.family_id
    WHERE fm1.user_id = auth.uid() AND fm2.user_id = profiles.id
  )
);

-- Create RLS policies for families table
CREATE POLICY "Users can view families they belong to"
ON public.families
FOR SELECT
TO authenticated
USING (
  parent_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.family_members fm
    WHERE fm.family_id = id AND fm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own families"
ON public.families
FOR INSERT
TO authenticated
WITH CHECK (parent_id = auth.uid());

-- Create RLS policies for family_members table
CREATE POLICY "Users can view family members they belong to"
ON public.family_members
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR 
  public.is_family_member(family_id, auth.uid()) OR
  public.is_family_owner(family_id, auth.uid())
);

CREATE POLICY "Users can insert themselves into families"
ON public.family_members
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Family owners can insert members"
ON public.family_members
FOR INSERT
TO authenticated
WITH CHECK (public.is_family_owner(family_id, auth.uid()));
