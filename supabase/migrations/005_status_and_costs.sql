-- --------------------------------------------------
-- Module 6 & 7 Migration: Status Workflow + Cost Engine Stub
-- Adds project_status enum, status columns, cost summary table
-- --------------------------------------------------

-- Enable pgcrypto for UUID generation (if not already)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Enum for project status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status') THEN
    CREATE TYPE project_status AS ENUM ('draft', 'needs_recalc', 'costs_ready', 'compliant');
  END IF;
END$$;

-- 2. Alter projects table
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS status project_status DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS last_recalc_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_cost_calc_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS non_compliance JSONB;

-- 3. Cost summary table
CREATE TABLE IF NOT EXISTS project_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  low_cost_per_key NUMERIC,
  mid_cost_per_key NUMERIC,
  high_cost_per_key NUMERIC,
  regional_multiplier NUMERIC DEFAULT 1.0,
  brand_tier TEXT DEFAULT 'standard',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_costs_project_id ON project_costs(project_id); 