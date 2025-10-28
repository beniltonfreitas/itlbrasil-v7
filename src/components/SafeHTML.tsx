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
      'width', 'height', 'style', 'id', 'align', 'colspan', 'rowspan'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ADD_ATTR: ['target', 'rel'],
    FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    KEEP_CONTENT: true,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM: false,
    SANITIZE_DOM: true
  };

  // Clean multiple <br> tags and <br> around block elements
  const cleanHTML = (html: string): string => {
    return html
      // Remove múltiplos <br> consecutivos (mantém apenas 1)
      .replace(/(<br\s*\/?>[\s\n]*){2,}/gi, '<br>')
      // Remove <br> antes de tags de fechamento de bloco
      .replace(/<br\s*\/?>\s*<\/(p|h1|h2|h3|h4|h5|h6|div|blockquote)>/gi, '</$1>')
      // Remove <br> depois de tags de abertura de bloco
      .replace(/<(p|h1|h2|h3|h4|h5|h6|div|blockquote)([^>]*)>\s*<br\s*\/?>/gi, '<$1$2>')
      // Remove <br> entre tags de bloco
      .replace(/<\/(p|h1|h2|h3|h4|h5|h6|div|blockquote)>\s*<br\s*\/?>\s*<(p|h1|h2|h3|h4|h5|h6|div|blockquote)/gi, '</$1><$2>');
  };

  // Add security attributes to external links
  const processLinks = (htmlContent: string): string => {
    return htmlContent.replace(
      /<a\s+([^>]*href=["']https?:\/\/[^"']*["'][^>]*)>/gi,
      '<a $1 target="_blank" rel="noopener noreferrer">'
    );
  };

  const sanitizedHTML = processLinks(DOMPurify.sanitize(cleanHTML(html), config) as string);

  return (
    <Tag 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  );
};

export default SafeHTML;