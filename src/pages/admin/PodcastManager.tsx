import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Plus, Upload, Headphones } from 'lucide-react';

export const PodcastManager: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Podcast</h1>
          <p className="text-muted-foreground">
            Gerencie episódios de podcast e conteúdo de áudio
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Episódio
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Gravar Episódio
            </CardTitle>
            <CardDescription>
              Grave um novo episódio diretamente no navegador
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Iniciar Gravação</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload de Áudio
            </CardTitle>
            <CardDescription>
              Faça upload de arquivos de áudio existentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Fazer Upload</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Headphones className="h-5 w-5" />
              Episódios
            </CardTitle>
            <CardDescription>
              Gerencie todos os episódios publicados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Ver Episódios</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};