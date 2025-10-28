import { useState } from "react";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useCreateArticle } from "@/hooks/useArticleMutations";
import { useCategories } from "@/hooks/useCategories";
import { useAuthors } from "@/hooks/useAuthors";
import { useArticleRewrite } from "@/hooks/useArticleRewrite";
import { generateSlug, normalizeContent, FIXED_CATEGORIES, parseTags, generateMissingTags, mapCategoryToOfficial } from "@/lib/newsUtils";
import { removeWhatsAppCTA } from "@/lib/textUtils";
import { supabase } from "@/integrations/supabase/client";

const NewsItemSchema = z.object({
  categoria: z.string().refine((val) => FIXED_CATEGORIES.includes(val), 
    `Categoria inválida. Use: ${FIXED_CATEGORIES.join(", ")}`),
  titulo: z.string().trim()
    .min(6, "Título deve ter pelo menos 6 caracteres")
    .max(120, "Título excede 120 caracteres. Reduza o tamanho."),
  slug: z.string().trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug deve conter apenas letras minúsculas, números e hífens")
    .optional(),
  resumo: z.string().trim()
    .max(160, "Resumo excede 160 caracteres. Reduza o tamanho.")
    .optional(),
  conteudo: z.string().trim().min(10, "Conteúdo deve ter pelo menos 10 caracteres"),
  fonte: z.union([z.string().trim().url("URL da fonte deve ser válida"), z.literal("")]).optional(),
  imagem: z.union([
    z.object({
      hero: z.string().url("URL hero deve ser válida").optional(),
      og: z.string().url("URL og deve ser válida").optional(),
      card: z.string().url("URL card deve ser válida").optional(),
      alt: z.string().min(5).max(140).optional()
    }).optional(),
    z.string().trim().url("Imagem deve ser uma URL válida").optional(),
    z.literal("").optional()
  ]).optional(),
  credito: z.string().trim().optional(),
  tags: z.union([
    z.string(),
    z.array(z.string().trim().max(40, "Cada tag deve ter no máximo 40 caracteres"))
  ]).optional(),
  seo: z.object({
    meta_titulo: z.string().trim().max(80, "Meta título excede 80 caracteres. Reduza o tamanho.").optional(),
    meta_descricao: z.string().trim().max(160, "Meta descrição excede 160 caracteres. Reduza o tamanho.").optional(),
    meta_keywords: z.union([z.string(), z.array(z.string())]).optional()
  }).optional()
});

export const BulkImportSchema = z.object({
  noticias: z.array(NewsItemSchema)
});

export interface ImportResult {
  success: boolean;
  title: string;
  error?: string;
  slug?: string;
}

