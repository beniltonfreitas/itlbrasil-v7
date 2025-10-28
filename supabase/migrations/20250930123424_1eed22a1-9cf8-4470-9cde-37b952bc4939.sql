-- Criar tabela para banners do site
CREATE TABLE IF NOT EXISTS public.site_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  image_url text NOT NULL,
  link_url text,
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.site_banners ENABLE ROW LEVEL SECURITY;

-- Policy: Público pode ver banners ativos
CREATE POLICY "Public can view active banners"
ON public.site_banners
FOR SELECT
TO public
USING (is_active = true);

-- Policy: Admins podem gerenciar todos os banners
CREATE POLICY "Admins can manage banners"
ON public.site_banners
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_site_banners_active ON public.site_banners(is_active);
CREATE INDEX IF NOT EXISTS idx_site_banners_order ON public.site_banners(order_index);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_site_banners_updated_at
BEFORE UPDATE ON public.site_banners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE public.site_banners IS 'Banners promocionais do site';
COMMENT ON COLUMN public.site_banners.order_index IS 'Ordem de exibição dos banners (menor = primeiro)';
COMMENT ON COLUMN public.site_banners.is_active IS 'Se o banner está ativo e visível no site';