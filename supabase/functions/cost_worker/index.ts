// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/x/sift@0.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

const BASE_COST_PER_TIER: Record<string, number> = {
  standard: 125000,
  upscale: 165000,
  luxury: 220000,
};

serve(async (req) => {
  const { projectId, regionalMultiplier = 1.0, brandTier = "standard" } = await req.json();
  if (!projectId) return new Response("No projectId", { status: 400 });

  console.log("cost_worker start", projectId);

  try {
    // Fetch total rooms from project (assuming stored previously)
    const { data: projectRow, error } = await supabase.from("projects").select("*, non_compliance").eq("id", projectId).single();
    if (error) throw error;

    // Simple guard – if errors in non_compliance, no compliant status
    const hasErrors = (projectRow.non_compliance || []).some((i: any) => i.type === "error");

    const totalRooms = projectRow.total_rooms || 0; // may not exist yet, default 0

    const baseCost = BASE_COST_PER_TIER[brandTier] || BASE_COST_PER_TIER["standard"];

    const low = (baseCost * 0.9) * regionalMultiplier;
    const mid = baseCost * regionalMultiplier;
    const high = (baseCost * 1.15) * regionalMultiplier;

    // Insert cost summary
    const { error: insErr } = await supabase.from("project_costs").insert({
      project_id: projectId,
      low_cost_per_key: low,
      mid_cost_per_key: mid,
      high_cost_per_key: high,
      regional_multiplier: regionalMultiplier,
      brand_tier: brandTier,
    });
    if (insErr) throw insErr;

    // Update project status
    const newStatus = hasErrors ? "needs_recalc" : "compliant";

    const { error: upErr } = await supabase
      .from("projects")
      .update({ status: newStatus, last_cost_calc_at: new Date().toISOString() })
      .eq("id", projectId);
    if (upErr) throw upErr;

    return new Response("Cost OK", { status: 200 });
  } catch (err) {
    console.error("cost_worker error", err);
    return new Response("cost error", { status: 500 });
  }
}); 