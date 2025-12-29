import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Accessibility, 
  Type, 
  Volume2, 
  VolumeX,
  Contrast,
  RotateCcw,
  X,
  Play,
  Square,
  Pause
} from "lucide-react";
import { useAccessibility } from "@/hooks/useAccessibility";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { loadVLibras, unloadVLibras } from "@/lib/vlibras";
import { toast } from "sonner";

interface AccessibilityToolbarProps {
  className?: string;
}

export const AccessibilityToolbar = ({ className }: AccessibilityToolbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [vlibrasLoading, setVlibrasLoading] = useState(false);
  
  const {
    settings,
    toggleVLibras,
    adjustFontSize,
    toggleHighContrast,
    toggleDyslexicFont,
    setLineSpacing,
    resetSettings
  } = useAccessibility();

  const {
    speak,
    stop,
    pause,
    resume,
    status,
    isSupported
  } = useTextToSpeech();

  // Gerenciar VLibras
  useEffect(() => {
    if (settings.vlibrasEnabled) {
      setVlibrasLoading(true);
      loadVLibras()
        .then(() => {
          toast.success("VLibras ativado com sucesso!");
        })
        .catch((error) => {
          console.error("Erro ao carregar VLibras:", error);
          toast.error("Erro ao carregar VLibras");
        })
        .finally(() => {
          setVlibrasLoading(false);
        });
    } else {
      unloadVLibras();
    }

    return () => {
      // Não descarregar ao desmontar para manter preferência
    };
  }, [settings.vlibrasEnabled]);

  const handleReadPage = () => {
    if (status === 'playing') {
      pause();
      return;
    }
    
    if (status === 'paused') {
      resume();
      return;
    }

    // Extrair texto principal da página
    const mainContent = document.querySelector('main') || document.querySelector('article') || document.body;
    const textContent = mainContent?.textContent?.slice(0, 3000) || '';
    
    if (textContent.trim()) {
      speak(textContent);
      toast.success("Iniciando leitura da página...");
    } else {
      toast.error("Não foi possível encontrar conteúdo para ler");
    }
  };

  const handleStopReading = () => {
    stop();
    toast.info("Leitura interrompida");
  };

  const handleReset = () => {
    resetSettings();
    stop();
    toast.success("Configurações restauradas para o padrão");
  };

  const fontSizePercent = Math.round(settings.fontScale * 100);

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed top-20 right-4 z-50 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg ${className}`}
        size="icon"
        aria-label="Abrir ferramentas de acessibilidade"
      >
        <Accessibility className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Card className={`fixed top-20 right-4 z-50 w-80 shadow-2xl bg-card border-border ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2 text-card-foreground">
            <Accessibility className="h-5 w-5 text-primary" />
            Acessibilidade
          </h3>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Fechar ferramentas de acessibilidade"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* VLibras Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="vlibras" className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <span className="text-lg">🤟</span>
              VLibras (Libras)
            </Label>
            <Switch
              id="vlibras"
              checked={settings.vlibrasEnabled}
              onCheckedChange={toggleVLibras}
              disabled={vlibrasLoading}
              aria-label="Ativar tradução para Libras"
            />
          </div>
          {settings.vlibrasEnabled && (
            <p className="text-xs text-muted-foreground">
              Widget VLibras ativo. Procure o ícone azul no canto da tela.
            </p>
          )}

          <Separator />

          {/* Font Size */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Tamanho da Fonte: {fontSizePercent}%
            </Label>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => adjustFontSize(false)}
                variant="outline"
                size="sm"
                disabled={settings.fontScale <= 0.9}
                aria-label="Diminuir fonte"
                className="h-8"
              >
                <Type className="h-3 w-3" />
                <span className="ml-1">A-</span>
              </Button>
              <Slider
                value={[settings.fontScale * 100]}
                min={90}
                max={160}
                step={10}
                onValueChange={(value) => {
                  const newScale = value[0] / 100;
                  // Calcular diferença e aplicar incremento
                  if (newScale > settings.fontScale) {
                    adjustFontSize(true);
                  } else if (newScale < settings.fontScale) {
                    adjustFontSize(false);
                  }
                }}
                className="flex-1"
                aria-label="Ajustar tamanho da fonte"
              />
              <Button
                onClick={() => adjustFontSize(true)}
                variant="outline"
                size="sm"
                disabled={settings.fontScale >= 1.6}
                aria-label="Aumentar fonte"
                className="h-8"
              >
                <Type className="h-4 w-4" />
                <span className="ml-1">A+</span>
              </Button>
            </div>
          </div>

          <Separator />

          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <Label htmlFor="high-contrast" className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <Contrast className="h-4 w-4" />
              Alto Contraste
            </Label>
            <Switch
              id="high-contrast"
              checked={settings.highContrast}
              onCheckedChange={toggleHighContrast}
              aria-label="Ativar alto contraste"
            />
          </div>

          {/* Dyslexic Font */}
          <div className="flex items-center justify-between">
            <Label htmlFor="dyslexic-font" className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <Type className="h-4 w-4" />
              Fonte Disléxica
            </Label>
            <Switch
              id="dyslexic-font"
              checked={settings.dyslexicFont}
              onCheckedChange={toggleDyslexicFont}
              aria-label="Ativar fonte para dislexia"
            />
          </div>

          <Separator />

          {/* Line Spacing */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Espaçamento de Linha</Label>
            <div className="flex gap-2">
              <Button
                onClick={() => setLineSpacing('1.0')}
                variant={settings.lineSpacing === '1.0' ? 'default' : 'outline'}
                size="sm"
                className="flex-1 h-8 text-xs"
                aria-label="Espaçamento normal"
              >
                Normal
              </Button>
              <Button
                onClick={() => setLineSpacing('1.5')}
                variant={settings.lineSpacing === '1.5' ? 'default' : 'outline'}
                size="sm"
                className="flex-1 h-8 text-xs"
                aria-label="Espaçamento relaxado"
              >
                Relaxado
              </Button>
              <Button
                onClick={() => setLineSpacing('2.0')}
                variant={settings.lineSpacing === '2.0' ? 'default' : 'outline'}
                size="sm"
                className="flex-1 h-8 text-xs"
                aria-label="Espaçamento espaçoso"
              >
                Espaçoso
              </Button>
            </div>
          </div>

          <Separator />

          {/* Text-to-Speech */}
          {isSupported && (
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Leitura em Áudio
              </Label>
              <div className="flex gap-2">
                <Button
                  onClick={handleReadPage}
                  variant={status === 'playing' || status === 'paused' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 h-9"
                  aria-label={status === 'playing' ? 'Pausar leitura' : status === 'paused' ? 'Continuar leitura' : 'Ler página'}
                >
                  {status === 'playing' ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pausar
                    </>
                  ) : status === 'paused' ? (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Continuar
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Ler Página
                    </>
                  )}
                </Button>
                {(status === 'playing' || status === 'paused') && (
                  <Button
                    onClick={handleStopReading}
                    variant="destructive"
                    size="sm"
                    className="h-9"
                    aria-label="Parar leitura"
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {!isSupported && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <VolumeX className="h-4 w-4" />
              <span>Leitura em áudio não suportada neste navegador</span>
            </div>
          )}

          <Separator />

          {/* Reset Button */}
          <Button
            onClick={handleReset}
            variant="outline"
            className="w-full"
            aria-label="Restaurar configurações padrão"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar Padrões
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
