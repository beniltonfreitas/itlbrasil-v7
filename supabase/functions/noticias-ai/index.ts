import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const DEFAULT_FONTE_URL = "https://itlbrasil.com";
const VALID_CATEGORIES = [
  "Últimas Notícias",
  "Justiça",
  "Política",
  "Economia",
  "Educação",
  "Internacional",
  "Meio Ambiente",
  "Direitos Humanos",
  "Cultura",
  "Esportes",
  "Saúde",
  "Geral",
] as const;

type ValidCategory = (typeof VALID_CATEGORIES)[number];

const stripDiacritics = (value: string) =>
  value.normalize("NFD").replace(/\p{Diacritic}/gu, "");

const toKebabCase = (value: string) => {
  const base = stripDiacritics(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
  return base;
};

const truncate = (value: string, max: number) => {
  const text = String(value ?? "").trim();
  if (text.length <= max) return text;
  if (max <= 1) return text.slice(0, max);
  return text.slice(0, max - 1).trimEnd() + "…";
};

const isHttpsUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
};

const escapeHtml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const ensureHtmlParagraphs = (content: string) => {
  const c = String(content ?? "").trim();
  if (!c) return "";

  // If it already looks like HTML, keep it.
  if (/<\/?(p|h2|h3|blockquote|ul|ol|li|strong|em|br)\b/i.test(c)) return c;

  // Otherwise, wrap plain-text paragraphs.
  const paragraphs = c
    .split(/\n{2,}|\r\n{2,}/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  return paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
};

const normalizeTags = (tags: unknown, title: string, category: string) => {
  const raw = Array.isArray(tags)
    ? tags
    : typeof tags === "string"
      ? tags.split(",")
      : [];

  const cleaned = raw
    .map((t) => String(t ?? "").trim())
    .filter(Boolean)
    .map((t) => truncate(t, 40));

  const unique: string[] = [];
  for (const t of cleaned) if (!unique.includes(t)) unique.push(t);

  const fallback = [
    category,
    "ITL Brasil",
    "Notícias",
    "Brasil",
    "Atualidades",
    "Jornalismo",
    "Política",
    "Economia",
    "Sociedade",
    "Serviço público",
    "Educação",
    "Governo",
  ].map((t) => truncate(t, 40));

  for (const t of fallback) {
    if (unique.length >= 12) break;
    if (!unique.includes(t)) unique.push(t);
  }

  while (unique.length < 12) unique.push(truncate(`Tag ${unique.length + 1}`, 40));

  return unique.slice(0, 12);
};

type ImageObj = { hero: string; og: string; card: string; alt: string; credito: string };

const normalizeImage = (image: unknown, fallbackTitle: string, fallbackCredit?: string): ImageObj => {
  const defaultAlt = truncate(fallbackTitle || "Imagem da notícia", 140);
  const defaultCredit = String(fallbackCredit ?? "ITL Brasil").trim() || "ITL Brasil";

  if (typeof image === "string") {
    const url = image.trim();
    const safeUrl = isHttpsUrl(url) ? url : "";
    return {
      hero: safeUrl,
      og: safeUrl,
      card: safeUrl,
      alt: defaultAlt.length >= 5 ? defaultAlt : "Imagem da notícia",
      credito: defaultCredit.length >= 2 ? defaultCredit : "ITL Brasil",
    };
  }

  if (image && typeof image === "object") {
    const obj = image as Record<string, unknown>;
    const hero = String(obj.hero ?? "").trim();
    const og = String(obj.og ?? hero).trim();
    const card = String(obj.card ?? hero).trim();
    const alt = truncate(String(obj.alt ?? defaultAlt), 140);
    const credito = String(obj.credito ?? fallbackCredit ?? defaultCredit).trim();

    return {
      hero: isHttpsUrl(hero) ? hero : "",
      og: isHttpsUrl(og) ? og : "",
      card: isHttpsUrl(card) ? card : "",
      alt: alt.length >= 5 ? alt : defaultAlt,
      credito: credito.length >= 2 ? credito : defaultCredit,
    };
  }

  return {
    hero: "",
    og: "",
    card: "",
    alt: defaultAlt.length >= 5 ? defaultAlt : "Imagem da notícia",
    credito: defaultCredit.length >= 2 ? defaultCredit : "ITL Brasil",
  };
};

const normalizeCategory = (value: unknown): ValidCategory => {
  const text = String(value ?? "").trim();
  if ((VALID_CATEGORIES as readonly string[]).includes(text)) return text as ValidCategory;
  return "Geral";
};

const normalizeNoticia = (noticia: any) => {
  const titulo = truncate(String(noticia?.titulo ?? ""), 120) || "(Sem título)";
  const categoria = normalizeCategory(noticia?.categoria);
  const slug = toKebabCase(String(noticia?.slug ?? titulo)) || toKebabCase(titulo) || "noticia";
  const resumo = truncate(String(noticia?.resumo ?? ""), 160);
  const conteudo = ensureHtmlParagraphs(String(noticia?.conteudo ?? ""));

  const fonteRaw = String(noticia?.fonte ?? "").trim();
  const fonte = isHttpsUrl(fonteRaw) ? fonteRaw : DEFAULT_FONTE_URL;

  const seoMetaTitulo = truncate(String(noticia?.seo?.meta_titulo ?? titulo), 60);
  const seoMetaDescricao = truncate(
    String(noticia?.seo?.meta_descricao ?? (resumo || "")),
    160,
  );

  const tags = normalizeTags(noticia?.tags, titulo, categoria);

  const imagem = normalizeImage(
    noticia?.imagem,
    titulo,
    noticia?.imagem_credito ?? noticia?.credito ?? noticia?.imagem?.credito,
  );

  // Preserve optional flags/fields if present
  const featured = typeof noticia?.featured === "boolean" ? noticia.featured : undefined;
  const imagens_adicionais = Array.isArray(noticia?.imagens_adicionais)
    ? noticia.imagens_adicionais
        .map((u: any) => String(u ?? "").trim())
        .filter((u: string) => u && (u.startsWith("http://") || u.startsWith("https://")))
        .slice(0, 10)
    : undefined;

  return {
    categoria,
    titulo,
    slug,
    resumo,
    conteudo,
    fonte,
    imagem,
    ...(imagens_adicionais && imagens_adicionais.length ? { imagens_adicionais } : {}),
    ...(featured !== undefined ? { featured } : {}),
    tags,
    seo: {
      meta_titulo: seoMetaTitulo,
      meta_descricao: seoMetaDescricao,
    },
  };
};

const normalizeOutputForImport = (payload: any, inputType: string) => {
  const out = payload && typeof payload === "object" ? { ...payload } : {};

  // Enforce output shape according to requested mode.
  if (inputType === "CADASTRO_MANUAL") {
    out.json = null;
  }
  if (inputType === "JSON" || inputType === "LINK") {
    out.cadastroManual = null;
  }

  if (out?.json?.noticias && Array.isArray(out.json.noticias)) {
    out.json = {
      noticias: out.json.noticias.map((n: any) => normalizeNoticia(n)),
    };
  }

  return out;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { input, inputType } = await req.json();

    if (!input) {
      return new Response(
        JSON.stringify({ error: "Input é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    // Build system prompt based on input type
    let systemPrompt = `Você é um editor de notícias profissional do ITL Brasil. Sua tarefa é processar conteúdo de notícias e gerar saídas formatadas.

REGRAS GERAIS:
- Resumo: máximo 160 caracteres
- Meta Título: máximo 60 caracteres  
- Meta Descrição: máximo 160 caracteres
- Slug: formato kebab-case sem acentos (apenas letras minúsculas, números e hífens)
- Categoria: DEVE ser exatamente uma das seguintes: "Últimas Notícias", "Justiça", "Política", "Economia", "Educação", "Internacional", "Meio Ambiente", "Direitos Humanos", "Cultura", "Esportes", "Saúde", "Geral"

IMPORTANTE PARA O JSON (formato Importar em Massa):
- "fonte": DEVE ser uma URL válida começando com https:// (ex: "https://agenciabrasil.ebc.com.br/...")
  Se não houver URL de fonte, use: "https://itlbrasil.com"
- "conteudo": DEVE ser formatado em HTML seguindo o PADRÃO AGÊNCIA BRASIL abaixo
- "tags": DEVE ter EXATAMENTE 12 tags relevantes (não mais, não menos). Cada tag com máximo 40 caracteres.
- "imagem": DEVE ser um objeto com hero, og, card (URLs HTTPS), alt (5-140 chars) e credito

FORMATAÇÃO DE CONTEÚDO HTML (PADRÃO AGÊNCIA BRASIL):

1. PRIMEIRO PARÁGRAFO (LIDE) - OBRIGATÓRIO:
   - SEMPRE em negrito: <p><strong>Primeiro parágrafo com o lide completo...</strong></p>
   - Deve responder: Quem? O quê? Quando? Onde?
   - Máximo 3-4 linhas

2. DESTAQUES NO TEXTO:
   - Use <strong> para informações-chave importantes em parágrafos normais
   - Exemplo: <p><strong>Não há surto de sarampo no país.</strong> A situação está controlada.</p>

3. CITAÇÕES/FALAS DE FONTES:
   - Use <blockquote> para declarações de fontes oficiais ou entrevistados
   - Exemplo: <blockquote>"Declaração da autoridade ou entrevistado aqui..."</blockquote>
   - Sempre identifique a fonte após a citação

4. LISTAS DE ORIENTAÇÕES/RECOMENDAÇÕES:
   - Use <ul><li> para listas, recomendações ou itens enumerados
   - Exemplo: <ul><li>Primeira orientação</li><li>Segunda orientação</li></ul>

5. INTERTÍTULOS (para textos longos):
   - Use <h2> para separar seções temáticas em matérias extensas
   - Exemplo: <h2>Próximos passos</h2>

6. DATAS CONTEXTUALIZADAS:
   - Use referências claras como "neste sábado (27)", "próxima terça-feira (30)", "ontem (26)"
   - Evite datas absolutas sem contexto

7. PARÁGRAFOS:
   - Curtos (2-4 linhas cada)
   - Linguagem objetiva e factual
   - Cada parágrafo em <p>...</p>

8. ESTRUTURA RECOMENDADA DO CONTEÚDO:
   <p><strong>Lide em negrito respondendo quem, o quê, quando, onde...</strong></p>
   <p>Desenvolvimento com mais detalhes...</p>
   <blockquote>"Citação de fonte oficial se houver..."</blockquote>
   <p>Contexto adicional...</p>
   <h2>Intertítulo se necessário</h2>
   <ul><li>Lista se aplicável</li></ul>
   <p>Conclusão ou próximos passos...</p>

FORMATO DE RESPOSTA JSON:
{
  "cadastroManual": {
    "titulo": "string",
    "slug": "string",
    "resumo": "string (max 160 chars)",
    "categoria": "string (uma das categorias válidas)",
    "fonte": "string (nome da fonte)",
    "imagens": {
      "hero": "URL ou descrição",
      "og": "URL ou descrição", 
      "card": "URL ou descrição"
    },
    "textoAlternativo": "string",
    "creditoImagem": "string",
    "conteudo": "string (HTML formatado conforme padrão acima)",
    "galeriaImagens": ["URL1", "URL2"],
    "seo": {
      "metaTitulo": "string (max 60 chars)",
      "metaDescricao": "string (max 160 chars)"
    }
  },
  "json": {
    "noticias": [{
      "categoria": "string (DEVE ser uma das categorias válidas: Últimas Notícias, Justiça, Política, Economia, Educação, Internacional, Meio Ambiente, Direitos Humanos, Cultura, Esportes, Saúde, Geral)",
      "titulo": "string (6-120 chars)",
      "slug": "string (kebab-case, letras minúsculas, números e hífens)",
      "resumo": "string (max 160 chars)",
      "conteudo": "string (HTML formatado conforme PADRÃO AGÊNCIA BRASIL acima)",
      "fonte": "URL HTTPS válida (ex: https://agenciabrasil.ebc.com.br/...)",
      "imagem": {
        "hero": "URL HTTPS da imagem principal",
        "og": "URL HTTPS para compartilhamento",
        "card": "URL HTTPS para cards",
        "alt": "texto alternativo (5-140 chars)",
        "credito": "crédito da imagem"
      },
      "tags": ["EXATAMENTE 12 tags relevantes"],
      "seo": {
        "meta_titulo": "string (max 60 chars)",
        "meta_descricao": "string (max 160 chars)"
      }
    }]
  }
}`;

    let userPrompt = "";

    switch (inputType) {
      case "EXCLUSIVA":
        systemPrompt += `

REGRA ESPECIAL - EXCLUSIVA:
- NÃO altere NENHUMA palavra do conteúdo original
- Mantenha o texto exatamente como foi enviado
- Gere AMBAS as saídas: cadastroManual E json`;
        userPrompt = `Processe esta notícia EXCLUSIVA (NÃO altere o conteúdo):\n\n${input.replace(/^EXCLUSIVA\s*/i, "")}`;
        break;

      case "CADASTRO_MANUAL":
        systemPrompt += `

REGRA ESPECIAL - CADASTRO MANUAL:
- Gere APENAS o cadastroManual
- Defina json como null
- Organize os dados no formato do painel administrativo`;
        userPrompt = `Processe esta notícia para CADASTRO MANUAL:\n\n${input.replace(/^CADASTRO MANUAL\s*/i, "")}`;
        break;

      case "JSON":
      case "LINK":
        systemPrompt += `

REGRA ESPECIAL - JSON/LINK:
- Gere APENAS o json no formato Repórter Pró
- Defina cadastroManual como null
- Se for um link, extraia e processe o conteúdo`;
        userPrompt = inputType === "LINK" 
          ? `Extraia e processe a notícia deste link para JSON:\n\n${input}`
          : `Processe esta notícia para JSON:\n\n${input.replace(/^JSON\s*/i, "")}`;
        break;

      default:
        userPrompt = `Processe esta notícia e gere ambas as saídas (cadastroManual e json):\n\n${input}`;
    }

    console.log(`[noticias-ai] Processing ${inputType} request`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[noticias-ai] AI Gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Entre em contato com o administrador." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Resposta vazia da IA");
    }

    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (parseError) {
      console.error("[noticias-ai] JSON parse error:", parseError);
      throw new Error("Erro ao interpretar resposta da IA");
    }

    // Normalize output to match "Importar em Massa" format
    const normalizedOutput = normalizeOutputForImport(parsedContent, inputType);

    console.log("[noticias-ai] Successfully processed request");

    return new Response(
      JSON.stringify(normalizedOutput),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[noticias-ai] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