export const useBulkNewsImport = () => {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ImportResult[]>([]);

  const { toast } = useToast();
  const createArticle = useCreateArticle();
  const rewriteMutation = useArticleRewrite();
  const { data: categories } = useCategories();
  const { data: authors } = useAuthors();

  const validateJSON = (jsonInput: string) => {
    try {
      const parsed = JSON.parse(jsonInput);
      
      // Auto-correct fields before validation
      const corrections: string[] = [];
      
      if (parsed.noticias && Array.isArray(parsed.noticias)) {
        parsed.noticias = parsed.noticias.map((item: any, index: number) => {
          const corrected = { ...item };
          
          console.group(`🔄 Validando e convertendo notícia ${index + 1}`);
          console.log('Formato original:', {
            imagem: typeof item.imagem,
            conteudo: Array.isArray(item.conteudo) ? 'array' : 'string',
            galeria: (item as any).galeria ? 'presente' : 'ausente',
            tags: item.tags?.length || 0
          });
          
          // FALLBACK 1: Se imagem vier como objeto (formato antigo), converter
          if (corrected.imagem && typeof corrected.imagem === 'object') {
            const imgObj = corrected.imagem as any;
            
            // Tentar extrair URL de múltiplos campos possíveis
            let extractedUrl = imgObj.url || imgObj.hero || imgObj.src || imgObj.image || '';
            
            // Validar se a URL extraída é válida
            if (extractedUrl && !extractedUrl.startsWith('http')) {
              extractedUrl = '';
            }
            
            // Extrair crédito de múltiplos campos possíveis
            const extractedCredit = imgObj.credito || imgObj.credit || imgObj.fonte || imgObj.source || '';
            
            corrected.imagem = extractedUrl;
            corrected.imagem_credito = extractedCredit;
            
            corrections.push(`Notícia ${index + 1}: formato de imagem convertido de objeto para string (URL: ${extractedUrl ? 'válida' : 'vazia'})`);
          }
          
          // Garantir que imagem é sempre string (não undefined, não null)
          if (typeof corrected.imagem !== 'string') {
            corrected.imagem = '';
            corrections.push(`Notícia ${index + 1}: imagem não-string convertida para string vazia`);
          }
          
          // Helper para escapar HTML
          const escapeHtml = (text: string): string => {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
          };
          
          // FALLBACK 2: Se conteudo vier como array (formato antigo), converter para HTML
          if (Array.isArray(corrected.conteudo)) {
            corrected.conteudo = corrected.conteudo
              .filter((p: string) => {
                const trimmed = p.trim();
                return trimmed.length > 0 && !trimmed.toLowerCase().includes('whatsapp');
              })
              .map((p: string) => {
                const trimmed = p.trim();
                
                // Se já tiver tags HTML, manter
                if (trimmed.startsWith('<') && trimmed.endsWith('>')) return trimmed;
                
                // Se for título (começar com ##), converter para h2
                if (trimmed.startsWith('##')) {
                  const titulo = trimmed.replace(/^##\s*/, '');
                  return `<h2>${escapeHtml(titulo)}</h2>`;
                }
                
                // Se for citação (começar e terminar com aspas), usar blockquote
                if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || 
                    (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
                  const citacao = trimmed.replace(/^[""]/, '').replace(/[""]$/, '');
                  return `<blockquote>${escapeHtml(citacao)}</blockquote>`;
                }
                
                // Senão, envolver em <p>
                return `<p>${escapeHtml(trimmed)}</p>`;
              })
              .join('\n');
            corrections.push(`Notícia ${index + 1}: conteúdo convertido de array para HTML semântico`);
          }
          
          // FALLBACK 3: Se galeria existir (formato antigo), converter para imagens_adicionais
          if ((corrected as any).galeria && Array.isArray((corrected as any).galeria)) {
            const galerias = (corrected as any).galeria
              .map((img: any) => {
                // Se for objeto, tentar extrair URL
                if (typeof img === 'object' && img !== null) {
                  return img.url || img.src || img.image || '';
                }
                // Se já for string, usar diretamente
                return img;
              })
              .filter((url: string) => {
                // Validar que é string não-vazia e começa com http
                return typeof url === 'string' && url.trim().length > 0 && url.startsWith('http');
              })
              // Remover duplicatas
              .filter((url: string, index: number, self: string[]) => self.indexOf(url) === index)
              // Limitar a 10 imagens
              .slice(0, 10);
            
            corrected.imagens_adicionais = galerias;
            delete (corrected as any).galeria;
            corrections.push(`Notícia ${index + 1}: galeria convertida para ${galerias.length} imagens adicionais válidas`);
          }

          // FALLBACK 4: Processar tags - garantir array com exatamente 12 tags
          let processedTags = Array.isArray(corrected.tags) 
            ? corrected.tags 
            : typeof corrected.tags === 'string'
              ? corrected.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
              : [];

          // Se menos de 12, completar com tags genéricas
          if (processedTags.length < 12) {
            const genericTags = ['Brasil', 'notícias', 'atualidades', 'informação', 'jornalismo', 'política', 'economia', 'sociedade', 'cultura', 'mundo'];
            while (processedTags.length < 12 && genericTags.length > 0) {
              const tag = genericTags.shift();
              if (tag && !processedTags.includes(tag)) {
                processedTags.push(tag);
              }
            }
            corrections.push(`Notícia ${index + 1}: tags completadas de ${corrected.tags?.length || 0} para ${processedTags.length}`);
          }

          // Se mais de 12, truncar
          if (processedTags.length > 12) {
            processedTags = processedTags.slice(0, 12);
            corrections.push(`Notícia ${index + 1}: tags truncadas para 12`);
          }

          corrected.tags = processedTags;
          console.log(`✅ Tags finais (${corrected.tags.length}/12):`, corrected.tags);
          
          // Validar imagens_adicionais se já existir
          if (corrected.imagens_adicionais && Array.isArray(corrected.imagens_adicionais)) {
            corrected.imagens_adicionais = corrected.imagens_adicionais
              .filter((url: any) => typeof url === 'string' && url.startsWith('http'))
              .filter((url: string, index: number, self: string[]) => self.indexOf(url) === index)
              .slice(0, 10);
          }
          
          // Normalize image: support new format or legacy string
          if (corrected.imagem === null || corrected.imagem === undefined) {
            corrected.imagem = '';
            corrections.push(`Notícia ${index + 1}: imagem nula convertida para string vazia`);
          }
          
          if (corrected.credito === null || corrected.credito === undefined) {
            corrected.credito = '';
            corrections.push(`Notícia ${index + 1}: crédito nulo convertido para string vazia`);
          }
          // Normalizar e validar fonte (URL)
          if (corrected.fonte) {
            let normalizedUrl = corrected.fonte.trim();
            
            // Se não começar com http, tentar adicionar
            if (normalizedUrl && !normalizedUrl.startsWith('http')) {
              normalizedUrl = 'https://' + normalizedUrl;
            }
            
            // Validar se é uma URL válida
            try {
              new URL(normalizedUrl);
              corrected.fonte = normalizedUrl;
            } catch {
              // URL inválida, remover
              corrected.fonte = '';
              corrections.push(`Notícia ${index + 1}: fonte inválida removida`);
            }
          } else {
            corrected.fonte = '';
          }
          
          // Use intelligent category mapping
          if (!corrected.categoria || !FIXED_CATEGORIES.includes(corrected.categoria)) {
            const originalCategory = corrected.categoria || '';
            corrected.categoria = mapCategoryToOfficial(
              originalCategory, 
              corrected.titulo || '', 
              corrected.conteudo || ''
            );
            
            if (corrected.categoria !== originalCategory) {
              corrections.push(
                `Notícia ${index + 1}: categoria "${originalCategory}" mapeada para "${corrected.categoria}"`
              );
            }
          }
          
          // Parse and normalize tags to exactly 12
          let parsedTags = parseTags(corrected.tags || []);
          
          if (parsedTags.length < 12) {
            parsedTags = generateMissingTags(parsedTags, corrected.titulo, corrected.conteudo);
            corrections.push(`Notícia ${index + 1}: ${12 - parsedTags.length} tags geradas automaticamente`);
          }
          
          // FALLBACK FINAL: Se ainda faltarem tags, completar com genéricas
          const GENERIC_TAGS = [
            'Notícias', 'Brasil', 'Atualidades', 'Informação', 
            'Jornalismo', 'Acontecimentos', 'Reportagem', 'Imprensa',
            'Mídia', 'Comunicação', 'Sociedade', 'Cidadania'
          ];
          
          while (parsedTags.length < 12) {
            const nextTag = GENERIC_TAGS[parsedTags.length % GENERIC_TAGS.length];
            if (!parsedTags.includes(nextTag)) {
              parsedTags.push(nextTag);
            } else {
              parsedTags.push(`${nextTag} ${Math.floor(parsedTags.length / GENERIC_TAGS.length) + 1}`);
            }
          }
          
          // Garantir exatamente 12 (cortar se passou)
          parsedTags = parsedTags.slice(0, 12);
          corrected.tags = parsedTags;
          
          console.log(`✓ Tags finalizadas (${parsedTags.length}):`, parsedTags);
          
          // Trim all string fields
          Object.keys(corrected).forEach(key => {
            if (typeof corrected[key] === 'string') {
              corrected[key] = corrected[key].trim();
            }
          });
          
          // Truncate titulo if needed
          if (corrected.titulo && corrected.titulo.length > 120) {
            corrected.titulo = corrected.titulo.substring(0, 117) + '...';
            corrections.push(`Notícia ${index + 1}: título truncado para 120 caracteres`);
          }
          
          // Truncate resumo if needed
          if (corrected.resumo && corrected.resumo.length > 160) {
            corrected.resumo = corrected.resumo.substring(0, 157) + '...';
            corrections.push(`Notícia ${index + 1}: resumo truncado para 160 caracteres`);
          }
          
          // Generate slug if missing
          if (!corrected.slug && corrected.titulo) {
            corrected.slug = generateSlug(corrected.titulo);
            corrections.push(`Notícia ${index + 1}: slug gerado automaticamente`);
          }
          
          // Normalize slug
          if (corrected.slug) {
            corrected.slug = generateSlug(corrected.slug);
          }
          
          // Tags already processed above - skip this section
          
          // Truncate SEO fields
          if (corrected.seo) {
            if (corrected.seo.meta_titulo && corrected.seo.meta_titulo.length > 60) {
              corrected.seo.meta_titulo = corrected.seo.meta_titulo.substring(0, 57) + '...';
              corrections.push(`Notícia ${index + 1}: meta título truncado para 60 caracteres`);
            }
            if (corrected.seo.meta_descricao && corrected.seo.meta_descricao.length > 160) {
              corrected.seo.meta_descricao = corrected.seo.meta_descricao.substring(0, 157) + '...';
              corrections.push(`Notícia ${index + 1}: meta descrição truncada para 160 caracteres`);
            }
          }
          
          // Ensure conteudo has minimum length
          if (corrected.conteudo && corrected.conteudo.length < 10) {
            corrected.conteudo = corrected.conteudo.padEnd(10, ' ');
            corrections.push(`Notícia ${index + 1}: conteúdo expandido para mínimo de 10 caracteres`);
          }
          
          console.log('Conversões aplicadas:', corrections.filter(c => c.includes(`${index + 1}`)));
          console.log('Formato final:', {
            imagem: corrected.imagem ? 'string válida' : 'vazia',
            conteudo: corrected.conteudo?.length + ' chars',
            imagens_adicionais: corrected.imagens_adicionais?.length || 0,
            tags: corrected.tags?.length || 0
          });
          console.groupEnd();
          
          return corrected;
        });
      }
      
      // Show corrections made
      if (corrections.length > 0) {
        toast({
          title: "Correções automáticas aplicadas",
          description: `${corrections.length} ajuste(s) feito(s):\n${corrections.slice(0, 5).join('\n')}${corrections.length > 5 ? '\n...' : ''}`,
          duration: 5000,
        });
      }
      
      const validated = BulkImportSchema.parse(parsed);
      return { success: true, data: validated, error: null };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(e => {
          if (e.path.includes('imagem') && e.message.includes('object')) {
            return `${e.path.join('.')}: O campo imagem deve ser URL (string). Remova objetos {url, credito} e use imagem: 'https://...' + credito: 'Autor/Agência'`;
          }
          return `${e.path.join('.')}: ${e.message}`;
        });
        return { success: false, data: null, error: `Erro de validação: ${errorMessages.join(' | ')}` };
      } else {
        return { success: false, data: null, error: "JSON inválido. Verifique a estrutura." };
      }
    }
  };

  const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message;
    if (typeof err === 'string') return err;
    try {
      return JSON.stringify(err);
    } catch {
      return 'Erro desconhecido';
    }
  };

  const getCategoryId = (categoryName: string, title?: string, content?: string) => {
    // Try exact match first
    let category = categories?.find(
      c => c.name.toLowerCase() === categoryName.toLowerCase()
    );
    
    if (category) {
      console.log(`✓ Categoria "${categoryName}" encontrada diretamente`);
      return category.id;
    }
    
    // Use intelligent mapping if category doesn't exist
    console.warn(`⚠ Categoria "${categoryName}" não encontrada. Usando mapeamento inteligente...`);
    const mappedCategory = mapCategoryToOfficial(categoryName, title || '', content || '');
    
    category = categories?.find(
      c => c.name.toLowerCase() === mappedCategory.toLowerCase()
    );
    
    if (category) {
      console.log(`✓ Mapeamento: "${categoryName}" → "${mappedCategory}"`);
      return category.id;
    }
    
    // Final fallback: use "Geral" or first available category
    const fallback = categories?.find(c => c.name === "Geral") || categories?.[0];
    if (fallback) {
      console.warn(`⚠ Usando fallback: "${fallback.name}"`);
      return fallback.id;
    }
    
    return undefined;
  };

  const getDefaultAuthorId = () => {
    // Sempre usar "Redação ITL Brasil" como padrão
    const DEFAULT_AUTHOR_ID = '04ff5b92-dde9-427b-9371-e3b2813bcab5';
    return DEFAULT_AUTHOR_ID;
  };

  // Upload de imagem externa para o storage do Supabase
  const uploadExternalImage = async (imageUrl: string): Promise<string | null> => {
    try {
      console.log('📥 Baixando imagem externa:', imageUrl);
      
      // 1. Fazer download da imagem
      const response = await fetch(imageUrl);
      if (!response.ok) {
        console.error('❌ Falha ao baixar imagem:', response.status);
        return null;
      }
      
      const blob = await response.blob();
      
      // 2. Comprimir imagem (max 1920px)
      const compressedBlob = await compressImage(blob);
      
      // 3. Gerar nome único
      const fileExt = imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
      const fileName = `jp-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `images/${fileName}`;
      
      // 4. Upload para bucket 'article-images'
      const { error: uploadError } = await supabase.storage
        .from('article-images')
        .upload(filePath, compressedBlob);
      
      if (uploadError) {
        console.error('❌ Erro no upload:', uploadError);
        return null;
      }
      
      // 5. Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('article-images')
        .getPublicUrl(filePath);
      
      console.log('✅ Imagem hospedada:', publicUrl);
      return publicUrl;
      
    } catch (error) {
      console.error('❌ Erro ao processar imagem:', error);
      return null;
    }
  };

  // Comprimir imagem mantendo qualidade
  const compressImage = async (blob: Blob): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const maxSize = 1920;
        let width = img.width;
        let height = img.height;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (compressedBlob) => resolve(compressedBlob || blob),
          'image/jpeg',
          0.85
        );
      };

      img.src = URL.createObjectURL(blob);
    });
  };

  const importNews = async (jsonData: z.infer<typeof BulkImportSchema>, options: { rewriteWithAI?: boolean } = {}) => {
    setImporting(true);
    setProgress(0);
    setResults([]);

    const authorId = getDefaultAuthorId();
    if (!authorId) {
      toast({
        title: "Erro",
        description: "Nenhum autor encontrado. Crie um autor antes de importar.",
        variant: "destructive"
      });
      setImporting(false);
      return { success: false, results: [] };
    }

    console.log('📦 Iniciando importação com autor:', authorId);
    console.log('📊 Total de notícias:', jsonData.noticias.length);

    const totalNews = jsonData.noticias.length;
    const importResults: ImportResult[] = [];

    for (let i = 0; i < jsonData.noticias.length; i++) {
      const noticia = jsonData.noticias[i];
      
      try {
        console.log(`\n📰 [${i + 1}/${totalNews}] Processando:`, noticia.titulo);
        
        const categoryId = getCategoryId(noticia.categoria, noticia.titulo, noticia.conteudo);
        if (!categoryId) {
          throw new Error(`Erro crítico: nenhuma categoria disponível no sistema`);
        }
        console.log('✓ Categoria processada:', noticia.categoria, '→', categoryId);
        
        // Auto-generate slug if missing
        const finalSlug = noticia.slug || generateSlug(noticia.titulo);
        console.log('✓ Slug gerado:', finalSlug);
        
        // Handle AI rewriting if enabled and source available
        let finalContent = noticia.conteudo;
        if (options.rewriteWithAI && noticia.fonte) {
          try {
            console.log('🤖 Reescrevendo com IA...');
            const rewriteResult = await rewriteMutation.mutateAsync({
              sourceUrl: noticia.fonte,
              currentContent: noticia.conteudo,
              preserveCharacterCount: true,
            });
            finalContent = rewriteResult.rewrittenContent;
            console.log('✓ Conteúdo reescrito');
          } catch (rewriteError) {
            console.warn('⚠ Falha ao reescrever, usando conteúdo original:', rewriteError);
          }
        }
        
        // ====== DEBUG COMPLETO DO JSON RECEBIDO ======
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📄 NOTÍCIA RECEBIDA:', noticia.titulo);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔍 JSON COMPLETO:', JSON.stringify(noticia, null, 2));
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📸 CAMPO imagens_adicionais:');
        console.log('   - Valor:', (noticia as any).imagens_adicionais);
        console.log('   - Tipo:', typeof (noticia as any).imagens_adicionais);
        console.log('   - É Array?:', Array.isArray((noticia as any).imagens_adicionais));
        console.log('   - Length:', (noticia as any).imagens_adicionais?.length);
        console.log('   - Stringify:', JSON.stringify((noticia as any).imagens_adicionais));
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Normalize content (add CTA, structure sections)
        finalContent = normalizeContent(finalContent);
        
        // Remover CTAs duplicados do WhatsApp
        finalContent = removeWhatsAppCTA(finalContent);
        
        // Processar imagem principal com upload para storage
        let featuredImage = undefined;
        let featuredImageAlt = (noticia as any).alt || 
                               (noticia as any).imagem_alt || 
                               noticia.titulo.substring(0, 140);
        let featuredImageCredit = (noticia as any).credito || 
                                  (noticia as any).imagem_credito ||
                                  '© Imagem / Divulgação';
        
        console.log('✅ Crédito da imagem:', featuredImageCredit);

        if (typeof noticia.imagem === 'string' && noticia.imagem) {
          console.log('📸 Processando imagem principal:', noticia.imagem);
          
          // Upload da imagem para storage (igual ao cadastro manual)
          const uploadedUrl = await uploadExternalImage(noticia.imagem);
          
          if (uploadedUrl) {
            featuredImage = uploadedUrl;
            featuredImageAlt = (noticia as any).imagem_alt || noticia.titulo;
            featuredImageCredit = (noticia as any).imagem_credito || undefined;
            
            console.log('✅ Imagem principal processada:', {
              url: featuredImage,
              alt: featuredImageAlt,
              credit: featuredImageCredit
            });
          } else {
            console.warn('⚠️ Falha no upload, usando URL externa como fallback');
            featuredImage = noticia.imagem; // fallback para URL externa
            featuredImageAlt = (noticia as any).imagem_alt || noticia.titulo;
            featuredImageCredit = (noticia as any).imagem_credito || undefined;
          }
        }

        // Determinar se é artigo em destaque
        const isFeatured = 
          (i === 0 && totalNews > 0) || // Primeira notícia sempre em destaque
          noticia.categoria?.toLowerCase() === 'últimas notícias' ||
          noticia.categoria?.toLowerCase() === 'ultimas noticias' ||
          (noticia as any).featured === true; // Respeitar flag do JSON se existir

        console.log(`📌 Artigo ${i + 1}/${totalNews} - Destaque: ${isFeatured ? 'SIM' : 'NÃO'}`);
        console.log(`   Categoria: "${noticia.categoria}"`);
        console.log(`   Featured flag: ${(noticia as any).featured}`);

        // Process additional images for gallery
        let additionalImages = undefined;

        // Validação melhorada de imagens_adicionais - aceitar "galeria" ou "imagens_adicionais"
        const rawImages = (noticia as any).galeria || 
                          (noticia as any).imagens_adicionais;
        
        console.log('━━━━━━━━━━━ DEBUG GALERIA ━━━━━━━━━━━');
        console.log('Campo "imagens_adicionais":', (noticia as any).imagens_adicionais);
        console.log('Campo "galeria":', (noticia as any).galeria);
        console.log('rawImages usado:', rawImages);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // Se o campo não existe, tudo bem (undefined)
        if (rawImages === undefined || rawImages === null) {
          console.log('⚪ Campo imagens_adicionais ausente (OK)');
        }
        // Se o campo existe mas está vazio, avisar
        else if (Array.isArray(rawImages) && rawImages.length === 0) {
          console.warn('⚠️ Campo imagens_adicionais VAZIO para:', noticia.titulo);
          console.warn('   ➜ Verifique se o Jornalista Pro está enviando as URLs corretas');
        }
        // Se o campo existe e tem dados, processar
        else if (Array.isArray(rawImages) && rawImages.length > 0) {
          console.log(`✅ ${rawImages.length} imagem(ns) encontrada(s) em imagens_adicionais`);
          const validUrls = rawImages.filter((url: any) => {
            const isValid = url && 
                           typeof url === 'string' && 
                           url.trim() !== '' && 
                           url.startsWith('http');
            
            if (!isValid) {
              console.warn('❌ URL inválida:', url);
            }
            return isValid;
          });

          if (validUrls.length > 0) {
            additionalImages = validUrls.map((url: string, index: number) => {
              const uniqueId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              
              // Extração inteligente de caption
              let smartCaption = '';
              const urlParts = url.split('/').pop()?.replace(/\.(jpg|jpeg|png|webp|gif)/i, '').replace(/[_-]/g, ' ') || '';
              
              if (urlParts.length > 8) {
                smartCaption = urlParts
                  .replace(/\d+/g, '')
                  .replace(/\s+/g, ' ')
                  .trim()
                  .split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                  .join(' ');
              }
              
              if (!smartCaption || smartCaption.length < 3) {
                smartCaption = `${noticia.titulo} - Imagem ${index + 1}`;
              }
              
              const imageData = {
                id: uniqueId,
                url,
                caption: smartCaption,
                credit: featuredImageCredit || 'Reprodução',
                position: index
              };
              
              console.log(`   ✅ Imagem ${index + 1} processada:`, imageData);
              return imageData;
            });
            
            console.log(`✅ Total de ${additionalImages.length} imagem(ns) processada(s)`);
          } else {
            console.warn('⚠️ Nenhuma URL válida encontrada em imagens_adicionais');
          }
        }
        // Se o campo existe mas não é array, avisar do erro
        else {
          console.error('❌ Campo imagens_adicionais tem formato inválido:', typeof rawImages, rawImages);
        }

        const articleData = {
          title: noticia.titulo,
          slug: finalSlug,
          content: finalContent,
          excerpt: noticia.resumo || undefined,
          category_id: categoryId,
          author_id: authorId,
          featured_image: featuredImage,
          featured_image_alt: featuredImageAlt,
          featured_image_credit: featuredImageCredit,
          source_url: noticia.fonte || undefined,
          meta_title: noticia.seo?.meta_titulo || noticia.titulo.substring(0, 80),
          meta_description: noticia.seo?.meta_descricao || noticia.resumo?.substring(0, 160) || undefined,
          meta_keywords: (() => {
            // Generate meta_keywords from SEO object or first 8 tags
            if (noticia.seo?.meta_keywords) {
              return Array.isArray(noticia.seo.meta_keywords) 
                ? noticia.seo.meta_keywords 
                : [noticia.seo.meta_keywords];
            }
            const tagsInput = noticia.tags;
            const tagsArray = typeof tagsInput === 'string' 
              ? tagsInput.split(',').map(t => t.trim()).filter(Boolean)
              : (Array.isArray(tagsInput) ? tagsInput : []);
            return tagsArray.slice(0, 8);
          })(),
          featured: isFeatured,
          status: "published" as const,
          published_at: new Date().toISOString(),
          tags: (() => {
            const tagsInput = noticia.tags;
            let processedTags = typeof tagsInput === 'string'
              ? tagsInput.split(',').map(t => t.trim()).filter(Boolean)
              : Array.isArray(tagsInput) 
                ? tagsInput 
                : [];

            // Completar até 12 se necessário
            const genericTags = ['Brasil', 'notícias', 'atualidades', 'informação', 'jornalismo'];
            while (processedTags.length < 12 && genericTags.length > 0) {
              const tag = genericTags.shift();
              if (tag && !processedTags.includes(tag)) {
                processedTags.push(tag);
              }
            }

            console.log(`📊 Tags processadas (${processedTags.length}):`, processedTags);

            return processedTags.slice(0, 12);
          })(),
        additional_images: additionalImages || []
      };

      console.log('✅ Status: PUBLICADO automaticamente');
      console.log('✅ Data de publicação:', new Date().toISOString());
      console.log(`✅ Artigo em destaque: ${isFeatured}`);

        // VALIDAÇÃO FINAL antes de criar artigo
        const validationErrors: string[] = [];

        if (!articleData.title || articleData.title.trim().length === 0) {
          validationErrors.push('Título vazio');
        }
        if (!articleData.content || articleData.content.trim().length < 10) {
          validationErrors.push('Conteúdo muito curto');
        }
        if (!articleData.category_id) {
          validationErrors.push('Categoria inválida');
        }
        if (!articleData.tags || articleData.tags.length !== 12) {
          validationErrors.push(`Tags inválidas (${articleData.tags?.length || 0}/12)`);
        }

        if (validationErrors.length > 0) {
          throw new Error(`Validação falhou: ${validationErrors.join(', ')}`);
        }

        console.log('✅ Validação final passou - criando artigo...');
        console.log('📝 Criando artigo...', {
          title: articleData.title,
          slug: articleData.slug,
          category_id: articleData.category_id,
          author_id: articleData.author_id,
          tags: articleData.tags.length
        });

        await createArticle.mutateAsync(articleData);
        console.log('✅ Artigo criado com sucesso!');

        importResults.push({
          success: true,
          title: noticia.titulo,
          slug: finalSlug
        });
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(`❌ Erro ao importar "${noticia.titulo}":`, errorMessage);
        console.error('Detalhes do erro:', error);
        
        importResults.push({
          success: false,
          title: noticia.titulo,
          error: errorMessage
        });
      }

      setProgress(((i + 1) / totalNews) * 100);
    }

    setResults(importResults);
    setImporting(false);

    const successCount = importResults.filter(r => r.success).length;
    const errorCount = importResults.filter(r => !r.success).length;
    const firstError = importResults.find(r => !r.success)?.error;

    console.log(`\n📊 Importação finalizada: ${successCount} sucesso, ${errorCount} erros`);

    toast({
      title: "Importação concluída",
      description: `${successCount} notícias importadas com sucesso. ${errorCount} erros.${firstError ? ` Primeiro erro: ${firstError}` : ''}`,
      variant: errorCount > 0 ? "destructive" : "default"
    });

    return { success: errorCount === 0, results: importResults };
  };

  return {
    importing,
    progress,
    results,
    validateJSON,
    importNews
  };
};
