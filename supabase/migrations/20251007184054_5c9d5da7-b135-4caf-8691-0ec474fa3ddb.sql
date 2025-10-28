-- Restrict admin role permissions to only Dashboard and Articles
-- Super admins retain full access

-- Step 1: Clear all existing permissions for 'admin' role
DELETE FROM public.role_permissions 
WHERE role = 'admin';

-- Step 2: Add only the essential permissions for admin role
INSERT INTO public.role_permissions (role, permission_key)
VALUES 
  ('admin', 'dashboard'),
  ('admin', 'articles'),
  ('admin', 'article-editor')
ON CONFLICT (role, permission_key) DO NOTHING;

-- Step 3: Ensure all menu items have corresponding permissions in available_permissions
INSERT INTO public.available_permissions (permission_key, permission_name, permission_description, category)
VALUES
  -- Dashboard
  ('dashboard', 'Dashboard', 'Acesso ao painel principal', 'general'),
  
  -- Articles/News
  ('articles', 'Ver Notícias', 'Visualizar lista de notícias', 'content'),
  ('article-editor', 'Criar/Editar Notícias', 'Criar e editar notícias', 'content'),
  ('articles-queue', 'Fila de Revisão', 'Gerenciar fila de notícias importadas', 'content'),
  
  -- Content Management
  ('categories', 'Categorias', 'Gerenciar categorias', 'content'),
  ('authors', 'Autores', 'Gerenciar autores', 'content'),
  ('image-manager', 'Gerenciador de Imagens', 'Gerenciar biblioteca de imagens', 'content'),
  ('webstories', 'Web Stories', 'Gerenciar web stories', 'content'),
  
  -- Editions
  ('edition-generator', 'Gerador de Edições', 'Criar e editar edições', 'editions'),
  ('editions-list', 'Lista de Edições', 'Visualizar edições', 'editions'),
  
  -- Monetization
  ('ads', 'Anúncios', 'Gerenciar anúncios', 'monetization'),
  ('banners', 'Banners', 'Gerenciar banners do site', 'monetization'),
  
  -- Media
  ('tv', 'TV', 'Gerenciar conteúdo de TV', 'media'),
  ('radio', 'Rádio', 'Gerenciar conteúdo de rádio', 'media'),
  ('podcast', 'Podcast', 'Gerenciar podcasts', 'media'),
  ('studio', 'ITL Studio', 'Acesso ao estúdio de transmissão', 'media'),
  
  -- Analytics & Reports
  ('analytics', 'Analytics', 'Visualizar analytics e estatísticas', 'analytics'),
  ('activity-logs', 'Logs de Atividade', 'Visualizar logs de atividade', 'analytics'),
  
  -- Social
  ('social-overview', 'Social - Overview', 'Visão geral das redes sociais', 'social'),
  ('social-create', 'Social - Criar Post', 'Criar posts para redes sociais', 'social'),
  ('social-schedule', 'Social - Agendar', 'Agendar posts', 'social'),
  ('social-inbox', 'Social - Inbox', 'Gerenciar mensagens', 'social'),
  ('social-reports', 'Social - Relatórios', 'Ver relatórios de redes sociais', 'social'),
  ('social-library', 'Social - Biblioteca', 'Biblioteca de mídia social', 'social'),
  ('social-settings', 'Social - Configurações', 'Configurações de redes sociais', 'social'),
  
  -- Community
  ('community-dashboard', 'Comunidade - Dashboard', 'Dashboard da comunidade', 'community'),
  ('community-groups', 'Comunidade - Grupos', 'Gerenciar grupos', 'community'),
  ('community-topics', 'Comunidade - Tópicos', 'Gerenciar tópicos', 'community'),
  ('community-chat', 'Comunidade - Chat', 'Chat da comunidade', 'community'),
  
  -- Academy
  ('academy-dashboard', 'Academia - Dashboard', 'Dashboard da academia', 'academy'),
  ('academy-courses', 'Academia - Cursos', 'Gerenciar cursos', 'academy'),
  ('academy-ebooks', 'Academia - E-books', 'Gerenciar e-books', 'academy'),
  ('academy-mentorships', 'Academia - Mentorias', 'Gerenciar mentorias', 'academy'),
  ('academy-gamification', 'Academia - Gamificação', 'Sistema de gamificação', 'academy'),
  ('academy-reports', 'Academia - Relatórios', 'Relatórios da academia', 'academy'),
  ('academy-community', 'Academia - Comunidade', 'Comunidade da academia', 'academy'),
  
  -- Settings
  ('settings', 'Configurações Gerais', 'Configurações do site', 'settings'),
  ('themes', 'Modelos/Temas', 'Gerenciar temas do site', 'settings'),
  ('accessibility-settings', 'Acessibilidade', 'Configurações de acessibilidade', 'settings'),
  ('notifications-settings', 'Notificações', 'Configurações de notificações', 'settings'),
  ('security-settings', 'Segurança', 'Configurações de segurança', 'settings'),
  
  -- User Management (Superadmin only)
  ('users-manager', 'Gerenciar Usuários', 'Gerenciar usuários do sistema', 'admin'),
  ('role-manager', 'Gerenciar Papéis', 'Gerenciar papéis de usuários', 'admin'),
  ('permissions-manager', 'Gerenciar Permissões', 'Gerenciar permissões de papéis', 'admin'),
  ('debug-permissions', 'Debug Permissões', 'Depurar sistema de permissões', 'admin'),
  
  -- Tools
  ('feed-tester', 'Testador de Feed', 'Testar feeds RSS', 'tools'),
  ('rss-feed-form', 'Feeds RSS', 'Gerenciar feeds RSS', 'tools'),
  ('bulk-news-import', 'Importação em Massa', 'Importar notícias em massa', 'tools'),
  ('jornalista-pro', 'Jornalista Pró', 'Ferramentas profissionais de jornalismo', 'tools')
ON CONFLICT (permission_key) DO NOTHING;

COMMENT ON TABLE public.role_permissions IS 'Stores role-based permissions. Admins only have dashboard and articles by default. Superadmins have automatic full access.';