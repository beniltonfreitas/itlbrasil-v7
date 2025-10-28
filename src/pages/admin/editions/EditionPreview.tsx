import { useParams } from 'react-router-dom';
import { useEdition } from '@/hooks/useEditions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, BookOpen, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export default function EditionPreview() {
  const { id } = useParams();
  const { data: edition, isLoading } = useEdition(id);

  const handleGeneratePDF = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-edition-pdf', {
        body: { edition_id: id },
      });

      if (error) throw error;

      toast({
        title: 'PDF gerado com sucesso',
        description: 'O download começará em instantes.',
      });

      // Trigger download
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao gerar PDF',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleGenerateEPUB = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-edition-epub', {
        body: { edition_id: id },
      });

      if (error) throw error;

      toast({
        title: 'EPUB gerado com sucesso',
        description: 'O download começará em instantes.',
      });

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao gerar EPUB',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div>Carregando prévia...</div>;
  }

  if (!edition || Array.isArray(edition)) {
    return <div>Edição não encontrada</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Prévia da Edição</h1>
          <p className="text-muted-foreground">{edition.titulo} - {edition.numero_edicao}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGeneratePDF}>
            <Download className="mr-2 h-4 w-4" />
            Baixar PDF
          </Button>
          <Button variant="outline" onClick={handleGenerateEPUB}>
            <Download className="mr-2 h-4 w-4" />
            Baixar EPUB
          </Button>
        </div>
      </div>

      <Tabs defaultValue="reader" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reader">
            <FileText className="mr-2 h-4 w-4" />
            Leitor
          </TabsTrigger>
          <TabsTrigger value="flipbook">
            <BookOpen className="mr-2 h-4 w-4" />
            Flipbook
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reader" className="mt-6">
          <Card className="p-6">
            <div className="prose max-w-none">
              <h1>{edition.titulo}</h1>
              {edition.subtitulo && <p className="lead">{edition.subtitulo}</p>}
              <p className="text-muted-foreground">
                {edition.numero_edicao} - {edition.cidade}, {edition.uf}
              </p>
              <hr />
              {'items' in edition && edition.items && edition.items.length > 0 ? (
                <div className="space-y-4">
                  {edition.items.map((item, index) => (
                    <div key={item.id} className="border-b pb-4">
                      <p>Item {index + 1}: {item.tipo}</p>
                      {item.secao && <p className="text-sm text-muted-foreground">Seção: {item.secao}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum conteúdo adicionado ainda</p>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="flipbook" className="mt-6">
          <Card className="p-6">
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Visualização de flipbook será implementada aqui
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Usando react-pageflip para efeito de virar páginas
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
