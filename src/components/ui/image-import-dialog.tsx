import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useImageImport } from "@/hooks/useImageImport";
import { Loader2, Link, Download } from "lucide-react";

interface ImageImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageSelected: (url: string) => void;
  title?: string;
}

export function ImageImportDialog({
  open,
  onOpenChange,
  onImageSelected,
  title = "Inserir Imagem",
}: ImageImportDialogProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [mode, setMode] = useState<"direct" | "import">("import");
  const { importFromUrl, isImporting } = useImageImport();

  const handleSubmit = async () => {
    if (!imageUrl.trim()) return;

    if (mode === "direct") {
      onImageSelected(imageUrl.trim());
      setImageUrl("");
      onOpenChange(false);
    } else {
      const cachedUrl = await importFromUrl(imageUrl.trim());
      if (cachedUrl) {
        onImageSelected(cachedUrl);
        setImageUrl("");
        onOpenChange(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isImporting && imageUrl.trim()) {
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Cole a URL de uma imagem. Você pode usar diretamente ou importar para o armazenamento do site.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="image-url">URL da Imagem</Label>
            <Input
              id="image-url"
              placeholder="https://exemplo.com/imagem.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isImporting}
            />
          </div>

          <RadioGroup value={mode} onValueChange={(v) => setMode(v as "direct" | "import")}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="import" id="import" disabled={isImporting} />
              <Label htmlFor="import" className="flex items-center gap-2 cursor-pointer">
                <Download className="h-4 w-4 text-primary" />
                <span>Importar para o Storage</span>
                <span className="text-xs text-muted-foreground">(recomendado)</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="direct" id="direct" disabled={isImporting} />
              <Label htmlFor="direct" className="flex items-center gap-2 cursor-pointer">
                <Link className="h-4 w-4" />
                <span>Usar link direto</span>
                <span className="text-xs text-muted-foreground">(pode quebrar)</span>
              </Label>
            </div>
          </RadioGroup>

          {mode === "import" && (
            <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
              A imagem será baixada e salva no servidor, garantindo que não quebre no futuro.
            </p>
          )}

          {mode === "direct" && (
            <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-2 rounded">
              ⚠️ Links externos podem expirar ou ser bloqueados. Use apenas se tiver certeza.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isImporting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!imageUrl.trim() || isImporting}>
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importando...
              </>
            ) : mode === "import" ? (
              <>
                <Download className="h-4 w-4 mr-2" />
                Importar
              </>
            ) : (
              "Inserir"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
