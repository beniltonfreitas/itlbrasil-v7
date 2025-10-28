import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export const Footer04: React.FC = () => {
  const { data: categories } = useCategories();
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({
        title: "Inscrição realizada!",
        description: "Você receberá nossas notícias em breve.",
      });
      setEmail('');
    }
  };

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: FaWhatsapp, href: '#', label: 'WhatsApp' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Youtube, href: '#', label: 'YouTube' },
  ];

  return (
    <footer className="bg-[#0D47A1] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Column 1 - Instituto Tribuna Livre */}
          <div>
            <div className="mb-4">
              <img 
                src="/Logo_ITL.png" 
                alt="Instituto Tribuna Livre" 
                className="h-12 w-auto mb-2"
              />
              <div className="text-sm font-semibold">Jornalismo de Qualidade</div>
            </div>
            <p className="text-sm text-white/80 mb-4">
              Portal de notícias independente dedicado a trazer informação de qualidade 
              sobre política, economia, sociedade e direitos humanos.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white/80 transition-colors"
                  aria-label={social.label}
                >
                  {typeof social.icon === 'function' && social.icon.name ? (
                    <social.icon className="h-5 w-5" />
                  ) : (
                    React.createElement(social.icon, { className: "h-5 w-5" })
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 - Categorias */}
          <div>
            <h3 className="text-lg font-bold mb-4">Categorias</h3>
            <ul className="space-y-2">
              {categories?.slice(0, 8).map((category) => (
                <li key={category.id}>
                  <Link
                    to={`/categoria/${category.slug}`}
                    className="text-sm text-white/80 hover:text-white transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Links Rápidos */}
          <div>
            <h3 className="text-lg font-bold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/sobre" className="text-sm text-white/80 hover:text-white transition-colors">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link to="/contato" className="text-sm text-white/80 hover:text-white transition-colors">
                  Contato
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-white/80 hover:text-white transition-colors">
                  Anuncie
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-white/80 hover:text-white transition-colors">
                  Política de Privacidade
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-white/80 hover:text-white transition-colors">
                  Termos de Uso
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-white/80 hover:text-white transition-colors">
                  Denúncia Climática
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4 - Newsletter */}
          <div>
            <h3 className="text-lg font-bold mb-4">Newsletter</h3>
            <p className="text-sm text-white/80 mb-4">
              Receba notícias e análises diretamente no seu e-mail
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <Input
                type="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
              <Button 
                type="submit"
                className="w-full bg-[#1565C0] hover:bg-[#1976D2] text-white"
              >
                Assinar Newsletter
              </Button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/20 pt-6 text-center">
          <p className="text-sm text-white/70">
            © 2024 Instituto Tribuna Livre - Jornalismo de Qualidade. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
