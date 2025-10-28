import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { BreakingNewsBar } from './components/BreakingNewsBar';
import { Header04 } from './components/Header04';
import { HeroSection04 } from './components/HeroSection04';
import { NewsletterSection04 } from './components/NewsletterSection04';
import { Footer04 } from './components/Footer04';
import { useArticles } from '@/hooks/useArticles';
import { useCategories } from '@/hooks/useCategories';
import { useLiveStreams } from '@/hooks/useLiveStreams';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import NewsCard from '@/components/NewsCard';

import { LiveStreamWidget } from '@/components/widgets/LiveStreamWidget';
import { Tv, Clock, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Import all other pages
import Index from '@/pages/Index';
import Article from '@/pages/Article';
import Category from '@/pages/Category';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import NotFound from '@/pages/NotFound';

const HomePage: React.FC = () => {
  const { data: articles, isLoading } = useArticles({ limit: 12 });
  const { data: featuredArticles } = useArticles({ featured: true, limit: 5 });
  const { data: categories } = useCategories();
  const { data: liveStreams } = useLiveStreams();

  const hasActiveLiveStream = liveStreams?.some(stream => stream.status === 'live');

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection04 />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - 70% */}
          <div className="lg:col-span-2 space-y-8">
            {/* Live Stream Section */}
            <Card className="border shadow-sm">
              <CardHeader className="border-b bg-gray-50">
                <CardTitle className="flex items-center gap-2">
                  <Tv className="h-5 w-5 text-[#1565C0]" />
                  Transmissões ao Vivo
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {hasActiveLiveStream ? (
                  <LiveStreamWidget />
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Tv className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">Nenhuma transmissão ativa no momento</p>
                    <p className="text-sm mt-2">Acompanhe nossa programação em breve</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Latest News Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Últimas Notícias</h2>
                <Link to="/">
                  <Button variant="ghost" className="text-[#1565C0] hover:text-[#0D47A1]">
                    Ver Todas <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {articles?.map((article) => (
                  <Card key={article.id} className="overflow-hidden border shadow-sm hover:shadow-lg transition-all duration-300 group">
                    <Link to={`/artigo/${article.slug}`}>
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={article.featured_image || '/placeholder.svg'}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {article.featured && (
                          <Badge className="absolute top-3 left-3 bg-[#FF6D00] hover:bg-[#FF6D00]">
                            Destaque
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#1565C0] transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {article.excerpt || article.content.substring(0, 150)}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {article.author && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {article.author.name}
                            </span>
                          )}
                          {article.published_at && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(article.published_at), { 
                                addSuffix: true,
                                locale: ptBR 
                              })}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - 30% */}
          <div className="space-y-6">
            {/* Última Hora Widget */}
            <Card className="border shadow-sm bg-[#1565C0] text-white">
              <CardHeader className="border-b border-white/20">
                <CardTitle className="text-white">Última Hora</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {featuredArticles?.slice(0, 5).map((article) => (
                    <Link 
                      key={article.id} 
                      to={`/artigo/${article.slug}`}
                      className="block hover:bg-white/10 p-2 rounded transition-colors"
                    >
                      <h4 className="text-sm font-semibold line-clamp-2 mb-1">
                        {article.title}
                      </h4>
                      {article.published_at && (
                        <span className="text-xs text-white/70">
                          {formatDistanceToNow(new Date(article.published_at), { 
                            addSuffix: true,
                            locale: ptBR 
                          })}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Explore by Category Section */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Explore por Categoria
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories?.map((category) => (
              <Link key={category.id} to={`/categoria/${category.slug}`}>
                <Card className="border shadow-sm hover:shadow-lg hover:border-[#1565C0] transition-all duration-300 group">
                  <CardContent className="p-6 text-center">
                    <h3 className="font-bold text-gray-900 group-hover:text-[#1565C0] transition-colors mb-2">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {category._count?.articles || 0} artigos
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Newsletter Section */}
      <NewsletterSection04 />
    </div>
  );
};

export const ModeloItl04: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <BreakingNewsBar />
      <Header04 />
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/artigo/:slug" element={<Article />} />
          <Route path="/categoria/:slug" element={<Category />} />
          <Route path="/sobre" element={<About />} />
          <Route path="/contato" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer04 />
    </div>
  );
};
