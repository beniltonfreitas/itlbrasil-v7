import NewsCard from "@/components/NewsCard";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Article } from "@/hooks/useArticles";
import { TrendingUp, Globe, DollarSign, Users, Leaf, Smartphone, Trophy, Palette } from "lucide-react";
import { useArticles } from "@/hooks/useArticles";
import { useCategories } from "@/hooks/useCategories";
import { BannerSlider } from "@/components/BannerSlider";
import { LiveStreamWidget } from "@/components/widgets/LiveStreamWidget";


import heroImage from "@/assets/hero-geopolitics.jpg";
import diplomacyImage from "@/assets/news-diplomacy.jpg";
import economyImage from "@/assets/news-economy.jpg";
import technologyImage from "@/assets/news-technology.jpg";

const Index = () => {
  const { data: featuredArticles, isLoading: featuredLoading } = useArticles({ featured: true, limit: 1 });
  const { data: latestArticles, isLoading: latestLoading } = useArticles({ limit: 3 });
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const featuredNews = featuredArticles?.[0] ? {
    title: featuredArticles[0].title,
    excerpt: featuredArticles[0].excerpt || "",
    category: featuredArticles[0].category?.name || "Geral",
    author: featuredArticles[0].author?.name || "ITL Brasil",
    publishDate: "15 min atrás", // You could format the actual date here
    readTime: `${featuredArticles[0].read_time || 5} min`,
    imageUrl: featuredArticles[0].featured_image || heroImage,
    slug: featuredArticles[0].slug
  } : {
    title: "Análise Geopolítica: Mudanças no Cenário Internacional Redefinem Alianças Globais",
    excerpt: "As transformações geopolíticas recentes estão reconfigurando o mapa das relações internacionais, com impactos diretos na diplomacia e economia mundial. Especialistas analisam os desdobramentos e suas consequências para o Brasil.",
    category: "Geopolítica",
    author: "Dr. Carlos Silva",
    publishDate: "15 min atrás",
    readTime: "8 min",
    imageUrl: heroImage,
    slug: "analise-geopolitica-mudancas-cenario-internacional"
  };

  const latestNews = latestArticles?.length ? latestArticles.map(article => ({
    title: article.title,
    excerpt: article.excerpt || "",
    category: article.category?.name || "Geral",
    author: article.author?.name || "ITL Brasil",
    publishDate: "30 min atrás", // Format actual date here
    readTime: `${article.read_time || 5} min`,
    imageUrl: article.featured_image || diplomacyImage,
    slug: article.slug
  })) : [
    {
      title: "Reunião Diplomática Define Novos Acordos Comerciais",
      excerpt: "Líderes mundiais se reúnem para discutir estratégias de cooperação econômica e política internacional.",
      category: "Geopolítica",
      author: "Ana Santos",
      publishDate: "30 min atrás",
      readTime: "5 min",
      imageUrl: diplomacyImage,
      slug: "reuniao-diplomatica-acordos-comerciais"
    },
    {
      title: "Mercados Globais Respondem a Mudanças Geopolíticas",
      excerpt: "Análise dos impactos econômicos das recentes movimentações no cenário político internacional.",
      category: "Economia",
      author: "Ricardo Oliveira",
      publishDate: "1 hora atrás",
      readTime: "6 min",
      imageUrl: economyImage,
      slug: "mercados-globais-mudancas-geopoliticas"
    },
    {
      title: "Inovações Tecnológicas Transformam a Diplomacia Moderna",
      excerpt: "Como a tecnologia está revolucionando as relações diplomáticas e a comunicação internacional.",
      category: "Tecnologia",
      author: "Maria Costa",
      publishDate: "2 horas atrás",
      readTime: "7 min",
      imageUrl: technologyImage,
      slug: "inovacoes-tecnologicas-diplomacia-moderna"
    }
  ];

  const categoryData = categories?.length ? categories.map(cat => {
    const iconMap: { [key: string]: any } = {
      Globe, DollarSign, Users, Leaf, Smartphone, Trophy, Palette
    };
    return {
      name: cat.name,
      icon: iconMap[cat.icon || 'Globe'] || Globe,
      color: cat.color || "bg-primary",
      count: cat._count?.articles || 0
    };
  }) : [
    { name: "Geopolítica", icon: Globe, color: "bg-primary", count: 156 },
    { name: "Economia", icon: DollarSign, color: "bg-accent", count: 89 },
    { name: "Sociedade", icon: Users, color: "bg-secondary", count: 124 },
    { name: "Meio Ambiente", icon: Leaf, color: "bg-green-600", count: 67 },
    { name: "Tecnologia", icon: Smartphone, color: "bg-blue-600", count: 93 },
    { name: "Esportes", icon: Trophy, color: "bg-orange-600", count: 45 },
    { name: "Cultura", icon: Palette, color: "bg-purple-600", count: 78 }
  ];

  return (
    <>
      <SEO />
      <main>
        {/* Banner Slider */}
        <section className="py-4">
          <div className="container mx-auto px-4">
            <BannerSlider />
          </div>
        </section>

        {/* Hero Section */}
        <section className="py-8 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Featured News */}
              <div className="lg:col-span-2">
                {featuredLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="w-full h-64" />
                    <Skeleton className="w-3/4 h-8" />
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-1/2 h-4" />
                  </div>
                ) : featuredArticles?.[0] ? (
                  <NewsCard article={featuredArticles[0]} featured />
                ) : (
                  <LiveStreamWidget />
                )}
              </div>
              
              {/* Breaking News & Trending */}
              <div className="space-y-6">
                <Card className="border-l-4 border-l-breaking">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-breaking" />
                      <span>Última Hora</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="pb-3 border-b last:border-0">
                        <h4 className="font-semibold text-sm leading-tight hover:text-primary cursor-pointer transition-colors">
                          Desenvolvimento importante nas negociações internacionais
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">5 min atrás</p>
                      </div>
                      <div className="pb-3 border-b last:border-0">
                        <h4 className="font-semibold text-sm leading-tight hover:text-primary cursor-pointer transition-colors">
                          Mudanças significativas no cenário econômico global
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">12 min atrás</p>
                      </div>
                      <div className="pb-3 border-b last:border-0">
                        <h4 className="font-semibold text-sm leading-tight hover:text-primary cursor-pointer transition-colors">
                          Nova política externa brasileira ganha destaque
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">25 min atrás</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>
            </div>
          </div>
        </section>

        {/* Latest News */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">Últimas Notícias</h2>
              <Button variant="outline">Ver Todas</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="space-y-4">
                    <Skeleton className="w-full h-48" />
                    <Skeleton className="w-3/4 h-6" />
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-1/2 h-4" />
                  </div>
                ))
              ) : latestArticles?.length ? (
                latestArticles
                  .filter(article => article && article.slug) // Filter out null/undefined articles and articles without slug
                  .map((article, index) => (
                    <NewsCard key={article.id} article={article} />
                  ))
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-muted rounded-lg p-6">
                    <h3 className="font-bold mb-2">Últimas Notícias</h3>
                    <p className="text-sm text-muted-foreground">Conteúdo em breve...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Explore por Categoria</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categoriesLoading ? (
                Array.from({ length: 7 }).map((_, index) => (
                  <div key={index} className="space-y-4 p-6">
                    <Skeleton className="w-16 h-16 rounded-full mx-auto" />
                    <Skeleton className="w-3/4 h-6 mx-auto" />
                    <Skeleton className="w-1/2 h-4 mx-auto" />
                  </div>
                ))
              ) : (
                categoryData.map((category, index) => {
                  const IconComponent = category.icon;
                  return (
                    <Card key={index} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                      <CardContent className="p-6 text-center">
                        <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                          <IconComponent className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {category.count} artigos
                        </p>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Mantenha-se Informado
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Receba as principais notícias e análises geopolíticas diretamente no seu e-mail. 
              Seja o primeiro a saber sobre os desenvolvimentos que moldam o mundo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <NewsletterSignup />
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Index;
