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
import { AudioPlayerNative } from "@/components/AudioPlayerNative";
import { ImageGallery } from "@/components/ImageGallery";
import { SafeHTML } from "@/components/SafeHTML";
import { WhatsAppCTA } from "@/components/WhatsAppCTA";

const ArticleComplete = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: article, isLoading, error } = useArticle(slug || "");
  const { data: relatedArticles } = useArticles({ limit: 4 });
  
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
  const authorName = article.author?.name || 'Redação';
  
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
      <main className="bg-background min-h-screen">
        <article className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            
            {/* 1. Categoria editorial (tag pequena colorida) */}
            {article.category && (
              <Link to={`/${article.category.slug}`} className="inline-block mb-4">
                <Badge 
                  className="text-xs uppercase tracking-wide font-medium px-3 py-1 hover:opacity-90 transition-opacity"
                  style={{ 
                    backgroundColor: article.category.color || 'hsl(var(--primary))', 
                    color: 'white' 
                  }}
                >
                  {article.category.name}
                </Badge>
              </Link>
            )}

            {/* 2. Título principal (H1) */}
            <header className="mb-6">
              <h1 className="text-3xl md:text-4xl lg:text-[2.5rem] font-bold text-foreground leading-tight mb-3">
                {article.title}
              </h1>
              
              {/* 3. Subtítulo (H2 ou p.subtitle) - se houver excerpt */}
              {article.excerpt && (
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-4 font-normal">
                  {article.excerpt}
                </p>
              )}
              
              {/* 4. Créditos editoriais (data, autor, local) */}
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-4">
                <time dateTime={article.published_at || article.created_at}>
                  {format(new Date(article.published_at || article.created_at), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
                </time>
                <span className="text-muted-foreground/40">|</span>
                <span className="font-medium text-foreground/80">
                  Por {authorName}
                </span>
                {(article as any).location && (
                  <>
                    <span className="text-muted-foreground/40">|</span>
                    <span>{(article as any).location}</span>
                  </>
                )}
                {article.read_time && (
                  <>
                    <span className="text-muted-foreground/40">|</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{article.read_time} min</span>
                    </div>
                  </>
                )}
              </div>

              {/* Ícones de compartilhamento */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground mr-1">Compartilhar:</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-[#1877F2] hover:bg-[#1877F2]/10"
                  onClick={() => handleShare('facebook')}
                  aria-label="Compartilhar no Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10"
                  onClick={() => handleShare('twitter')}
                  aria-label="Compartilhar no Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-[#0A66C2] hover:bg-[#0A66C2]/10"
                  onClick={() => handleShare('linkedin')}
                  aria-label="Compartilhar no LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-[#25D366] hover:bg-[#25D366]/10"
                  onClick={() => handleShare('whatsapp')}
                  aria-label="Compartilhar no WhatsApp"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </header>

            {/* 5. Imagem principal (Hero) - Proporção 16:9 */}
            {article.featured_image && (
              <figure className="mb-6">
                <div className="aspect-video w-full overflow-hidden rounded-lg">
                  <img
                    src={article.featured_image}
                    alt={(article as any).featured_image_alt || article.title}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
                {((article as any).featured_image_credit || (article as any).image_credit) && (
                  <figcaption className="text-sm text-muted-foreground mt-2 text-right">
                    Foto: {(article as any).featured_image_credit || (article as any).image_credit}
                  </figcaption>
                )}
              </figure>
            )}

            {/* 6. Player de áudio (OBRIGATÓRIO - estilo Agência Brasil) */}
            {/* Posicionado IMEDIATAMENTE após a imagem principal */}
            {/* e ANTES de qualquer parágrafo de texto */}
            <AudioPlayerNative
              title={article.title}
              content={article.content}
              excerpt={article.excerpt}
              className="mb-8"
            />

            {/* 7. Corpo do texto (conteúdo editorial) */}
            {/* O primeiro parágrafo começa logo abaixo do player */}
            <div className="article-content prose prose-lg max-w-none text-foreground
              [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mt-10 [&>h2]:mb-4 [&>h2]:text-foreground
              [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:mt-8 [&>h3]:mb-3
              [&>p]:mb-5 [&>p]:leading-relaxed [&>p]:text-base [&>p]:text-foreground/90
              [&>ul]:mb-5 [&>ul]:pl-6 [&>ul]:list-disc
              [&>ol]:mb-5 [&>ol]:pl-6 [&>ol]:list-decimal
              [&>li]:mb-2
              [&>blockquote]:border-l-4 [&>blockquote]:border-blue-500 [&>blockquote]:pl-6 [&>blockquote]:py-4 [&>blockquote]:my-8 [&>blockquote]:bg-slate-50 dark:[&>blockquote]:bg-slate-900/50 [&>blockquote]:italic [&>blockquote]:text-lg [&>blockquote]:text-foreground/85 [&>blockquote]:rounded-r-md
              [&>blockquote>p]:mb-2 [&>blockquote>p]:last:mb-0
              [&>blockquote>cite]:block [&>blockquote>cite]:text-sm [&>blockquote>cite]:not-italic [&>blockquote>cite]:font-medium [&>blockquote>cite]:text-muted-foreground [&>blockquote>cite]:mt-3
              [&>figure]:my-6 [&>figure>img]:w-full [&>figure>img]:h-auto
              [&>figure>figcaption]:text-sm [&>figure>figcaption]:text-muted-foreground [&>figure>figcaption]:mt-2 [&>figure>figcaption]:text-left
              [&>img]:w-full [&>img]:h-auto [&>img]:my-6
              [&>hr]:my-10 [&>hr]:border-border
            ">
              {contentParts.map((part, index) => (
                <div key={index}>
                  <SafeHTML html={part} />
                  {index < contentParts.length - 1 && <WhatsAppCTA />}
                </div>
              ))}
            </div>

            {/* 7. Galeria de Imagens (se houver) */}
            {article.additional_images && 
             Array.isArray(article.additional_images) && 
             article.additional_images.length > 0 && (
              <div className="my-8">
                <h3 className="text-lg font-bold mb-4 text-foreground">Galeria de Imagens</h3>
                <ImageGallery images={article.additional_images.filter(img => 
                  img && typeof img === 'object' && img.url && img.url.startsWith('http')
                )} />
              </div>
            )}

            {/* 8. Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="my-8">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  {article.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* 9. Fonte / Assinatura */}
            {(article as any).source_name && (
              <div className="my-6 py-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Fonte: <span className="font-medium">{(article as any).source_name}</span>
                  {(article as any).source_url && (
                    <a 
                      href={(article as any).source_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-1 text-primary hover:underline"
                    >
                      (ver original)
                    </a>
                  )}
                </p>
              </div>
            )}

            <Separator className="my-8" />

            {/* Card do Autor */}
            {article.author && (
              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={article.author.avatar_url || ""} alt={article.author.name} />
                      <AvatarFallback>
                        <User className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-base font-semibold text-foreground mb-1">{article.author.name}</h3>
                      {article.author.bio && (
                        <p className="text-sm text-muted-foreground leading-relaxed">{article.author.bio}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Newsletter */}
            <Card className="mb-8 bg-muted/30">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">Receba nossas notícias</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Cadastre-se para receber as principais notícias diretamente no seu email.
                </p>
                <NewsletterSignup 
                  placeholder="Seu email"
                  buttonText="Assinar"
                />
              </CardContent>
            </Card>
          </div>

          {/* 10. Notícias relacionadas (seção inferior, fora da coluna única) */}
          {relatedArticles && relatedArticles.length > 0 && (
            <section className="max-w-5xl mx-auto mt-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">Notícias Relacionadas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedArticles
                  .filter(a => a.id !== article.id)
                  .slice(0, 4)
                  .map((relatedArticle) => (
                    <Link 
                      key={relatedArticle.id} 
                      to={`/artigo/${relatedArticle.slug}`}
                      className="group block"
                    >
                      <article className="h-full">
                        {relatedArticle.featured_image && (
                          <div className="aspect-video overflow-hidden rounded-lg mb-3">
                            <img 
                              src={relatedArticle.featured_image} 
                              alt={relatedArticle.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <Badge variant="secondary" className="text-xs mb-2">
                          {relatedArticle.category?.name || 'Geral'}
                        </Badge>
                        <h3 className="text-sm font-medium text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-3">
                          {relatedArticle.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(relatedArticle.published_at!), "d 'de' MMM", { locale: ptBR })}
                        </p>
                      </article>
                    </Link>
                  ))}
              </div>
            </section>
          )}
        </article>
      </main>
    </>
  );
};

export default ArticleComplete;
