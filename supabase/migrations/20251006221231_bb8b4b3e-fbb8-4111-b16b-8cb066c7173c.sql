-- Corrigir políticas RLS da tabela articles para incluir todos os papéis necessários

-- Dropar políticas antigas
DROP POLICY IF EXISTS "Admins and editors can manage articles" ON public.articles;
DROP POLICY IF EXISTS "Published articles are viewable by everyone" ON public.articles;

-- Criar nova política de gerenciamento que inclui superadmin, admin, editor e author
CREATE POLICY "Users with roles can manage articles"
ON public.articles
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'superadmin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'editor'::app_role) OR 
  has_role(auth.uid(), 'author'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'superadmin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'editor'::app_role) OR 
  has_role(auth.uid(), 'author'::app_role)
);

-- Criar política de visualização que permite ver artigos publicados ou todos para usuários com roles
CREATE POLICY "Published articles are viewable by everyone"
ON public.articles
FOR SELECT
TO public
USING (
  status = 'published'::text OR 
  has_role(auth.uid(), 'superadmin'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'editor'::app_role) OR
  has_role(auth.uid(), 'author'::app_role)
);