import DOMPurify, { Config } from 'dompurify';

interface SafeHTMLProps {
  html: string;
  className?: string;
  tag?: keyof JSX.IntrinsicElements;
  allowedTags?: string[];
  allowedAttributes?: string[];
}

export const SafeHTML: React.FC<SafeHTMLProps> = ({
  html,
  className = '',
  tag: Tag = 'div',
  allowedTags,
  allowedAttributes
}) => {
  // Configure DOMPurify with security-first defaults
  const config: Config = {
    ALLOWED_TAGS: allowedTags || [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre',
      'div', 'span', 'b', 'i', 's', 'strike', 'del', 'ins',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'figure', 'figcaption', 'hr', 'sub', 'sup'
    ],
    ALLOWED_ATTR: allowedAttributes || [
      'href', 'target', 'rel', 'src', 'alt', 'title', 'class',
      'width', 'height', 'id', 'align', 'colspan', 'rowspan'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ADD_ATTR: ['target', 'rel'],
    FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'button', 'style'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style'],
    KEEP_CONTENT: true,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM: false,
    SANITIZE_DOM: true
  };

  // Convert citation patterns to blockquotes
  const convertCitationsToBlockquotes = (content: string): string => {
    let processed = content;
    
    // Pattern 1: Text in quotes followed by attribution (e.g., "Texto aqui", disse João Silva)
    processed = processed.replace(
      /<p>\s*[""]([^""]+)[""]\s*,?\s*(disse|afirmou|declarou|explicou|ressaltou|destacou|comentou|observou|pontuou|acrescentou|completou|concluiu|informou|revelou|contou|lembrou|alertou|avaliou|analisou|argumentou|defendeu|criticou|elogiou|questionou|respondeu|garantiu|prometeu|admitiu|reconheceu|confessou|negou|confirmou)\s+([^<]+)<\/p>/gi,
      '<blockquote><p>"$1"</p><cite>— $3</cite></blockquote>'
    );
    
    // Pattern 2: Quote with source in parentheses
    processed = processed.replace(
      /<p>\s*[""]([^""]+)[""]\s*\(([^)]+)\)\s*<\/p>/gi,
      '<blockquote><p>"$1"</p><cite>— $2</cite></blockquote>'
    );
    
    // Pattern 3: Para/Segundo attribution followed by quote
    processed = processed.replace(
      /<p>\s*(Para|Segundo|De acordo com|Conforme|Na visão de|Na opinião de)\s+([^,]+),\s*[""]([^""]+)[""]\s*\.?\s*<\/p>/gi,
      '<blockquote><p>"$3"</p><cite>— $2</cite></blockquote>'
    );
    
    return processed;
  };

  // Normalize content: convert plain text to paragraphs, clean up HTML
  const normalizeContent = (content: string): string => {
    // Remove inline styles
    let normalized = content.replace(/\s*style\s*=\s*["'][^"']*["']/gi, '');
    
    // Clean multiple <br> tags (keep max 1)
    normalized = normalized.replace(/(<br\s*\/?>[\s\n]*){2,}/gi, '</p><p>');
    
    // Remove <br> before block element close tags
    normalized = normalized.replace(/<br\s*\/?>\s*<\/(p|h1|h2|h3|h4|h5|h6|div|blockquote)>/gi, '</$1>');
    
    // Remove <br> after block element open tags
    normalized = normalized.replace(/<(p|h1|h2|h3|h4|h5|h6|div|blockquote)([^>]*)>\s*<br\s*\/?>/gi, '<$1$2>');
    
    // Remove <br> between block elements
    normalized = normalized.replace(/<\/(p|h1|h2|h3|h4|h5|h6|div|blockquote)>\s*<br\s*\/?>\s*<(p|h1|h2|h3|h4|h5|h6|div|blockquote)/gi, '</$1><$2');
    
    // If content has no block elements, wrap in paragraphs
    const hasBlockElements = /<(p|h1|h2|h3|h4|h5|h6|div|blockquote|ul|ol|figure|table)/i.test(normalized);
    
    if (!hasBlockElements && normalized.trim()) {
      // Split by double newlines and wrap each in <p>
      const paragraphs = normalized
        .split(/\n\s*\n/)
        .map(p => p.trim())
        .filter(p => p.length > 0)
        .map(p => `<p>${p.replace(/\n/g, ' ')}</p>`)
        .join('');
      
      normalized = paragraphs || `<p>${normalized}</p>`;
    }
    
    // Clean up empty paragraphs
    normalized = normalized.replace(/<p>\s*<\/p>/gi, '');
    normalized = normalized.replace(/<p>\s*<br\s*\/?>\s*<\/p>/gi, '');
    
    // Convert citation patterns to blockquotes
    normalized = convertCitationsToBlockquotes(normalized);
    
    return normalized;
  };

  // Add security attributes to external links
  const processLinks = (htmlContent: string): string => {
    return htmlContent.replace(
      /<a\s+([^>]*href=["']https?:\/\/[^"']*["'][^>]*)>/gi,
      '<a $1 target="_blank" rel="noopener noreferrer">'
    );
  };

  const normalizedHTML = normalizeContent(html);
  const sanitizedHTML = processLinks(DOMPurify.sanitize(normalizedHTML, config) as string);

  return (
    <Tag 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  );
};

export default SafeHTML;
