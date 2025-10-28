-- Criar permissões para o grupo Financeiro e NFS-e
INSERT INTO available_permissions (permission_key, permission_name, permission_description, category) 
VALUES 
  ('financial-group', 'Menu Financeiro', 'Acesso ao menu Financeiro', 'financial'),
  ('nfse-manager', 'NFS-e Manager', 'Gerenciar NFS-e (emissão e cancelamento)', 'financial')
ON CONFLICT (permission_key) DO NOTHING;

-- Associar ao role superadmin
INSERT INTO role_permissions (role, permission_key)
SELECT 'superadmin'::app_role, permission_key FROM available_permissions 
WHERE permission_key IN ('financial-group', 'nfse-manager')
ON CONFLICT (role, permission_key) DO NOTHING;