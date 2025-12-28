import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, User, Share2, Facebook, Twitter, Linkedin, Calendar, Tag } from 'lucide-react';
import { useArticle } from '@/hooks/useArticles';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SafeHTML } from '@/components/SafeHTML';
import { SEO } from '@/components/SEO';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { AudioPlayer } from '@/components/AudioPlayer';
import { ImageGallery } from '@/components/ImageGallery';
import { WhatsAppCTA } from '@/components/WhatsAppCTA';
import { useImageProxy } from '@/hooks/useImageProxy';

// Helper para extrair dados da imagem com prioridade para featured_image_json
const getImageData = (article: any) => {
  if (article.featured_image_json && typeof article.featured_image_json === 'object') {
    return {
      url: article.featured_image_json.url || article.featured_image || null,
      alt: article.featured_image_json.alt || article.title,
      credit: article.featured_image_json.credito || article.featured_image_credit || null
    };
  }
  
  return {
    url: article.featured_image || null,
    alt: article.featured_image_alt || article.title,
    credit: article.featured_image_credit || null
  };
};

// Remove links do WhatsApp do HTML do conteúdo para evitar duplicação
const cleanWhatsAppFromContent = (htmlContent: string): string => {
  if (!htmlContent) return htmlContent;
  
  // Remove parágrafos com o texto do WhatsApp
  let cleaned = htmlContent.replace(
    /<p[^>]*>\s*<strong[^>]*>\s*&gt;&gt;\s*Siga o canal da ITL Brasil no WhatsApp\s*<\/strong>\s*<\/p>/gi,
    ''
  );
  
  // Remove links crus do WhatsApp
  cleaned = cleaned.replace(
    /<p[^>]*>\s*<a[^>]*href=["']https?:\/\/whatsapp\.com\/channel\/[^"']*["'][^>]*>.*?<\/a>\s*<\/p>/gi,
    ''
  );
  
  // Remove apenas o link em texto sem formatação
  cleaned = cleaned.replace(
    /https?:\/\/whatsapp\.com\/channel\/\w+/gi,
    ''
  );
  
  // Remove parágrafos vazios resultantes
  cleaned = cleaned.replace(/<p[^>]*>\s*<\/p>/gi, '');
  
  return cleaned.trim();
};

const FeaturedImageWithProxy: React.FC<{
  imageUrl: string;
  alt: string;
  credit?: string;
}> = ({ imageUrl, alt, credit }) => {
  const { cachedUrl, isLoading } = useImageProxy(imageUrl);
  const [imageError, setImageError] = React.useState(false);

  if (isLoading) {
    return (
      <div className="w-full h-64 bg-muted animate-pulse rounded-lg my-6" />
    );
  }

  if (imageError) {
    return (
      <div className="w-full h-[400px] bg-muted rounded-lg flex items-center justify-center my-6">
        <div className="text-center text-muted-foreground px-4">
          <p className="text-lg font-medium">Imagem temporariamente indisponível</p>
          <p className="text-sm mt-2">{alt}</p>
          {credit && <p className="text-xs mt-1 italic">Crédito: {credit}</p>}
        </div>
      </div>
    );
  }

  return (
    <figure className="my-6">
      {cachedUrl && (
        <img
          src={cachedUrl}
          alt={alt}
          className="w-full rounded-lg shadow-lg"
          onError={() => {
            console.error('❌ Falha ao carregar imagem:', cachedUrl);
            setImageError(true);
          }}
          loading="lazy"
        />
      )}
      {credit && (
        <p className="image-credit text-sm text-muted-foreground mt-2 text-right">
          Foto: {credit}
        </p>
      )}
    </figure>
  );
};

export const Article05: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading } = useArticle(slug || '');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-96 bg-muted rounded"></div>
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
              <div className="h-4 bg-muted rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Artigo não encontrado</h1>
          <Link to="/" className="text-primary hover:underline">
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    );
  }

  const categoryName = typeof article.category === 'string' ? article.category : article.category?.name || 'Sem categoria';
  const authorName = typeof article.author === 'string' ? article.author : article.author?.name || 'Autor desconhecido';
  const imageData = getImageData(article);

  return (
    <>
      <SEO
        title={article.meta_title || article.title}
        description={article.meta_description || article.excerpt || article.title}
        image={imageData.url || undefined}
        keywords={article.tags || []}
        type="article"
        publishedTime={article.published_at || article.created_at}
        author={authorName}
        section={categoryName}
      />

      <div className="min-h-screen bg-background">
        <main className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Article Content */}
              <article className="lg:col-span-3">
                {/* Article Header */}
                <div className="mb-8">
                  <Badge className="mb-4 bg-primary text-primary-foreground hover:bg-primary/90">
                    {categoryName}
                  </Badge>
                  
                  <h1 className="text-4xl font-bold leading-tight mb-4">
                    {article.title}
                  </h1>
                  
                  {article.excerpt && (
                    <p className="text-xl text-muted-foreground leading-relaxed mb-6">
                      {article.excerpt}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{authorName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(article.published_at || article.created_at), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>5 min de leitura</span>
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
                {imageData.url && (
                  <FeaturedImageWithProxy 
                    imageUrl={imageData.url}
                    alt={imageData.alt}
                    credit={imageData.credit}
                  />
                )}

                {/* Audio Player - Abaixo da imagem */}
                <AudioPlayer
                  title={article.title}
                  content={article.content}
                  excerpt={article.excerpt}
                  className="mb-8"
                />

                {/* Article Body */}
                <div className="prose prose-lg max-w-none mb-8 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-8 [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-6 [&>h3]:mb-3 [&>p]:mb-3 [&>p]:leading-relaxed [&>br]:hidden [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-6">
                  <SafeHTML html={cleanWhatsAppFromContent(article.content)} />
                </div>

                {/* WhatsApp CTA - Apenas uma no final */}
                <WhatsAppCTA />

                {/* Image Gallery */}
                {article.additional_images && 
                 Array.isArray(article.additional_images) && 
                 article.additional_images.length > 0 && (
                  <div className="mb-12">
                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <span>Galeria de Imagens</span>
                    </h3>
                    <ImageGallery images={article.additional_images.filter(img => 
                      img && typeof img === 'object' && img.url && img.url.startsWith('http')
                    )} />
                  </div>
                )}

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="mb-8">
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
                {article.author && typeof article.author === 'object' && (
                  <Card className="mb-8">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl">
                          {authorName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg mb-2">{authorName}</h3>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {article.author.bio || 'Jornalista e colaborador do ITL Brasil.'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
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
                    <NewsletterSignup />
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
          </div>
        </main>
      </div>
    </>
  );
};
