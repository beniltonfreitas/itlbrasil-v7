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
  Building2
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
    if (permissionsLoading || loadingPermissionsDB) {
      console.log(`⏳ [AdminLayout] hasPermission("${permission}"): true (loading...)`);
      return true;
    }
    
    // APENAS Superadmins têm acesso automático a TODAS as permissões
    if (hasRole('superadmin')) {
      console.log(`✅ [AdminLayout] hasPermission("${permission}"): true (superadmin - acesso total)`);
      return true;
    }
    
    // Admin, editor e author: usar permissões do banco de dados
    if (hasRole('admin') || hasRole('editor') || hasRole('author')) {
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

  type NavigationItem = {
    name: string;
    icon: any;
    permission: string;
    href?: string;
    external?: boolean;
    type?: "group";
    key?: string;
    submenu?: {
      name: string;
      href: string;
      icon: any;
      permission: string;
      external?: boolean;
    }[];
  };

  const allNavigation: NavigationItem[] = [
    // Dashboard (com submenu)
    { 
      name: "Dashboard", 
      icon: LayoutDashboard, 
      permission: "dashboard-group",
      type: "group",
      key: "dashboard",
      submenu: [
        { name: "Visão Geral", href: "/admin", icon: LayoutDashboard, permission: "dashboard" },
        { name: "Ativar VPN", href: "/admin/vpn", icon: Shield, permission: "vpn" },
      ]
    },
    
    // Repórter AI (logo abaixo do Dashboard)
    { 
      name: "Repórter AI", 
      icon: Sparkles, 
      permission: "reporter-ai-group",
      type: "group",
      key: "reporter-ai",
      submenu: [
        { name: "Repórter AI", href: "/admin/reporter-ai-v2", icon: Sparkles, permission: "reporter-ai" },
        { name: "Gerador JSON", href: "/admin/json-generator", icon: FileText, permission: "json-generator" },
        { 
          name: "Repórter Pró", 
          href: "https://chatgpt.com/share/6901212f-cb00-8002-8684-d71080179ed4", 
          icon: ExternalLink, 
          permission: "reporter-pro",
          external: true 
        },
        { name: "Repórter GPT", href: "https://chatgpt.com/g/g-6900f51c074c819192f61cb9e3f9010f-reporter-ai", icon: ExternalLink, permission: "reporter-gpt", external: true },
      ]
    },
    
    // Meus Projetos
    { 
      name: "Meus Projetos", 
      icon: Briefcase, 
      permission: "projects-group",
      type: "group",
      key: "meus-projetos",
      submenu: [
        { 
          name: "ITL BRASIL", 
          href: "https://itlbrasil.com/", 
          icon: Globe, 
          permission: "project-itl",
          external: true
        },
        { 
          name: "CDM BRASIL", 
          href: "https://cdmbrasil.com.br/", 
          icon: CloudCog, 
          permission: "project-cdm",
          external: true
        },
        { 
          name: "CONSABS", 
          href: "https://consabs.site/", 
          icon: Building2, 
          permission: "project-consabs",
          external: true
        },
      ]
    },
    
    // Treinamento (logo abaixo de Meus Projetos)
    { 
      name: "Treinamento", 
      icon: Video, 
      permission: "training-group",
      type: "group",
      key: "treinamento",
      submenu: [
        { name: "YouTube", href: "/admin/training/youtube", icon: Youtube, permission: "training-youtube" },
        { name: "TikTok", href: "/admin/training/tiktok", icon: Music, permission: "training-tiktok" },
        { name: "Instagram", href: "/admin/training/instagram", icon: Instagram, permission: "training-instagram" },
        { name: "Vimeo", href: "/admin/training/vimeo", icon: Film, permission: "training-vimeo" },
        { name: "Outros Vídeos", href: "/admin/training/others", icon: Monitor, permission: "training-others" },
      ]
    },
    
    // Menus Promovidos (ex-submenus agora standalone)
    { name: "Todas as Notícias", href: "/admin/articles", icon: FileText, permission: "articles" },
    { name: "Cadastrar Notícias", href: "/admin/articles/new", icon: PlusCircle, permission: "article-editor" },
    { name: "Web Stories", href: "/admin/webstories", icon: BookOpen, permission: "webstories" },
    { name: "Importar em Massa", href: "/admin/bulk-import", icon: Upload, permission: "bulk-import" },
    
    
    // Em Breve (agrupa todos os outros menus)
    { 
      name: "Em Breve", 
      icon: Clock, 
      permission: "coming-soon-group",
      type: "group",
      key: "em-breve",
      submenu: [
        // Analytics
        { name: "Analytics", href: "/admin/analytics", icon: BarChart3, permission: "analytics" },
        
        // Logs de Atividade
        { name: "Logs de Atividade", href: "/admin/activity-logs", icon: Shield, permission: "activity-logs" },
        
        // Anúncios
        { name: "Anúncios", href: "/admin/ads", icon: DollarSign, permission: "ads" },
        
        // Banners
        { name: "Banners", href: "/admin/banners", icon: Image, permission: "banners" },
        
        // Autores
        { name: "Autores", href: "/admin/authors", icon: Users, permission: "authors" },
        
        // Categorias
        { name: "Categorias", href: "/admin/categories", icon: Tag, permission: "categories" },
        
        // Gerenciador de Imagens
        { name: "Gerenciador de Imagens", href: "/admin/image-manager", icon: Image, permission: "image-manager" },
        
        // Modelos
        { name: "Modelos", href: "/admin/theme", icon: Palette, permission: "themes" },
        
        // Nota Fiscal (NFS-e)
        { name: "Nota Fiscal (NFS-e)", href: "/admin/nfse", icon: Receipt, permission: "nfse-manager" },
        
        // Comunidade (todo o submenu)
        { name: "Dashboard da Comunidade", href: "/admin/community", icon: LayoutDashboard, permission: "community-dashboard" },
        { name: "Grupos & Espaços", href: "/admin/community/groups", icon: UserPlus, permission: "community-groups" },
        { name: "Tópicos & Discussões", href: "/admin/community/topics", icon: MessageCircle, permission: "community-topics" },
        { name: "Chat em Tempo Real", href: "/admin/community/chat", icon: Zap, permission: "community-chat" },
        { name: "Eventos da Comunidade", href: "/admin/community/events", icon: Calendar, permission: "community-events" },
        { name: "Gamificação", href: "/admin/community/gamification", icon: Trophy, permission: "community-gamification" },
        { name: "Perfil do Usuário", href: "/admin/community/profiles", icon: User, permission: "community-profiles" },
        { name: "Monetização", href: "/admin/community/monetization", icon: DollarSign, permission: "community-monetization" },
        { name: "Administração da Comunidade", href: "/admin/community/admin", icon: Crown, permission: "community-admin" },
        
        // Configurações (todo o submenu)
        { name: "Usuários", href: "/admin/users", icon: Users, permission: "users" },
        { name: "Gerenciar Roles", href: "/admin/roles", icon: Crown, permission: "role-manager" },
        { name: "Permissões", href: "/admin/permissions-manager", icon: Shield, permission: "permissions-manager" },
        { name: "Configurações Gerais", href: "/admin/settings", icon: Settings, permission: "settings" },
        { name: "Acessibilidade", href: "/admin/settings/accessibility", icon: Shield, permission: "accessibility" },
        { name: "Segurança", href: "/admin/security", icon: Shield, permission: "security-settings" },
        
        // Ferramentas (exceto Web Stories e Importar em Massa - já promovidos)
        { name: "Estúdio Pro", href: "/admin/studio", icon: Play, permission: "studio" },
        { name: "Gerador de Jornal", href: "/admin/tools/jornal", icon: Newspaper, permission: "edition-generator" },
        { name: "Social Post", href: "/admin/social/create", icon: Share2, permission: "social-create" },
        { name: "Auto Post", href: "/admin/auto-post", icon: Zap, permission: "auto-post" },
        { name: "Fila de Revisão", href: "/admin/queue", icon: Clock, permission: "articles-queue" },
        { name: "Importar RSS", href: "/admin/import", icon: Upload, permission: "rss-import" },
        { name: "Jornalista Pró", href: "/admin/tools/jornalista-pro", icon: Sparkles, permission: "jornalista-pro-tools" },
      ]
    }
  ];

  // Filter navigation based on user permissions
  const navigation = allNavigation.filter(item => {
    if (permissionsLoading) return true; // Show all while loading
    
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
                      Super Admin
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

          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
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
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                              collapsed && "justify-center"
                            )}
                          >
                            <item.icon className="h-4 w-4 flex-shrink-0" />
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
                        {item.submenu.map((subItem) => {
                          const isSubActive = location.pathname === subItem.href;
                          
                          // Se for link externo, usar <a> ao invés de <NavLink>
                          if ((subItem as any).external) {
                            return (
                              <a
                                key={subItem.name}
                                href={subItem.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                  "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                )}
                              >
                                <subItem.icon className="h-3 w-3" />
                                {subItem.name}
                                <ExternalLink className="h-3 w-3 ml-auto" />
                              </a>
                            );
                          }
                          
                          return (
                            <NavLink
                              key={subItem.name}
                              to={subItem.href}
                              className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                isSubActive
                                  ? "bg-primary text-primary-foreground"
                                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                              )}
                            >
                              <subItem.icon className="h-3 w-3" />
                              {subItem.name}
                            </NavLink>
                          );
                        })}
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