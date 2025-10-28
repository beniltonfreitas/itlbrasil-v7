import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Image,
  Video,
  Upload,
  Search,
  Filter,
  Grid3X3,
  List,
  FolderPlus,
  Trash2,
  Download,
  Edit,
  Eye,
  MoreHorizontal,
  Tag,
  Calendar
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

const SocialMediaLibrary = () => {
  const [viewMode, setViewMode] = useState("grid");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterFolder, setFilterFolder] = useState("all");

  // Mock data para biblioteca de mídia
  const mediaFiles = [
    {
      id: "1",
      title: "Banner Tech 2024",
      description: "Banner promocional para eventos de tecnologia",
      fileUrl: "/api/placeholder/400/300",
      fileType: "image/jpeg",
      fileSize: 245760,
      width: 1920,
      height: 1080,
      tags: ["banner", "tech", "evento"],
      folder: "banners",
      isPublic: true,
      createdAt: "2024-01-10T10:00:00Z"
    },
    {
      id: "2",
      title: "Video Tutorial IA",
      description: "Tutorial sobre inteligência artificial",
      fileUrl: "/api/placeholder/400/225",
      fileType: "video/mp4",
      fileSize: 15728640,
      width: 1280,
      height: 720,
      duration: 120,
      tags: ["tutorial", "ia", "educacional"],
      folder: "videos",
      isPublic: false,
      createdAt: "2024-01-12T14:30:00Z"
    },
    {
      id: "3",
      title: "Logo ITL Brasil",
      description: "Logo oficial da empresa",
      fileUrl: "/api/placeholder/300/300",
      fileType: "image/png",
      fileSize: 52480,
      width: 512,
      height: 512,
      tags: ["logo", "branding"],
      folder: "logos",
      isPublic: true,
      createdAt: "2024-01-08T09:15:00Z"
    }
  ];

  const folders = ["banners", "videos", "logos", "posts", "stories"];

  const filteredFiles = mediaFiles.filter(file => {
    const matchesSearch = file.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === "all" || 
                       (filterType === "image" && file.fileType.startsWith("image")) ||
                       (filterType === "video" && file.fileType.startsWith("video"));
    const matchesFolder = filterFolder === "all" || file.folder === filterFolder;
    
    return matchesSearch && matchesType && matchesFolder;
  });

  const handleFileAction = (action: string, fileId: string) => {
    toast({
      title: `Arquivo ${action}`,
      description: `Ação "${action}" executada no arquivo ${fileId}`,
    });
  };

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Biblioteca de Mídia</h1>
            <p className="text-muted-foreground">
              Gerencie suas imagens, vídeos e outros arquivos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1">
              <Image className="h-4 w-4 mr-2" />
              {filteredFiles.length} arquivos
            </Badge>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>

        {/* Filtros e Busca */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar arquivos, tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="image">Imagens</SelectItem>
                    <SelectItem value="video">Vídeos</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filterFolder} onValueChange={setFilterFolder}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas Pastas</SelectItem>
                    {folders.map(folder => (
                      <SelectItem key={folder} value={folder}>
                        {folder}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button variant="outline" size="sm">
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Nova Pasta
                </Button>
                
                <div className="flex items-center border rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações em Lote */}
        {selectedFiles.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {selectedFiles.length} arquivo(s) selecionado(s)
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm">
                    <Tag className="h-4 w-4 mr-2" />
                    Adicionar Tags
                  </Button>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Biblioteca */}
        <Card>
          <CardContent className="pt-6">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredFiles.map(file => (
                  <div key={file.id} className="group relative border rounded-lg overflow-hidden hover:border-primary/50">
                    <div className="absolute top-2 left-2 z-10">
                      <Checkbox
                        checked={selectedFiles.includes(file.id)}
                        onCheckedChange={() => handleFileSelect(file.id)}
                        className="bg-white/80 backdrop-blur-sm"
                      />
                    </div>
                    
                    <div className="absolute top-2 right-2 z-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleFileAction("visualizar", file.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleFileAction("editar", file.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleFileAction("download", file.id)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleFileAction("excluir", file.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="aspect-square bg-muted flex items-center justify-center">
                      {file.fileType.startsWith("image") ? (
                        <img 
                          src={file.fileUrl}
                          alt={file.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Video className="h-8 w-8" />
                          {file.duration && (
                            <span className="text-xs bg-black/70 text-white px-2 py-1 rounded">
                              {formatDuration(file.duration)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-3">
                      <h4 className="font-medium text-sm truncate">{file.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatFileSize(file.fileSize)}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        {file.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs px-1">
                            {tag}
                          </Badge>
                        ))}
                        {file.tags.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{file.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredFiles.map(file => (
                  <div key={file.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50">
                    <Checkbox
                      checked={selectedFiles.includes(file.id)}
                      onCheckedChange={() => handleFileSelect(file.id)}
                    />
                    
                    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                      {file.fileType.startsWith("image") ? (
                        <img 
                          src={file.fileUrl}
                          alt={file.title}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <Video className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{file.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {file.folder}
                        </Badge>
                        {file.isPublic && (
                          <Badge variant="secondary" className="text-xs">
                            Público
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {file.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{formatFileSize(file.fileSize)}</span>
                        {file.width && file.height && (
                          <span>{file.width}×{file.height}</span>
                        )}
                        {file.duration && (
                          <span>{formatDuration(file.duration)}</span>
                        )}
                        <span>{new Date(file.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        {file.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs px-1">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleFileAction("visualizar", file.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleFileAction("editar", file.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleFileAction("download", file.id)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleFileAction("excluir", file.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
            
            {filteredFiles.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Image className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Nenhum arquivo encontrado</p>
                <p className="text-sm">Faça upload de arquivos ou ajuste os filtros</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};

export default SocialMediaLibrary;