import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, X, User, Bell } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { FinancialWidget } from '@/components/widgets/FinancialWidget';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const Header04: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: categories } = useCategories();

  const mainCategories = categories?.slice(0, 10) || [];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Main Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 flex-shrink-0">
              <img 
                src="/Logo_ITL.png" 
                alt="Instituto Tribuna Livre" 
                className="h-12 w-auto"
              />
              <div className="hidden md:block">
                <div className="text-2xl font-bold text-primary">Instituto Tribuna Livre</div>
                <div className="text-xs text-muted-foreground">Jornalismo de Qualidade</div>
              </div>
            </Link>

            {/* Financial Indicators */}
            <div className="hidden lg:flex items-center flex-1 justify-center">
              <FinancialWidget />
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="hidden md:flex">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hidden md:flex">
                <User className="h-5 w-5" />
              </Button>
              <Button 
                className="hidden md:flex bg-[#1565C0] hover:bg-[#0D47A1] text-white"
                size="sm"
              >
                Newsletter
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X /> : <Menu />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="border-b bg-white">
        <div className="container mx-auto px-4">
          <div className="hidden md:flex items-center justify-between py-3">
            <div className="flex items-center gap-6 flex-wrap">
              <Link 
                to="/" 
                className="text-sm font-semibold hover:text-[#1565C0] transition-colors"
              >
                Últimas Notícias
              </Link>
              {mainCategories.map((category) => (
                <Link
                  key={category.id}
                  to={`/categoria/${category.slug}`}
                  className="text-sm font-semibold hover:text-[#1565C0] transition-colors"
                >
                  {category.name}
                </Link>
              ))}
            </div>
            
            {/* Search */}
            <div className="flex items-center gap-2">
              <Input
                type="search"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48"
              />
              <Button size="icon" variant="ghost">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 space-y-2">
              <Link 
                to="/" 
                className="block py-2 text-sm font-semibold hover:text-[#1565C0]"
                onClick={() => setIsMenuOpen(false)}
              >
                Últimas Notícias
              </Link>
              {mainCategories.map((category) => (
                <Link
                  key={category.id}
                  to={`/categoria/${category.slug}`}
                  className="block py-2 text-sm font-semibold hover:text-[#1565C0]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
              <div className="pt-4 border-t">
                <Input
                  type="search"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};
