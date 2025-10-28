import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface EnhancedImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  acceptMultiple?: boolean;
  maxFiles?: number;
}

export const EnhancedImageUpload = ({
  value,
  onChange,
  label = 'Imagem',
  placeholder = 'URL da imagem ou arraste arquivos aqui',
  className,
  disabled,
  acceptMultiple = false,
  maxFiles = 1,
}: EnhancedImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(value || '');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione apenas arquivos de imagem.',
        variant: 'destructive',
      });
      return false;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Erro',
        description: `O arquivo "${file.name}" é muito grande. Máximo 5MB.`,
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 1920px width/height)
        const maxSize = 1920;
        let { width, height } = img;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(blob || file);
          },
          'image/jpeg',
          0.8
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const uploadFile = async (file: File): Promise<string> => {
    if (!validateFile(file)) {
      throw new Error('Invalid file');
    }

    const compressedBlob = await compressImage(file);
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filePath, compressedBlob);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleFileUpload = async (files: FileList) => {
    if (files.length === 0) return;

    setUploading(true);

    try {
      const file = files[0]; // For now, handle single file
      const publicUrl = await uploadFile(file);

      setImageUrl(publicUrl);
      onChange(publicUrl);

      toast({
        title: 'Sucesso',
        description: 'Imagem enviada e otimizada com sucesso!',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao enviar a imagem. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, []);

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    onChange(url);
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {label && <Label>{label}</Label>}
      
      <div className="space-y-3">
        {/* URL Input */}
        <div className="flex gap-2">
          <Input
            type="url"
            value={imageUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled || uploading}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Drag & Drop Area */}
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-4 text-center transition-colors',
            dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/20',
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-2">
            <File className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Arraste e solte imagens aqui ou clique para selecionar
            </p>
            <p className="text-xs text-muted-foreground">
              Suporta JPG, PNG, WEBP (máx. 5MB)
            </p>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          className="hidden"
          disabled={disabled || uploading}
          multiple={acceptMultiple}
        />

        {/* Image preview */}
        {imageUrl && (
          <div className="relative inline-block">
            <div className="relative w-32 h-32 border rounded-lg overflow-hidden bg-muted">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={() => {
                  toast({
                    title: 'Erro',
                    description: 'Não foi possível carregar a imagem.',
                    variant: 'destructive',
                  });
                }}
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-1 right-1 h-6 w-6 p-0"
                onClick={handleRemoveImage}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!imageUrl && (
          <div className="w-32 h-32 border-2 border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center bg-muted/10">
            <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
          </div>
        )}
      </div>
    </div>
  );
};