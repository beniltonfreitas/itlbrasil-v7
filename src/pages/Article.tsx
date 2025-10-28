import { useParams } from "react-router-dom";
import { Clock, User, Share2, Facebook, Twitter, Linkedin, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsCard from "@/components/NewsCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import heroImage from "@/assets/hero-geopolitics.jpg";
import diplomacyImage from "@/assets/news-diplomacy.jpg";
import economyImage from "@/assets/news-economy.jpg";
import technologyImage from "@/assets/news-technology.jpg";

const Article = () => {
  const { slug } = useParams();

  // Mock article data
  const article = {
    title: "Análise Geopolítica: Mudanças no Cenário Internacional Redefinem Alianças Globais",
    subtitle: "As transformações geopolíticas recentes estão reconfigurando o mapa das relações internacionais, com impactos diretos na diplomacia e economia mundial",
    author: "Dr. Carlos Silva",
    publishDate: "15 de Janeiro, 2024",
    readTime: "8 min de leitura",
    category: "Geopolítica",
    imageUrl: heroImage,
    content: `
      <p class="text-lg leading-relaxed mb-6">O cenário geopolítico mundial está passando por transformações profundas que redefinem não apenas as relações diplomáticas tradicionais, mas também os próprios fundamentos do sistema internacional estabelecido após a Segunda Guerra Mundial.</p>

      <p class="mb-6">Essas mudanças estruturais têm impactos diretos nas estratégias de política externa dos países, incluindo o Brasil, que precisa navegar com cautela neste novo ambiente de multipolaridade crescente e tensões renovadas entre as grandes potências.</p>

      <h2 class="text-2xl font-bold mb-4 mt-8">O Novo Mapa Geopolítico</h2>

      <p class="mb-6">A emergência de novos atores no cenário internacional, combinada com o ressurgimento de rivalidades históricas, está criando um ambiente de competição estratégica sem precedentes. Este fenômeno se manifesta em diversas dimensões:</p>

      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li>Competição tecnológica entre as superpotências</li>
        <li>Redefinição das rotas comerciais globais</li>
        <li>Emergência de novos blocos econômicos e militares</li>
        <li>Disputas por recursos naturais estratégicos</li>
      </ul>

      <p class="mb-6">Para o Brasil, essas transformações representam tanto oportunidades quanto desafios significativos. A capacidade de manter relações equilibradas com diferentes blocos de poder será crucial para maximizar os benefícios econômicos e minimizar os riscos geopolíticos.</p>

      <h2 class="text-2xl font-bold mb-4 mt-8">Impactos na Diplomacia Brasileira</h2>

      <p class="mb-6">A diplomacia brasileira está sendo testada neste novo contexto, necessitando de uma abordagem mais sofisticada para navegar entre as pressões das grandes potências. A tradicional política externa brasileira de não-alinhamento automático ganha ainda mais relevância neste cenário.</p>

      <p class="mb-6">É fundamental que o país mantenha sua autonomia estratégica, buscando parcerias diversificadas que atendam aos interesses nacionais sem comprometer a soberania nas decisões de política externa.</p>

      <h2 class="text-2xl font-bold mb-4 mt-8">Perspectivas Futuras</h2>

      <p class="mb-6">As próximas décadas serão decisivas para a consolidação desta nova ordem mundial. O Brasil tem a oportunidade de se posicionar como um ator relevante neste processo, aproveitando suas vantagens comparativas e fortalecendo sua posição no cenário internacional.</p>

      <p class="mb-6">A capacidade de antecipação e adaptação às mudanças geopolíticas será fundamental para garantir que o país se beneficie das oportunidades emergentes, ao mesmo tempo em que protege seus interesses estratégicos fundamentais.</p>
    `
  };

  const relatedNews = [
    {
      title: "Reunião Diplomática Define Novos Acordos Comerciais",
      excerpt: "Líderes mundiais se reúnem para discutir estratégias de cooperação econômica.",
      category: "Geopolítica",
      author: "Ana Santos",
      publishDate: "30 min atrás",
      readTime: "5 min",
      imageUrl: diplomacyImage,
      slug: "reuniao-diplomatica-acordos-comerciais"
    },
    {
      title: "Mercados Globais Respondem a Mudanças Geopolíticas",
      excerpt: "Análise dos impactos econômicos das recentes movimentações políticas.",
      category: "Economia",
      author: "Ricardo Oliveira",
      publishDate: "1 hora atrás",
      readTime: "6 min",
      imageUrl: economyImage,
      slug: "mercados-globais-mudancas-geopoliticas"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Article Content */}
            <article className="lg:col-span-3">
              {/* Article Header */}
              <div className="mb-8">
                <Badge className="mb-4 bg-primary text-primary-foreground">
                  {article.category}
                </Badge>
                
                <h1 className="text-4xl font-bold leading-tight mb-4">
                  {article.title}
                </h1>
                
                <p className="text-xl text-muted-foreground leading-relaxed mb-6">
                  {article.subtitle}
                </p>

                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{article.author}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{article.publishDate}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{article.readTime}</span>
                  </div>
                </div>

                {/* Share Buttons */}
                <div className="flex items-center space-x-3 mb-8">
                  <span className="text-sm font-medium">Compartilhar:</span>
                  <Button variant="outline" size="sm" className="p-2">
                    <Facebook className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="p-2">
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="p-2">
                    <Linkedin className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="p-2">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Featured Image */}
              <div className="mb-8">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-96 object-cover rounded-lg"
                />
              </div>

              {/* Article Body */}
              <div 
                className="prose prose-lg max-w-none mb-12"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              <Separator className="my-8" />

              {/* Author Info */}
              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl">
                      CS
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">{article.author}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Doutor em Relações Internacionais com especialização em Geopolítica. 
                        Analista sênior do ITL Brasil e colaborador de diversos veículos especializados 
                        em política internacional.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </article>

            {/* Sidebar */}
            <aside className="space-y-8">
              {/* Advertisement Space */}
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="h-64 bg-muted rounded-lg flex items-center justify-center mb-4">
                    <p className="text-muted-foreground">Espaço Publicitário</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Anuncie conosco e alcance nosso público especializado
                  </p>
                </CardContent>
              </Card>

              {/* Newsletter */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-3">Newsletter ITL Brasil</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Receba análises exclusivas sobre geopolítica em seu e-mail.
                  </p>
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="Seu e-mail"
                      className="w-full px-3 py-2 border border-border rounded-md text-sm"
                    />
                    <Button className="w-full bg-primary hover:bg-primary-dark">
                      Assinar Newsletter
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Popular Articles */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4">Mais Lidas</h3>
                  <div className="space-y-4">
                    {[1, 2, 3].map((index) => (
                      <div key={index} className="flex space-x-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                          {index}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm leading-tight hover:text-primary cursor-pointer transition-colors">
                            Análise: Impactos da nova ordem geopolítica mundial
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">2 horas atrás</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>

          {/* Related Articles */}
          <section className="mt-16">
            <h2 className="text-3xl font-bold mb-8">Notícias Relacionadas</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedNews.map((news, index) => (
                <div key={index} className="group hover:shadow-lg transition-all duration-300">
                  <Card>
                    <Link to={`/artigo/${news.slug}`}>
                      <div className="relative overflow-hidden h-48">
                        <img
                          src={news.imageUrl}
                          alt={news.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-primary text-primary-foreground">
                            {news.category}
                          </Badge>
                        </div>
                      </div>
                      
                      <CardContent className="p-6">
                        <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors mb-2">
                          {news.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                          {news.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>{news.author}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{news.readTime}</span>
                            </div>
                          </div>
                          <span>{news.publishDate}</span>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Article;