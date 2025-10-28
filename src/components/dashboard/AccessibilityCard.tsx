import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAccessibility } from "@/hooks/useAccessibility";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { loadVLibras, unloadVLibras } from "@/lib/vlibras";
import { 
  Accessibility, 
  Volume2, 
  Eye, 
  Type, 
  AlignLeft, 
  Settings as SettingsIcon,
  Play,
  Pause,
  Square
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";

export const AccessibilityCard = () => {
  const navigate = useNavigate();
  const {
    settings,
    toggleVLibras,
    adjustFontSize,
    toggleHighContrast,
    toggleDyslexicFont,
    setLineSpacing,
  } = useAccessibility();

  const { speak, pause, resume, stop, status, isSupported } = useTextToSpeech();

  // Carregar/descarregar VLibras quando o estado mudar
  useEffect(() => {
    if (settings.vlibrasEnabled) {
      loadVLibras().catch((error) => {
        console.error('Erro ao carregar VLibras:', error);
        toast({
          title: "Erro ao carregar VLibras",
          description: "Não foi possível ativar o tradutor de Libras.",
          variant: "destructive",
        });
      });
    } else {
      unloadVLibras();
    }
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
    const mainContent = document.querySelector('main');
    const textContent = mainContent?.innerText || document.body.innerText;
    
    if (!textContent) {
      toast({
        title: "Nenhum conteúdo encontrado",
        description: "Não há texto para ler nesta página.",
        variant: "destructive",
      });
      return;
    }

    // Ler apenas os primeiros 500 caracteres para não sobrecarregar
    const excerpt = textContent.substring(0, 500);
    speak(excerpt);
  };

  const handleStopReading = () => {
    stop();
  };

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Accessibility className="h-5 w-5 text-primary" />
          Acessibilidade
        </CardTitle>
        <CardDescription>
          Recursos para melhorar sua experiência
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* VLibras */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="vlibras" className="font-medium">
              VLibras (Libras)
            </Label>
            <p className="text-xs text-muted-foreground">
              Tradutor para Língua Brasileira de Sinais
            </p>
          </div>
          <Switch
            id="vlibras"
            checked={settings.vlibrasEnabled}
            onCheckedChange={toggleVLibras}
            aria-label="Ativar ou desativar VLibras"
          />
        </div>

        <Separator />

        {/* Leitor de Página (TTS) */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            <Label className="font-medium">Leitor de Página</Label>
          </div>
          {!isSupported ? (
            <p className="text-xs text-muted-foreground">
              Seu navegador não suporta leitura de texto.
            </p>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReadPage}
                className="flex-1"
                aria-label={status === 'playing' ? 'Pausar leitura' : 'Ler página'}
              >
                {status === 'playing' ? (
                  <>
                    <Pause className="h-3 w-3 mr-1" />
                    Pausar
                  </>
                ) : status === 'paused' ? (
                  <>
                    <Play className="h-3 w-3 mr-1" />
                    Continuar
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 mr-1" />
                    Ler Página
                  </>
                )}
              </Button>
              {status !== 'idle' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStopReading}
                  aria-label="Parar leitura"
                >
                  <Square className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Controles Visuais */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <Label className="font-medium">Controles Visuais</Label>
          </div>

          {/* Tamanho da Fonte */}
          <div className="flex items-center justify-between">
            <Label className="text-sm">Tamanho da Fonte</Label>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustFontSize(false)}
                aria-label="Diminuir fonte"
              >
                A-
              </Button>
              <span className="px-3 py-1 text-sm flex items-center">
                {Math.round(settings.fontScale * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustFontSize(true)}
                aria-label="Aumentar fonte"
              >
                A+
              </Button>
            </div>
          </div>

          {/* Alto Contraste */}
          <div className="flex items-center justify-between">
            <Label htmlFor="high-contrast" className="text-sm">
              Alto Contraste
            </Label>
            <Switch
              id="high-contrast"
              checked={settings.highContrast}
              onCheckedChange={toggleHighContrast}
              aria-label="Ativar ou desativar alto contraste"
            />
          </div>

          {/* Fonte para Dislexia */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dyslexic-font" className="text-sm">
                Fonte Amigável à Dislexia
              </Label>
            </div>
            <Switch
              id="dyslexic-font"
              checked={settings.dyslexicFont}
              onCheckedChange={toggleDyslexicFont}
              aria-label="Ativar ou desativar fonte para dislexia"
            />
          </div>

          {/* Espaçamento de Linhas */}
          <div className="flex items-center justify-between">
            <Label htmlFor="line-spacing" className="text-sm">
              Espaçamento de Linhas
            </Label>
            <Select
              value={settings.lineSpacing}
              onValueChange={(value) => setLineSpacing(value as '1.0' | '1.5' | '2.0')}
            >
              <SelectTrigger id="line-spacing" className="w-24" aria-label="Selecionar espaçamento de linhas">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1.0">Padrão</SelectItem>
                <SelectItem value="1.5">1.5x</SelectItem>
                <SelectItem value="2.0">2.0x</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Link para Configurações */}
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => navigate('/admin/settings/accessibility')}
        >
          <SettingsIcon className="h-4 w-4 mr-2" />
          Configurações de Acessibilidade
        </Button>
      </CardContent>
    </Card>
  );
};
