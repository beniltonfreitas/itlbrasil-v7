import { useParams, Link } from 'react-router-dom';
import { useEditionBySlug } from '@/hooks/useEditions';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { SEO } from '@/components/SEO';

export default function EditionReader() {
  const { slug } = useParams<{ slug: string }>();
  const { data: edition, isLoading } = useEditionBySlug(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-96 w-full max-w-4xl" />
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
        title={`Ler: ${edition.titulo} - Edição ${edition.numero_edicao}`}
        description={`Leia online a ${edition.titulo}.`}
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card sticky top-0 z-50">
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
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Download PDF
              </Button>
            </div>
          </div>
        </header>

        {/* Reader Content */}
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-card rounded-lg shadow-lg p-8 md:p-12 min-h-[600px]">
            <div className="flex items-center justify-center h-96">
              <div className="text-center text-muted-foreground">
                <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Leitor de edições em desenvolvimento</p>
                <p className="text-sm mt-2">Em breve você poderá ler as edições completas aqui</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
