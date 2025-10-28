import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface Perfil {
  id: string;
  provedor: string;
  endpoint: string;
  im: string;
  token: string | null;
  prestador_cnpj: string;
  prestador_im: string;
  item_lista: number;
  aliquota: number;
  municipio_ibge: number;
  natureza: number;
  optante_simples: number;
  iss_retido: number;
  incentivador: number;
  rps_serie: string;
}

/**
 * Busca perfil de emissão (primeiro Cotia/SP ativo se perfilId não informado)
 */
export async function getPerfil(
  supabase: SupabaseClient,
  perfilId?: string
): Promise<Perfil> {
  let query = supabase.from("nfse_perfis").select("*");
  
  if (perfilId) {
    query = query.eq("id", perfilId);
  } else {
    query = query.eq("provedor", "COTIA_GIAP").eq("ativo", true).limit(1);
  }
  
  const { data, error } = await query.single();
  
  if (error || !data) {
    throw new Error("Perfil NFS-e não encontrado");
  }
  
  // Token pode vir do banco ou do env
  const token = data.token || Deno.env.get("NFSE_COTIA_TOKEN") || null;
  
  return {
    id: data.id,
    provedor: data.provedor,
    endpoint: data.endpoint,
    im: data.im,
    token,
    prestador_cnpj: data.prestador_cnpj,
    prestador_im: data.prestador_im,
    item_lista: Number(data.item_lista),
    aliquota: Number(data.aliquota),
    municipio_ibge: Number(data.municipio_ibge),
    natureza: Number(data.natureza),
    optante_simples: Number(data.optante_simples),
    iss_retido: Number(data.iss_retido),
    incentivador: Number(data.incentivador),
    rps_serie: data.rps_serie
  };
}

/**
 * Gera próximo número RPS com lock otimista
 */
export async function getNextRpsNumber(
  supabase: SupabaseClient,
  perfilId: string,
  serie: string
): Promise<number> {
  // Buscar sequência atual
  const { data, error } = await supabase
    .from("nfse_rps_sequencia")
    .select("proximo_numero")
    .eq("perfil_id", perfilId)
    .eq("serie", serie)
    .single();
  
  if (error || !data) {
    // Criar sequência se não existir
    const { data: newSeq, error: insertError } = await supabase
      .from("nfse_rps_sequencia")
      .insert({ perfil_id: perfilId, serie, proximo_numero: 2 })
      .select("proximo_numero")
      .single();
    
    if (insertError) throw new Error("Erro ao criar sequência RPS");
    return 1;
  }
  
  const numero = Number(data.proximo_numero);
  
  // Incrementar
  const { error: updateError } = await supabase
    .from("nfse_rps_sequencia")
    .update({ proximo_numero: numero + 1 })
    .eq("perfil_id", perfilId)
    .eq("serie", serie);
  
  if (updateError) throw new Error("Erro ao incrementar sequência RPS");
  
  return numero;
}

/**
 * Mascara token para logs (segurança)
 */
export function maskToken(token?: string | null): string {
  if (!token) return "";
  if (token.length <= 8) return "****";
  return token.slice(0, 4) + "****" + token.slice(-4);
}

/**
 * Registra log de auditoria
 */
export async function logAuditoria(
  supabase: SupabaseClient,
  opts: {
    perfilId: string;
    notaId?: string;
    acao: string;
    detalhe?: string;
    ip?: string;
    userId?: string;
  }
) {
  await supabase.from("nfse_logs").insert({
    perfil_id: opts.perfilId,
    nota_id: opts.notaId || null,
    acao: opts.acao,
    detalhe: opts.detalhe || null,
    ip: opts.ip || null,
    user_id: opts.userId || null
  });
}
