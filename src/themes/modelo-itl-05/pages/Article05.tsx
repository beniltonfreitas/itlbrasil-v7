import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin } from 'lucide-react';
import { useArticle } from '@/hooks/useArticles';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SafeHTML } from '@/components/SafeHTML';
import { SEO } from '@/components/SEO';
import { AudioPlayerNative } from '@/components/AudioPlayerNative';
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
  
  let cleaned = htmlContent.replace(
    /<p[^>]*>\s*<strong[^>]*>\s*&gt;&gt;\s*Siga o canal da ITL Brasil no WhatsApp\s*<\/strong>\s*<\/p>/gi,
    ''
  );
  
  cleaned = cleaned.replace(
    /<p[^>]*>\s*<a[^>]*href=["']https?:\/\/whatsapp\.com\/channel\/[^"']*["'][^>]*>.*?<\/a>\s*<\/p>/gi,
    ''
  );
  
  cleaned = cleaned.replace(
    /https?:\/\/whatsapp\.com\/channel\/\w+/gi,
    ''
  );
  
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
      <div className="w-full h-64 bg-muted animate-pulse mb-6" />
    );
  }

  if (imageError) {
    return (
      <div className="w-full h-[400px] bg-muted flex items-center justify-center mb-6">
        <div className="text-center text-muted-foreground px-4">
          <p className="text-lg font-medium">Imagem temporariamente indisponível</p>
          <p className="text-sm mt-2">{alt}</p>
        </div>
      </div>
    );
  }

  return (
    <figure className="relative mb-6">
      {cachedUrl && (
        <img
          src={cachedUrl}
          alt={alt}
          className="w-full"
          onError={() => {
            console.error('❌ Falha ao carregar imagem:', cachedUrl);
            setImageError(true);
          }}
          loading="lazy"
        />
      )}
      {credit && (
        <figcaption className="absolute bottom-0 right-0 text-xs text-white bg-black/60 px-2 py-1">
          © {credit}
        </figcaption>
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
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-3/4 mx-auto"></div>
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
  const categorySlug = typeof article.category === 'object' ? article.category?.slug : '';
  const authorName = typeof article.author === 'string' ? article.author : article.author?.name || 'Redação';
  const imageData = getImageData(article);
  const articleUrl = window.location.href;

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(articleUrl);
    const encodedTitle = encodeURIComponent(article.title);
    
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

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
          {/* Coluna única centralizada como Agência Brasil */}
          <article className="max-w-3xl mx-auto px-4">
            
            {/* Header centralizado */}
            <header className="text-center mb-6">
              {categorySlug ? (
                <Link to={`/${categorySlug}`}>
                  <Badge className="mb-4 bg-primary text-primary-foreground hover:bg-primary/90">
                    {categoryName}
                  </Badge>
                </Link>
              ) : (
                <Badge className="mb-4 bg-primary text-primary-foreground">
                  {categoryName}
                </Badge>
              )}
              
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4 text-[#0C1A3D]">
                {article.title}
              </h1>
              
              {article.excerpt && (
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {article.excerpt}
                </p>
              )}
            </header>

            {/* Metadados no estilo Agência Brasil */}
            <div className="mb-6 border-t border-b border-border py-4">
              <div className="font-medium text-foreground mb-1">
                {authorName}
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Publicado em {format(new Date(article.published_at || article.created_at), "dd/MM/yyyy - HH:mm", { locale: ptBR })}
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-2 h-8 w-8"
                    onClick={() => handleShare('facebook')}
                  >
                    <Facebook className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-2 h-8 w-8"
                    onClick={() => handleShare('twitter')}
                  >
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-2 h-8 w-8"
                    onClick={() => handleShare('linkedin')}
                  >
                    <Linkedin className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {(article as any).location && (
                <div className="text-sm text-muted-foreground mt-1">
                  {(article as any).location}
                </div>
              )}
            </div>

            {/* Imagem Principal - com crédito DENTRO da imagem */}
            {imageData.url && (
              <FeaturedImageWithProxy 
                imageUrl={imageData.url}
                alt={imageData.alt}
                credit={imageData.credit}
              />
            )}

            {/* Audio Player DEPOIS da imagem - estilo nativo */}
            <AudioPlayerNative
              title={article.title}
              content={article.content}
              excerpt={article.excerpt}
              className="mb-8"
            />

            {/* Conteúdo do Artigo */}
            <div className="prose prose-lg max-w-none mb-8 
              [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-8 [&>h2]:mb-4 
              [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-6 [&>h3]:mb-3 
              [&>p]:mb-4 [&>p]:leading-relaxed [&>p]:text-foreground
              [&>blockquote]:border-l-4 [&>blockquote]:border-gray-800 [&>blockquote]:pl-6 [&>blockquote]:py-2 [&>blockquote]:my-6 [&>blockquote]:bg-transparent [&>blockquote]:text-base [&>blockquote]:italic
              [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4
              [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4">
              <SafeHTML html={cleanWhatsAppFromContent(article.content)} />
            </div>

            {/* WhatsApp CTA */}
            <WhatsAppCTA />

            {/* Galeria de Imagens */}
            {article.additional_images && 
             Array.isArray(article.additional_images) && 
             article.additional_images.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Galeria de Imagens</h3>
                <ImageGallery images={article.additional_images.filter(img => 
                  img && typeof img === 'object' && img.url && img.url.startsWith('http')
                )} />
              </div>
            )}

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mb-8 pt-4 border-t border-border">
                <div className="flex items-center gap-2 flex-wrap">
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

          </article>
        </main>
      </div>
    </>
  );
};
