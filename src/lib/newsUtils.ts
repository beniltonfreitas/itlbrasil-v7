/**
 * Utilities for news content processing and normalization
 */

/**
 * Fixed categories list as per requirements
 */
export const FIXED_CATEGORIES = [
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
  "Geral"
];

/**
 * Category keywords mapping for intelligent category detection
 */
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Política": ["governo", "presidente", "ministro", "senado", "câmara", "congresso", "eleição", "partido", "político", "deputado", "prefeito", "governador", "voto", "legislação", "parlamento"],
  "Justiça": ["tribunal", "juiz", "processo", "sentença", "crime", "polícia", "investigação", "prisão", "advogado", "promotor", "julgamento", "lei", "jurídico", "condenação", "acusação"],
  "Economia": ["mercado", "dólar", "inflação", "juros", "investimento", "banco", "empresa", "negócio", "bolsa", "pib", "econômico", "financeiro", "fiscal", "crédito", "taxa"],
  "Educação": ["escola", "universidade", "professor", "aluno", "ensino", "educação", "estudante", "curso", "aprendizagem", "formação", "pedagógico", "didático"],
  "Internacional": ["país", "mundo", "exterior", "estrangeiro", "diplomacia", "global", "internacional", "nação", "fronteira", "embaixada"],
  "Meio Ambiente": ["ambiental", "clima", "natureza", "floresta", "poluição", "sustentável", "ecologia", "biodiversidade", "desmatamento", "carbono", "verde"],
  "Direitos Humanos": ["direitos", "igualdade", "discriminação", "liberdade", "cidadania", "inclusão", "minoria", "acesso", "dignidade", "social"],
  "Cultura": ["arte", "música", "cinema", "teatro", "festival", "show", "exposição", "cultural", "artista", "livro", "literatura"],
  "Esportes": ["futebol", "jogo", "atleta", "campeonato", "time", "esporte", "olimpíada", "copa", "partida", "competição", "treino"],
  "Saúde": ["hospital", "médico", "doença", "tratamento", "vacina", "saúde", "paciente", "sintoma", "medicamento", "clínica", "sus", "epidemia"]
};

/**
 * Similar category mappings for common variations
 */
const CATEGORY_ALIASES: Record<string, string> = {
  "tecnologia": "Geral",
  "ciência": "Geral",
  "segurança": "Justiça",
  "governo": "Política",
  "negócios": "Economia",
  "finanças": "Economia",
  "entretenimento": "Cultura",
  "clima": "Meio Ambiente",
  "mundial": "Internacional",
  "exterior": "Internacional"
};

/**
 * Intelligently map a category to an official one based on context
 */
export const mapCategoryToOfficial = (
  category: string,
  title: string = "",
  content: string = ""
): string => {
  // First check if it's already a valid category
  if (FIXED_CATEGORIES.includes(category)) {
    return category;
  }

  // Check direct aliases (case-insensitive)
  const categoryLower = category.toLowerCase();
  for (const [alias, officialCategory] of Object.entries(CATEGORY_ALIASES)) {
    if (categoryLower.includes(alias)) {
      console.log(`Mapped "${category}" to "${officialCategory}" via alias "${alias}"`);
      return officialCategory;
    }
  }

  // Analyze content using keywords
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

  // Find category with highest score
  const bestMatch = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  
  if (bestMatch && bestMatch[1] > 0) {
    console.log(`Mapped "${category}" to "${bestMatch[0]}" via content analysis (score: ${bestMatch[1]})`);
    return bestMatch[0];
  }

  // Default to "Geral" if no match found
  console.log(`No match found for "${category}", defaulting to "Geral"`);
  return "Geral";
};

/**
 * WhatsApp CTA text - official format with clickable link
 */
export const WHATSAPP_CTA = `<p><strong>&gt;&gt; Siga o canal da ITL Brasil no WhatsApp</strong></p><p><a href="https://whatsapp.com/channel/0029Vb735uVIt5rscmQ3XA0Z" target="_blank" rel="noopener noreferrer">https://whatsapp.com/channel/0029Vb735uVIt5rscmQ3XA0Z</a></p>`;

/**
 * Generate URL-friendly slug from title
 * Removes accents, converts to lowercase, replaces special chars with hyphens
 */
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove accent marks
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .trim();
};

/**
 * Validate slug format according to requirements
 * Must be 6-120 chars, only lowercase letters, numbers, hyphens
 */
export const validateSlug = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slug.length >= 6 && slug.length <= 120 && slugRegex.test(slug);
};

/**
 * Check if content already contains WhatsApp CTA
 */
export const hasWhatsAppCTA = (content: string): boolean => {
  return content.includes('whatsapp.com/channel/0029Vb735uVIt5rscmQ3XA0Z');
};

