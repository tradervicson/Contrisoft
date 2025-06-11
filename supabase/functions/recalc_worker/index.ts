// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/x/sift@0.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

interface Metrics {
  totalRooms: number;
  totalFloors: number;
  accessibleRooms: number;
  nonCompliance: any[];
}

function calculateMetrics(floors: any[]): Metrics {
  let totalRooms = 0;
  let accessibleRooms = 0;
  const nonCompliance: any[] = [];

  floors.forEach((floor) => {
    if (floor.height < 8 || floor.height > 14) {
      nonCompliance.push({ type: "warning", msg: `Floor ${floor.name} height out of range` });
    }
    floor.rooms.forEach((room: any) => {
      totalRooms += room.quantity;
      if (room.room_type === "accessible") accessibleRooms += room.quantity;
    });
  });

  const accessiblePct = totalRooms ? (accessibleRooms / totalRooms) * 100 : 0;
  if (accessiblePct < 4) {
    nonCompliance.push({ type: "error", msg: `ADA accessible rooms ${accessiblePct.toFixed(1)}% (<4%)` });
  }

  return {
    totalRooms,
    totalFloors: floors.length,
    accessibleRooms,
    nonCompliance,
  };
}

serve(async (req) => {
  const { projectId } = await req.json();
  if (!projectId) return new Response("No projectId", { status: 400 });

  console.log("recalc_worker starting", projectId);

  try {
    // fetch floors with room configs
    const { data: floors, error } = await supabase.rpc("get_project_design", { p_project_id: projectId });
    if (error) throw error;

    const metrics = calculateMetrics(floors || []);

    // Update project row
    const { error: upErr } = await supabase
      .from("projects")
      .update({
        status: "costs_ready",
        last_recalc_at: new Date().toISOString(),
        non_compliance: metrics.nonCompliance,
      })
      .eq("id", projectId);
    if (upErr) throw upErr;

    // Invoke cost worker
    await supabase.functions.invoke("cost_worker", { body: { projectId } });

    return new Response("Recalc OK", { status: 200 });
  } catch (err) {
    console.error("recalc_worker error", err);
    // Retry logic could be added here
    return new Response("recalc error", { status: 500 });
  }
}); 