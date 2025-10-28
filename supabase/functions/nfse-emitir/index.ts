import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildEnviarLoteRpsEnvio } from "../_shared/nfse-xml-builder.ts";
import { getPerfil, getNextRpsNumber, maskToken, logAuditoria } from "../_shared/nfse-helpers.ts";

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
    const {
      perfilId,
      valorServicos,
      discriminacao,
      tomador,
      simular = false
    } = body;

    // Validação básica
    if (!valorServicos || valorServicos <= 0) {
      throw new Error("Valor dos serviços inválido");
    }
    if (!discriminacao || discriminacao.length < 3) {
      throw new Error("Discriminação inválida");
    }
    if (!tomador || !tomador.documento || !tomador.razaoSocial) {
      throw new Error("Dados do tomador incompletos");
    }

    // Buscar perfil
    const perfil = await getPerfil(supabase, perfilId);
    
    if (perfil.provedor !== "COTIA_GIAP") {
      throw new Error("Provedor não suportado");
    }
    if (!perfil.token) {
      throw new Error("TOKEN do perfil ausente - configure NFSE_COTIA_TOKEN");
    }

    console.log(`📝 Emitindo NFS-e - Perfil: ${perfil.id}, Simular: ${simular}`);

    // Gerar próximo RPS
    const serie = perfil.rps_serie || "A";
    const rpsNumero = await getNextRpsNumber(supabase, perfil.id, serie);

    // Upsert cliente
    const tipo = tomador.documento.tipo === "CNPJ" ? "PJ" : "PF";
    const { data: clienteData, error: clienteError } = await supabase
      .from("clientes")
      .upsert({
        tipo,
        documento: tomador.documento.valor,
        razao_social: tomador.razaoSocial,
        email: tomador.email,
        telefone: tomador.telefone,
        logradouro: tomador.endereco.logradouro,
        numero: tomador.endereco.numero,
        bairro: tomador.endereco.bairro,
        municipio_ibge: tomador.endereco.municipioIbge,
        uf: tomador.endereco.uf,
        cep: tomador.endereco.cep
      }, { onConflict: "documento" })
      .select("id")
      .single();

    if (clienteError) {
      console.error("Erro ao salvar cliente:", clienteError);
      throw new Error("Erro ao salvar cliente");
    }

    const clienteId = clienteData.id;

    // Criar nota EM_PROCESSO
    const { data: notaData, error: notaError } = await supabase
      .from("nfse_notas")
      .insert({
        perfil_id: perfil.id,
        cliente_id: clienteId,
        rps_serie: serie,
        rps_numero: rpsNumero,
        valor_servicos: valorServicos,
        discriminacao,
        situacao: "EM_PROCESSO"
      })
      .select("id")
      .single();

    if (notaError) {
      console.error("Erro ao criar nota:", notaError);
      throw new Error("Erro ao criar nota");
    }

    const notaId = notaData.id;

    // Construir XML
    const dataISO = new Date().toISOString().slice(0, 19);
    const xml = buildEnviarLoteRpsEnvio({
      loteNumero: rpsNumero,
      prestadorCnpj: perfil.prestador_cnpj,
      prestadorIM: perfil.prestador_im,
      rpsNumero,
      rpsSerie: serie,
      rpsDataEmissao: dataISO,
      naturezaOperacao: perfil.natureza,
      optanteSimplesNacional: perfil.optante_simples,
      incentivadorCultural: perfil.incentivador,
      issRetido: perfil.iss_retido,
      itemListaServico: perfil.item_lista,
      aliquota: perfil.aliquota,
      discriminacao,
      municipioPrestacao: perfil.municipio_ibge,
      valorServicos,
      tomadorCnpjCpf: tomador.documento.valor,
      tomadorRazaoSocial: tomador.razaoSocial,
      tomadorEmail: tomador.email,
      tomadorTelefone: tomador.telefone,
      tomadorEndereco: tomador.endereco?.logradouro,
      tomadorNumero: tomador.endereco?.numero,
      tomadorBairro: tomador.endereco?.bairro,
      tomadorCodigoMunicipio: tomador.endereco?.municipioIbge,
      tomadorUF: tomador.endereco?.uf,
      tomadorCEP: tomador.endereco?.cep
    });

    // Chamar API GIAP
    const url = `${perfil.endpoint}/emissao${simular ? "/simula" : ""}`;
    const auth = `${perfil.im}-${perfil.token}`;
    
    console.log(`🌐 Chamando GIAP: ${url}`);
    console.log(`🔑 Auth: ${perfil.im}-${maskToken(perfil.token)}`);

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

    // Atualizar nota
    const situacao = simular ? "SIMULADA" : (response.ok ? "EMITIDA" : "FALHA");
    await supabase
      .from("nfse_notas")
      .update({
        situacao,
        retorno_bruto: retorno,
        atualizado_em: new Date().toISOString()
      })
      .eq("id", notaId);

    // Log de auditoria
    await logAuditoria(supabase, {
      perfilId: perfil.id,
      notaId,
      acao: simular ? "SIMULAR" : "EMITIR",
      detalhe: `HTTP ${response.status} - ${response.statusText}`
    });

    return new Response(
      JSON.stringify({
        success: response.ok,
        notaId,
        rpsSerie: serie,
        rpsNumero,
        status: response.status,
        xmlEnviado: xml,
        retorno,
        situacao
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: response.ok ? 200 : 400
      }
    );

  } catch (error: any) {
    console.error("❌ Erro ao emitir NFS-e:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro ao emitir NFS-e" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      }
    );
  }
});
