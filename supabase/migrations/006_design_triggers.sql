-- --------------------------------------------------
-- Module 6: helper function + realtime trigger
-- --------------------------------------------------

-- 1. Helper function to return full design snapshot for a project
CREATE OR REPLACE FUNCTION get_project_design(p_project_id uuid)
RETURNS jsonb
LANGUAGE plpgsql AS $$
DECLARE
  payload jsonb;
BEGIN
  SELECT jsonb_agg(row_to_json(floor_row)) INTO payload
  FROM (
    SELECT fl.*, (
      SELECT jsonb_agg(rc.*)
      FROM room_configurations rc
      WHERE rc.floor_id = fl.id
    ) AS rooms
    FROM floors fl
    WHERE fl.project_id = p_project_id
    ORDER BY fl.level
  ) AS floor_row;

  RETURN COALESCE(payload, '[]'::jsonb);
END;
$$;

-- 2. Realtime trigger: on any design table change, NOTIFY edge function
--   (Supabase realtime webhook listens to the "design_changes" channel)

CREATE OR REPLACE FUNCTION notify_design_change()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  proj_id uuid;
BEGIN
  IF TG_TABLE_NAME = 'floors' THEN
    proj_id := COALESCE(NEW.project_id, OLD.project_id);
  ELSIF TG_TABLE_NAME = 'room_configurations' THEN
    SELECT floor_id INTO proj_id FROM room_configurations WHERE id = COALESCE(NEW.id, OLD.id);
    SELECT project_id INTO proj_id FROM floors WHERE id = proj_id;
  ELSIF TG_TABLE_NAME = 'public_areas' OR TG_TABLE_NAME = 'geometry_configs' THEN
    proj_id := COALESCE(NEW.project_id, OLD.project_id);
  END IF;
  PERFORM pg_notify('design_changes', proj_id::text);
  RETURN NULL;
END;
$$;

-- Attach trigger to each table
CREATE TRIGGER floors_notify_change
AFTER INSERT OR UPDATE OR DELETE ON floors
FOR EACH ROW EXECUTE FUNCTION notify_design_change();

CREATE TRIGGER room_configs_notify_change
AFTER INSERT OR UPDATE OR DELETE ON room_configurations
FOR EACH ROW EXECUTE FUNCTION notify_design_change();

CREATE TRIGGER public_areas_notify_change
AFTER INSERT OR UPDATE OR DELETE ON public_areas
FOR EACH ROW EXECUTE FUNCTION notify_design_change();

CREATE TRIGGER geometry_notify_change
AFTER INSERT OR UPDATE OR DELETE ON geometry_configs
FOR EACH ROW EXECUTE FUNCTION notify_design_change(); 