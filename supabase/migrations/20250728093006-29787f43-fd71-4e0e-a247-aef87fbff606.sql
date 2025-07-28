-- Add unique constraint to prevent duplicate conversation completions
ALTER TABLE conversation_completions 
ADD CONSTRAINT unique_user_family_completion 
UNIQUE (user_id, family_id);