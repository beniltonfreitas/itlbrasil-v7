import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface RSSArticle {
  id: string;
  title: string;
  link: string;
  description: string;
  pubDate: string;
  image?: string;
  feedId: string;
  feedName: string;
  selected: boolean;
}

export interface FeedSelection {
  feedId: string;
  feedName: string;
  feedUrl: string;
  quantity: number;
  selected: boolean;
}

export interface GeneratedArticle {
  titulo: string;
  slug: string;
  resumo: string;
  conteudo: string;
  categoria: string;
  tags: string[];
  imagem_destaque?: string;
  credito_imagem?: string;
  fonte_nome: string;
  fonte_url: string;
}

export const useRSSToJson = () => {
  const { toast } = useToast();
  const [articles, setArticles] = useState<RSSArticle[]>([]);
  const [generatedJson, setGeneratedJson] = useState<string>("");
  const [isFetching, setIsFetching] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const fetchArticlesFromFeeds = async (selections: FeedSelection[]) => {
    setIsFetching(true);
    setArticles([]);
    
    try {
      const allArticles: RSSArticle[] = [];
      
      for (const selection of selections.filter(s => s.selected)) {
        try {
          const { data, error } = await supabase.functions.invoke('rss-to-json', {
            body: { 
              action: 'fetch-feed',
              feedUrl: selection.feedUrl,
              feedId: selection.feedId,
              feedName: selection.feedName,
              quantity: selection.quantity
            }
          });

          if (error) {
            console.error(`Erro ao buscar feed ${selection.feedName}:`, error);
            toast({
              title: "Erro ao buscar feed",
              description: `Falha ao buscar ${selection.feedName}: ${error.message}`,
              variant: "destructive"
            });
            continue;
          }

          if (data?.articles) {
            const feedArticles = data.articles.map((article: any, index: number) => ({
              ...article,
              id: `${selection.feedId}-${index}`,
              feedId: selection.feedId,
              feedName: selection.feedName,
              selected: true
            }));
            allArticles.push(...feedArticles);
          }
        } catch (err) {
          console.error(`Erro ao processar feed ${selection.feedName}:`, err);
        }
      }

      setArticles(allArticles);
      
      if (allArticles.length > 0) {
        toast({
          title: "Artigos encontrados",
          description: `${allArticles.length} artigos carregados dos feeds selecionados`
        });
      } else {
        toast({
          title: "Nenhum artigo encontrado",
          description: "Os feeds selecionados não retornaram artigos",
          variant: "destructive"
        });
      }

      return allArticles;
    } catch (error) {
      console.error("Erro ao buscar artigos:", error);
      toast({
        title: "Erro",
        description: "Falha ao buscar artigos dos feeds",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsFetching(false);
    }
  };

  const generateJsonFromArticles = async (selectedArticles: RSSArticle[]) => {
    if (selectedArticles.length === 0) {
      toast({
        title: "Nenhum artigo selecionado",
        description: "Selecione ao menos um artigo para gerar o JSON",
        variant: "destructive"
      });
      return null;
    }

    setIsGenerating(true);
    setProgress({ current: 0, total: selectedArticles.length });
    setGeneratedJson("");

    try {
      const generatedArticles: GeneratedArticle[] = [];
      const batchSize = 3; // Processar 3 de cada vez

      for (let i = 0; i < selectedArticles.length; i += batchSize) {
        const batch = selectedArticles.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (article) => {
          try {
            const { data, error } = await supabase.functions.invoke('rss-to-json', {
              body: {
                action: 'generate-json',
                articleUrl: article.link,
                articleTitle: article.title,
                feedName: article.feedName
              }
            });

            if (error) {
              console.error(`Erro ao processar artigo:`, error);
              return null;
            }

            return data?.article || null;
          } catch (err) {
            console.error(`Erro ao gerar JSON para artigo:`, err);
            return null;
          }
        });

        const results = await Promise.all(batchPromises);
        
        results.forEach(result => {
          if (result) {
            generatedArticles.push(result);
          }
        });

        setProgress({ current: Math.min(i + batchSize, selectedArticles.length), total: selectedArticles.length });
      }

      const jsonOutput = JSON.stringify({ noticias: generatedArticles }, null, 2);
      setGeneratedJson(jsonOutput);

      toast({
        title: "JSON gerado com sucesso",
        description: `${generatedArticles.length} artigos processados`
      });

      return jsonOutput;
    } catch (error) {
      console.error("Erro ao gerar JSON:", error);
      toast({
        title: "Erro",
        description: "Falha ao gerar JSON dos artigos",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleArticleSelection = (articleId: string) => {
    setArticles(prev => 
      prev.map(article => 
        article.id === articleId 
          ? { ...article, selected: !article.selected }
          : article
      )
    );
  };

  const selectAllArticles = (selected: boolean) => {
    setArticles(prev => prev.map(article => ({ ...article, selected })));
  };

  const clearArticles = () => {
    setArticles([]);
    setGeneratedJson("");
  };

  return {
    articles,
    generatedJson,
    isFetching,
    isGenerating,
    progress,
    fetchArticlesFromFeeds,
    generateJsonFromArticles,
    toggleArticleSelection,
    selectAllArticles,
    clearArticles,
    setGeneratedJson
  };
};
