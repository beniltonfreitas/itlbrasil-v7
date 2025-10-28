import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Category keywords mapping for intelligent detection
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Política": ["governo", "presidente", "ministro", "senado", "câmara", "congresso", "eleição", "partido", "político", "deputado", "prefeito", "governador"],
  "Justiça": ["tribunal", "juiz", "processo", "sentença", "crime", "polícia", "investigação", "prisão", "advogado", "promotor", "julgamento"],
  "Economia": ["mercado", "dólar", "inflação", "juros", "investimento", "banco", "empresa", "negócio", "bolsa", "pib", "econômico"],
  "Educação": ["escola", "universidade", "professor", "aluno", "ensino", "educação", "estudante", "curso"],
  "Internacional": ["país", "mundo", "exterior", "estrangeiro", "diplomacia", "global", "internacional"],
  "Meio Ambiente": ["ambiental", "clima", "natureza", "floresta", "poluição", "sustentável", "ecologia"],
  "Direitos Humanos": ["direitos", "igualdade", "discriminação", "liberdade", "cidadania", "inclusão"],
  "Cultura": ["arte", "música", "cinema", "teatro", "festival", "show", "cultural", "artista"],
  "Esportes": ["futebol", "jogo", "atleta", "campeonato", "time", "esporte", "olimpíada"],
  "Saúde": ["hospital", "médico", "doença", "tratamento", "vacina", "saúde", "paciente", "sus"]
};

// Similar category aliases
const CATEGORY_ALIASES: Record<string, string> = {
  "tecnologia": "Geral",
  "ciência": "Geral",
  "segurança": "Justiça",
  "governo": "Política",
  "negócios": "Economia",
  "finanças": "Economia",
  "entretenimento": "Cultura",
  "clima": "Meio Ambiente",
  "mundial": "Internacional"
};

