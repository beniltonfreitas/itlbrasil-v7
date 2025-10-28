import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Youtube, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { NewsletterSignup } from '@/components/NewsletterSignup';

export const Footer02: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'YouTube' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' }
  ];

  const categories = [
    { name: 'Política', href: '/category/politica' },
    { name: 'Economia', href: '/category/economia' },
    { name: 'Esportes', href: '/category/esportes' },
    { name: 'Saúde', href: '/category/saude' },
    { name: 'Tecnologia', href: '/category/tecnologia' }
  ];

  const quickLinks = [
    { name: 'Quem Somos', href: '/sobre' },
    { name: 'Contato', href: '/contato' },
    { name: 'Política de Privacidade', href: '/privacidade' },
    { name: 'Termos de Uso', href: '/termos' },
    { name: 'RSS', href: '/rss' }
  ];

  return (
    <footer className="bg-blue-600 text-white mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="text-2xl font-bold">Instituto Tribuna Livre</div>
            <p className="text-blue-100 text-sm leading-relaxed">
              Portal de notícias com informações atualizadas sobre política, economia, 
              esportes e muito mais. Conectando você ao que acontece no Brasil e no mundo.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <Link
                  key={label}
                  to={href}
                  className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors"
                  aria-label={label}
                >
                  <Icon size={16} />
                </Link>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Categorias</h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.name}>
                  <Link
                    to={category.href}
                    className="text-blue-100 hover:text-white transition-colors text-sm"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Links Rápidos</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-blue-100 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Newsletter</h3>
            <p className="text-blue-100 text-sm">
              Receba as principais notícias direto no seu email.
            </p>
            <div className="bg-blue-500 p-4 rounded-lg">
              <NewsletterSignup />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 pt-6 border-t border-blue-500">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6">
              <div className="flex items-center space-x-2 text-sm text-blue-100">
                <Mail size={14} />
                <span>contato@itlbrasil.com.br</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-blue-100">
                <Phone size={14} />
                <span>(63) 3000-0000</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-blue-100">
                <MapPin size={14} />
                <span>Palmas, Tocantins</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-blue-500 text-center">
          <p className="text-blue-100 text-sm">
            © {currentYear} Instituto Tribuna Livre - Jornalismo de Qualidade. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};