import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Instagram, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTrainingVideos } from "@/hooks/useTrainingVideos";
import { instagramVideoSchema, type TrainingVideoFormData } from "@/schemas/trainingVideoSchema";

export const TrainingInstagram = () => {
  const { videos, isLoading, addVideo, deleteVideo, isAdding } = useTrainingVideos('instagram');
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<TrainingVideoFormData>({
    resolver: zodResolver(instagramVideoSchema)
  });

  const onSubmit = (data: TrainingVideoFormData) => {
    addVideo(data as any, {
      onSuccess: () => reset()
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Instagram className="h-8 w-8 text-purple-500" />
        <h1 className="text-3xl font-bold">Treinamento - Instagram</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Vídeo do Instagram</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="url">URL do Vídeo (Reels/IGTV)</Label>
              <Input 
                id="url"
                {...register('url')}
                placeholder="https://www.instagram.com/reel/..." 
                className="mt-1"
              />
              {errors.url && (
                <p className="text-sm text-destructive mt-1">{errors.url.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="title">Título</Label>
              <Input 
                id="title"
                {...register('title')}
                placeholder="Ex: Passo a passo" 
                className="mt-1" 
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea 
                id="description"
                {...register('description')}
                placeholder="Descrição do vídeo de treinamento..." 
                className="mt-1"
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
              )}
            </div>
            
            <Button type="submit" disabled={isAdding}>
              {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isAdding ? 'Adicionando...' : 'Adicionar Vídeo'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Vídeos Cadastrados ({videos?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : videos && videos.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="w-[120px]">URL</TableHead>
                  <TableHead className="w-[80px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videos.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell className="font-medium">{video.title}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {video.description || '-'}
                    </TableCell>
                    <TableCell>
                      <a 
                        href={video.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        Ver <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteVideo(video.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">Nenhum vídeo cadastrado ainda.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
