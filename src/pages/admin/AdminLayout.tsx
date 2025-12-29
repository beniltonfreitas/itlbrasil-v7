import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Rss, 
  Upload, 
  BarChart3, 
  Settings,
  Users,
  Tag,
  LogOut,
  User,
  Palette,
  Radio,
  Mic,
  PlusCircle,
  Clock,
  Tv,
  ChevronDown,
  ChevronRight,
  Globe,
  Newspaper,
  Share2,
  Shield,
  Calendar,
  Image,
  MessageCircle,
  TrendingUp,
  Heart,
  UserPlus,
  Trophy,
  DollarSign,
  Crown,
  Zap,
  Play,
  Wrench,
  Sparkles,
  ChevronsLeft,
  ChevronsRight,
  Pin,
  PinOff,
  Receipt,
  Video,
  Youtube,
  Music,
  Instagram,
  Film,
  Monitor,
  Briefcase,
  ExternalLink,
  CloudCog,
  Building2,
  Search,
  X,
  FolderOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useSecureAuth } from "@/contexts/SecureAuthContext";
import { useSecurePermissions } from "@/hooks/useSecurePermissions";
import { useSidebarState } from "@/hooks/useSidebarState";
import { useRolePermissions } from "@/hooks/useRolePermissions";

const AdminLayout = () => {
  const location = useLocation();
  const { user, signOut } = useSecureAuth();
  const { hasRole, isAdmin, isSuperAdmin, loading: permissionsLoading, userRoles, getPrimaryRole } = useSecurePermissions();
  const { collapsed, pinned, isMobile, toggle, togglePin, close } = useSidebarState();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [menuSearch, setMenuSearch] = useState("");
  
  // Buscar permissões dinâmicas do banco para admin, editor e author
  const primaryRole = getPrimaryRole();
  const { data: rolePermissionsFromDB = [], isLoading: loadingPermissionsDB } = useRolePermissions(
    primaryRole === 'admin' || primaryRole === 'editor' || primaryRole === 'author' ? primaryRole : undefined
  );
  
  // Debug logging
  useEffect(() => {
    console.log('🎨 [AdminLayout] Render state:', {
      user: user?.email,
      userId: user?.id,
      permissionsLoading,
      rolesCount: userRoles?.length || 0,
      roles: userRoles?.map(r => r.role) || [],
      isSuperAdmin: isSuperAdmin(),
      isAdmin: isAdmin(),
      primaryRole: getPrimaryRole()
    });
  }, [user, permissionsLoading, userRoles]);
  
  // Função helper para verificar permissões baseada em roles e banco de dados
  const hasPermission = (permission: string) => {
    if (permissionsLoading) {
      console.log(`⏳ [AdminLayout] hasPermission("${permission}"): true (loading...)`);
      return true;
    }
    
    // Superadmin e Admin têm acesso automático a todas as permissões
    // (exceto "Em Breve" que é filtrado separadamente no código)
    if (hasRole('superadmin') || hasRole('admin')) {
      console.log(`✅ [AdminLayout] hasPermission("${permission}"): true (${hasRole('superadmin') ? 'superadmin' : 'admin'} - acesso total)`);
      return true;
    }
    
    // Editor e author: usar permissões do banco de dados (quando as tabelas existirem)
    if (hasRole('editor') || hasRole('author')) {
      const result = rolePermissionsFromDB.includes(permission);
      console.log(`${result ? '✅' : '❌'} [AdminLayout] hasPermission("${permission}"): ${result} (${primaryRole}, from DB)`);
      return result;
    }
    
    console.log(`❌ [AdminLayout] hasPermission("${permission}"): false (no matching role)`);
    return false;
  };
  
  // Estado para controlar expansão dos grupos de menu
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('admin-menu-groups');
      return saved ? JSON.parse(saved) : {
        'treinamento': true,
        'meus-projetos': true,
        'em-breve': false
      };
    } catch (error) {
      console.warn('Error parsing menu groups, using defaults:', error);
      return {
        'treinamento': true,
        'meus-projetos': true,
        'em-breve': false
      };
    }
  });

  // Salvar estado no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('admin-menu-groups', JSON.stringify(openGroups));
  }, [openGroups]);

  const toggleGroup = (groupKey: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  type MenuSubItem = {
    name: string;
    href: string;
    icon: any;
    permission: string;
    external?: boolean;
    category?: string;
  };

  type NavigationItem = {
    name: string;
    icon: any;
    permission: string;
    href?: string;
    external?: boolean;
    type?: "group";
    key?: string;
    submenu?: MenuSubItem[];
    highlight?: boolean;
  };

  const categories = {
    "projetos": { label: "Meus Projetos", color: "text-blue-500", bgColor: "bg-blue-500/10" },
    "treinamento": { label: "Treinamento", color: "text-purple-500", bgColor: "bg-purple-500/10" },
    "reporter-ai": { label: "Repórter AI", color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
    "funcionalidades": { label: "Funcionalidades", color: "text-amber-500", bgColor: "bg-amber-500/10" },
    "comunidade": { label: "Comunidade", color: "text-pink-500", bgColor: "bg-pink-500/10" },
    "configuracoes": { label: "Configurações", color: "text-red-500", bgColor: "bg-red-500/10" },
    "ferramentas": { label: "Ferramentas", color: "text-cyan-500", bgColor: "bg-cyan-500/10" },
  };

  const allNavigation: NavigationItem[] = [
    // 1. Dashboard (link direto)
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard, permission: "dashboard" },
    
    // 2. Notícias AI
    { name: "Notícias AI", href: "/admin/noticias-ai", icon: Newspaper, permission: "noticias-ai" },
    
    // 3. +Funções (grupo)
    { 
      name: "+Funções", 
      icon: PlusCircle, 
      permission: "funcoes-group",
      type: "group",
      key: "funcoes",
      submenu: [
        { 
          name: "Repórter Pró", 
          href: "https://chatgpt.com/share/6901212f-cb00-8002-8684-d71080179ed4", 
          icon: ExternalLink, 
          permission: "reporter-pro",
          external: true 
        },
        { name: "Enviar Imagem", href: "/admin/upload-imagem", icon: Image, permission: "upload-image" },
        { name: "Web Stories", href: "/admin/webstories", icon: BookOpen, permission: "webstories" },
        { name: "Importar em Massa", href: "/admin/bulk-import", icon: Upload, permission: "bulk-import" },
        { name: "Cadastrar Notícias", href: "/admin/articles/new", icon: PlusCircle, permission: "article-editor" },
        { name: "Todas as Notícias", href: "/admin/articles", icon: FileText, permission: "articles" },
      ]
    },
    
    // 4. Meus Projetos (grupo)
    { 
      name: "Meus Projetos", 
      icon: FolderOpen, 
      permission: "projetos-group",
      type: "group",
      key: "projetos",
      submenu: [
        { name: "ITL BRASIL", href: "https://itlbrasil.com/", icon: Globe, permission: "project-itl", external: true },
        { name: "CDM BRASIL", href: "https://cdmbrasil.com.br/", icon: CloudCog, permission: "project-cdm", external: true },
        { name: "CONSABS", href: "https://consabs.site/", icon: Building2, permission: "project-consabs", external: true },
      ]
    },
    
    // 5. Em Breve (superadmin only)
    { 
      name: "Em Breve", 
      icon: Clock, 
      permission: "coming-soon-group",
      type: "group",
      key: "em-breve",
      submenu: [
        // ============ Treinamento ============
        { name: "YouTube", href: "/admin/training/youtube", icon: Youtube, permission: "training-youtube", category: "treinamento" },
        { name: "TikTok", href: "/admin/training/tiktok", icon: Music, permission: "training-tiktok", category: "treinamento" },
        { name: "Instagram", href: "/admin/training/instagram", icon: Instagram, permission: "training-instagram", category: "treinamento" },
        { name: "Vimeo", href: "/admin/training/vimeo", icon: Film, permission: "training-vimeo", category: "treinamento" },
        { name: "Outros Vídeos", href: "/admin/training/others", icon: Monitor, permission: "training-others", category: "treinamento" },
        
        // ============ Repórter AI ============
        { name: "Repórter AI", href: "/admin/reporter-ai-v2", icon: Sparkles, permission: "reporter-ai", category: "reporter-ai" },
        { name: "Gerador JSON", href: "/admin/json-generator", icon: FileText, permission: "json-generator", category: "reporter-ai" },
        { name: "RSS → JSON", href: "/admin/rss-to-json", icon: Rss, permission: "rss-to-json", category: "reporter-ai" },
        { name: "Repórter GPT", href: "https://chatgpt.com/g/g-6900f51c074c819192f61cb9e3f9010f-reporter-ai", icon: ExternalLink, permission: "reporter-gpt", external: true, category: "reporter-ai" },
        
        // ============ Outras Funcionalidades ============
        { name: "Analytics", href: "/admin/analytics", icon: BarChart3, permission: "analytics", category: "funcionalidades" },
        { name: "Logs de Atividade", href: "/admin/activity-logs", icon: Shield, permission: "activity-logs", category: "funcionalidades" },
        { name: "Anúncios", href: "/admin/ads", icon: DollarSign, permission: "ads", category: "funcionalidades" },
        { name: "Banners", href: "/admin/banners", icon: Image, permission: "banners", category: "funcionalidades" },
        { name: "Autores", href: "/admin/authors", icon: Users, permission: "authors", category: "funcionalidades" },
        { name: "Categorias", href: "/admin/categories", icon: Tag, permission: "categories", category: "funcionalidades" },
        { name: "Gerenciador de Imagens", href: "/admin/image-manager", icon: Image, permission: "image-manager", category: "funcionalidades" },
        { name: "Modelos", href: "/admin/theme", icon: Palette, permission: "themes", category: "funcionalidades" },
        { name: "Nota Fiscal (NFS-e)", href: "/admin/nfse", icon: Receipt, permission: "nfse-manager", category: "funcionalidades" },
        
        // ============ Comunidade ============
        { name: "Dashboard da Comunidade", href: "/admin/community", icon: LayoutDashboard, permission: "community-dashboard", category: "comunidade" },
        { name: "Grupos & Espaços", href: "/admin/community/groups", icon: UserPlus, permission: "community-groups", category: "comunidade" },
        { name: "Tópicos & Discussões", href: "/admin/community/topics", icon: MessageCircle, permission: "community-topics", category: "comunidade" },
        { name: "Chat em Tempo Real", href: "/admin/community/chat", icon: Zap, permission: "community-chat", category: "comunidade" },
        { name: "Eventos da Comunidade", href: "/admin/community/events", icon: Calendar, permission: "community-events", category: "comunidade" },
        { name: "Gamificação", href: "/admin/community/gamification", icon: Trophy, permission: "community-gamification", category: "comunidade" },
        { name: "Perfil do Usuário", href: "/admin/community/profiles", icon: User, permission: "community-profiles", category: "comunidade" },
        { name: "Monetização", href: "/admin/community/monetization", icon: DollarSign, permission: "community-monetization", category: "comunidade" },
        { name: "Administração da Comunidade", href: "/admin/community/admin", icon: Crown, permission: "community-admin", category: "comunidade" },
        
        // ============ Configurações ============
        { name: "Usuários", href: "/admin/users", icon: Users, permission: "users", category: "configuracoes" },
        { name: "Gerenciar Roles", href: "/admin/roles", icon: Crown, permission: "role-manager", category: "configuracoes" },
        { name: "Permissões", href: "/admin/permissions-manager", icon: Shield, permission: "permissions-manager", category: "configuracoes" },
        { name: "Configurações Gerais", href: "/admin/settings", icon: Settings, permission: "settings", category: "configuracoes" },
        { name: "Acessibilidade", href: "/admin/settings/accessibility", icon: Shield, permission: "accessibility", category: "configuracoes" },
        { name: "Segurança", href: "/admin/security", icon: Shield, permission: "security-settings", category: "configuracoes" },
        
        // ============ Ferramentas ============
        { name: "Estúdio Pro", href: "/admin/studio", icon: Play, permission: "studio", category: "ferramentas" },
        { name: "Gerador de Jornal", href: "/admin/tools/jornal", icon: Newspaper, permission: "edition-generator", category: "ferramentas" },
        { name: "Social Post", href: "/admin/social/create", icon: Share2, permission: "social-create", category: "ferramentas" },
        { name: "Auto Post", href: "/admin/auto-post", icon: Zap, permission: "auto-post", category: "ferramentas" },
        { name: "Fila de Revisão", href: "/admin/queue", icon: Clock, permission: "articles-queue", category: "ferramentas" },
        { name: "Importar RSS", href: "/admin/import", icon: Upload, permission: "rss-import", category: "ferramentas" },
        { name: "Jornalista Pró", href: "/admin/tools/jornalista-pro", icon: Sparkles, permission: "jornalista-pro-tools", category: "ferramentas" },
      ]
    }
  ];

  // Filter navigation based on user permissions
  const navigation = allNavigation.filter(item => {
    if (permissionsLoading) return true; // Show all while loading
    
    // Menu "Em Breve" exclusivo para Super Admin
    if (item.key === "em-breve") {
      return hasRole('superadmin');
    }
    
    // Para grupos, mostrar se pelo menos um item do submenu tem permissão
    if (item.type === "group" && item.submenu) {
      const hasAnyPermission = item.submenu.some(subItem => hasPermission(subItem.permission));
      return hasAnyPermission;
    }
    
    return hasPermission(item.permission);
  }).map(item => ({
    ...item,
    submenu: item.submenu?.filter(subItem => {
      if (permissionsLoading) return true; // Show all while loading
      return hasPermission(subItem.permission);
    })
  }));

  // Filter navigation based on search
  const filteredNavigation = menuSearch === "" 
    ? navigation 
    : navigation.map(item => ({
        ...item,
        submenu: item.submenu?.filter(sub => 
          sub.name.toLowerCase().includes(menuSearch.toLowerCase())
        )
      })).filter(item => 
        item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
        (item.submenu && item.submenu.length > 0)
      );

  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Painel Administrativo</h1>
            <Badge variant="secondary">ITL Brasil</Badge>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Tema:</span>
              <ThemeToggle />
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{user?.email}</span>
              
              {permissionsLoading ? (
                <Badge variant="secondary" className="text-xs">
                  Carregando...
                </Badge>
              ) : userRoles.length === 0 ? (
                <Badge variant="destructive" className="text-xs">
                  Sem permissões
                </Badge>
              ) : (
                <Badge 
                  variant={hasRole('superadmin') ? 'destructive' : 'outline'} 
                  className={cn("text-xs", hasRole('superadmin') && "font-semibold")}
                >
                  {hasRole('superadmin') ? (
                    <span className="flex items-center gap-1">
                      <Crown className="h-3 w-3" />
                      Master Admin
                    </span>
                  ) : hasRole('admin') ? 'Admin' :
                    hasRole('editor') ? 'Editor' :
                    hasRole('author') ? 'Autor' : 'Usuário'}
                </Badge>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                if (isLoggingOut) return;
                setIsLoggingOut(true);
                try {
                  await signOut();
                } catch (error) {
                  console.error('Error during logout:', error);
                }
              }}
              disabled={isLoggingOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isLoggingOut ? 'Saindo...' : 'Sair'}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Mobile Backdrop */}
        {isMobile && !collapsed && (
          <div 
            className="sidebar-backdrop"
            onClick={close}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <aside 
          className={cn(
            "border-r border-border bg-card sidebar-transition",
            collapsed ? "w-16" : "w-64",
            isMobile && !collapsed && "fixed inset-y-0 left-0 z-50",
            isMobile && collapsed && "hidden"
          )}
        >
          {/* Sidebar Header com Toggle e Pin */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            {!collapsed && (
              <span className="text-sm font-semibold">Menu</span>
            )}
            <div className="flex gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggle}
                    className="h-8 w-8 p-0"
                    aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
                  >
                    {collapsed ? (
                      <ChevronsRight className="h-4 w-4" />
                    ) : (
                      <ChevronsLeft className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {collapsed ? "Expandir (Ctrl+/)" : "Recolher (Ctrl+/)"}
                </TooltipContent>
              </Tooltip>
              
              {!collapsed && !isMobile && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={togglePin}
                      className="h-8 w-8 p-0"
                      aria-label={pinned ? "Desafixar menu" : "Fixar menu"}
                    >
                      {pinned ? (
                        <Pin className="h-4 w-4" />
                      ) : (
                        <PinOff className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {pinned ? "Desafixar menu" : "Fixar menu aberto"}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          {/* Search Input */}
          {!collapsed && (
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  placeholder="Buscar página..."
                  className="w-full pl-9 pr-9 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {menuSearch && (
                  <button
                    onClick={() => setMenuSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          <nav className="p-4 space-y-2">
            {filteredNavigation.map((item) => {
              // Para itens standalone (não grupos)
              if (!item.type || item.type !== "group") {
                const isActive = !item.external && (location.pathname === item.href || 
                  (item.href !== '/admin' && location.pathname.startsWith(item.href!)) ||
                  (item.submenu && item.submenu.some(sub => location.pathname === sub.href)));
                
                return (
                  <div key={item.name}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {item.external ? (
                          <a
                            href={item.href!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                              "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                              collapsed && "justify-center"
                            )}
                          >
                            <item.icon className="h-4 w-4 flex-shrink-0" />
                            {!collapsed && (
                              <>
                                <span className="flex-1">{item.name}</span>
                                <ExternalLink className="h-3 w-3" />
                              </>
                            )}
                          </a>
                        ) : (
                          <NavLink
                            to={item.href!}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : item.highlight
                                  ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-l-2 border-blue-500 hover:bg-blue-500/25"
                                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                              collapsed && "justify-center"
                            )}
                          >
                            <item.icon className={cn("h-4 w-4 flex-shrink-0", item.highlight && !isActive && "text-blue-500")} />
                            {!collapsed && <span>{item.name}</span>}
                          </NavLink>
                        )}
                      </TooltipTrigger>
                      {collapsed && (
                        <TooltipContent side="right">
                          {item.name}
                        </TooltipContent>
                      )}
                    </Tooltip>
                    
                    {item.submenu && !collapsed && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.submenu.map((subItem) => {
                          const isSubActive = location.pathname === subItem.href;
                          return (
                            <NavLink
                              key={subItem.name}
                              to={subItem.href}
                              className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                isSubActive
                                  ? "bg-primary/80 text-primary-foreground"
                                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                              )}
                            >
                              <subItem.icon className="h-3 w-3" />
                              {subItem.name}
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
              
              // Para grupos com submenu expansível
              if (item.type === "group" && item.submenu) {
                const hasActiveSubitem = item.submenu.some(sub => location.pathname === sub.href);
                const isGroupOpen = openGroups[item.key!];
                
                // Se collapsed, mostrar apenas ícone com tooltip
                if (collapsed) {
                  return (
                    <Tooltip key={item.name}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => toggleGroup(item.key!)}
                          className={cn(
                            "flex items-center justify-center w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            hasActiveSubitem
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                          aria-label={item.name}
                        >
                          <item.icon className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <div className="space-y-1">
                          <p className="font-medium">{item.name}</p>
                          <div className="text-xs space-y-0.5">
                            {item.submenu.map(sub => (
                              <div key={sub.name}>{sub.name}</div>
                            ))}
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                }
                
                return (
                  <div key={item.name}>
                    <Collapsible open={isGroupOpen} onOpenChange={() => toggleGroup(item.key!)}>
                      <CollapsibleTrigger asChild>
                        <button
                          className={cn(
                            "flex items-center justify-between w-full gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            hasActiveSubitem
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                          aria-label={`${isGroupOpen ? 'Recolher' : 'Expandir'} ${item.name}`}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className="h-4 w-4 flex-shrink-0" />
                            <span>{item.name}</span>
                          </div>
                          {isGroupOpen ? 
                            <ChevronDown className="h-3 w-3 flex-shrink-0" /> : 
                            <ChevronRight className="h-3 w-3 flex-shrink-0" />
                          }
                        </button>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent className="ml-6 mt-1 space-y-1">
                        {(() => {
                          let lastCategory: string | null = null;
                          
                          return item.submenu.map((subItem, index) => {
                            const isSubActive = location.pathname === subItem.href;
                            const showCategoryHeader = subItem.category && subItem.category !== lastCategory;
                            
                            if (subItem.category) {
                              lastCategory = subItem.category;
                            }
                            
                            const categoryInfo = subItem.category ? categories[subItem.category as keyof typeof categories] : null;
                            
                            return (
                              <div key={subItem.name}>
                                {showCategoryHeader && categoryInfo && (
                                  <div className={cn(
                                    "flex items-center gap-2 px-3 py-2 mt-3 mb-1 rounded-md text-xs font-semibold uppercase tracking-wider",
                                    categoryInfo.bgColor,
                                    categoryInfo.color
                                  )}>
                                    <div className="h-px flex-1 bg-current opacity-30" />
                                    <span>{categoryInfo.label}</span>
                                    <div className="h-px flex-1 bg-current opacity-30" />
                                  </div>
                                )}
                                
                                {/* Se for link externo, usar <a> ao invés de <NavLink> */}
                                {(subItem as any).external ? (
                                  <a
                                    href={subItem.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cn(
                                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                      "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                    )}
                                  >
                                    <subItem.icon className={cn("h-3 w-3", categoryInfo?.color)} />
                                    {subItem.name}
                                    <ExternalLink className="h-3 w-3 ml-auto" />
                                  </a>
                                ) : (
                                  <NavLink
                                    to={subItem.href}
                                    className={cn(
                                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                      isSubActive
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                    )}
                                  >
                                    <subItem.icon className={cn("h-3 w-3", !isSubActive && categoryInfo?.color)} />
                                    {subItem.name}
                                  </NavLink>
                                )}
                              </div>
                            );
                          });
                        })()}
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                );
              }
              
              return null;
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
    </NextThemesProvider>
  );
};

export default AdminLayout;