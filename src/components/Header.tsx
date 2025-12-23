import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Search, Bell, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InfoBar } from "@/components/widgets/InfoBar";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { JornalistaPro } from "@/components/JornalistaPro";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isJornalistaProOpen, setIsJornalistaProOpen] = useState(false);
  const location = useLocation();
  const { settings } = useSiteSettings();

  const categories = [
    { name: "Últimas Notícias", path: "/" },
    { name: "Internacional", path: "/categoria/internacional" },
    { name: "Direitos Humanos", path: "/categoria/direitos-humanos" },
    { name: "Economia", path: "/categoria/economia" },
    { name: "Educação", path: "/categoria/educacao" },
    { name: "Esportes", path: "/categoria/esportes" },
    { name: "Geral", path: "/categoria/geral" },
    { name: "Justiça", path: "/categoria/justica" },
    { name: "Política", path: "/categoria/politica" },
    { name: "Saúde", path: "/categoria/saude" },
    { name: "Web Stories", path: "/web-stories" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-background border-b-2 border-primary sticky top-0 z-50">
      {/* Breaking News Bar */}
      <div className="bg-blue-600 text-white py-2">
        <div className="container mx-auto px-4 flex items-center space-x-4 overflow-hidden">
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Bell className="h-4 w-4" />
            <span className="font-semibold text-sm">ÚLTIMA HORA:</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm animate-scroll-left whitespace-nowrap">
              Desenvolvimentos importantes na geopolítica internacional - Acompanhe as análises em tempo real • Notícias atualizadas em tempo real • Cobertura completa dos principais acontecimentos
            </p>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src={settings.logo_url || "/Logo_ITL.png"} 
              alt="Instituto Tribuna Livre - Jornalismo de Qualidade"
              className="h-12 md:h-16 w-auto"
              onError={(e) => {
                e.currentTarget.src = "/Logo_ITL.png";
              }}
            />
            <div className="hidden sm:block">
              <div className="text-primary font-bold text-xl md:text-2xl">
                Instituto Tribuna Livre
              </div>
              <div className="text-xs text-muted-foreground font-normal">
                Jornalismo de Qualidade
              </div>
            </div>
          </Link>

          {/* Info Bar - Desktop */}
          <div className="hidden xl:block">
            <InfoBar />
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="border-t border-border">
        <div className="container mx-auto px-4">
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-between py-3">
            <div className="flex items-center space-x-8">
              {categories.map((category) => (
                <Link
                  key={category.path}
                  to={category.path}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive(category.path)
                      ? "text-primary border-b-2 border-primary pb-1"
                      : "text-foreground"
                  }`}
                >
                  {category.name}
                </Link>
              ))}
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  className="pl-10 w-64"
                />
              </div>
              <Button size="sm" className="bg-primary hover:bg-primary-dark">
                Newsletter
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden py-4 space-y-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar notícias..."
                  className="pl-10"
                />
              </div>
              
              <Button
                variant="outline"
                className="w-full justify-start gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10"
                onClick={() => {
                  setIsJornalistaProOpen(true);
                  setIsMenuOpen(false);
                }}
              >
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="font-semibold text-primary">Jornalista Pró</span>
              </Button>

              {categories.map((category) => (
                <Link
                  key={category.path}
                  to={category.path}
                  className={`block py-2 text-sm font-medium transition-colors ${
                    isActive(category.path)
                      ? "text-primary font-semibold"
                      : "text-foreground hover:text-primary"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
              
              <div className="border-t border-border pt-4 space-y-2">
                <Button size="sm" className="w-full bg-primary hover:bg-primary-dark mt-2">
                  Newsletter
                </Button>
              </div>

              {/* Mobile Info */}
              <div className="border-t border-border pt-4 mb-4">
                <InfoBar className="text-xs justify-center" />
              </div>
            </div>
          )}
        </div>
      </nav>

      <JornalistaPro open={isJornalistaProOpen} onOpenChange={setIsJornalistaProOpen} />
    </header>
  );
};

export default Header;