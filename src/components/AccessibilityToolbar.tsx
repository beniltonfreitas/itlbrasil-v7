import React, { useState, useEffect, useCallback } from 'react';
import { 
  Accessibility, 
  Volume2, 
  VolumeX,
  Eye,
  Type,
  Hand,
  X,
  Plus,
  Minus,
  RotateCcw,
  ExternalLink,
  Keyboard,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  Square
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useAccessibility } from '@/hooks/useAccessibility';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useScreenReader } from '@/hooks/useScreenReader';
import { useAccessibilityShortcuts, ACCESSIBILITY_SHORTCUTS } from '@/hooks/useAccessibilityShortcuts';
import { loadVLibras } from '@/lib/vlibras';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface AccessibilityToolbarProps {
  className?: string;
}

export const AccessibilityToolbar: React.FC<AccessibilityToolbarProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [vlibrasLoading, setVlibrasLoading] = useState(false);
  
  const {
    settings,
    toggleVLibras,
    adjustFontSize,
    toggleHighContrast,
    toggleDyslexicFont,
    setLineSpacing,
    resetSettings,
  } = useAccessibility();

  const {
    speak,
    stop,
    pause,
    resume,
    status: speechStatus,
    isSupported: ttsSupported,
  } = useTextToSpeech();

  const {
    settings: screenReaderSettings,
    toggleScreenReader,
  } = useScreenReader();

  // Carregar VLibras automaticamente
  useEffect(() => {
    setVlibrasLoading(true);
    loadVLibras()
      .catch((error) => {
        console.error("Erro ao carregar VLibras:", error);
      })
      .finally(() => {
        setVlibrasLoading(false);
      });
  }, []);

  // Funções para Text-to-Speech
  const handleReadPage = useCallback(() => {
    if (speechStatus === 'playing') {
      pause();
      return;
    }
    
    if (speechStatus === 'paused') {
      resume();
      return;
    }

    const mainContent = document.querySelector('main') || document.querySelector('article') || document.body;
    const textContent = mainContent?.textContent?.slice(0, 5000) || '';
    
    if (textContent.trim()) {
      speak(textContent);
      toast.success("Iniciando leitura da página...");
    } else {
      toast.error("Não foi possível encontrar conteúdo para ler");
    }
  }, [speechStatus, speak, pause, resume]);

  const handleStopReading = useCallback(() => {
    stop();
    toast.info("Leitura interrompida");
  }, [stop]);

  const handleReset = useCallback(() => {
    resetSettings();
    stop();
    toast.success("Configurações restauradas para o padrão");
  }, [resetSettings, stop]);

  // Atalhos de teclado
  useAccessibilityShortcuts({
    onToggleMenu: () => setIsOpen(prev => !prev),
    onToggleVLibras: toggleVLibras,
    onIncreaseFontSize: () => adjustFontSize(true),
    onDecreaseFontSize: () => adjustFontSize(false),
    onToggleHighContrast: toggleHighContrast,
    onToggleTextToSpeech: handleReadPage,
    onToggleScreenReader: toggleScreenReader,
  });

  const fontSizePercentage = Math.round(settings.fontScale * 100);

  return (
    <>
      {/* Botão flutuante fixo - Abaixo do VLibras (bottom-32 para não sobrepor) */}
      <div 
        className={`fixed right-0 bottom-32 z-[9998] flex flex-col gap-2 ${className}`}
        role="region"
        aria-label="Ferramentas de acessibilidade"
      >
        {/* Botão Acessibilidade */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-14 h-14 rounded-l-xl shadow-lg flex items-center justify-center
            transition-all duration-300 hover:w-16
            ${isOpen 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-background border border-border text-foreground hover:bg-muted'
            }
          `}
          title="Menu de Acessibilidade (Alt+A)"
          aria-label="Abrir menu de acessibilidade"
          aria-expanded={isOpen}
          aria-controls="accessibility-panel"
        >
          <Accessibility className="w-6 h-6" />
        </button>
      </div>

      {/* Painel de Acessibilidade */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-[9998]"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Painel */}
          <div 
            id="accessibility-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="accessibility-title"
            className="fixed right-4 bottom-36 w-[350px] max-h-[80vh] bg-background border border-border rounded-xl shadow-2xl z-[9999] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 bg-primary text-primary-foreground flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Accessibility className="w-5 h-5" />
                <h2 id="accessibility-title" className="font-bold">Acessibilidade</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-primary-foreground/20 rounded-full transition-colors"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* VLibras Info */}
              <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <Hand className="w-5 h-5 text-blue-600" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  VLibras está sempre ativo. Procure o ícone azul no canto da tela.
                </p>
              </div>

              <Separator />

              {/* Tamanho da Fonte */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Type className="w-5 h-5 text-green-600" />
                    <Label className="font-medium">Tamanho da Fonte</Label>
                  </div>
                  <Badge variant="secondary">{fontSizePercentage}%</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => adjustFontSize(false)}
                    disabled={settings.fontScale <= 0.9}
                    aria-label="Diminuir fonte"
                    className="h-8 w-8"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Slider
                    value={[settings.fontScale * 100]}
                    min={90}
                    max={160}
                    step={10}
                    onValueChange={(value) => {
                      const newScale = value[0] / 100;
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
                    variant="outline"
                    size="icon"
                    onClick={() => adjustFontSize(true)}
                    disabled={settings.fontScale >= 1.6}
                    aria-label="Aumentar fonte"
                    className="h-8 w-8"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Alto Contraste */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-yellow-600" />
                  <Label htmlFor="contrast-toggle" className="font-medium">Alto Contraste</Label>
                </div>
                <Switch
                  id="contrast-toggle"
                  checked={settings.highContrast}
                  onCheckedChange={toggleHighContrast}
                />
              </div>

              {/* Fonte Disléxica */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Type className="w-5 h-5 text-purple-600" />
                  <Label htmlFor="dyslexic-toggle" className="font-medium">Fonte Disléxica</Label>
                </div>
                <Switch
                  id="dyslexic-toggle"
                  checked={settings.dyslexicFont}
                  onCheckedChange={toggleDyslexicFont}
                />
              </div>

              {/* Modo Leitor de Tela */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Accessibility className="w-5 h-5 text-teal-600" />
                  <Label htmlFor="screenreader-toggle" className="font-medium">Modo Leitor de Tela</Label>
                </div>
                <Switch
                  id="screenreader-toggle"
                  checked={screenReaderSettings.enabled}
                  onCheckedChange={toggleScreenReader}
                />
              </div>
              {screenReaderSettings.enabled && (
                <p className="text-xs text-muted-foreground ml-7">
                  Pressione H para navegar entre títulos. Shift+H para voltar.
                </p>
              )}

              <Separator />

              {/* Espaçamento de Linha */}
              <div className="space-y-3">
                <Label className="font-medium">Espaçamento de Linha</Label>
                <div className="flex gap-2">
                  {[
                    { value: '1.0' as const, label: 'Normal' },
                    { value: '1.5' as const, label: 'Relaxado' },
                    { value: '2.0' as const, label: 'Espaçoso' },
                  ].map(({ value, label }) => (
                    <Button
                      key={value}
                      variant={settings.lineSpacing === value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setLineSpacing(value)}
                      className="flex-1"
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Text-to-Speech */}
              {ttsSupported && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-red-600" />
                    <Label className="font-medium">Leitura de Texto</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={speechStatus === 'playing' || speechStatus === 'paused' ? 'default' : 'outline'}
                      onClick={handleReadPage}
                      className="flex-1"
                      size="sm"
                    >
                      {speechStatus === 'playing' ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pausar
                        </>
                      ) : speechStatus === 'paused' ? (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Continuar
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Ler Página
                        </>
                      )}
                    </Button>
                    {(speechStatus === 'playing' || speechStatus === 'paused') && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleStopReading}
                        aria-label="Parar leitura"
                      >
                        <Square className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {!ttsSupported && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <VolumeX className="w-4 h-4" />
                  <span>Leitura em áudio não suportada neste navegador</span>
                </div>
              )}

              <Separator />

              {/* Atalhos de Teclado */}
              <Collapsible open={showShortcuts} onOpenChange={setShowShortcuts}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between" size="sm">
                    <div className="flex items-center gap-2">
                      <Keyboard className="w-5 h-5 text-indigo-600" />
                      <span className="font-medium">Atalhos de Teclado</span>
                    </div>
                    {showShortcuts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-2">
                  {ACCESSIBILITY_SHORTCUTS.map((shortcut, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between text-sm py-1"
                    >
                      <span className="text-muted-foreground text-xs">{shortcut.description}</span>
                      <kbd className="px-2 py-0.5 bg-muted rounded text-xs font-mono">
                        Alt+{shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>

              <Separator />

              {/* Link para página de acessibilidade */}
              <Link
                to="/acessibilidade"
                className="flex items-center justify-center gap-2 text-primary hover:underline text-sm py-2"
                onClick={() => setIsOpen(false)}
              >
                <ExternalLink className="w-4 h-4" />
                Página de Acessibilidade
              </Link>

              {/* Restaurar Padrões */}
              <Button
                variant="outline"
                onClick={handleReset}
                className="w-full"
                size="sm"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Restaurar Padrões
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default AccessibilityToolbar;