/**
 * Add WhatsApp CTA to content if not present
 */
export const ensureWhatsAppCTA = (content: string): string => {
  if (hasWhatsAppCTA(content)) {
    return content;
  }
  
  // Add CTA at the end with proper spacing
  const trimmedContent = content.trim();
  return `${trimmedContent}\n\n${WHATSAPP_CTA}`;
};

/**
 * Normalize content structure:
 * - Convert double line breaks to proper paragraphs  
 * - Convert standalone "Posse", "Pautas", "Perfil" to H2 headings
 * - Ensure WhatsApp CTA is present
 */
export const normalizeContent = (content: string): string => {
  let normalized = content;
  
  // Convert standalone section headers to H2
  const sectionHeaders = ['Posse', 'Pautas', 'Perfil'];
  sectionHeaders.forEach(header => {
    // Match standalone header lines (with optional surrounding whitespace/breaks)
    const headerRegex = new RegExp(`(^|\\n\\s*)${header}(\\s*\\n|$)`, 'gim');
    normalized = normalized.replace(headerRegex, `$1## ${header}$2`);
  });
  
  // Ensure WhatsApp CTA is present
  normalized = ensureWhatsAppCTA(normalized);
  
  return normalized.trim();
};

/**
 * Validate image URL format (must be string, not object)
 */
export const validateImageUrl = (image: any): boolean => {
  return typeof image === 'string' && /^https?:\/\/.+/.test(image);
};

/**
 * Validates that an image URL uses HTTPS and has a valid image extension
 * Used for security and ensuring proper image loading
 */
export const isHttpsImageUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === "https:";
    const looksLikeImage = /\.(png|jpe?g|webp|gif|avif)(\?.*)?$/i.test(parsedUrl.pathname);
    return isHttps && looksLikeImage;
  } catch {
    return false;
  }
};

/**
 * Image object structure for articles
 */
export interface ArticleImageObject {
  hero: string;
  og: string;
  card: string;
  alt: string;
}

/**
 * Normalize image input to always return an object structure
 * Accepts either a string URL (for backward compatibility) or an image object
 * If string is provided, replicates it across hero/og/card fields
 */
export const normalizeImageInput = (input: any): ArticleImageObject => {
  // If it's a string URL, replicate it to all fields
  if (typeof input === "string" && input.trim()) {
    if (isHttpsImageUrl(input)) {
      return {
        hero: input,
        og: input,
        card: input,
        alt: ""
      };
    }
    // Invalid URL string, return empty
    return { hero: "", og: "", card: "", alt: "" };
  }
  
  // If it's already an object, validate and fill missing fields
  if (input && typeof input === "object") {
    const hero = input.hero || "";
    return {
      hero,
      og: input.og || hero,
      card: input.card || hero,
      alt: input.alt || ""
    };
  }
  
  // Default empty object
  return { hero: "", og: "", card: "", alt: "" };
};

/**
 * Count words in text content
 */
export const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

/**
 * Count characters in text content
 */
export const countCharacters = (text: string): number => {
  return text.length;
};

/**
 * Parse tags from string or array input, normalize and validate
 * Accepts comma or pipe separated string: "tag1, tag2, tag3" or "tag1|tag2|tag3"
 * Returns exactly 12 unique tags (40 chars max each)
 */
export const parseTags = (input: string | string[]): string[] => {
  if (!input) return [];
  
  // Convert to array if string
  let tags: string[] = [];
  if (typeof input === 'string') {
    tags = input.split(/[,|]/).map(t => t.trim()).filter(Boolean);
  } else if (Array.isArray(input)) {
    tags = input.map(t => String(t).trim()).filter(Boolean);
  }
  
  // Deduplicate (case-insensitive)
  const unique: string[] = [];
  const seen = new Set<string>();
  for (const tag of tags) {
    const key = tag.toLowerCase();
    if (!seen.has(key) && tag.length <= 40) {
      seen.add(key);
      unique.push(tag);
    }
  }
  
  return unique;
};

/**
 * Generate missing tags based on content analysis to reach exactly 12 tags
 */
