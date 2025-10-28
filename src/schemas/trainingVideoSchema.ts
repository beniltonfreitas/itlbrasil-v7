import { z } from 'zod';

// Schema base para vídeos de treinamento
export const trainingVideoSchema = z.object({
  title: z.string()
    .trim()
    .min(3, 'Título deve ter no mínimo 3 caracteres')
    .max(255, 'Título deve ter no máximo 255 caracteres'),
  
  url: z.string()
    .trim()
    .url('URL inválida'),
  
  description: z.string()
    .trim()
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .optional()
    .or(z.literal(''))
});

// Schema específico para YouTube
export const youtubeVideoSchema = trainingVideoSchema.extend({
  url: z.string()
    .trim()
    .url('URL inválida')
    .refine(
      (url) => /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)/.test(url),
      'URL deve ser do YouTube (youtube.com ou youtu.be)'
    )
});

// Schema específico para TikTok
export const tiktokVideoSchema = trainingVideoSchema.extend({
  url: z.string()
    .trim()
    .url('URL inválida')
    .refine(
      (url) => /tiktok\.com/.test(url),
      'URL deve ser do TikTok (tiktok.com)'
    )
});

// Schema específico para Instagram
export const instagramVideoSchema = trainingVideoSchema.extend({
  url: z.string()
    .trim()
    .url('URL inválida')
    .refine(
      (url) => /instagram\.com\/(?:reel|p|tv)/.test(url),
      'URL deve ser do Instagram (reel, post ou IGTV)'
    )
});

// Schema específico para Vimeo
export const vimeoVideoSchema = trainingVideoSchema.extend({
  url: z.string()
    .trim()
    .url('URL inválida')
    .refine(
      (url) => /vimeo\.com/.test(url),
      'URL deve ser do Vimeo (vimeo.com)'
    )
});

export type TrainingVideoFormData = z.infer<typeof trainingVideoSchema>;
