import { useState } from 'react';
import { useEditions } from '@/hooks/useEditions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, Eye, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SEO } from '@/components/SEO';

export default function EditionsListPublic() {
  const [search, setSearch] = useState('');
  const { data: editions, isLoading } = useEditions({ status: 'publicado', search });

  return (
    <>
      <SEO
        title="Edições Digitais | Jornal Digital"
        description="Navegue por todas as edições digitais do nosso jornal. Leia online ou faça download em PDF/EPUB."
        keywords={['edições digitais', 'jornal online', 'revista digital', 'flipbook']}
      />

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Edições Digitais
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore todas as edições do nosso jornal. Leia online, baixe em PDF ou aproveite a experiência interativa do flipbook.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por título ou número da edição..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
          </div>

          {/* Editions Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : editions && editions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {editions.map((edition) => (
                <Card key={edition.id} className="overflow-hidden hover:shadow-lg transition-all group">
                  {/* Cover Preview */}
                  <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
                    {edition.capa_json?.imagem ? (
                      <img
                        src={edition.capa_json.imagem}
                        alt={`Capa da ${edition.titulo}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <h3 className="text-2xl font-bold text-primary mb-2">{edition.numero_edicao}</h3>
                          <p className="text-sm text-muted-foreground">{edition.titulo}</p>
                        </div>
                      </div>
                    )}
                    <Badge className="absolute top-2 right-2">
                      Edição {edition.numero_edicao}
                    </Badge>
                  </div>

                  <CardHeader>
                    <CardTitle className="line-clamp-2">{edition.titulo}</CardTitle>
                    {edition.subtitulo && (
                      <CardDescription className="line-clamp-1">{edition.subtitulo}</CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(edition.data_publicacao), 'dd/MM/yyyy', { locale: ptBR })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{edition.visualizacoes || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        <span>{(edition.downloads_pdf || 0) + (edition.downloads_epub || 0)}</span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Link to={`/jornal/edicao/${edition.slug}`}>
                      <Button className="w-full" size="lg">
                        Ver Edição
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                {search ? 'Nenhuma edição encontrada para sua busca.' : 'Nenhuma edição publicada ainda.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
