import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Plus, 
  Search, 
  Settings, 
  Eye, 
  Lock, 
  DollarSign,
  EyeOff,
  MessageSquare,
  UserPlus
} from "lucide-react";

const CommunityGroups = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - em produção vir da API
  const communities = [
    {
      id: 1,
      name: "Tecnologia e Inovação",
      slug: "tecnologia-inovacao",
      description: "Discussões sobre as últimas tendências em tecnologia, startups e inovação digital.",
      type: "public",
      memberCount: 324,
      postCount: 89,
      coverImage: "/placeholder-community.jpg",
      isActive: true,
      monthlyPrice: 0,
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      name: "Análise Política Premium",
      slug: "analise-politica-premium",
      description: "Análises aprofundadas e debates exclusivos sobre cenário político brasileiro.",
      type: "paid",
      memberCount: 156,
      postCount: 67,
      coverImage: "/placeholder-community.jpg",
      isActive: true,
      monthlyPrice: 29.90,
      createdAt: "2024-02-20"
    },
    {
      id: 3,
      name: "Mercado Financeiro",
      slug: "mercado-financeiro",
      description: "Discussões sobre investimentos, economia e mercado de capitais.",
      type: "private",
      memberCount: 198,
      postCount: 45,
      coverImage: "/placeholder-community.jpg",
      isActive: true,
      monthlyPrice: 0,
      createdAt: "2024-01-10"
    },
    {
      id: 4,
      name: "Jornalistas ITL",
      slug: "jornalistas-itl",
      description: "Espaço exclusivo para colaboradores e jornalistas da equipe ITL Brasil.",
      type: "secret",
      memberCount: 12,
      postCount: 23,
      coverImage: "/placeholder-community.jpg",
      isActive: true,
      monthlyPrice: 0,
      createdAt: "2024-03-01"
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'public': return <Eye className="h-4 w-4" />;
      case 'private': return <Lock className="h-4 w-4" />;
      case 'paid': return <DollarSign className="h-4 w-4" />;
      case 'secret': return <EyeOff className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'public': return 'Pública';
      case 'private': return 'Privada';
      case 'paid': return 'Paga';
      case 'secret': return 'Secreta';
      default: return 'Pública';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'public': return 'default';
      case 'private': return 'secondary';
      case 'paid': return 'destructive';
      case 'secret': return 'outline';
      default: return 'default';
    }
  };

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Grupos & Espaços</h1>
          <p className="text-muted-foreground">
            Gerencie comunidades, grupos de discussão e espaços temáticos
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Comunidade
        </Button>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {communities.reduce((acc, c) => acc + c.memberCount, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total de Membros</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <MessageSquare className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {communities.reduce((acc, c) => acc + c.postCount, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Posts Totais</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <UserPlus className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{communities.length}</p>
                <p className="text-sm text-muted-foreground">Comunidades Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {communities.filter(c => c.type === 'paid').length}
                </p>
                <p className="text-sm text-muted-foreground">Comunidades Pagas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar comunidades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filtros</Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Comunidades */}
      <div className="grid gap-6">
        {filteredCommunities.map((community) => (
          <Card key={community.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-foreground">{community.name}</h3>
                    <Badge variant={getTypeColor(community.type) as any} className="gap-1">
                      {getTypeIcon(community.type)}
                      {getTypeLabel(community.type)}
                    </Badge>
                    {community.type === 'paid' && (
                      <Badge variant="outline">
                        R$ {community.monthlyPrice}/mês
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {community.description}
                  </p>
                  
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{community.memberCount} membros</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{community.postCount} posts</span>
                    </div>
                    <div>
                      Criada em {new Date(community.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button size="sm">
                    Gerenciar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCommunities.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhuma comunidade encontrada
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Crie sua primeira comunidade para começar.'}
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Comunidade
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CommunityGroups;