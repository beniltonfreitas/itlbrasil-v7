import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  FileText, 
  Plus, 
  Search, 
  Download, 
  Eye,
  Edit,
  Trash2,
  DollarSign,
  Users,
  BookOpen,
  Star,
  TrendingUp,
  Shield,
  Clock
} from 'lucide-react';

interface Ebook {
  id: string;
  title: string;
  author: string;
  category: string;
  price: number;
  downloads: number;
  rating: number;
  reviews: number;
  fileSize: number; // in MB
  pages: number;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  coverImage?: string;
  revenue: number;
}

const AcademyEbooks: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Mock data - will be replaced with real data from hooks
  const ebooks: Ebook[] = [
    {
      id: '1',
      title: 'Guia Completo de Marketing Digital',
      author: 'Maria Silva',
      category: 'Marketing',
      price: 29.90,
      downloads: 1247,
      rating: 4.8,
      reviews: 234,
      fileSize: 15.2,
      pages: 120,
      status: 'published',
      publishedAt: new Date(2024, 11, 15),
      revenue: 37286.30
    },
    {
      id: '2',
      title: 'Manual de Vendas B2B',
      author: 'João Santos',
      category: 'Vendas',
      price: 49.90,
      downloads: 834,
      rating: 4.9,
      reviews: 167,
      fileSize: 22.8,
      pages: 185,
      status: 'published',
      publishedAt: new Date(2024, 10, 20),
      revenue: 41616.60
    },
    {
      id: '3',
      title: 'Liderança na Era Digital',
      author: 'Ana Costa',
      category: 'Liderança',
      price: 39.90,
      downloads: 567,
      rating: 4.7,
      reviews: 89,
      fileSize: 18.5,
      pages: 150,
      status: 'published',
      publishedAt: new Date(2024, 9, 10),
      revenue: 22623.30
    },
    {
      id: '4',
      title: 'Programação React - Fundamentos',
      author: 'Pedro Oliveira',
      category: 'Tecnologia',
      price: 35.90,
      downloads: 0,
      rating: 0,
      reviews: 0,
      fileSize: 25.6,
      pages: 200,
      status: 'draft',
      revenue: 0
    }
  ];

  const categories = ['Marketing', 'Vendas', 'Tecnologia', 'Liderança', 'Comunicação'];

  const getStatusColor = (status: Ebook['status']) => {
    switch (status) {
      case 'published':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'archived':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const filteredEbooks = ebooks.filter(ebook => {
    const matchesSearch = ebook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ebook.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ebook.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || ebook.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const formatFileSize = (sizeInMB: number) => {
    if (sizeInMB >= 1024) {
      return `${(sizeInMB / 1024).toFixed(1)} GB`;
    }
    return `${sizeInMB.toFixed(1)} MB`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalRevenue = ebooks.reduce((acc, ebook) => acc + ebook.revenue, 0);
  const totalDownloads = ebooks.reduce((acc, ebook) => acc + ebook.downloads, 0);

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            E-books & Materiais
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie sua biblioteca digital de e-books e materiais educacionais
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo E-book
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de E-books</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ebooks.length}</div>
            <p className="text-xs text-muted-foreground">
              {ebooks.filter(e => e.status === 'published').length} publicados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDownloads.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +15% este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Receita acumulada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(ebooks.filter(e => e.rating > 0).reduce((acc, ebook) => acc + ebook.rating, 0) / 
                ebooks.filter(e => e.rating > 0).length).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              {ebooks.filter(e => e.reviews > 0).reduce((acc, e) => acc + e.reviews, 0)} avaliações
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              E-books Mais Vendidos
            </CardTitle>
            <CardDescription>
              Performance dos últimos 30 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ebooks
                .filter(e => e.status === 'published')
                .sort((a, b) => b.downloads - a.downloads)
                .slice(0, 5)
                .map((ebook, index) => (
                  <div key={ebook.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{ebook.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {ebook.author} • {ebook.downloads} downloads
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{ebook.rating}</span>
                        </div>
                        <div className="text-sm text-green-600 font-medium">
                          {formatCurrency(ebook.revenue)}
                        </div>
                      </div>
                    </div>
                    <Progress 
                      value={(ebook.downloads / Math.max(...ebooks.map(e => e.downloads))) * 100} 
                      className="w-20"
                    />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Proteção & Segurança
            </CardTitle>
            <CardDescription>
              Status da proteção DRM
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Proteção DRM</span>
              <Badge variant="default">Ativa</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Watermark</span>
              <Badge variant="default">Ativo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Downloads Seguros</span>
              <Badge variant="default">Ativo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Controle de Acesso</span>
              <Badge variant="default">Ativo</Badge>
            </div>
            <div className="pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Último backup: há 2 horas
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" />
                <span className="text-xs text-muted-foreground">Backup automático ativo</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros e Pesquisa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar e-books ou autores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="published">Publicado</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="archived">Arquivado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* E-books Table */}
      <Card>
        <CardHeader>
          <CardTitle>Biblioteca de E-books</CardTitle>
          <CardDescription>
            {filteredEbooks.length} e-book(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>E-book</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Downloads</TableHead>
                <TableHead>Avaliação</TableHead>
                <TableHead>Receita</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEbooks.map((ebook) => (
                <TableRow key={ebook.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">{ebook.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {ebook.pages} páginas • {formatFileSize(ebook.fileSize)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{ebook.author}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{ebook.category}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(ebook.price)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      {ebook.downloads}
                    </div>
                  </TableCell>
                  <TableCell>
                    {ebook.rating > 0 ? (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{ebook.rating}</span>
                        <span className="text-muted-foreground text-sm">({ebook.reviews})</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-green-600">
                    {formatCurrency(ebook.revenue)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(ebook.status)}>
                      {ebook.status === 'published' ? 'Publicado' : 
                       ebook.status === 'draft' ? 'Rascunho' : 'Arquivado'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcademyEbooks;