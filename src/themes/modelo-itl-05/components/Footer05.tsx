import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Twitter, Linkedin } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const footerSections = [
  {
    title: 'Notícias',
    links: [
      { name: 'Últimas Notícias', slug: 'ultimas-noticias' },
      { name: 'Política', slug: 'politica' },
      { name: 'Justiça', slug: 'justica' },
      { name: 'Internacional', slug: 'internacional' },
    ],
  },
  {
    title: 'Economia & Social',
    links: [
      { name: 'Economia', slug: 'economia' },
      { name: 'Direitos Humanos', slug: 'direitos-humanos' },
      { name: 'Educação', slug: 'educacao' },
      { name: 'Saúde', slug: 'saude' },
    ],
  },
  {
    title: 'Entretenimento',
    links: [
      { name: 'Esportes', slug: 'esportes' },
      { name: 'Geral', slug: 'geral' },
      { name: 'Web Stories', slug: '/web-stories' },
      { name: 'Transmissão Ao Vivo', slug: '/transmissao-ao-vivo' },
    ],
  },
  {
    title: 'Institucional',
    links: [
      { name: 'Sobre Nós', slug: '/sobre' },
      { name: 'Contato', slug: '/contato' },
      { name: 'Política de Privacidade', slug: '/politica-privacidade' },
      { name: 'Termos de Uso', slug: '/termos-uso' },
    ],
  },
];

const socialLinks = [
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
];

export const Footer05: React.FC = () => {
  const { settings } = useSiteSettings();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted border-t">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-bold text-lg mb-4 text-foreground">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.slug}>
                    <Link
                      to={link.slug.startsWith('/') ? link.slug : `/categoria/${link.slug}`}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social Media & Logo */}
        <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src={settings.logo_url || '/Logo_ITL.png'}
              alt={typeof settings.site_name === 'string' ? settings.site_name : 'Instituto Tribuna Livre'}
              className="h-10 object-contain"
            />
            <div className="flex flex-col">
              <span className="font-bold text-lg">
                {typeof settings.site_name === 'string' ? settings.site_name : 'Instituto Tribuna Livre'}
              </span>
              <span className="text-xs text-muted-foreground">
                {typeof settings.site_tagline === 'string' ? settings.site_tagline : 'Jornalismo de Qualidade'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>
            © {currentYear} {typeof settings.site_name === 'string' ? settings.site_name : 'Instituto Tribuna Livre'}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
