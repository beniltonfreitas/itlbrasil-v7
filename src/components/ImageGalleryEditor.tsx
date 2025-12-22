import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, MoveUp, MoveDown, Image as ImageIcon, Upload, Loader2, Download } from "lucide-react";
import { ImageData } from "@/hooks/useArticles";
import { uploadImageToStorage } from "@/lib/imageUpload";
import { useToast } from "@/hooks/use-toast";
import { useImageImport } from "@/hooks/useImageImport";
import { cn } from "@/lib/utils";

interface ImageGalleryEditorProps {
  images: ImageData[];
  onChange: (images: ImageData[]) => void;
}

export const ImageGalleryEditor: React.FC<ImageGalleryEditorProps> = ({
  images,
  onChange,
}) => {
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { importFromUrl, isImporting } = useImageImport();

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

  // Import image from URL and save to storage
  const handleImportFromUrl = async () => {
    if (!newImageUrl.trim()) return;

    const cachedUrl = await importFromUrl(newImageUrl.trim());
    if (cachedUrl) {
      const newImage: ImageData = {
        id: generateId(),
        url: cachedUrl,
        caption: "",
        credit: "",
        position: images.length,
      };

      onChange([...images, newImage]);
      setNewImageUrl("");
    }
  };

  const removeImage = (imageId: string) => {
    const updatedImages = images
      .filter((img) => img.id !== imageId)
      .map((img, index) => ({ ...img, position: index }));
    onChange(updatedImages);
  };

  const handleSingleFileUpload = async (file: File) => {
    try {
      const result = await uploadImageToStorage(file);
      
      const newImage: ImageData = {
        id: generateId(),
        url: result.url,
        caption: "",
        credit: "",
        position: images.length,
      };

      onChange([...images, newImage]);
      return true;
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    let successCount = 0;
    
    for (const file of Array.from(files)) {
      const success = await handleSingleFileUpload(file);
      if (success) successCount++;
    }

    if (successCount > 0) {
      toast({
        title: "Imagens enviadas",
        description: `${successCount} imagem(ns) adicionada(s) à galeria.`,
      });
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Drag & Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    let successCount = 0;
    
    for (const file of Array.from(files)) {
      // Validate file type
      if (!file.type.startsWith('image/')) continue;
      const success = await handleSingleFileUpload(file);
      if (success) successCount++;
    }

    if (successCount > 0) {
      toast({
        title: "Imagens enviadas",
        description: `${successCount} imagem(ns) adicionada(s) à galeria.`,
      });
    }

    setUploading(false);
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
        {/* Drag & Drop Zone */}
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer",
            dragActive 
              ? "border-primary bg-primary/5 scale-[1.02]" 
              : "border-muted-foreground/20 hover:border-primary/50",
            uploading && "opacity-50 pointer-events-none"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 mx-auto mb-2 text-primary animate-spin" />
          ) : (
            <Upload className={cn(
              "h-8 w-8 mx-auto mb-2 transition-colors",
              dragActive ? "text-primary" : "text-muted-foreground"
            )} />
          )}
          <p className={cn(
            "text-sm font-medium transition-colors",
            dragActive ? "text-primary" : "text-muted-foreground"
          )}>
            {uploading 
              ? "Enviando imagens..." 
              : dragActive 
                ? "Solte as imagens aqui!" 
                : "Arraste imagens aqui ou clique para selecionar"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Suporta JPG, PNG, WEBP, GIF (máx. 10MB cada) • Compressão automática
          </p>
        </div>

        {/* URL Input with Import Button */}
        <div className="flex gap-2">
          <Input
            placeholder="Ou cole uma URL de imagem..."
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addImage()}
            disabled={isImporting}
          />
          <Button 
            onClick={handleImportFromUrl} 
            disabled={!newImageUrl.trim() || isImporting}
            variant="default"
            title="Importar para o Storage (recomendado)"
          >
            {isImporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>
          <Button 
            onClick={addImage} 
            disabled={!newImageUrl.trim() || isImporting}
            variant="outline"
            title="Usar link direto (pode quebrar)"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground -mt-2">
          💡 Use o botão azul para importar (recomendado) ou o botão + para link direto
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Images list */}
        {images.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm">Nenhuma imagem na galeria</p>
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
