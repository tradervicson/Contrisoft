// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/x/sift@0.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

serve(async (req) => {
  try {
    const payload: any = await req.json();
    console.log("design_change_listener payload", payload);

    const projectId: string | undefined = payload?.record?.project_id || payload?.old_record?.project_id;
    if (!projectId) {
      return new Response("No project_id found", { status: 400 });
    }

    // Mark project as needing recalculation
    const { error } = await supabase
      .from("projects")
      .update({ status: "needs_recalc" })
      .eq("id", projectId);

    if (error) throw error;

    // Invoke recalculation worker asynchronously
    await supabase.functions.invoke("recalc_worker", {
      body: { projectId },
    });

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("design_change_listener error", err);
    return new Response("Internal error", { status: 500 });
  }
}); 