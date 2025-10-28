import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X, Facebook, Twitter, Youtube } from 'lucide-react';
import { InfoBar } from '@/components/widgets/InfoBar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const Header02: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();

  const categories = [
    { name: 'ÚLTIMAS NOTÍCIAS', path: '/', color: 'text-blue-400' },
    { name: 'INTERNACIONAL', path: '/categoria/internacional' },
    { name: 'DIREITOS HUMANOS', path: '/categoria/direitos-humanos' },
    { name: 'ECONOMIA', path: '/categoria/economia' },
    { name: 'EDUCAÇÃO', path: '/categoria/educacao' },
    { name: 'ESPORTES', path: '/categoria/esportes' },
    { name: 'GERAL', path: '/categoria/geral' },
    { name: 'JUSTIÇA', path: '/categoria/justica' },
    { name: 'POLÍTICA', path: '/categoria/politica' },
    { name: 'SAÚDE', path: '/categoria/saude' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    return location.pathname.startsWith(path) && path !== '/';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      console.log('Searching for:', searchTerm);
    }
  };

  return (
    <header className="w-full">
      {/* Top Bar - Blue */}
      <div className="bg-blue-500 text-white px-4 py-2">
        <div className="container mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center gap-4">
            <span>Palmas - 25 de setembro de 2025</span>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <Link to="/politica-privacidade" className="hover:text-blue-200 transition-colors">Política de privacidade</Link>
          </div>
        </div>
      </div>

      {/* Main Header - White */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex-1 md:flex-none">
              <Link to="/" className="flex items-center gap-3">
                <img 
                  src="/Logo_ITL.png" 
                  alt="Instituto Tribuna Livre" 
                  className="h-12 w-auto"
                />
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    Instituto Tribuna Livre
                  </div>
                  <div className="text-xs text-gray-600">
                    Jornalismo de Qualidade
                  </div>
                </div>
              </Link>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="flex w-full">
                <Input
                  type="text"
                  placeholder="Buscar"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-r-none"
                />
                <Button type="submit" size="sm" className="rounded-l-none">
                  <Search size={16} />
                </Button>
              </form>
            </div>

            {/* Right Info - Desktop */}
            <div className="hidden lg:flex items-center">
              <InfoBar />
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation - Desktop */}
      <nav className="hidden md:block bg-white border-b border-gray-200">
        <div className="container mx-auto">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden mr-2"
            >
              <Menu size={16} />
              <span className="ml-2 font-semibold">MENU</span>
            </Button>
            
            {categories.map((category) => (
              <Link
                key={category.path}
                to={category.path}
                className={`px-4 py-3 text-sm font-medium transition-colors hover:bg-blue-50 hover:text-blue-600 ${
                  isActive(category.path)
                    ? category.color || 'text-blue-600 bg-blue-50'
                    : 'text-gray-700'
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
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="flex mb-4">
              <Input
                type="text"
                placeholder="Buscar"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-r-none"
              />
              <Button type="submit" size="sm" className="rounded-l-none">
                <Search size={16} />
              </Button>
            </form>

            {/* Mobile Navigation */}
            <div className="space-y-2">
              {categories.map((category) => (
                <Link
                  key={category.path}
                  to={category.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-2 text-sm font-medium rounded transition-colors ${
                    isActive(category.path)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {category.name}
                </Link>
              ))}
            </div>

            {/* Mobile Info */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <InfoBar className="text-xs" />
            </div>
          </div>
        </div>
      )}

      {/* Advertisement Banner */}
      <div className="bg-gray-100 py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="w-full max-w-4xl h-32 bg-red-500 flex items-center justify-center text-white text-xl font-bold rounded">
              PUBLICIDADE 970X150 PX
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};