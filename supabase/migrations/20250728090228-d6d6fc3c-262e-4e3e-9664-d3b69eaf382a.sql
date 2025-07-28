-- Clean up duplicate conversation responses, keeping only the latest set
-- Delete older duplicates, keeping the most recent one for each question

WITH latest_responses AS (
  SELECT DISTINCT ON (user_id, family_id, question_id) 
    id, user_id, family_id, question_id, created_at
  FROM conversation_responses 
  WHERE user_id = '12d710b3-feee-4bcf-9576-4cd374897598'
  ORDER BY user_id, family_id, question_id, created_at DESC
)
DELETE FROM conversation_responses 
WHERE user_id = '12d710b3-feee-4bcf-9576-4cd374897598'
  AND id NOT IN (SELECT id FROM latest_responses);