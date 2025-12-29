import React from 'react';

interface SkipLink {
  href: string;
  label: string;
}

const defaultLinks: SkipLink[] = [
  { href: '#main-content', label: 'Pular para conteúdo principal' },
  { href: '#navigation', label: 'Pular para navegação' },
  { href: '#footer', label: 'Pular para rodapé' },
];

interface SkipLinksProps {
  links?: SkipLink[];
}

export const SkipLinks: React.FC<SkipLinksProps> = ({ links = defaultLinks }) => {
  return (
    <nav 
      aria-label="Links de navegação rápida" 
      className="skip-links"
    >
      {links.map((link, index) => (
        <a
          key={index}
          href={link.href}
          className="skip-link sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all"
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
};

export default SkipLinks;
