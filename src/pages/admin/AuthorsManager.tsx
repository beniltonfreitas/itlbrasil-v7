import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, Plus, Edit, Trash2, Mail } from "lucide-react";
import { useAuthors, useDeleteAuthor } from "@/hooks/useAuthors";
import { AuthorForm } from "@/components/forms/AuthorForm";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const AuthorsManager = () => {
  const { data: authors, isLoading } = useAuthors();
  const deleteAuthor = useDeleteAuthor();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<any>(null);

  const handleCreateAuthor = () => {
    setEditingAuthor(null);
    setDialogOpen(true);
  };

  const handleEditAuthor = (author: any) => {
    setEditingAuthor(author);
    setDialogOpen(true);
  };

  const handleDeleteAuthor = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este autor?")) {
      try {
        await deleteAuthor.mutateAsync(id);
      } catch (error) {
        console.error("Erro ao deletar autor:", error);
      }
    }
  };

  const handleFormSuccess = () => {
    setDialogOpen(false);
    setEditingAuthor(null);
  };

  const handleFormCancel = () => {
    setDialogOpen(false);
    setEditingAuthor(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Autores</h1>
          <p className="text-muted-foreground">
            Gerencie os autores e colaboradores do sistema
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateAuthor}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Autor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAuthor ? "Editar Autor" : "Novo Autor"}
              </DialogTitle>
            </DialogHeader>
            <AuthorForm
              author={editingAuthor}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-4 p-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : authors && authors.length > 0 ? (
            <div className="divide-y divide-border">
              {authors.map((author) => (
                <div key={author.id} className="p-6 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={author.avatar_url || ""} alt={author.name} />
                        <AvatarFallback>
                          {author.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{author.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          {author.email && (
                            <>
                              <Mail className="h-3 w-3" />
                              {author.email}
                            </>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {author._count?.articles || 0} artigos
                        </p>
                        {author.bio && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {author.bio}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditAuthor(author)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteAuthor(author.id)}
                        disabled={deleteAuthor.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum autor cadastrado</h3>
              <p className="text-muted-foreground mb-4">
                Adicione autores para gerenciar o conteúdo do sistema
              </p>
              <Button onClick={handleCreateAuthor}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar primeiro autor
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthorsManager;