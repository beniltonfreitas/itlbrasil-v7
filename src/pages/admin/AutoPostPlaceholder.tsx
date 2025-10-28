import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Calendar, Share2, Settings } from "lucide-react";

const AutoPostPlaceholder = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Zap className="h-8 w-8 text-primary" />
          Auto Post
        </h1>
        <p className="text-muted-foreground mt-2">
          Automação de publicações em redes sociais
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Agendamento Automático
            </CardTitle>
            <CardDescription>
              Agende publicações para múltiplas plataformas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>
              Em Breve
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              Publicação Instantânea
            </CardTitle>
            <CardDescription>
              Publique em todas as redes simultaneamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>
              Em Breve
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Funcionalidade em Desenvolvimento</CardTitle>
          <CardDescription>
            O Auto Post está sendo desenvolvido e estará disponível em breve
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Esta ferramenta permitirá automação completa de publicações, incluindo:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>Agendamento de posts para múltiplas redes sociais</li>
            <li>Publicação automática de notícias assim que forem publicadas</li>
            <li>Integração com WhatsApp, Facebook, Instagram, Twitter/X</li>
            <li>Personalização de mensagens por plataforma</li>
            <li>Relatórios de engajamento</li>
            <li>Regras de automação customizáveis</li>
          </ul>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="flex items-start gap-2">
              <Settings className="h-5 w-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Configurações Futuras</p>
                <p className="text-xs text-muted-foreground">
                  Você poderá definir horários ideais de publicação, templates personalizados e muito mais.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutoPostPlaceholder;
