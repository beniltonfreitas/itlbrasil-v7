-- Criar tabela de logs de atividade de usuários
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  activity_type TEXT NOT NULL,
  activity_description TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_activity_type ON user_activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_ip_address ON user_activity_logs(ip_address);

-- Habilitar RLS
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Política: Apenas superadmin pode visualizar logs
CREATE POLICY "Superadmin can view all activity logs"
  ON user_activity_logs FOR SELECT
  USING (has_role(auth.uid(), 'superadmin'));

-- Política: Apenas superadmin pode deletar logs
CREATE POLICY "Superadmin can delete activity logs"
  ON user_activity_logs FOR DELETE
  USING (has_role(auth.uid(), 'superadmin'));

-- Política: Sistema pode inserir logs (via edge function com service role)
CREATE POLICY "System can insert activity logs"
  ON user_activity_logs FOR INSERT
  WITH CHECK (true);