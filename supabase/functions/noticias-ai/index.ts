import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

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
- "conteudo": DEVE ser formatado em HTML com parágrafos <p>...</p>. Cada parágrafo deve estar dentro de tags <p>.
- "tags": DEVE ter EXATAMENTE 12 tags relevantes (não mais, não menos). Cada tag com máximo 40 caracteres.
- "imagem": DEVE ser um objeto com hero, og, card (URLs HTTPS), alt (5-140 chars) e credito

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
    "conteudo": "string (texto puro sem HTML)",
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
      "conteudo": "string (HTML com parágrafos <p>)</p>",
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

    console.log("[noticias-ai] Successfully processed request");

    return new Response(
      JSON.stringify(parsedContent),
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
