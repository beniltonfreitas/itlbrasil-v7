import { useState } from 'react';
import { useArticles } from '@/hooks/useArticles';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Search, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EditionNewsLibraryProps {
  selectedArticles: string[];
  onToggleArticle: (articleId: string) => void;
  onAddArticles?: () => void;
}

export default function EditionNewsLibrary({
  selectedArticles,
  onToggleArticle,
  onAddArticles,
}: EditionNewsLibraryProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  const { data: articles, isLoading } = useArticles({ 
    category: categoryFilter || undefined,
  });

  const filteredArticles = articles?.filter((article) =>
    article.title.toLowerCase().includes(search.toLowerCase()) ||
    article.excerpt?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar notícias..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        {onAddArticles && (
          <Button
            onClick={onAddArticles}
            disabled={selectedArticles.length === 0}
          >
            Adicionar ({selectedArticles.length})
          </Button>
        )}
      </div>

      <div className="grid gap-4 max-h-[600px] overflow-y-auto">
        {isLoading ? (
          <div>Carregando...</div>
        ) : filteredArticles && filteredArticles.length > 0 ? (
          filteredArticles.map((article) => {
            const isSelected = selectedArticles.includes(article.id);
            
            return (
              <Card
                key={article.id}
                className={`p-4 cursor-pointer transition-colors ${
                  isSelected ? 'ring-2 ring-primary' : 'hover:bg-accent'
                }`}
                onClick={() => onToggleArticle(article.id)}
              >
                <div className="flex gap-4">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleArticle(article.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  
                  {article.featured_image ? (
                    <img
                      src={article.featured_image}
                      alt={article.title}
                      className="w-24 h-24 object-cover rounded"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-muted rounded flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold line-clamp-2 mb-1">{article.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {article.category && (
                        <Badge variant="outline">{article.category.name}</Badge>
                      )}
                      {article.published_at && (
                        <span>
                          {format(new Date(article.published_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      )}
                      <span>{article.read_time} min de leitura</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma notícia encontrada
          </div>
        )}
      </div>
    </div>
  );
}
