import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if this is a manual run for a specific schedule
    let specificScheduleId: string | null = null;
    try {
      const body = await req.json();
      specificScheduleId = body?.scheduleId || null;
    } catch {
      // No body or invalid JSON, run all pending schedules
    }

    console.log("Starting scheduler run...", specificScheduleId ? `for schedule: ${specificScheduleId}` : "for all pending");

    // Fetch schedules to run
    let query = supabase
      .from("noticias_ai_schedules")
      .select("*")
      .eq("is_active", true);

    if (specificScheduleId) {
      query = query.eq("id", specificScheduleId);
    } else {
      query = query.lte("next_run", new Date().toISOString());
    }

    const { data: schedules, error: fetchError } = await query;

    if (fetchError) {
      console.error("Error fetching schedules:", fetchError);
      throw fetchError;
    }

    if (!schedules || schedules.length === 0) {
      console.log("No schedules to run");
      return new Response(
        JSON.stringify({ message: "No schedules to run", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${schedules.length} schedule(s) to process`);

    const results = [];

    for (const schedule of schedules) {
      const startTime = Date.now();
      let articlesImported = 0;
      let articlesFailed = 0;
      let status = "success";
      let errorMessage: string | null = null;

      try {
        console.log(`Processing schedule: ${schedule.name}`);

        // Limit URLs to process
        const urlsToProcess = schedule.source_urls.slice(0, schedule.max_articles_per_run);

        if (urlsToProcess.length === 0) {
          console.log("No URLs to process in schedule");
          continue;
        }

        // Call reporter-batch function
        const { data: batchResult, error: batchError } = await supabase.functions.invoke("reporter-batch", {
          body: {
            items: urlsToProcess.map((url: string) => ({ newsUrl: url })),
          },
        });

        if (batchError) {
          throw batchError;
        }

        if (batchResult?.json?.noticias) {
          const noticias = batchResult.json.noticias;
          
          for (const noticia of noticias) {
            try {
              // Find category
              const { data: categories } = await supabase
                .from("categories")
                .select("id, name, slug")
                .limit(100);

              let categoryId = null;
              if (categories && noticia.categoria) {
                const normalizedCategory = noticia.categoria.toLowerCase().trim();
                const found = categories.find(
                  (c: any) => c.name.toLowerCase() === normalizedCategory || c.slug.toLowerCase() === normalizedCategory
                );
                categoryId = found?.id || categories.find((c: any) => c.name.toLowerCase() === "geral")?.id;
              }

              // Create article
              const { error: insertError } = await supabase.from("articles").insert({
                title: noticia.titulo,
                slug: noticia.slug + "-" + Date.now(),
                excerpt: noticia.resumo,
                content: noticia.conteudo,
                category_id: categoryId,
                featured_image: noticia.imagem?.hero || null,
                featured_image_alt: noticia.imagem?.alt || null,
                featured_image_credit: noticia.imagem?.credito || null,
                source_url: noticia.fonte || null,
                meta_title: noticia.seo?.meta_titulo || null,
                meta_description: noticia.seo?.meta_descricao || null,
                tags: noticia.tags || [],
                status: schedule.auto_publish ? "published" : "draft",
                published_at: schedule.auto_publish ? new Date().toISOString() : null,
              });

              if (insertError) {
                console.error("Error inserting article:", insertError);
                articlesFailed++;
              } else {
                articlesImported++;
              }
            } catch (articleErr) {
              console.error("Error processing article:", articleErr);
              articlesFailed++;
            }
          }
        }

        if (batchResult?.failed?.length > 0) {
          articlesFailed += batchResult.failed.length;
        }

        if (articlesFailed > 0 && articlesImported > 0) {
          status = "partial";
        } else if (articlesImported === 0) {
          status = "error";
          errorMessage = "No articles imported";
        }

      } catch (scheduleErr) {
        console.error(`Error processing schedule ${schedule.name}:`, scheduleErr);
        status = "error";
        errorMessage = scheduleErr instanceof Error ? scheduleErr.message : "Unknown error";
      }

      const duration = Date.now() - startTime;

      // Log execution
      await supabase.from("noticias_ai_schedule_logs").insert({
        schedule_id: schedule.id,
        status,
        articles_imported: articlesImported,
        articles_failed: articlesFailed,
        duration_ms: duration,
        error_message: errorMessage,
      });

      // Update schedule
      const nextRun = new Date();
      nextRun.setMinutes(nextRun.getMinutes() + schedule.interval_minutes);

      await supabase
        .from("noticias_ai_schedules")
        .update({
          last_run: new Date().toISOString(),
          next_run: nextRun.toISOString(),
        })
        .eq("id", schedule.id);

      results.push({
        schedule: schedule.name,
        status,
        articlesImported,
        articlesFailed,
        duration,
      });

      console.log(`Completed schedule ${schedule.name}: ${articlesImported} imported, ${articlesFailed} failed`);
    }

    return new Response(
      JSON.stringify({
        message: "Scheduler run completed",
        processed: results.length,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Scheduler error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
