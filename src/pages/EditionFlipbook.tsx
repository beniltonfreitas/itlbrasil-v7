import { useParams, Link } from 'react-router-dom';
import { useEditionBySlug } from '@/hooks/useEditions';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { SEO } from '@/components/SEO';

export default function EditionFlipbook() {
  const { slug } = useParams<{ slug: string }>();
  const { data: edition, isLoading } = useEditionBySlug(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-96 w-full max-w-6xl" />
      </div>
    );
  }

  if (!edition) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Edição não encontrada</h1>
          <Link to="/jornal">
            <Button>Ver todas as edições</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`Flipbook: ${edition.titulo} - Edição ${edition.numero_edicao}`}
        description={`Explore a ${edition.titulo} em nosso flipbook interativo.`}
      />

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={`/jornal/edicao/${edition.slug}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="font-bold text-lg">{edition.titulo}</h1>
                <p className="text-sm text-muted-foreground">Edição {edition.numero_edicao}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Flipbook Container */}
        <div className="container mx-auto px-4 py-8">
          <div className="bg-card rounded-lg shadow-2xl p-8 min-h-[700px] flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <BookOpen className="h-20 w-20 mx-auto mb-4 opacity-50" />
              <p className="text-xl font-semibold mb-2">Flipbook Interativo</p>
              <p className="text-sm">Em desenvolvimento - Em breve você poderá virar as páginas digitalmente</p>
              <p className="text-xs mt-4 text-muted-foreground/60">
                Usando react-pageflip para uma experiência realista
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
