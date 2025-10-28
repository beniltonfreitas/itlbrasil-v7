import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RewriteRequest {
  sourceUrl: string;
  currentContent?: string;
  preserveCharacterCount?: boolean;
}

interface RewriteResponse {
  rewrittenContent: string;
  originalCharCount: number;
  rewrittenCharCount: number;
  percentageChange: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sourceUrl, currentContent = "", preserveCharacterCount = true }: RewriteRequest = await req.json();
    
    if (!sourceUrl) {
      return new Response(
        JSON.stringify({ error: "URL da fonte é obrigatória" }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Starting article rewrite for URL:', sourceUrl);

    // Fetch original content from the source URL
    let originalText = "";
    try {
      const response = await fetch(sourceUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const html = await response.text();
      
      // Extract text content from HTML (simplified approach)
      originalText = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove styles  
        .replace(/<[^>]*>/g, ' ') // Remove HTML tags
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
        
      if (!originalText || originalText.length < 100) {
        throw new Error('Conteúdo insuficiente extraído da URL');
      }
      
    } catch (error) {
      console.error('Error fetching source content:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      return new Response(
        JSON.stringify({ 
          error: `Erro ao buscar conteúdo da fonte: ${errorMessage}`,
          details: error instanceof Error ? error.stack : 'Sem detalhes'
        }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const originalCharCount = originalText.length;
    console.log('Original content extracted, char count:', originalCharCount);

    // Calculate target character count (±5% tolerance)
    const targetCharCount = Math.round(originalCharCount);
    const minCharCount = Math.round(originalCharCount * 0.95);
    const maxCharCount = Math.round(originalCharCount * 1.05);

    // Get Lovable AI key
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    // Create rewriting prompt
    const rewritePrompt = `
Você é um jornalista profissional especializado em reescrita de notícias. Sua tarefa é reescrever o conteúdo fornecido mantendo:

1. TODOS os fatos, datas, nomes e informações objetivas
2. A estrutura de notícia com lead, desenvolvimento e conclusão
3. Tom jornalístico profissional e imparcial
4. Número de caracteres entre ${minCharCount} e ${maxCharCount} (original: ${originalCharCount})

IMPORTANTE:
- NÃO invente informações
- NÃO mude fatos ou datas
- NÃO adicione opiniões pessoais
- Mantenha a essência factual da notícia
- Use linguagem clara e objetiva
- Organize em parágrafos bem estruturados

Use o formato:
- Parágrafo introdutório (lead)
- Desenvolvimento dos fatos
- Se houver seções como "Posse", "Pautas", "Perfil", mantenha-as como subtítulos

CONTEÚDO ORIGINAL:
${originalText.substring(0, 4000)} ${originalText.length > 4000 ? '...' : ''}

Reescreva este conteúdo mantendo o número de caracteres próximo ao original:`;

    // Call Lovable AI for rewriting
    console.log('Calling Lovable AI for rewriting...');
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "Você é um jornalista profissional especializado em reescrita de notícias. Mantenha sempre a precisão factual e o tom jornalístico adequado."
          },
          {
            role: "user", 
            content: rewritePrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de taxa excedido. Tente novamente em alguns momentos." }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione fundos ao seu workspace Lovable AI." }), 
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      throw new Error("Erro na API de IA");
    }

    const aiData = await aiResponse.json();
    let rewrittenContent = aiData.choices?.[0]?.message?.content;
    
    if (!rewrittenContent) {
      throw new Error("Resposta inválida da API de IA");
    }

    // Clean up the rewritten content
    rewrittenContent = rewrittenContent.trim();
    
    // Ensure it has proper structure and add WhatsApp CTA
    const whatsappCTA = `\n\n>> Siga o canal da ITL Brasil no WhatsApp\nhttps://whatsapp.com/channel/0029Vb735uVIt5rscmQ3XA0Z`;
    
    if (!rewrittenContent.includes('whatsapp.com/channel/0029Vb735uVIt5rscmQ3XA0Z')) {
      rewrittenContent += whatsappCTA;
    }

    const rewrittenCharCount = rewrittenContent.length;
    const percentageChange = ((rewrittenCharCount - originalCharCount) / originalCharCount) * 100;

    console.log('Rewrite completed:', {
      originalCharCount,
      rewrittenCharCount, 
      percentageChange: percentageChange.toFixed(1)
    });

    const response: RewriteResponse = {
      rewrittenContent,
      originalCharCount,
      rewrittenCharCount,
      percentageChange: Math.round(percentageChange * 10) / 10 // Round to 1 decimal
    };

    return new Response(
      JSON.stringify(response), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in rewrite-article function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Erro interno do servidor",
        details: error instanceof Error ? error.stack : 'Sem detalhes'
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});