-- Update RLS policy for conversation_responses to allow family members to access each other's responses
DROP POLICY IF EXISTS "Users can view their own responses" ON conversation_responses;
DROP POLICY IF EXISTS "Family members can view family responses" ON conversation_responses;

-- Create new policy that allows family members to view each other's responses  
CREATE POLICY "Family members can view family responses" ON conversation_responses 
FOR SELECT 
USING (
  -- Users can view their own responses
  auth.uid() = user_id 
  OR 
  -- Family members can view responses within their family
  EXISTS (
    SELECT 1 FROM family_members fm1
    JOIN family_members fm2 ON fm1.family_id = fm2.family_id
    WHERE fm1.user_id = auth.uid() 
    AND fm2.user_id = conversation_responses.user_id
    AND fm1.family_id = conversation_responses.family_id
  )
);