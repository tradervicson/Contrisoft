-- Enable pgcrypto for UUIDs
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Table: projects (references auth.users directly)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'Draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: hotel_base_models
CREATE TABLE IF NOT EXISTS hotel_base_models (
  project_id UUID PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS and policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Select own projects" ON projects FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Insert own projects" ON projects FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Update own projects" ON projects FOR UPDATE USING (user_id = auth.uid());

ALTER TABLE hotel_base_models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Select own models" ON hotel_base_models FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid())
);
CREATE POLICY "Insert own models" ON hotel_base_models FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid())
);
CREATE POLICY "Update own models" ON hotel_base_models FOR UPDATE USING (
  EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid())
); 