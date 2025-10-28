import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { useAccessibility } from "@/hooks/useAccessibility";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { 
  Accessibility, 
  Volume2, 
  Eye, 
  Type, 
  RotateCcw,
  CheckCircle2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AccessibilitySettings = () => {
  const {
    settings,
    toggleVLibras,
    adjustFontSize,
    toggleHighContrast,
    toggleDyslexicFont,
    setLineSpacing,
    resetSettings,
  } = useAccessibility();

  const { rate, setRate } = useTextToSpeech();

  const handleReset = () => {
    resetSettings();
    toast({
      title: "Configurações restauradas",
      description: "Todas as configurações de acessibilidade foram restauradas para os padrões.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Accessibility className="h-8 w-8 text-primary" />
          Configurações de Acessibilidade
        </h1>
        <p className="text-muted-foreground mt-2">
          Personalize sua experiência para melhor atender às suas necessidades
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recursos de Libras */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Accessibility className="h-5 w-5" />
              Língua Brasileira de Sinais
            </CardTitle>
            <CardDescription>
              Tradutor virtual de Libras
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="vlibras-full" className="font-medium">
                  VLibras Ativo
                </Label>
                <p className="text-xs text-muted-foreground">
                  Tradutor automático para Língua Brasileira de Sinais
                </p>
              </div>
              <Switch
                id="vlibras-full"
                checked={settings.vlibrasEnabled}
                onCheckedChange={toggleVLibras}
              />
            </div>

            {settings.vlibrasEnabled && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">VLibras Ativado</p>
                    <p className="text-xs text-muted-foreground">
                      O widget de tradução para Libras está visível no canto inferior direito da tela.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leitor de Tela (TTS) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Leitor de Texto
            </CardTitle>
            <CardDescription>
              Síntese de voz para leitura de conteúdo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="speech-rate">
                Velocidade de Leitura
              </Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="speech-rate"
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  value={[rate]}
                  onValueChange={([value]) => setRate(value)}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-12 text-right">
                  {rate.toFixed(1)}x
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Ajuste a velocidade de leitura da síntese de voz
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Controles Visuais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Ajustes Visuais
            </CardTitle>
            <CardDescription>
              Personalize a aparência do conteúdo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tamanho da Fonte */}
            <div className="space-y-2">
              <Label htmlFor="font-scale">
                Tamanho da Fonte
              </Label>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustFontSize(false)}
                  disabled={settings.fontScale <= 0.9}
                >
                  A-
                </Button>
                <div className="flex-1 text-center">
                  <span className="text-2xl font-bold">
                    {Math.round(settings.fontScale * 100)}%
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustFontSize(true)}
                  disabled={settings.fontScale >= 1.6}
                >
                  A+
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Faixa: 90% - 160%
              </p>
            </div>

            <Separator />

            {/* Alto Contraste */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="high-contrast-full" className="font-medium">
                  Alto Contraste
                </Label>
                <p className="text-xs text-muted-foreground">
                  Aumenta o contraste entre texto e fundo
                </p>
              </div>
              <Switch
                id="high-contrast-full"
                checked={settings.highContrast}
                onCheckedChange={toggleHighContrast}
              />
            </div>

            <Separator />

            {/* Fonte para Dislexia */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dyslexic-font-full" className="font-medium">
                  Fonte Amigável à Dislexia
                </Label>
                <p className="text-xs text-muted-foreground">
                  Usa fonte OpenDyslexic para facilitar leitura
                </p>
              </div>
              <Switch
                id="dyslexic-font-full"
                checked={settings.dyslexicFont}
                onCheckedChange={toggleDyslexicFont}
              />
            </div>
          </CardContent>
        </Card>

        {/* Espaçamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Espaçamento e Layout
            </CardTitle>
            <CardDescription>
              Ajuste o espaçamento para melhor legibilidade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="line-spacing-full">
                Espaçamento entre Linhas
              </Label>
              <Select
                value={settings.lineSpacing}
                onValueChange={(value) => setLineSpacing(value as '1.0' | '1.5' | '2.0')}
              >
                <SelectTrigger id="line-spacing-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1.0">Padrão (1.0)</SelectItem>
                  <SelectItem value="1.5">Relaxado (1.5)</SelectItem>
                  <SelectItem value="2.0">Amplo (2.0)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Maior espaçamento facilita a leitura
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações */}
      <Card>
        <CardHeader>
          <CardTitle>Restaurar Padrões</CardTitle>
          <CardDescription>
            Restaura todas as configurações de acessibilidade para os valores padrão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={handleReset}
            className="w-full sm:w-auto"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar Configurações Padrão
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessibilitySettings;
