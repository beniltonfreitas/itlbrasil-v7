/**
 * Text utility functions for content processing
 */

/**
 * Strip HTML tags from a string
 */
export const stripHtml = (html: string): string => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

/**
 * Calculate reading time in minutes
 * Based on average reading speed of 200 words per minute
 */
export const calculateReadTime = (html: string): number => {
  const text = stripHtml(html);
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
};

/**
 * Truncate text to a specific length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Generate excerpt from HTML content
 */
export const generateExcerpt = (html: string, maxLength: number = 160): string => {
  const text = stripHtml(html);
  return truncateText(text, maxLength);
};

/**
 * Count words in HTML content
 */
export const countWords = (html: string): number => {
  const text = stripHtml(html);
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

/**
 * Count characters in HTML content (excluding tags)
 */
export const countCharacters = (html: string): number => {
  return stripHtml(html).length;
};

/**
 * Remove WhatsApp CTA duplicates from article content
 * Removes paragraphs and links containing WhatsApp channel URLs
 */
export const removeWhatsAppCTA = (htmlContent: string): string => {
  if (!htmlContent) return htmlContent;
  
  // Remove parágrafos completos contendo links do WhatsApp
  let cleaned = htmlContent.replace(
    /<p[^>]*>.*?https:\/\/whatsapp\.com\/channel\/[^<]*<\/p>/gi,
    ''
  );
  
  // Remove links diretos do WhatsApp que possam ter sobrado
  cleaned = cleaned.replace(
    /<a[^>]*href=["']https:\/\/whatsapp\.com\/channel\/[^"']*["'][^>]*>.*?<\/a>/gi,
    ''
  );
  
  // Remove textos relacionados que possam ter ficado órfãos
  cleaned = cleaned.replace(
    /<p[^>]*>\s*>>\s*Siga o canal.*?WhatsApp.*?<\/p>/gi,
    ''
  );
  
  // Remove múltiplas quebras de linha consecutivas
  cleaned = cleaned.replace(/(<br\s*\/?>){3,}/gi, '<br><br>');
  
  // Remove parágrafos vazios
  cleaned = cleaned.replace(/<p[^>]*>\s*<\/p>/gi, '');
  
  return cleaned.trim();
};