export const generateMissingTags = (
  existingTags: string[],
  title: string,
  content: string
): string[] => {
  const needed = 12 - existingTags.length;
  if (needed <= 0) return existingTags.slice(0, 12);
  
  // Extract potential tags from title and content
  const text = `${title} ${content}`.toLowerCase();
  const words = text
    .replace(/<[^>]*>/g, ' ') // Remove HTML
    .replace(/[^\w\sáéíóúâêîôûãõçü]/gi, ' ') // Keep only words
    .split(/\s+/)
    .filter(w => w.length >= 4 && w.length <= 40) // Reasonable word length
    .filter(w => !['para', 'pela', 'pelo', 'com', 'sem', 'sobre', 'entre', 'quando', 'onde', 'como', 'qual', 'quem', 'este', 'essa', 'isso', 'aqui', 'mais', 'menos', 'muito', 'pouco', 'todas', 'todos', 'cada', 'deve', 'pode', 'será', 'está', 'foram', 'sido', 'fazer', 'dizer', 'essa', 'este'].includes(w)); // Filter common words
  
  // Count word frequency
  const freq = new Map<string, number>();
  for (const word of words) {
    freq.set(word, (freq.get(word) || 0) + 1);
  }
  
  // Sort by frequency and get top candidates
  const candidates = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
    .filter(word => {
      const lower = word.toLowerCase();
      return !existingTags.some(t => t.toLowerCase() === lower);
    });
  
  // Add candidates until we have 12 tags
  const result = [...existingTags];
  for (let i = 0; i < candidates.length && result.length < 12; i++) {
    // Capitalize first letter for better display
    const tag = candidates[i].charAt(0).toUpperCase() + candidates[i].slice(1);
    result.push(tag);
  }
  
  // If still not enough, add generic tags
  const genericTags = ['Notícia', 'Brasil', 'Atualidade', 'Destaque', 'Informação'];
  for (const tag of genericTags) {
    if (result.length >= 12) break;
    if (!result.some(t => t.toLowerCase() === tag.toLowerCase())) {
      result.push(tag);
    }
  }
  
  return result.slice(0, 12);
};

/**
 * Validate that tags array has exactly 12 items
 */
export const validateTags = (tags: string[]): { valid: boolean; error?: string } => {
  if (!Array.isArray(tags)) {
    return { valid: false, error: 'Tags deve ser um array' };
  }
  if (tags.length < 12) {
    return { valid: false, error: `Adicione mais ${12 - tags.length} tags` };
  }
  if (tags.length > 12) {
    return { valid: false, error: 'Máximo de 12 tags. As extras serão removidas.' };
  }
  for (const tag of tags) {
    if (tag.length > 40) {
      return { valid: false, error: `Tag "${tag}" excede 40 caracteres` };
    }
  }
  return { valid: true };
};

/**
 * Truncate text to specified length with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Generate SEO-friendly meta title (max 60 chars)
 */
export const generateMetaTitle = (title: string): string => {
  return truncateText(title, 60);
};

/**
 * Generate SEO-friendly meta description (max 160 chars)
 */
export const generateMetaDescription = (excerpt: string): string => {
  return truncateText(excerpt, 160);
};

/**
 * Generate JSON-LD NewsArticle structured data
 */
export const generateNewsArticleJsonLD = (article: {
  title: string;
  image?: string;
  category?: string;
  publishedAt?: string;
  url?: string;
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "image": article.image || "",
    "articleSection": article.category || "Notícias",
    "datePublished": article.publishedAt || new Date().toISOString(),
    "publisher": {
      "@type": "Organization", 
      "name": "ITL Brasil",
      "url": "https://itlbrasil.com"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": article.url || ""
    }
  };
};

/**
 * Build social media meta tags for OG and Twitter
 * Used for sharing articles on social platforms
 * Accepts both old format (image: string) and new format (imagem: object)
 */
export const buildSocialMeta = (article: {
  title?: string;
  titulo?: string;
  excerpt?: string;
  resumo?: string;
  image?: string;
  imagem?: ArticleImageObject | string;
  metaDescription?: string;
  seo?: { meta_descricao?: string };
}) => {
  // Handle new image object format
  let imageUrl = "";
  if (article.imagem) {
    if (typeof article.imagem === "string") {
      imageUrl = article.imagem;
    } else {
      imageUrl = article.imagem.og || article.imagem.hero || "";
    }
  } else if (article.image) {
    imageUrl = article.image;
  }

  const title = article.titulo || article.title || "";
  const description = article.seo?.meta_descricao || article.metaDescription || article.resumo || article.excerpt || "";

  return {
    "og:title": title,
    "og:description": description,
    "og:image": imageUrl,
    "og:type": "article",
    "twitter:card": "summary_large_image",
    "twitter:title": title,
    "twitter:description": description,
    "twitter:image": imageUrl,
  };
};

/**
 * Fetch and extract text content from URL
 * Used for rewriting content from source URLs
 */
export const fetchTextFromUrl = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Basic HTML to text conversion (simplified)
    // In production, you might want to use a proper HTML parser
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove styles
      .replace(/<[^>]*>/g, ' ') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    return textContent;
  } catch (error) {
    console.error('Error fetching text from URL:', error);
    throw new Error('Não foi possível buscar o conteúdo da URL fornecida');
  }
};