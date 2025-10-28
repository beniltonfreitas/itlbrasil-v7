-- Criar tabela para armazenar tokens FCM de push notifications
CREATE TABLE IF NOT EXISTS public.push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fcm_token TEXT NOT NULL UNIQUE,
  device_info JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_push_tokens_user ON push_tokens(user_id);
CREATE INDEX idx_push_tokens_active ON push_tokens(active);

-- Habilitar RLS
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

-- Usuários podem gerenciar seus próprios tokens
CREATE POLICY "Users can manage own tokens" ON public.push_tokens
FOR ALL USING (auth.uid() = user_id);

-- Super_admins podem ver todos os tokens
CREATE POLICY "Superadmins can view all tokens" ON public.push_tokens
FOR SELECT USING (
  has_role(auth.uid(), 'superadmin'::app_role)
);

-- Trigger para atualizar last_used_at
CREATE OR REPLACE FUNCTION update_push_token_last_used()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_used_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_last_used_push_tokens
BEFORE UPDATE ON public.push_tokens
FOR EACH ROW EXECUTE FUNCTION update_push_token_last_used();