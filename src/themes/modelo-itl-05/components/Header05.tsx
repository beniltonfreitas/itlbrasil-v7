import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FinancialWidget } from '@/components/widgets/FinancialWidget';
import { WeatherWidget } from '@/components/widgets/WeatherWidget';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const categories = [
  { name: 'Últimas Notícias', slug: 'ultimas-noticias' },
  { name: 'Internacional', slug: 'internacional' },
  { name: 'Direitos Humanos', slug: 'direitos-humanos' },
  { name: 'Economia', slug: 'economia' },
  { name: 'Educação', slug: 'educacao' },
  { name: 'Esportes', slug: 'esportes' },
  { name: 'Geral', slug: 'geral' },
  { name: 'Justiça', slug: 'justica' },
  { name: 'Política', slug: 'politica' },
  { name: 'Saúde', slug: 'saude' },
];

export const Header05: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const { settings } = useSiteSettings();

  const isActive = (slug: string) => location.pathname.includes(slug);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="bg-background border-b sticky top-0 z-40 shadow-sm">
      {/* Top Bar with Financial & Weather */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <FinancialWidget />
            <WeatherWidget />
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <img 
              src={settings.logo_url || '/Logo_ITL.png'} 
              alt={typeof settings.site_name === 'string' ? settings.site_name : 'Instituto Tribuna Livre'} 
              className="h-12 object-contain"
            />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-foreground leading-none">
                {typeof settings.site_name === 'string' ? settings.site_name : 'Instituto Tribuna Livre'}
              </span>
              <span className="text-xs text-muted-foreground mt-0.5">
                {typeof settings.site_tagline === 'string' ? settings.site_tagline : 'Jornalismo de Qualidade'}
              </span>
            </div>
          </Link>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Input
                type="search"
                placeholder="Buscar notícias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
              <Button 
                type="submit" 
                size="sm" 
                variant="ghost" 
                className="absolute right-1 top-1/2 -translate-y-1/2"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="border-t bg-muted/20 hidden lg:block">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-1 py-2 flex-wrap">
            {categories.map((category) => (
              <Link
                key={category.slug}
                to={`/categoria/${category.slug}`}
                className={`px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                  isActive(category.slug)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted hover:text-primary'
                }`}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t bg-background absolute top-full left-0 right-0 shadow-lg">
          <div className="container mx-auto px-4 py-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Buscar notícias..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  variant="ghost" 
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>

            {/* Mobile Navigation */}
            <div className="flex flex-col gap-1">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  to={`/categoria/${category.slug}`}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 text-sm font-medium transition-colors rounded-md ${
                    isActive(category.slug)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
