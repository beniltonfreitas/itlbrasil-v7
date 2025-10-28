-- Tabela com todas as permissões disponíveis no sistema
CREATE TABLE IF NOT EXISTS public.available_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  permission_key text UNIQUE NOT NULL,
  permission_name text NOT NULL,
  permission_description text,
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabela de relacionamento entre roles e permissões
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  permission_key text NOT NULL REFERENCES public.available_permissions(permission_key) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(role, permission_key)
);

-- Habilitar RLS
ALTER TABLE public.available_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Policies: Apenas superadmin pode gerenciar
CREATE POLICY "Superadmin can manage permissions"
  ON public.available_permissions
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "Superadmin can manage role permissions"
  ON public.role_permissions
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'superadmin'::app_role));

-- Todos podem ler (necessário para verificar permissões)
CREATE POLICY "Anyone can read permissions"
  ON public.available_permissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can read role permissions"
  ON public.role_permissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Inserir permissões padrão
INSERT INTO public.available_permissions (permission_key, permission_name, category, permission_description) VALUES
  ('dashboard', 'Dashboard', 'general', 'Acesso ao painel principal'),
  ('articles', 'Artigos', 'content', 'Visualizar artigos'),
  ('article-editor', 'Editor de Artigos', 'content', 'Criar/editar artigos'),
  ('authors', 'Autores', 'users', 'Gerenciar autores'),
  ('categories', 'Categorias', 'content', 'Gerenciar categorias'),
  ('analytics', 'Analytics', 'general', 'Visualizar estatísticas'),
  ('bulk-import', 'Importação em Massa', 'content', 'Importar notícias RSS'),
  ('banners', 'Banners', 'settings', 'Gerenciar banners do site'),
  ('jornalista-pro-tools', 'Jornalista Pro', 'tools', 'Ferramentas IA para jornalistas'),
  ('studio', 'Studio', 'media', 'Estúdio de transmissão'),
  ('webstories', 'Web Stories', 'content', 'Criar web stories'),
  ('social-create', 'Redes Sociais', 'social', 'Criar posts para redes sociais'),
  ('articles-queue', 'Fila de Artigos', 'content', 'Gerenciar fila de aprovação'),
  ('rss-import', 'RSS Feeds', 'content', 'Configurar feeds RSS'),
  ('edition-generator', 'Gerador de Edições', 'content', 'Criar edições digitais'),
  ('users', 'Usuários', 'users', 'Gerenciar usuários'),
  ('role-manager', 'Gerenciar Roles', 'users', 'Atribuir roles aos usuários'),
  ('permissions-manager', 'Gerenciar Permissões', 'settings', 'Configurar permissões por role'),
  ('settings', 'Configurações', 'settings', 'Configurações do sistema'),
  ('ads-manager', 'Anúncios', 'settings', 'Gerenciar anúncios'),
  ('theme-manager', 'Temas', 'settings', 'Gerenciar temas visuais'),
  ('accessibility', 'Acessibilidade', 'settings', 'Configurar acessibilidade'),
  ('activity-logs', 'Logs de Atividade', 'admin', 'Visualizar logs do sistema'),
  ('security-settings', 'Segurança', 'settings', 'Configurações de segurança')
ON CONFLICT (permission_key) DO NOTHING;

-- Inserir permissões padrão para Editor
INSERT INTO public.role_permissions (role, permission_key) VALUES
  ('editor', 'dashboard'),
  ('editor', 'articles'),
  ('editor', 'article-editor'),
  ('editor', 'authors'),
  ('editor', 'categories'),
  ('editor', 'analytics'),
  ('editor', 'bulk-import'),
  ('editor', 'banners'),
  ('editor', 'jornalista-pro-tools'),
  ('editor', 'studio'),
  ('editor', 'webstories'),
  ('editor', 'social-create'),
  ('editor', 'articles-queue'),
  ('editor', 'rss-import'),
  ('editor', 'edition-generator')
ON CONFLICT (role, permission_key) DO NOTHING;

-- Inserir permissões padrão para Author
INSERT INTO public.role_permissions (role, permission_key) VALUES
  ('author', 'dashboard'),
  ('author', 'articles'),
  ('author', 'article-editor'),
  ('author', 'studio'),
  ('author', 'webstories'),
  ('author', 'social-create')
ON CONFLICT (role, permission_key) DO NOTHING;