// Intelligent category mapping function
const mapCategoryByContext = (category: string, title: string, content: string): string => {
  const validCategories = [
    "Últimas Notícias", "Justiça", "Política", "Economia", "Educação",
    "Internacional", "Meio Ambiente", "Direitos Humanos", "Cultura",
    "Esportes", "Saúde", "Geral"
  ];
  
  // Already valid
  if (validCategories.includes(category)) {
    return category;
  }
  
  // Check aliases
  const categoryLower = category.toLowerCase();
  for (const [alias, official] of Object.entries(CATEGORY_ALIASES)) {
    if (categoryLower.includes(alias)) {
      console.log(`Alias match: "${category}" → "${official}"`);
      return official;
    }
  }
  
  // Analyze content
  const fullText = `${title} ${content}`.toLowerCase();
  const scores: Record<string, number> = {};
  
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    scores[cat] = 0;
    for (const keyword of keywords) {
      if (fullText.includes(keyword)) {
        scores[cat]++;
      }
    }
  }
  
  // Find best match
  const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (sortedScores[0] && sortedScores[0][1] > 0) {
    console.log(`Content analysis: "${category}" → "${sortedScores[0][0]}" (score: ${sortedScores[0][1]})`);
    return sortedScores[0][0];
  }
  
  console.log(`No match for "${category}", defaulting to "Geral"`);
  return "Geral";
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { urls } = await req.json();

    if (!Array.isArray(urls) || urls.length === 0) {
      throw new Error('URLs inválidas');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    const noticias = [];

    for (const url of urls) {
      try {
        // Fetch content from URL
        console.log(`Fetching content from: ${url}`);
        const contentResponse = await fetch(url);
        
        if (!contentResponse.ok) {
          console.error(`Failed to fetch ${url}: ${contentResponse.status}`);
          continue;
        }

        const htmlContent = await contentResponse.text();
        
        // Extract basic content (simplified)
        const textContent = htmlContent
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 8000); // Limit content size

// Call Lovable AI with Jornalista Pró prompt
const systemPrompt = `Você é o Jornalista Pró, especialista em reescrita e formatação de notícias para o portal ITL Brasil.

CRITICAL: Você DEVE retornar APENAS um objeto JSON válido, sem nenhum texto adicional antes ou depois.

O JSON DEVE começar exatamente com { e terminar com }

Estrutura OBRIGATÓRIA (copie exatamente esta estrutura):

{
  "noticias": [
    {
      "categoria": "string",
      "titulo": "string",
      "slug": "string",
      "resumo": "string",
      "conteudo": "string",
      "fonte": "string",
      "imagem": "string (URL completa ou vazia)",
      "alt": "string (texto alternativo para acessibilidade, 10-140 caracteres)",
      "credito": "string (crédito da foto ou vazio)",
      "galeria": ["string (URL)", "string (URL)", ...],
      "legenda": "string (legenda da galeria)",
      "fonte_imagem": "string (fonte da imagem, ex: 'Agência Brasil / Polícia')",
      "tags": "string (separadas por vírgula: 'tag1, tag2, tag3, ...')",
      "featured": true,
      "seo": {
        "meta_titulo": "string",
        "meta_descricao": "string",
        "meta_keywords": "string (palavras-chave separadas por vírgula)"
      }
    }
  ]
}

REGRAS CRÍTICAS DE FORMATAÇÃO:
- Use APENAS aspas duplas (") para strings JSON
- NÃO use aspas curvas (" " ' ')
- SEMPRE adicione vírgula entre propriedades
- NÃO adicione vírgula após a última propriedade
- SEMPRE feche todas as chaves e colchetes
- NÃO quebre strings no meio - mantenha tudo em uma linha

CAMPOS OBRIGATÓRIOS:
- categoria: ESCOLHA UMA categoria oficial da lista abaixo baseado no CONTEXTO da notícia
- titulo: Título impactante (MÁXIMO 120 caracteres)
- slug: URL-friendly (lowercase, hífens, sem acentos)
- resumo: Resumo direto (MÁXIMO 160 caracteres)
- conteudo: Texto completo reescrito em HTML semântico (MÍNIMO 10 caracteres)

LISTA OFICIAL DE CATEGORIAS (escolha APENAS uma destas):
1. "Política" - Use para: governo, presidente, ministros, senado, câmara, congresso, eleições, partidos políticos, legislação
2. "Justiça" - Use para: tribunais, juízes, processos, sentenças, crimes, polícia, investigações, prisões
3. "Economia" - Use para: mercado, dólar, inflação, juros, investimentos, bancos, empresas, negócios, bolsa de valores
4. "Educação" - Use para: escolas, universidades, professores, alunos, ensino, cursos
5. "Internacional" - Use para: outros países, relações diplomáticas, eventos globais, exterior
6. "Meio Ambiente" - Use para: clima, natureza, florestas, poluição, sustentabilidade, ecologia
7. "Direitos Humanos" - Use para: igualdade, discriminação, liberdade, cidadania, inclusão
8. "Cultura" - Use para: arte, música, cinema, teatro, festivais, literatura
9. "Esportes" - Use para: futebol, atletas, campeonatos, times, olimpíadas, competições
10. "Saúde" - Use para: hospitais, médicos, doenças, tratamentos, vacinas, SUS
11. "Últimas Notícias" - Use para: notícias urgentes e de última hora
12. "Geral" - Use APENAS quando a notícia não se encaixa em nenhuma categoria acima

INSTRUÇÕES PARA CATEGORIA:
- Analise o TÍTULO e CONTEÚDO da notícia
- Identifique palavras-chave relacionadas às categorias
- Escolha a categoria MAIS ESPECÍFICA possível
- Use "Geral" apenas como ÚLTIMO RECURSO
- NUNCA invente categorias novas

IMPORTANTE - FORMATO DE SAÍDA OBRIGATÓRIO:

1. CONTEÚDO:
   - "conteudo": DEVE ser uma STRING HTML contínua, NÃO um array
   - Exemplo CORRETO: "<p>Parágrafo 1</p><h2>Título</h2><p>Parágrafo 2</p>"
   - Exemplo ERRADO: ["Parágrafo 1", "Parágrafo 2"]

2. IMAGENS:
   - "imagem": STRING com URL da foto principal (NÃO objeto!)
     * Exemplo CORRETO: "https://exemplo.com/foto.jpg"
     * Exemplo ERRADO: {"url": "...", "credito": "..."}
   - "alt": STRING com descrição acessível (OBRIGATÓRIO, 10-140 caracteres)
     * Exemplo: "Presidente discursa na ONU durante assembleia geral"
     * Use contexto da notícia para criar descrição objetiva e clara
   - "credito": STRING com crédito (OBRIGATÓRIO)
     * Formato: "© Autor / Agência" ou "Foto: Divulgação/Fonte"
     * Se não houver crédito, use: "© Imagem / Divulgação"
     * NUNCA deixe vazio
   - "galeria": ARRAY de strings (URLs), máximo 10
     * A primeira imagem da galeria DEVE ser a mesma de "imagem"
     * Exemplo CORRETO: ["https://url1.jpg", "https://url2.jpg"]
     * NUNCA use objetos: [{"url": "..."}] ❌
   - "legenda": STRING com legenda da galeria (OBRIGATÓRIO)
     * Exemplo: "Projetos de restauração florestal no Brasil"
   - "fonte_imagem": STRING com fonte da imagem (OBRIGATÓRIO)
     * Formato: "Agência Brasil / Polícia Civil-SP"
     * Se não souber, use: "Reprodução"

3. WHATSAPP:
   - NÃO inclua menções ao WhatsApp no conteúdo (será adicionado automaticamente)
   - NÃO adicione links do WhatsApp no texto

4. TAGS:
   - EXATAMENTE 12 tags relevantes
   - Formato: STRING separada por vírgulas: "tag1, tag2, tag3, tag4, tag5, tag6, tag7, tag8, tag9, tag10, tag11, tag12"
   - NUNCA use array: ["tag1", "tag2"] ❌
   - Cada tag: máximo 40 caracteres
   - Misture tags específicas (pessoas, lugares) com gerais (temas)
   - Exemplo CORRETO: "educação, OCDE, Brasil, professores, IA, ensino, digital, tecnologia, futuro, inovação, política educacional, reforma"

CAMPOS OBRIGATÓRIOS ADICIONAIS:
- fonte: URL da notícia original (obrigatório)
- seo.meta_titulo: Título SEO (MÁXIMO 80 caracteres, ideal: 60-70)
- seo.meta_descricao: Descrição SEO (MÁXIMO 160 caracteres)
- seo.meta_keywords: Palavras-chave SEO (5-8 palavras separadas por vírgula)

LIMITES DE CARACTERES CRÍTICOS:
- titulo: MÁXIMO 120 caracteres
- resumo: MÁXIMO 160 caracteres
- meta_titulo: MÁXIMO 80 caracteres (ideal: 60-70)
- meta_descricao: MÁXIMO 160 caracteres
- cada tag: MÁXIMO 40 caracteres (NÃO 20!)
- conteudo: MÍNIMO 10 caracteres
- tags: EXATAMENTE 12 itens no array

FORMATAÇÃO HTML SEMÂNTICA OBRIGATÓRIA DO CONTEÚDO:
- Use <h2>Título da Seção</h2> para seções principais
- Use <h3>Subtítulo</h3> para subseções
- Use <p>Texto do parágrafo.</p> para cada parágrafo (3-5 linhas cada)
- Use <blockquote>"Citação importante do entrevistado"</blockquote> para citações diretas
- Use <strong>texto</strong> para destaques importantes
- Use <ul><li>item</li></ul> para listas quando apropriado
- SEMPRE feche todas as tags HTML corretamente
- Adicione 2-3 quebras de linha (<br><br>) entre seções principais para espaçamento

Diretrizes de reescrita:
- Reescreva COMPLETAMENTE o conteúdo mantendo apenas os fatos
- Use linguagem jornalística profissional brasileira
- Estruture com parágrafos curtos (3-5 linhas) sempre dentro de tags <p>
- Inicie cada seção importante com <h2>
- Use citações em <blockquote> quando houver falas importantes
- Mantenha neutralidade e imparcialidade
- Verifique ortografia e gramática
- Formate números: use pontos para milhares (1.000)
- Formate datas: use formato brasileiro (30/09/2025)
- RESPEITE RIGOROSAMENTE TODOS OS LIMITES DE CARACTERES
- Sempre inclua o campo "fonte" com a URL original da notícia

REGRAS ESPECIAIS:
- ARTIGO EM DESTAQUE: A primeira notícia de cada importação deve incluir "featured": true
- Notícias da categoria "Últimas Notícias" sempre têm "featured": true
- Sempre marque o artigo como "publicado" (nunca rascunho)
- Notícias serão enviadas automaticamente ao canal WhatsApp após importação

FORMATO DE SAÍDA:
- Retorne APENAS o JSON válido
- NÃO adicione texto antes ou depois do JSON
- NÃO use markdown (sem \`\`\`json)
- Certifique-se de que o JSON está dentro de { "noticias": [...] }
- Inclua "imagem_alt" e "featured" nos campos obrigatórios

IMPORTANTE: O JSON deve começar com { "noticias": [ e terminar com ] }`;

        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `URL: ${url}\n\nConteúdo:\n${textContent}` }
            ],
          }),
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error(`AI API error for ${url}:`, aiResponse.status, errorText);
          continue;
        }

        const aiData = await aiResponse.json();
        const content = aiData.choices?.[0]?.message?.content;

        if (!content) {
          console.error(`No content received from AI for ${url}`);
          continue;
        }

        // Extract JSON from response (handle markdown code blocks)
        let jsonContent = content.trim();
        if (jsonContent.startsWith('```json')) {
          jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (jsonContent.startsWith('```')) {
          jsonContent = jsonContent.replace(/```\n?/g, '');
        }

        // Sanitize JSON before parsing
        const sanitizeJSON = (text: string): string => {
          // Remove BOM and invisible characters
          let cleaned = text.replace(/^\uFEFF/, '').trim();
          
          // Fix common issues with quotes
          cleaned = cleaned.replace(/[""]/g, '"').replace(/['']/g, "'");
          
          // Remove trailing commas before } or ]
          cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
          
          // Ensure proper structure wrapping if missing
          if (!cleaned.startsWith('{')) {
            cleaned = '{"noticias": [' + cleaned + ']}';
          }
          
          return cleaned;
        };

        console.log('Raw AI response:', jsonContent.substring(0, 500));
        
        let parsedNews;
        try {
          // First attempt: direct parse
          parsedNews = JSON.parse(jsonContent);
        } catch (firstError) {
          console.log('First parse failed, trying sanitization...');
          try {
            // Second attempt: with sanitization
            const sanitized = sanitizeJSON(jsonContent);
            console.log('Sanitized JSON:', sanitized.substring(0, 500));
            parsedNews = JSON.parse(sanitized);
          } catch (secondError) {
            console.error('Both parse attempts failed for URL:', url);
            console.error('First error:', firstError);
            console.error('Second error:', secondError);
            console.error('Content sample:', jsonContent.substring(0, 1000));
            continue;
          }
        }
        
        // Ensure the response has the "noticias" array
        if (!parsedNews.noticias) {
          console.error('AI response missing "noticias" array');
          continue;
        }
        
        // Auto-correct and ensure all fields are normalized
        console.log('Processing news items count:', parsedNews.noticias?.length);
        
        const validCategories = [
          "Últimas Notícias", "Justiça", "Política", "Economia", "Educação",
          "Internacional", "Meio Ambiente", "Direitos Humanos", "Cultura",
          "Esportes", "Saúde", "Geral"
        ];
        
        parsedNews.noticias = parsedNews.noticias.map((noticia: any) => {
          const corrected = { ...noticia };
          
          // Intelligent category mapping with context analysis
          if (!corrected.categoria || !validCategories.includes(corrected.categoria)) {
            const originalCategory = corrected.categoria || "undefined";
            console.log(`Invalid/missing category "${originalCategory}" for "${corrected.titulo}"`);
            
            // Try to map based on content
            corrected.categoria = mapCategoryByContext(
              originalCategory,
              corrected.titulo || "",
              corrected.conteudo || ""
            );
            
            console.log(`Mapped "${originalCategory}" → "${corrected.categoria}" using context analysis`);
          }
          
          // Truncate fields as safeguard
          if (corrected.titulo && corrected.titulo.length > 120) {
            corrected.titulo = corrected.titulo.substring(0, 117) + '...';
          }
          if (corrected.resumo && corrected.resumo.length > 160) {
            corrected.resumo = corrected.resumo.substring(0, 157) + '...';
          }
          if (corrected.seo?.meta_titulo && corrected.seo.meta_titulo.length > 80) {
            corrected.seo.meta_titulo = corrected.seo.meta_titulo.substring(0, 77) + '...';
          }
          if (corrected.seo?.meta_descricao && corrected.seo.meta_descricao.length > 160) {
            corrected.seo.meta_descricao = corrected.seo.meta_descricao.substring(0, 157) + '...';
          }
          
          // Generate meta_keywords if missing
          if (!corrected.seo) {
            corrected.seo = {};
          }
          if (!corrected.seo.meta_keywords) {
            const tagsArray = corrected.tags.split(',').map((t: string) => t.trim()).filter(Boolean).slice(0, 8);
            corrected.seo.meta_keywords = tagsArray.join(', ');
            console.log(`✅ Generated meta_keywords: ${corrected.seo.meta_keywords}`);
          }
          
          // Validar tags (deve ser string)
          if (Array.isArray(corrected.tags)) {
            console.log('⚠️ Tags recebidas como array, convertendo para string');
            corrected.tags = corrected.tags.join(', ');
          }

          if (typeof corrected.tags !== 'string') {
            console.error('❌ Tags não é string:', typeof corrected.tags);
            corrected.tags = '';
          }

          // Se vazio ou com poucas tags, completar
          const tagsArray = corrected.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
          const genericTags = ['Brasil', 'notícias', 'atualidades', 'informação', 'jornalismo', 'política', 'economia', 'sociedade', 'mundo', 'cultura', 'tecnologia', 'ciência'];

          while (tagsArray.length < 12 && genericTags.length > 0) {
            const tag = genericTags.shift();
            if (tag && !tagsArray.includes(tag)) {
              tagsArray.push(tag);
            }
          }

          // Garantir exatamente 12 tags
          corrected.tags = tagsArray.slice(0, 12).join(', ');

          console.log(`✅ Tags finais (${tagsArray.length}):`, corrected.tags);
          
          // Normalize imagem: must be string (URL or empty)
          if (!corrected.imagem || typeof corrected.imagem !== 'string') {
            console.log(`Invalid/null image for "${corrected.titulo}" - setting to empty string`);
            corrected.imagem = '';
          } else if (!corrected.imagem.startsWith('http') && corrected.imagem !== '') {
            console.warn(`Invalid image URL for "${corrected.titulo}" - setting to empty string`);
            corrected.imagem = '';
          } else if (corrected.imagem) {
            console.log(`Valid image string for "${corrected.titulo}": ${corrected.imagem}`);
          }
          
          // Validar e gerar alt se necessário
          if (corrected.imagem && !corrected.alt) {
            corrected.alt = corrected.titulo.length > 140 
              ? corrected.titulo.substring(0, 137) + '...' 
              : corrected.titulo;
            console.log(`✅ Generated alt text: ${corrected.alt}`);
          } else if (corrected.alt && corrected.alt.length > 140) {
            corrected.alt = corrected.alt.substring(0, 137) + '...';
          }

          // Validar credito
          if (!corrected.credito || typeof corrected.credito !== 'string') {
            corrected.credito = '© Imagem / Divulgação';
            console.log(`✅ Generated credito: ${corrected.credito}`);
          }

          // Renomear imagens_adicionais para galeria
          if (corrected.imagens_adicionais && !corrected.galeria) {
            corrected.galeria = corrected.imagens_adicionais;
            delete corrected.imagens_adicionais;
          }

          // Validar galeria
          if (!Array.isArray(corrected.galeria)) {
            corrected.galeria = [];
          }

          // Adicionar campos novos
          if (!corrected.legenda) {
            corrected.legenda = `Imagens relacionadas: ${corrected.titulo}`;
          }

          if (!corrected.fonte_imagem) {
            corrected.fonte_imagem = corrected.credito || 'Reprodução';
          }
          
          // Ensure galeria always includes the featured image as first item
          if (corrected.imagem && !corrected.galeria.includes(corrected.imagem)) {
            corrected.galeria.unshift(corrected.imagem);
          }
          
          // Limit galeria to 10 images
          if (corrected.galeria.length > 10) {
            corrected.galeria = corrected.galeria.slice(0, 10);
          }

          // Preservar campo featured se existir
          if (typeof corrected.featured === 'boolean') {
            console.log(`✅ Featured flag: ${corrected.featured}`);
          }

          // VALIDAÇÃO FINAL OBRIGATÓRIA
          const validationErrors: string[] = [];

          if (!corrected.categoria) validationErrors.push('categoria ausente');
          if (!corrected.tags || typeof corrected.tags !== 'string') validationErrors.push('tags: formato inválido');
          if (!corrected.imagem) validationErrors.push('imagem ausente');
          if (!corrected.alt) validationErrors.push('alt ausente');
          if (!corrected.credito) validationErrors.push('credito ausente');
          if (!corrected.galeria || !Array.isArray(corrected.galeria)) validationErrors.push('galeria ausente');
          if (!corrected.legenda) validationErrors.push('legenda ausente');
          if (!corrected.fonte_imagem) validationErrors.push('fonte_imagem ausente');
          if (!corrected.fonte) validationErrors.push('fonte ausente');
          if (!corrected.seo?.meta_titulo) validationErrors.push('meta_titulo ausente');
          if (!corrected.seo?.meta_descricao) validationErrors.push('meta_descricao ausente');
          if (!corrected.seo?.meta_keywords) validationErrors.push('meta_keywords ausente');

          if (validationErrors.length > 0) {
            console.warn(`⚠️ Validação falhou para "${corrected.titulo}":`, validationErrors);
            
            // Auto-correção
            corrected.alt = corrected.alt || corrected.titulo.substring(0, 140);
            corrected.credito = corrected.credito || '© Imagem / Divulgação';
            corrected.galeria = corrected.galeria || [];
            corrected.legenda = corrected.legenda || `Imagens relacionadas: ${corrected.titulo}`;
            corrected.fonte_imagem = corrected.fonte_imagem || 'Reprodução';
            corrected.fonte = corrected.fonte || url;
            if (!corrected.seo) corrected.seo = {};
            if (!corrected.seo.meta_keywords) {
              const tagsArray = corrected.tags.split(',').map((t: string) => t.trim()).filter(Boolean).slice(0, 8);
              corrected.seo.meta_keywords = tagsArray.join(', ');
            }
            
            console.log('✅ Auto-correção aplicada');
          }
          
          // Normalize galeria: must be array of valid URLs
          if (!Array.isArray(corrected.galeria)) {
            corrected.galeria = [];
          } else {
            corrected.galeria = corrected.galeria
              .filter((url: any) => typeof url === 'string' && url.startsWith('http'))
              .slice(0, 10); // Max 10 images
            console.log(`${corrected.galeria.length} gallery images for "${corrected.titulo}"`);
          }
          
          // Normalize fonte
          corrected.fonte = (corrected.fonte && typeof corrected.fonte === 'string') ? corrected.fonte : url;
          
          return corrected;
        });
        
        noticias.push(...parsedNews.noticias);

      } catch (urlError) {
        console.error(`❌ ERRO CRÍTICO processando URL ${url}:`, urlError);
        console.error('Stack trace:', urlError instanceof Error ? urlError.stack : 'N/A');
        console.error('Tipo do erro:', urlError instanceof Error ? urlError.constructor.name : typeof urlError);
        
        // Add detailed error to response for user feedback
        noticias.push({
          categoria: "Geral",
          titulo: `ERRO: Falha ao processar ${url}`,
          slug: `erro-${Date.now()}`,
          resumo: `Não foi possível processar este link: ${urlError instanceof Error ? urlError.message : 'Erro desconhecido'}`,
          conteudo: `<p>Erro ao processar URL: ${url}</p><p>Detalhes: ${urlError instanceof Error ? urlError.message : JSON.stringify(urlError)}</p>`,
          fonte: url,
          imagem: '',
          credito: '',
          tags: 'Erro, Processamento, Falha, Sistema, Debug, Importação, URL, Problema, Análise, Correção, Verificação, Suporte',
          seo: {
            meta_titulo: 'Erro no processamento',
            meta_descricao: 'Falha ao processar link fornecido'
          }
        });
      }
    }

    if (noticias.length === 0) {
      throw new Error('Não foi possível processar nenhum link. Verifique os URLs e tente novamente. Todos falharam sem gerar notícias válidas.');
    }
    
    // Log final summary
    console.log(`\n✅ RESUMO FINAL: ${noticias.length} notícias processadas de ${urls.length} URLs fornecidas`);
    const errorCount = noticias.filter(n => n.titulo.startsWith('ERRO:')).length;
    if (errorCount > 0) {
      console.warn(`⚠️ ${errorCount} URL(s) falharam e geraram artigos de erro`);
    }

    return new Response(
      JSON.stringify({ noticias }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in jornalista-pro-tools:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
