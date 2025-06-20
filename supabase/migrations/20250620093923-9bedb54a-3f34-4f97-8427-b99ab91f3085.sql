
-- First, let's check for orphaned family_member records
SELECT fm.*, f.id as family_exists 
FROM family_members fm 
LEFT JOIN families f ON fm.family_id = f.id 
WHERE f.id IS NULL;

-- Delete orphaned family_member records that reference non-existent families
DELETE FROM family_members 
WHERE family_id NOT IN (SELECT id FROM families);
