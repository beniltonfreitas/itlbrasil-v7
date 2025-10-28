import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InfoBar } from '@/components/widgets/InfoBar';

export const Header03: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/categoria/todas?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const categories = [
    { name: 'NEWS', path: '/categoria/todas' },
    { name: 'POLÍTICA', path: '/categoria/politica' },
    { name: 'ECONOMIA', path: '/categoria/economia' },
    { name: 'ESPORTES', path: '/categoria/esportes' },
    { name: 'TECNOLOGIA', path: '/categoria/tecnologia' },
    { name: 'MUNDO', path: '/categoria/internacional' },
  ];

  return (
    <header className="bg-[#2c2c2c] text-white sticky top-0 z-50">
      {/* Info Bar - Weather & Financial */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 py-2">
          <InfoBar className="text-white/80 text-xs" />
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/Logo_ITL.png" 
              alt="Instituto Tribuna Livre" 
              className="h-12 w-auto"
            />
            <div className="hidden md:block">
              <div className="text-2xl font-bold tracking-tight">Instituto Tribuna Livre</div>
              <div className="text-xs text-white/60 uppercase tracking-wider">Jornalismo de Qualidade</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {categories.map((category) => (
              <Link
                key={category.path}
                to={category.path}
                className="px-4 py-2 text-sm font-semibold uppercase tracking-wide hover:bg-white/10 transition-colors rounded"
              >
                {category.name}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2">
            <div className="relative">
              <Input
                type="text"
                placeholder="Buscar notícias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-10"
              />
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              >
                <Search className="h-4 w-4 text-white/60" />
              </Button>
            </div>
          </form>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden pb-4 border-t border-white/10 mt-2 pt-4">
            <nav className="flex flex-col gap-2">
              {categories.map((category) => (
                <Link
                  key={category.path}
                  to={category.path}
                  className="px-4 py-2 text-sm font-semibold uppercase hover:bg-white/10 transition-colors rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
            </nav>
            <form onSubmit={handleSearch} className="mt-4 px-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Buscar notícias..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-10"
                />
                <Button
                  type="submit"
                  size="icon"
                  variant="ghost"
                  className="absolute right-0 top-0 h-full px-3"
                >
                  <Search className="h-4 w-4 text-white/60" />
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </header>
  );
};
