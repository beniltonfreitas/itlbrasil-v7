import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { ImageData } from "@/hooks/useArticles";

interface ImageGalleryProps {
  images: ImageData[];
  className?: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, className = "" }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (!images || images.length === 0) {
    return null;
  }

  // Filtrar apenas imagens válidas antes de ordenar
  const validImages = images.filter(img => 
    img && 
    typeof img === 'object' && 
    img.url && 
    typeof img.url === 'string' && 
    img.url.startsWith('http')
  );

  if (validImages.length === 0) {
    console.warn('ImageGallery: Nenhuma imagem válida encontrada');
    return null;
  }

  // Ordenar por position
  const sortedImages = [...validImages].sort((a, b) => {
    const posA = a.position ?? validImages.indexOf(a);
    const posB = b.position ?? validImages.indexOf(b);
    return posA - posB;
  });

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setSelectedImageIndex(null);
  };

  const goToPrevious = () => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedImageIndex !== null && selectedImageIndex < sortedImages.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  const selectedImage = selectedImageIndex !== null ? sortedImages[selectedImageIndex] : null;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedImages.map((image, index) => (
          <div key={image.id} className="group relative">
            <div 
              className="relative overflow-hidden rounded-lg border cursor-pointer transition-transform hover:scale-105"
              onClick={() => openLightbox(index)}
            >
              <img
                src={image.url}
                alt={image.caption || `Imagem ${index + 1}`}
                className="w-full h-48 object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ZoomIn className="h-8 w-8 text-white" />
              </div>
            </div>
            
            {(image.caption || image.credit) && (
              <div className="mt-2 space-y-1">
                {image.caption && (
                  <p className="text-sm text-foreground">{image.caption}</p>
                )}
                {image.credit && (
                  <p className="text-xs text-muted-foreground italic">{image.credit}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-4xl w-full h-[90vh] p-0 overflow-hidden">
          {selectedImage && (
            <div className="relative w-full h-full flex flex-col">
              {/* Header */}
              <div className="absolute top-0 left-0 right-0 z-10 bg-black/50 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {selectedImageIndex! + 1} de {sortedImages.length}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeLightbox}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Image */}
              <div className="relative flex-1 flex items-center justify-center bg-black">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.caption || `Imagem ${selectedImageIndex! + 1}`}
                  className="max-w-full max-h-full object-contain"
                />

                {/* Navigation buttons */}
                {sortedImages.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                      onClick={goToPrevious}
                      disabled={selectedImageIndex === 0}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                      onClick={goToNext}
                      disabled={selectedImageIndex === sortedImages.length - 1}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </>
                )}
              </div>

              {/* Caption and credit */}
              {(selectedImage.caption || selectedImage.credit) && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4">
                  {selectedImage.caption && (
                    <p className="text-sm mb-1">{selectedImage.caption}</p>
                  )}
                  {selectedImage.credit && (
                    <p className="text-xs text-gray-300 italic">{selectedImage.credit}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};