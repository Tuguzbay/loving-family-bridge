-- Fix the RLS policy on families table - the WHERE clause has a bug
-- It should compare fm.family_id = families.id, not fm.family_id = fm.id

DROP POLICY IF EXISTS "Users can view families they belong to" ON public.families;

CREATE POLICY "Users can view families they belong to" 
  ON public.families 
  FOR SELECT 
  USING (
    (parent_id = auth.uid()) OR 
    (EXISTS (
      SELECT 1 
      FROM family_members fm 
      WHERE fm.family_id = families.id AND fm.user_id = auth.uid()
    ))
  );