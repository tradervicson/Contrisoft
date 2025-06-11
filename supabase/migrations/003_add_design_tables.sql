CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- --------------------------------------------------
-- Module 5: Design Tab & Geometry Editor
-- Adds floors, room_configurations, public_areas, geometry_configs
-- --------------------------------------------------

-- Table: floors
CREATE TABLE IF NOT EXISTS floors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  level INTEGER NOT NULL,
  height DECIMAL(4,1) DEFAULT 9.0,
  floor_type TEXT DEFAULT 'standard',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: room_configurations
CREATE TABLE IF NOT EXISTS room_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  floor_id UUID REFERENCES floors(id) ON DELETE CASCADE,
  room_type_id UUID NOT NULL,
  quantity INTEGER DEFAULT 0,
  average_size DECIMAL(6,1),
  positioning JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: public_areas
CREATE TABLE IF NOT EXISTS public_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  area_type TEXT NOT NULL,
  size_sqft DECIMAL(8,1),
  is_required BOOLEAN DEFAULT FALSE,
  level INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: geometry_configs
CREATE TABLE IF NOT EXISTS geometry_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  floor_plan_data JSONB,
  view_settings JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for floors
ALTER TABLE floors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Select own floors" ON floors FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid())
);
CREATE POLICY "Insert own floors" ON floors FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid())
);
CREATE POLICY "Update own floors" ON floors FOR UPDATE USING (
  EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid())
);
CREATE POLICY "Delete own floors" ON floors FOR DELETE USING (
  EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid())
);

-- Enable RLS for room_configurations
ALTER TABLE room_configurations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Select own room configs" ON room_configurations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM floors f JOIN projects p ON p.id = f.project_id
    WHERE f.id = room_configurations.floor_id AND p.user_id = auth.uid()
  )
);
CREATE POLICY "Insert own room configs" ON room_configurations FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM floors f JOIN projects p ON p.id = f.project_id
    WHERE f.id = room_configurations.floor_id AND p.user_id = auth.uid()
  )
);
CREATE POLICY "Update own room configs" ON room_configurations FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM floors f JOIN projects p ON p.id = f.project_id
    WHERE f.id = room_configurations.floor_id AND p.user_id = auth.uid()
  )
);
CREATE POLICY "Delete own room configs" ON room_configurations FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM floors f JOIN projects p ON p.id = f.project_id
    WHERE f.id = room_configurations.floor_id AND p.user_id = auth.uid()
  )
);

-- Enable RLS for public_areas
ALTER TABLE public_areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Select own public areas" ON public_areas FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid())
);
CREATE POLICY "Insert own public areas" ON public_areas FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid())
);
CREATE POLICY "Update own public areas" ON public_areas FOR UPDATE USING (
  EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid())
);
CREATE POLICY "Delete own public areas" ON public_areas FOR DELETE USING (
  EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid())
);

-- Enable RLS for geometry_configs
ALTER TABLE geometry_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Select own geometry" ON geometry_configs FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid())
);
CREATE POLICY "Insert own geometry" ON geometry_configs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid())
);
CREATE POLICY "Update own geometry" ON geometry_configs FOR UPDATE USING (
  EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid())
); 