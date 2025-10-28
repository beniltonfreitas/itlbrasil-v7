import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Zap, Settings, TrendingUp } from "lucide-react";

const AutoPostManager = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Auto Post</h1>
        <p className="text-muted-foreground">
          Configure publicações automáticas de conteúdo
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Agendamento Automático</CardTitle>
            </div>
            <CardDescription>
              Agende publicações de notícias em horários estratégicos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled variant="outline" className="w-full">
              <Clock className="h-4 w-4 mr-2" />
              Configurar Agendamento
              <Badge variant="secondary" className="ml-2">Em Breve</Badge>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle>Publicação Instantânea</CardTitle>
            </div>
            <CardDescription>
              Publique automaticamente ao importar de feeds RSS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled variant="outline" className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              Configurar Regras
              <Badge variant="secondary" className="ml-2">Em Breve</Badge>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Stats Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas de Publicação</CardTitle>
          <CardDescription>
            Acompanhe o desempenho das suas publicações automáticas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">-</p>
                <p className="text-sm text-muted-foreground">Posts Agendados</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Zap className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">-</p>
                <p className="text-sm text-muted-foreground">Posts Automáticos</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Calendar className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">-</p>
                <p className="text-sm text-muted-foreground">Este Mês</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Settings className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-2">Funcionalidade em Desenvolvimento</h3>
              <p className="text-sm text-muted-foreground">
                O Auto Post permitirá que você configure regras inteligentes para publicação automática de conteúdo,
                incluindo agendamento baseado em horários de pico, categorias específicas e muito mais.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutoPostManager;