import { z } from "zod";

// Schema definitions
const ImageObjectSchema = z.object({
  hero: z.string().url().startsWith("https://"),
  og: z.string().url().startsWith("https://"),
  card: z.string().url().startsWith("https://"),
  alt: z.string().min(3),
  credito: z.string().min(2)
});

const ImageSchema = z.union([
  z.string().url().startsWith("https://"),
  ImageObjectSchema
]);

const SeoSchema = z.object({
  meta_titulo: z.string().min(1).max(60),
  meta_descricao: z.string().min(1).max(160)
});

const NoticiaSchema = z.object({
  categoria: z.string().min(2),
  titulo: z.string().min(5),
  slug: z.string().min(3),
  resumo: z.string().min(10).max(160),
  conteudo: z.string().min(10),
  fonte: z.string().url().startsWith("https://"),
  imagem: ImageSchema,
  imagem_alt: z.string().optional(),
  imagem_credito: z.string().optional(),
  featured: z.boolean().optional(),
  tags: z.array(z.string().min(2)).length(12),
  seo: SeoSchema
});

const BulkImportSchema = z.object({
  noticias: z.array(NoticiaSchema).min(1)
});

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  message: string;
  newsIndex?: number;
}

export interface ValidationReport {
  valid: boolean;
  totalNews: number;
  issues: ValidationIssue[];
  categories: string[];
  tagStats: { min: number; max: number; avg: number };
}

export const validateBulkImportJSON = (jsonInput: string): {
  success: boolean;
  data?: any;
  error?: string;
  report: ValidationReport;
} => {
  const report: ValidationReport = {
    valid: true,
    totalNews: 0,
    issues: [],
    categories: [],
    tagStats: { min: 12, max: 0, avg: 0 }
  };

  try {
    const parsed = JSON.parse(jsonInput);
    
    // Validate structure
    const validated = BulkImportSchema.parse(parsed);
    report.totalNews = validated.noticias.length;

    const validCategories = [
      "Política", "Economia", "Tecnologia", "Esportes", "Cultura",
      "Saúde", "Educação", "Internacional", "Opinião", "Geral",
      "Segurança", "Meio Ambiente"
    ];

    const categoriesSet = new Set<string>();
    let totalTags = 0;

    validated.noticias.forEach((noticia, idx) => {
      categoriesSet.add(noticia.categoria);
      
      // Validate category
      if (!validCategories.includes(noticia.categoria)) {
        report.issues.push({
          severity: 'error',
          message: `Categoria "${noticia.categoria}" inválida. Use: ${validCategories.join(', ')}`,
          newsIndex: idx
        });
        report.valid = false;
      }
      
      // Validate tags count
      const tagCount = noticia.tags?.length || 0;
      totalTags += tagCount;
      
      if (tagCount !== 12) {
        report.issues.push({
          severity: tagCount < 12 ? 'error' : 'warning',
          message: `${tagCount} tags encontradas (esperado: exatamente 12) - "${noticia.titulo}"`,
          newsIndex: idx
        });
        if (tagCount < 12) report.valid = false;
      }
      
      // Validate image HTTPS
      if (typeof noticia.imagem === 'string' && !noticia.imagem.startsWith('https://')) {
        report.issues.push({
          severity: 'error',
          message: `URL de imagem não usa HTTPS - "${noticia.titulo}"`,
          newsIndex: idx
        });
        report.valid = false;
      } else if (typeof noticia.imagem === 'object') {
        const imgObj = noticia.imagem as any;
        if (!imgObj.hero?.startsWith('https://') || !imgObj.og?.startsWith('https://') || !imgObj.card?.startsWith('https://')) {
          report.issues.push({
            severity: 'error',
            message: `Todas as URLs de imagem devem usar HTTPS - "${noticia.titulo}"`,
            newsIndex: idx
          });
          report.valid = false;
        }
      }
      
      // Validate SEO limits
      if (noticia.seo?.meta_titulo && noticia.seo.meta_titulo.length > 60) {
        report.issues.push({
          severity: 'warning',
          message: `Meta título com ${noticia.seo.meta_titulo.length} chars (máx: 60) - "${noticia.titulo}"`,
          newsIndex: idx
        });
      }
      
      if (noticia.seo?.meta_descricao && noticia.seo.meta_descricao.length > 160) {
        report.issues.push({
          severity: 'warning',
          message: `Meta descrição com ${noticia.seo.meta_descricao.length} chars (máx: 160) - "${noticia.titulo}"`,
          newsIndex: idx
        });
      }

      // Validate resumo length
      if (noticia.resumo && noticia.resumo.length > 160) {
        report.issues.push({
          severity: 'warning',
          message: `Resumo com ${noticia.resumo.length} chars (máx: 160) - "${noticia.titulo}"`,
          newsIndex: idx
        });
      }

      // Validate content is HTML
      if (!noticia.conteudo.includes('<') || !noticia.conteudo.includes('>')) {
        report.issues.push({
          severity: 'warning',
          message: `Conteúdo não parece ser HTML - "${noticia.titulo}"`,
          newsIndex: idx
        });
      }
    });

    report.categories = Array.from(categoriesSet);
    report.tagStats = {
      min: Math.min(...validated.noticias.map(n => n.tags.length)),
      max: Math.max(...validated.noticias.map(n => n.tags.length)),
      avg: Math.round(totalTags / validated.noticias.length)
    };

    if (report.issues.length === 0) {
      report.issues.push({
        severity: 'info',
        message: `✅ JSON válido! ${report.totalNews} notícia(s) pronta(s) para importar.`
      });
    }

    return { success: true, data: validated, report };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(e => ({
        severity: 'error' as const,
        message: `Campo ${e.path.join('.')}: ${e.message}`
      }));
      report.valid = false;
      report.issues = errorMessages;
      return { 
        success: false, 
        error: 'Erros de validação encontrados', 
        report
      };
    }
    
    if (error instanceof SyntaxError) {
      report.valid = false;
      report.issues = [{
        severity: 'error',
        message: `JSON inválido: ${error.message}`
      }];
      return { success: false, error: 'JSON malformado', report };
    }

    report.valid = false;
    report.issues = [{
      severity: 'error',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }];
    return { success: false, error: 'Erro ao validar JSON', report };
  }
};
