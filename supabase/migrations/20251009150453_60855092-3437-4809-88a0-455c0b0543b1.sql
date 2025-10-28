-- Fase 1: Criar permissões faltantes e associar ao superadmin

-- Criar permissões faltantes
INSERT INTO available_permissions (permission_key, permission_name, permission_description, category) 
VALUES 
  ('tools-group', 'Grupo Ferramentas', 'Acesso ao menu de ferramentas', 'tools'),
  ('auto-post', 'Auto Post', 'Gerenciar publicações automáticas', 'tools'),
  ('webstories', 'WebStories', 'Criar e gerenciar WebStories', 'tools')
ON CONFLICT (permission_key) DO NOTHING;

-- Associar TODAS as permissões de ferramentas ao superadmin
INSERT INTO role_permissions (role, permission_key)
SELECT 'superadmin'::app_role, permission_key 
FROM available_permissions 
WHERE permission_key IN (
  'tools-group',
  'webstories',
  'auto-post',
  'studio',
  'edition-generator',
  'articles-queue',
  'rss-import',
  'bulk-import',
  'social-create'
)
ON CONFLICT (role, permission_key) DO NOTHING;