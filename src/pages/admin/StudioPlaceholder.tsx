import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Video, Mic, Radio } from "lucide-react";

const StudioPlaceholder = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Play className="h-8 w-8 text-primary" />
          Estúdio ITL Brasil
        </h1>
        <p className="text-muted-foreground mt-2">
          Central de produção de conteúdo multimídia
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              Vídeos
            </CardTitle>
            <CardDescription>
              Gravação e edição de vídeos
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
              <Mic className="h-5 w-5 text-primary" />
              Podcast
            </CardTitle>
            <CardDescription>
              Produção de podcasts
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
              <Radio className="h-5 w-5 text-primary" />
              Rádio
            </CardTitle>
            <CardDescription>
              Transmissão de rádio ao vivo
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
            O Estúdio ITL Brasil está sendo desenvolvido e estará disponível em breve
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Esta será uma central completa de produção de conteúdo multimídia, incluindo:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>Gravação e edição de vídeos</li>
            <li>Produção de episódios de podcast</li>
            <li>Transmissão de rádio ao vivo</li>
            <li>Integração com redes sociais</li>
            <li>Biblioteca de mídia centralizada</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudioPlaceholder;
