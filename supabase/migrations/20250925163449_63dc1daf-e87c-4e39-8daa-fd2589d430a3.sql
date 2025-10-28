-- Criar tabela para configurações do site
CREATE TABLE public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}',
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para configurações do site
CREATE POLICY "Settings are viewable by everyone" 
ON public.site_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Settings can be updated by admins" 
ON public.site_settings 
FOR UPDATE 
USING (true);

CREATE POLICY "Settings can be created by admins" 
ON public.site_settings 
FOR INSERT 
WITH CHECK (true);

-- Inserir configuração padrão do tema
INSERT INTO public.site_settings (key, value, description) 
VALUES ('portal_theme', '{"model": "modelo-01", "name": "Modelo Atual do Site"}', 'Configuração do modelo visual do portal');

-- Trigger para updated_at
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();