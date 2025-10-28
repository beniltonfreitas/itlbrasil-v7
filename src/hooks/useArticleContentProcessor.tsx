import { useMemo } from "react";

export const useArticleContentProcessor = (htmlContent: string) => {
  return useMemo(() => {
    if (!htmlContent) return { parts: [htmlContent], positions: [] };

    // Split content by paragraphs to find insertion points
    const paragraphs = htmlContent.split(/(<\/p>)/i);
    const totalParagraphs = paragraphs.filter(p => p.toLowerCase() === '</p>').length;
    
    // Calculate positions for WhatsApp CTA (at 25%, 50%, 75% of content)
    const positions = [];
    const intervals = [0.25, 0.5, 0.75];
    
    for (const interval of intervals) {
      const targetParagraph = Math.floor(totalParagraphs * interval);
      if (targetParagraph > 0) {
        positions.push(targetParagraph);
      }
    }

    // Split content into parts for rendering with CTAs
    const parts: string[] = [];
    let currentPart = '';
    let paragraphCount = 0;
    let partIndex = 0;
    
    for (let i = 0; i < paragraphs.length; i++) {
      currentPart += paragraphs[i];
      
      if (paragraphs[i].toLowerCase() === '</p>') {
        paragraphCount++;
        
        if (positions.includes(paragraphCount)) {
          parts.push(currentPart);
          currentPart = '';
          partIndex++;
        }
      }
    }
    
    // Add remaining content
    if (currentPart) {
      parts.push(currentPart);
    }

    return { parts: parts.length > 0 ? parts : [htmlContent], positions };
  }, [htmlContent]);
};
