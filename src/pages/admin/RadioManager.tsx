import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Radio, Plus, Youtube, Video } from 'lucide-react';

export const RadioManager: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rádio</h1>
          <p className="text-muted-foreground">
            Gerencie transmissões ao vivo e conteúdo de rádio
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Transmissão
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5" />
              Transmissão ao Vivo
            </CardTitle>
            <CardDescription>
              Configure uma transmissão ao vivo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Configurar</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Youtube className="h-5 w-5" />
              YouTube Live
            </CardTitle>
            <CardDescription>
              Integrar com YouTube para transmissão
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Conectar</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Vídeos
            </CardTitle>
            <CardDescription>
              Gerencie vídeos e conteúdo multimídia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Gerenciar</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};