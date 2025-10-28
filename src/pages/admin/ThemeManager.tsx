import { useState } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Palette, Eye, Check, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { THEME_MODELS } from "@/themes";

// Preview component for live theme demonstration
const ThemePreview = ({ theme }: { theme: any }) => {
  const previewColors = {
    "modelo-padrao-v10": "from-blue-500 to-blue-700",
    "modelo-classico-v11": "from-green-600 to-green-800", 
    "modelo-moderno-v9": "from-purple-500 to-purple-700",
    "modelo-magazine-v8": "from-orange-500 to-red-600",
    "modelo-compacto-v7": "from-gray-500 to-gray-700",
    "modelo-itl-02-v1": "from-blue-600 to-blue-800"
  };

  return (
    <div className="aspect-video bg-gradient-to-br rounded-lg overflow-hidden border shadow-sm">
      <div className={`h-full bg-gradient-to-br ${previewColors[theme.id as keyof typeof previewColors]} text-white p-4 flex flex-col justify-between`}>
        {/* Mock header */}
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold opacity-90">{theme.version}</div>
          <div className="w-20 h-1 bg-white/30 rounded"></div>
        </div>
        
        {/* Mock content */}
        <div className="space-y-2">
          <div className="w-3/4 h-2 bg-white/40 rounded"></div>
          <div className="w-1/2 h-2 bg-white/30 rounded"></div>
          <div className="w-2/3 h-2 bg-white/20 rounded"></div>
        </div>
        
        {/* Mock footer */}
        <div className="text-xs text-center opacity-75">{theme.name}</div>
      </div>
    </div>
  );
};

export default function ThemeManager() {
  const [isPreviewOpen, setIsPreviewOpen] = useState<string | null>(null);
  const { settings, loading: isLoadingTheme, updateSetting } = useSiteSettings();
  const { toast } = useToast();

  // Safely parse theme config
  let currentThemeValue = { model: "modelo-padrao-v10", name: "Modelo Padrão" };
  try {
    const themeValue = settings['portal_theme'];
    if (themeValue) {
      currentThemeValue = typeof themeValue === 'string' ? JSON.parse(themeValue) : themeValue;
    }
  } catch (error) {
    console.warn('Error parsing theme config, using default:', error);
  }

  const handleThemeChange = async (modelId: string, modelName: string) => {
    try {
      await updateSetting('portal_theme', JSON.stringify({ model: modelId, name: modelName }));
      
      toast({
        title: "✨ Tema alterado com sucesso!",
        description: `O modelo "${modelName}" foi aplicado instantaneamente.`,
      });
      
      // Força reload para aplicar o novo tema
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao alterar o tema do portal.",
        variant: "destructive",
      });
    }
  };

  const handlePreview = (themeId: string) => {
    setIsPreviewOpen(themeId);
    
    toast({
      title: "Preview do Tema",
      description: "Visualizando as características do modelo selecionado.",
    });
  };

  if (isLoadingTheme) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Modelos do Portal</h1>
          <p className="text-muted-foreground mt-1">
            Escolha o modelo visual do seu portal de notícias
          </p>
        </div>
        <Badge className="bg-primary/10 text-primary">
          Atual: {currentThemeValue.name}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {THEME_MODELS.map((model) => {
          const isActive = currentThemeValue.model === model.id;
          
          return (
            <Card key={model.id} className={`relative ${isActive ? 'ring-2 ring-primary' : ''}`}>
              {isActive && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-primary text-primary-foreground">
                    <Check className="h-3 w-3 mr-1" />
                    Ativo
                  </Badge>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  {model.name}
                  <Badge variant="outline" className="ml-auto">
                    {model.version}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {model.description}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ThemePreview theme={model} />
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Características:</h4>
                  <div className="flex flex-wrap gap-1">
                    {model.features.map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(model.id)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  
                  <Button
                    onClick={() => handleThemeChange(model.id, model.name)}
                    disabled={isLoadingTheme || isActive}
                    size="sm"
                    className="flex-1"
                    variant={isActive ? "secondary" : "default"}
                  >
                    {isLoadingTheme ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : isActive ? (
                      <Check className="h-4 w-4 mr-2" />
                    ) : (
                      <Zap className="h-4 w-4 mr-2" />
                    )}
                    {isActive ? "Ativo" : "Aplicar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}