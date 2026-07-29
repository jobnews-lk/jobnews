import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Verify JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const token = authHeader.replace("Bearer ", "");

    // Get user from JWT
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ error: "Invalid session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .maybeSingle();

    if (profile?.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Forbidden: admin role required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const jobId = pathParts[pathParts.length - 1] !== "admin-jobs" ? pathParts[pathParts.length - 1] : null;

    if (req.method === "POST") {
      const body = await req.json();
      const { images, pdfs, thumbnail_url, official_pdf_url, ...jobData } = body;
      const { data: job, error } = await supabase.from("jobs").insert({
        ...jobData,
        thumbnail_url: thumbnail_url || null,
        official_pdf_url: official_pdf_url || null,
      }).select().single();
      if (error) throw error;

      if (images && images.length > 0) {
        const imageRecords = images.map((url: string, idx: number) => ({
          job_id: job.id,
          url,
          sort_order: idx,
        }));
        await supabase.from("job_images").insert(imageRecords);
      }

      if (pdfs && pdfs.length > 0) {
        const pdfRecords = pdfs.map((pdf: { url: string; filename: string; page_count?: number }) => ({
          job_id: job.id,
          url: pdf.url,
          filename: pdf.filename,
          page_count: pdf.page_count || null,
        }));
        await supabase.from("job_pdfs").insert(pdfRecords);
      }

      return new Response(
        JSON.stringify({ data: job }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "PUT") {
      if (!jobId) {
        return new Response(
          JSON.stringify({ error: "Job ID required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const body = await req.json();
      const { images, pdfs, thumbnail_url, official_pdf_url, replaceImages, replacePdfs, ...jobData } = body;
      const { data: job, error } = await supabase.from("jobs").update({
        ...jobData,
        thumbnail_url: thumbnail_url || null,
        official_pdf_url: official_pdf_url || null,
      }).eq("id", jobId).select().single();
      if (error) throw error;

      if (replaceImages && images) {
        await supabase.from("job_images").delete().eq("job_id", jobId);
        if (images.length > 0) {
          const imageRecords = images.map((url: string, idx: number) => ({
            job_id: jobId,
            url,
            sort_order: idx,
          }));
          await supabase.from("job_images").insert(imageRecords);
        }
      }

      if (replacePdfs && pdfs) {
        await supabase.from("job_pdfs").delete().eq("job_id", jobId);
        if (pdfs.length > 0) {
          const pdfRecords = pdfs.map((pdf: { url: string; filename: string; page_count?: number }) => ({
            job_id: jobId,
            url: pdf.url,
            filename: pdf.filename,
            page_count: pdf.page_count || null,
          }));
          await supabase.from("job_pdfs").insert(pdfRecords);
        }
      }

      return new Response(
        JSON.stringify({ data: job }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "DELETE") {
      if (!jobId) {
        return new Response(
          JSON.stringify({ error: "Job ID required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      await supabase.from("job_images").delete().eq("job_id", jobId);
      await supabase.from("job_pdfs").delete().eq("job_id", jobId);
      const { error } = await supabase.from("jobs").delete().eq("id", jobId);
      if (error) throw error;
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
