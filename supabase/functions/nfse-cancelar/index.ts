import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCancelamentoXML } from "../_shared/nfse-xml-builder.ts";
import { getPerfil, maskToken, logAuditoria } from "../_shared/nfse-helpers.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    const { perfilId, numeroNfse, motivo } = body;

    if (!numeroNfse || !motivo) {
      throw new Error("numeroNfse e motivo são obrigatórios");
    }

    // Buscar perfil
    const perfil = await getPerfil(supabase, perfilId);
    
    if (perfil.provedor !== "COTIA_GIAP") {
      throw new Error("Provedor não suportado");
    }
    if (!perfil.token) {
      throw new Error("TOKEN do perfil ausente");
    }

    console.log(`❌ Cancelando NFS-e ${numeroNfse} - Motivo: ${motivo}`);

    // Construir XML de cancelamento
    const xml = buildCancelamentoXML({
      numeroNfse,
      prestadorCnpj: perfil.prestador_cnpj,
      prestadorIM: perfil.prestador_im,
      codMunicipio: perfil.municipio_ibge,
      motivo
    });

    // Chamar API GIAP
    const url = `${perfil.endpoint}/cancela`;
    const auth = `${perfil.im}-${perfil.token}`;
    
    console.log(`🌐 Chamando GIAP: ${url}`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/xml; charset=ISO-8859-1",
        "Authorization": auth
      },
      body: xml
    });

    const retorno = await response.text();
    console.log(`📥 Retorno GIAP (${response.status}):`, retorno.slice(0, 500));

    // Atualizar nota no banco (se existir)
    const { data: notaData } = await supabase
      .from("nfse_notas")
      .select("id")
      .eq("numero_nfse", numeroNfse)
      .single();

    if (notaData && response.ok) {
      await supabase
        .from("nfse_notas")
        .update({
          situacao: "CANCELADA",
          retorno_bruto: retorno,
          atualizado_em: new Date().toISOString()
        })
        .eq("id", notaData.id);
    }

    // Log de auditoria
    await logAuditoria(supabase, {
      perfilId: perfil.id,
      notaId: notaData?.id,
      acao: "CANCELAR",
      detalhe: `NFS-e ${numeroNfse} - HTTP ${response.status} - ${motivo}`
    });

    return new Response(
      JSON.stringify({
        success: response.ok,
        numeroNfse,
        status: response.status,
        retorno
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: response.ok ? 200 : 400
      }
    );

  } catch (error: any) {
    console.error("❌ Erro ao cancelar NFS-e:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro ao cancelar NFS-e" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      }
    );
  }
});
