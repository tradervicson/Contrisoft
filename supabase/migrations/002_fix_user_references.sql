-- Migration to fix user references
-- This migrates from using custom accounts table to auth.users directly

-- Drop existing policies
DROP POLICY IF EXISTS "Select own projects" ON projects;
DROP POLICY IF EXISTS "Insert own projects" ON projects;
DROP POLICY IF EXISTS "Update own projects" ON projects;
DROP POLICY IF EXISTS "Select own models" ON hotel_base_models;
DROP POLICY IF EXISTS "Insert own models" ON hotel_base_models;
DROP POLICY IF EXISTS "Update own models" ON hotel_base_models;

-- Drop existing foreign key constraint
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_account_id_fkey;

-- Add new user_id column
ALTER TABLE projects ADD COLUMN IF NOT EXISTS user_id UUID;

-- Migrate existing data if any (you'll need to manually map if you have data)
-- For now, we'll just set it to null and you can manually update if needed
-- UPDATE projects SET user_id = account_id; -- Only if account_id mapped to auth.users

-- Drop old column
ALTER TABLE projects DROP COLUMN IF EXISTS account_id;

-- Add foreign key constraint to auth.users
ALTER TABLE projects ADD CONSTRAINT projects_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Make user_id NOT NULL (after updating existing data)
ALTER TABLE projects ALTER COLUMN user_id SET NOT NULL;

-- Recreate RLS policies with user_id
CREATE POLICY "Select own projects" ON projects FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Insert own projects" ON projects FOR INSERT WITH CHECK (user_id = auth.uid());  
CREATE POLICY "Update own projects" ON projects FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Select own models" ON hotel_base_models FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid())
);
CREATE POLICY "Insert own models" ON hotel_base_models FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid())
);
CREATE POLICY "Update own models" ON hotel_base_models FOR UPDATE USING (
  EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid())
);

-- Drop the accounts table if it exists and is not needed
DROP TABLE IF EXISTS accounts; 