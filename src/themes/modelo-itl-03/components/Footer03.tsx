import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Twitter, Linkedin } from 'lucide-react';

export const Footer03: React.FC = () => {
  const footerSections = [
    {
      title: 'NEWS',
      links: [
        { name: 'Política', path: '/categoria/politica' },
        { name: 'Economia', path: '/categoria/economia' },
        { name: 'Internacional', path: '/categoria/internacional' },
        { name: 'Nacional', path: '/categoria/nacional' },
      ]
    },
    {
      title: 'ESPORTES',
      links: [
        { name: 'Futebol', path: '/categoria/futebol' },
        { name: 'Basquete', path: '/categoria/basquete' },
        { name: 'Olimpíadas', path: '/categoria/olimpiadas' },
        { name: 'Tênis', path: '/categoria/tenis' },
      ]
    },
    {
      title: 'VIDA',
      links: [
        { name: 'Saúde', path: '/categoria/saude' },
        { name: 'Entretenimento', path: '/categoria/entretenimento' },
        { name: 'Cultura', path: '/categoria/cultura' },
        { name: 'Estilo', path: '/categoria/estilo' },
      ]
    },
    {
      title: 'TECH',
      links: [
        { name: 'Tecnologia', path: '/categoria/tecnologia' },
        { name: 'Inovação', path: '/categoria/inovacao' },
        { name: 'Ciência', path: '/categoria/ciencia' },
        { name: 'Gadgets', path: '/categoria/gadgets' },
      ]
    },
    {
      title: 'MONEY',
      links: [
        { name: 'Mercados', path: '/categoria/mercados' },
        { name: 'Negócios', path: '/categoria/negocios' },
        { name: 'Investimentos', path: '/categoria/investimentos' },
        { name: 'Finanças', path: '/categoria/financas' },
      ]
    },
    {
      title: 'SOBRE',
      links: [
        { name: 'Sobre Nós', path: '/sobre' },
        { name: 'Contato', path: '/contato' },
        { name: 'Anuncie', path: '/contato' },
        { name: 'Termos de Uso', path: '/sobre' },
      ]
    },
  ];

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Youtube, href: 'https://youtube.com', label: 'Youtube' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-[#1a1a1a] text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        {/* Logo and Social */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 pb-8 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3 mb-6 md:mb-0">
            <img 
              src="/Logo_ITL.png" 
              alt="Instituto Tribuna Livre" 
              className="h-16 w-auto object-contain"
            />
            <div>
              <div className="text-3xl font-bold tracking-tight">Instituto Tribuna Livre</div>
              <div className="text-xs text-white/60 uppercase tracking-wider">Jornalismo de Qualidade</div>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#0066CC] flex items-center justify-center transition-colors"
                aria-label={social.label}
              >
                <social.icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Footer Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-[#0066CC]">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-white/10 text-center">
          <p className="text-sm text-white/60">
            &copy; {new Date().getFullYear()} Instituto Tribuna Livre - Jornalismo de Qualidade. Todos os direitos reservados.
          </p>
          <p className="text-xs text-white/40 mt-2">
            Notícias internacionais, economia, política e muito mais.
          </p>
        </div>
      </div>
    </footer>
  );
};
