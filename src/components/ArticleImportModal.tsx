import { useState } from "react";
import { Search, Clock, Eye, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useArticles } from "@/hooks/useArticles";
import { useCategories } from "@/hooks/useCategories";
import { useAuthors } from "@/hooks/useAuthors";
import { useArticleToWebStory } from "@/hooks/useArticleToWebStory";
import { toast } from "sonner";

interface ArticleImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ArticleImportModal = ({ open, onOpenChange }: ArticleImportModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [authorFilter, setAuthorFilter] = useState<string>("");

  const { data: articles = [], isLoading } = useArticles();
  const { data: categories = [] } = useCategories();
  const { data: authors = [] } = useAuthors();
  const { mutate: convertToWebStory, isPending } = useArticleToWebStory();

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || article.category?.slug === categoryFilter;
    const matchesAuthor = !authorFilter || article.author?.id === authorFilter;
    const isPublished = article.published_at !== null;
    
    return matchesSearch && matchesCategory && matchesAuthor && isPublished;
  });

  const handleCreateWebStory = (articleId: string, articleTitle: string) => {
    convertToWebStory(articleId, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Importar Artigo para WebStory</DialogTitle>
          <DialogDescription>
            Selecione um artigo publicado para converter automaticamente em WebStory
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar artigos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.slug}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={authorFilter} onValueChange={setAuthorFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todos os autores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os autores</SelectItem>
              {authors.map((author) => (
                <SelectItem key={author.id} value={author.id}>
                  {author.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando artigos...
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum artigo encontrado com os filtros selecionados.
            </div>
          ) : (
            filteredArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {article.featured_image && (
                      <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={article.featured_image}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                        {article.title}
                      </h3>
                      
                      {article.excerpt && (
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                          {article.excerpt}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        {article.author && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{article.author.name}</span>
                          </div>
                        )}
                        
                        {article.read_time && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{article.read_time} min</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{article.views_count || 0} views</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {article.category && (
                            <Badge variant="secondary" className="text-xs">
                              {article.category.name}
                            </Badge>
                          )}
                          {article.featured && (
                            <Badge variant="default" className="text-xs">
                              Destaque
                            </Badge>
                          )}
                        </div>
                        
                        <Button
                          onClick={() => handleCreateWebStory(article.id, article.title)}
                          disabled={isPending}
                          size="sm"
                        >
                          {isPending ? "Criando..." : "Criar WebStory"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};