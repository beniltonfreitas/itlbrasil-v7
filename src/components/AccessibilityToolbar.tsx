import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Accessibility, 
  Type, 
  Eye, 
  Volume2, 
  VolumeX,
  Sun,
  Moon,
  Contrast
} from "lucide-react";

interface AccessibilityToolbarProps {
  className?: string;
}

export const AccessibilityToolbar = ({ className }: AccessibilityToolbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [highContrast, setHighContrast] = useState(false);
  const [readingMode, setReadingMode] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const adjustFontSize = (increment: boolean) => {
    const newSize = increment 
      ? Math.min(fontSize + 25, 200) 
      : Math.max(fontSize - 25, 100);
    setFontSize(newSize);
    document.documentElement.style.fontSize = `${newSize}%`;
  };

  const toggleHighContrast = () => {
    const newContrast = !highContrast;
    setHighContrast(newContrast);
    document.documentElement.classList.toggle('high-contrast', newContrast);
  };

  const toggleReadingMode = () => {
    const newMode = !readingMode;
    setReadingMode(newMode);
    document.documentElement.classList.toggle('reading-mode', newMode);
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    // Implementar text-to-speech aqui
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-50 bg-primary hover:bg-primary-light"
        size="icon"
        aria-label="Abrir ferramentas de acessibilidade"
      >
        <Accessibility className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Card className="fixed top-4 right-4 z-50 w-80 shadow-2xl">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Accessibility className="h-5 w-5" />
            Acessibilidade
          </h3>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="sm"
            aria-label="Fechar ferramentas de acessibilidade"
          >
            ×
          </Button>
        </div>

        <div className="space-y-4">
          {/* Font Size Controls */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Tamanho da Fonte: {fontSize}%
            </label>
            <div className="flex gap-2">
              <Button
                onClick={() => adjustFontSize(false)}
                variant="outline"
                size="sm"
                disabled={fontSize <= 100}
                aria-label="Diminuir fonte"
              >
                <Type className="h-4 w-4 mr-1" />
                A-
              </Button>
              <Button
                onClick={() => adjustFontSize(true)}
                variant="outline"
                size="sm"
                disabled={fontSize >= 200}
                aria-label="Aumentar fonte"
              >
                <Type className="h-4 w-4 mr-1" />
                A+
              </Button>
            </div>
          </div>

          <Separator />

          {/* High Contrast */}
          <Button
            onClick={toggleHighContrast}
            variant={highContrast ? "default" : "outline"}
            className="w-full justify-start"
            aria-label="Alternar alto contraste"
            aria-pressed={highContrast}
          >
            <Contrast className="h-4 w-4 mr-2" />
            Alto Contraste
          </Button>

          {/* Reading Mode */}
          <Button
            onClick={toggleReadingMode}
            variant={readingMode ? "default" : "outline"}
            className="w-full justify-start"
            aria-label="Alternar modo de leitura"
            aria-pressed={readingMode}
          >
            <Eye className="h-4 w-4 mr-2" />
            Modo Leitura
          </Button>

          {/* Audio Support */}
          <Button
            onClick={toggleAudio}
            variant={audioEnabled ? "default" : "outline"}
            className="w-full justify-start"
            aria-label="Alternar leitura em áudio"
            aria-pressed={audioEnabled}
          >
            {audioEnabled ? (
              <Volume2 className="h-4 w-4 mr-2" />
            ) : (
              <VolumeX className="h-4 w-4 mr-2" />
            )}
            Leitura em Áudio
          </Button>

          <Separator />

          {/* VLibras Integration */}
          <div className="text-center">
            <div 
              id="vlibras"
              className="inline-block"
              dangerouslySetInnerHTML={{
                __html: `<div vw class="enabled">
                  <div vw-access-button class="active"></div>
                  <div vw-plugin-wrapper>
                    <div class="vw-plugin-top-wrapper"></div>
                  </div>
                </div>`
              }}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Tradução para Libras disponível
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};