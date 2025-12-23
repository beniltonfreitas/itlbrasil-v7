import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Twitter, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold">Instituto Tribuna Livre</h3>
              <p className="text-sm opacity-90">Jornalismo de Qualidade</p>
            </div>
            <p className="text-sm opacity-80 leading-relaxed">
              Portal de notícias com foco em geopolítica e análises aprofundadas 
              dos principais acontecimentos nacionais e internacionais.
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="sm" className="p-2 hover:bg-primary-light" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost" size="sm" className="p-2 hover:bg-primary-light" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost" size="sm" className="p-2 hover:bg-primary-light" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <Youtube className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost" size="sm" className="p-2 hover:bg-primary-light" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost" size="sm" className="p-2 hover:bg-primary-light" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Categorias</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/geopolitica" className="opacity-80 hover:opacity-100 transition-opacity">Geopolítica</Link></li>
              <li><Link to="/economia" className="opacity-80 hover:opacity-100 transition-opacity">Economia</Link></li>
              <li><Link to="/sociedade" className="opacity-80 hover:opacity-100 transition-opacity">Sociedade</Link></li>
              <li><Link to="/meio-ambiente" className="opacity-80 hover:opacity-100 transition-opacity">Meio Ambiente</Link></li>
              <li><Link to="/tecnologia" className="opacity-80 hover:opacity-100 transition-opacity">Tecnologia</Link></li>
              <li><Link to="/esportes" className="opacity-80 hover:opacity-100 transition-opacity">Esportes</Link></li>
              <li><Link to="/cultura" className="opacity-80 hover:opacity-100 transition-opacity">Cultura</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Links Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/sobre" className="opacity-80 hover:opacity-100 transition-opacity">Sobre Nós</Link></li>
              <li><Link to="/contato" className="opacity-80 hover:opacity-100 transition-opacity">Contato</Link></li>
              <li><Link to="/web-stories" className="opacity-80 hover:opacity-100 transition-opacity">Web Stories</Link></li>
              <li><Link to="/auth" className="opacity-80 hover:opacity-100 transition-opacity">Admin</Link></li>
              <li><a href="#" className="opacity-80 hover:opacity-100 transition-opacity">Política de Privacidade</a></li>
              <li><a href="#" className="opacity-80 hover:opacity-100 transition-opacity">Termos de Uso</a></li>
              <li><a href="#" className="opacity-80 hover:opacity-100 transition-opacity">Anuncie Conosco</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Newsletter</h4>
            <p className="text-sm opacity-80">
              Receba as principais notícias e análises diretamente no seu e-mail.
            </p>
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Seu e-mail"
                className="bg-primary-foreground text-foreground"
              />
              <Button className="w-full bg-accent hover:bg-accent/90">
                Assinar Newsletter
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-light/20 mt-12 pt-8 text-center">
          <p className="text-sm opacity-80">
            © 2024 Instituto Tribuna Livre - Jornalismo de Qualidade. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;