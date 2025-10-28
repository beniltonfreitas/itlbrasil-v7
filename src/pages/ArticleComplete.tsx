import { useParams } from "react-router-dom";
import { Share2, Facebook, Twitter, Linkedin, Clock, User, ArrowLeft, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import NewsCard from "@/components/NewsCard";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { SEO } from "@/components/SEO";
import { useArticle } from "@/hooks/useArticles";
import { useArticles } from "@/hooks/useArticles";
import { useArticleContentProcessor } from "@/hooks/useArticleContentProcessor";
import { useCopyProtection } from "@/hooks/useCopyProtection";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { AudioPlayer } from "@/components/AudioPlayer";
import { ImageGallery } from "@/components/ImageGallery";
import { SafeHTML } from "@/components/SafeHTML";
import { WhatsAppCTA } from "@/components/WhatsAppCTA";

const ArticleComplete = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: article, isLoading, error } = useArticle(slug || "");
  const { data: relatedArticles } = useArticles({ limit: 3 });
  
  // Process article content for splitting with WhatsApp CTAs
  const { parts: contentParts } = useArticleContentProcessor(article?.content || '');
  
  // Enable copy protection
  useCopyProtection(true);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando artigo...</p>
        </div>
      </div>
    );
  }
  
  if (error || !article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Artigo não encontrado</h1>
          <p className="text-muted-foreground mb-6">O artigo que você está procurando não existe ou foi removido.</p>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao início
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/artigo/${article.slug}`;
  const shareTitle = article.title;
  const categoryName = article.category?.name || 'Sem categoria';
  const authorName = article.author?.name || 'Autor desconhecido';
  
  const handleShare = (platform: string) => {
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`
    };
    
    window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400');
  };

  return (
    <>
      <SEO 
        title={article.meta_title || article.title}
        description={article.meta_description || article.excerpt || article.title}
        image={article.featured_image || undefined}
        keywords={article.tags || []}
        type="article"
        publishedTime={article.published_at || article.created_at}
        author={authorName}
        section={categoryName}
      />
      <main>
        <article className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-6">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Link to="/" className="hover:text-primary transition-colors">Início</Link>
                <span>/</span>
                {article.category && (
                  <>
                    <Link to={`/${article.category.slug}`} className="hover:text-primary transition-colors">
                      {article.category.name}
                    </Link>
                    <span>/</span>
                  </>
                )}
                <span className="text-foreground">{article.title}</span>
              </div>
            </nav>

            {/* Article Header */}
            <header className="mb-8">
              {article.category && (
                <Badge 
                  variant="secondary" 
                  className="mb-4"
                  style={{ backgroundColor: article.category.color + '20', color: article.category.color }}
                >
                  {article.category.name}
                </Badge>
              )}
              
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                {article.title}
              </h1>
              
              {article.excerpt && (
                <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                  {article.excerpt}
                </p>
              )}
              
              {/* Article Meta */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center space-x-3">
                  {article.author && (
                    <>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={article.author.avatar_url || ""} alt={article.author.name} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{article.author.name}</p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>{format(new Date(article.published_at!), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                          {article.read_time && (
                            <>
                              <span>•</span>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{article.read_time} min</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Social Sharing */}
              <div className="flex items-center space-x-2 mb-8">
                <span className="text-sm text-muted-foreground">Compartilhar:</span>
                <Button variant="outline" size="sm" onClick={() => handleShare('facebook')}>
                  <Facebook className="h-4 w-4 mr-2" />
                  Facebook
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleShare('twitter')}>
                  <Twitter className="h-4 w-4 mr-2" />
                  Twitter
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleShare('linkedin')}>
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleShare('whatsapp')}>
                  <Share2 className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </header>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Audio Player */}
                <AudioPlayer
                  title={article.title}
                  content={article.content}
                  excerpt={article.excerpt}
                  className="mb-6"
                />

                {/* Featured Image */}
                {article.featured_image && (
                  <div className="mb-8">
                    <img
                      src={article.featured_image}
                      alt={article.title}
                      className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
                    />
                    {(article as any).image_credit && (
                      <p className="text-sm text-muted-foreground mt-2 text-right">
                        Foto: {(article as any).image_credit}
                      </p>
                    )}
                  </div>
                )}

                {/* Article Content with WhatsApp CTAs */}
                <div className="prose prose-lg max-w-none text-foreground [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-8 [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-6 [&>h3]:mb-3 [&>p]:mb-3 [&>p]:leading-relaxed [&>br]:hidden [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-6">
                  {contentParts.map((part, index) => (
                    <div key={index}>
                      <SafeHTML html={part} />
                      {index < contentParts.length - 1 && <WhatsAppCTA />}
                    </div>
                  ))}
                </div>

                {/* Image Gallery - Validação mais tolerante */}
                {article.additional_images && 
                 Array.isArray(article.additional_images) && 
                 article.additional_images.length > 0 && (
                  <Card className="my-8 p-6">
                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <span>📸 Galeria de Imagens</span>
                    </h3>
                    <ImageGallery images={article.additional_images.filter(img => 
                      img && typeof img === 'object' && img.url && img.url.startsWith('http')
                    )} />
                  </Card>
                )}

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="mb-8 mt-8">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">Tags:</span>
                      {article.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator className="my-8" />

                {/* Author Info */}
                {article.author && (
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={article.author.avatar_url || ""} alt={article.author.name} />
                          <AvatarFallback>
                            <User className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">{article.author.name}</h3>
                          {article.author.bio && (
                            <p className="text-muted-foreground">{article.author.bio}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <aside className="lg:col-span-1">
                {/* Newsletter */}
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Newsletter</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Receba as principais notícias de geopolítica diretamente no seu email.
                    </p>
                    <NewsletterSignup 
                      placeholder="Seu email"
                      buttonText="Assinar"
                    />
                  </CardContent>
                </Card>

                {/* Popular Articles */}
                {relatedArticles && relatedArticles.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4">Artigos Relacionados</h3>
                      <div className="space-y-4">
                        {relatedArticles.slice(0, 3).map((relatedArticle, index) => (
                          <Link 
                            key={relatedArticle.id} 
                            to={`/artigo/${relatedArticle.slug}`}
                            className="block hover:bg-muted/50 p-2 rounded-md transition-colors"
                          >
                            <div className="flex space-x-3">
                              <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
                                {index + 1}
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-foreground leading-tight mb-1">
                                  {relatedArticle.title}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(relatedArticle.published_at!), "d 'de' MMM", { locale: ptBR })}
                                  {relatedArticle.read_time && ` • ${relatedArticle.read_time} min`}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </aside>
            </div>
          </div>
        </article>
      </main>
    </>
  );
};

export default ArticleComplete;