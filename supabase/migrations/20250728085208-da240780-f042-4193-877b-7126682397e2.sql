-- Clear all data from tables (keeping structure intact)
-- Delete in correct order to respect foreign key dependencies

DELETE FROM insights;
DELETE FROM messages;
DELETE FROM conversations;
DELETE FROM conversation_responses;
DELETE FROM conversation_completions;
DELETE FROM parent_child_assessments;
DELETE FROM family_members;
DELETE FROM families;
DELETE FROM profiles;

-- Also clear auth users (this will cascade delete everything)
-- Note: This requires admin privileges
DELETE FROM auth.users;