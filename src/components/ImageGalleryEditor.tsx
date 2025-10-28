import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, MoveUp, MoveDown, Image as ImageIcon } from "lucide-react";
import { ImageData } from "@/hooks/useArticles";

interface ImageGalleryEditorProps {
  images: ImageData[];
  onChange: (images: ImageData[]) => void;
}

export const ImageGalleryEditor: React.FC<ImageGalleryEditorProps> = ({
  images,
  onChange,
}) => {
  const [newImageUrl, setNewImageUrl] = useState("");

  const generateId = () => `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addImage = () => {
    if (!newImageUrl.trim()) return;

    const newImage: ImageData = {
      id: generateId(),
      url: newImageUrl.trim(),
      caption: "",
      credit: "",
      position: images.length,
    };

    onChange([...images, newImage]);
    setNewImageUrl("");
  };

  const removeImage = (imageId: string) => {
    const updatedImages = images
      .filter((img) => img.id !== imageId)
      .map((img, index) => ({ ...img, position: index }));
    onChange(updatedImages);
  };

  const updateImage = (imageId: string, field: keyof ImageData, value: string | number) => {
    const updatedImages = images.map((img) =>
      img.id === imageId ? { ...img, [field]: value } : img
    );
    onChange(updatedImages);
  };

  const moveImage = (imageId: string, direction: "up" | "down") => {
    const currentIndex = images.findIndex((img) => img.id === imageId);
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === images.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const updatedImages = [...images];
    [updatedImages[currentIndex], updatedImages[newIndex]] = [
      updatedImages[newIndex],
      updatedImages[currentIndex],
    ];

    // Update positions
    updatedImages.forEach((img, index) => {
      img.position = index;
    });

    onChange(updatedImages);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Galeria de Imagens
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new image */}
        <div className="flex gap-2">
          <Input
            placeholder="URL da imagem..."
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addImage()}
          />
          <Button onClick={addImage} disabled={!newImageUrl.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Images list */}
        {images.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhuma imagem adicionada</p>
            <p className="text-sm">Adicione URLs de imagens para criar uma galeria</p>
          </div>
        ) : (
          <div className="space-y-4">
            {images.map((image, index) => (
              <Card key={image.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <span className="text-sm font-medium">Imagem</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveImage(image.id, "up")}
                        disabled={index === 0}
                      >
                        <MoveUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveImage(image.id, "down")}
                        disabled={index === images.length - 1}
                      >
                        <MoveDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeImage(image.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Image preview */}
                  <div className="relative">
                    <img
                      src={image.url}
                      alt={image.caption || "Preview"}
                      className="w-full h-32 object-cover rounded-md border"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden w-full h-32 bg-muted rounded-md border flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Erro ao carregar imagem</p>
                      </div>
                    </div>
                  </div>

                  {/* Image fields */}
                  <div className="space-y-2">
                    <div>
                      <Label htmlFor={`url-${image.id}`}>URL da Imagem</Label>
                      <Input
                        id={`url-${image.id}`}
                        value={image.url}
                        onChange={(e) => updateImage(image.id, "url", e.target.value)}
                        placeholder="https://exemplo.com/imagem.jpg"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`caption-${image.id}`}>Legenda (opcional)</Label>
                      <Textarea
                        id={`caption-${image.id}`}
                        value={image.caption || ""}
                        onChange={(e) => updateImage(image.id, "caption", e.target.value)}
                        placeholder="Descrição da imagem..."
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`credit-${image.id}`}>Crédito/Fonte (opcional)</Label>
                      <Input
                        id={`credit-${image.id}`}
                        value={image.credit || ""}
                        onChange={(e) => updateImage(image.id, "credit", e.target.value)}
                        placeholder="Fonte: Fotógrafo/Agência"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};