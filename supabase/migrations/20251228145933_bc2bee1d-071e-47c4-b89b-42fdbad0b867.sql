-- =============================================
-- NOTICIAS AI SOURCES (Custom templates)
-- =============================================
CREATE TABLE public.noticias_ai_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain_pattern TEXT NOT NULL UNIQUE,
  badge TEXT NOT NULL,
  badge_color TEXT DEFAULT '#3B82F6',
  parsing_instructions TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_system BOOLEAN DEFAULT FALSE,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_noticias_ai_sources_domain ON public.noticias_ai_sources(domain_pattern);
CREATE INDEX idx_noticias_ai_sources_active ON public.noticias_ai_sources(is_active);

-- Enable RLS
ALTER TABLE public.noticias_ai_sources ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Sources are viewable by authenticated users"
ON public.noticias_ai_sources FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and editors can manage sources"
ON public.noticias_ai_sources FOR ALL
USING (is_admin(auth.uid()));

CREATE POLICY "Authenticated users can create sources"
ON public.noticias_ai_sources FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Updated at trigger
CREATE TRIGGER update_noticias_ai_sources_updated_at
BEFORE UPDATE ON public.noticias_ai_sources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default system sources
INSERT INTO public.noticias_ai_sources (name, domain_pattern, badge, badge_color, parsing_instructions, is_system) VALUES
  ('Agência Brasil', 'agenciabrasil.ebc.com.br', 'AB', '#16A34A', 'Manter estilo oficial e institucional. Preservar dados estatísticos e citações de autoridades.', true),
  ('G1', 'g1.globo.com', 'G1', '#DC2626', 'Adaptar títulos sensacionalistas para tom mais neutro. Verificar múltiplas fontes citadas.', true),
  ('Folha de S.Paulo', 'folha.uol.com.br', 'FSP', '#1E40AF', 'Manter tom analítico e crítico. Preservar contexto histórico e dados.', true),
  ('UOL', 'uol.com.br', 'UOL', '#F97316', 'Adaptar linguagem coloquial para padrão jornalístico.', true),
  ('Estadão', 'estadao.com.br', 'EST', '#2563EB', 'Manter rigor jornalístico. Preservar análises econômicas e políticas.', true),
  ('CNN Brasil', 'cnnbrasil.com.br', 'CNN', '#B91C1C', 'Adaptar estilo breaking news para formato mais completo.', true),
  ('BBC', 'bbc.com', 'BBC', '#1F2937', 'Preservar imparcialidade e contextualização internacional.', true),
  ('R7', 'r7.com', 'R7', '#EF4444', 'Verificar sensacionalismo e adaptar para tom neutro.', true),
  ('Terra', 'terra.com.br', 'TRR', '#22C55E', 'Adaptar conteúdo agregado para formato original.', true),
  ('iG', 'ig.com.br', 'iG', '#9333EA', 'Verificar fonte original e adaptar linguagem.', true);

-- =============================================
-- NOTICIAS AI SCHEDULES (Automated imports)
-- =============================================
CREATE TABLE public.noticias_ai_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  source_urls TEXT[] NOT NULL DEFAULT '{}',
  source_id UUID REFERENCES public.noticias_ai_sources(id) ON DELETE SET NULL,
  schedule_type TEXT DEFAULT 'interval',
  interval_minutes INTEGER DEFAULT 60,
  cron_expression TEXT,
  max_articles_per_run INTEGER DEFAULT 5,
  auto_publish BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_run TIMESTAMPTZ,
  next_run TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_noticias_ai_schedules_active ON public.noticias_ai_schedules(is_active);
CREATE INDEX idx_noticias_ai_schedules_next_run ON public.noticias_ai_schedules(next_run);

-- Enable RLS
ALTER TABLE public.noticias_ai_schedules ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Schedules are viewable by authenticated users"
ON public.noticias_ai_schedules FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage schedules"
ON public.noticias_ai_schedules FOR ALL
USING (is_admin(auth.uid()));

CREATE POLICY "Authenticated users can create schedules"
ON public.noticias_ai_schedules FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Updated at trigger
CREATE TRIGGER update_noticias_ai_schedules_updated_at
BEFORE UPDATE ON public.noticias_ai_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- NOTICIAS AI SCHEDULE LOGS (Execution history)
-- =============================================
CREATE TABLE public.noticias_ai_schedule_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES public.noticias_ai_schedules(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  articles_imported INTEGER DEFAULT 0,
  articles_failed INTEGER DEFAULT 0,
  duration_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_noticias_ai_schedule_logs_schedule ON public.noticias_ai_schedule_logs(schedule_id);
CREATE INDEX idx_noticias_ai_schedule_logs_created ON public.noticias_ai_schedule_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.noticias_ai_schedule_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Logs are viewable by authenticated users"
ON public.noticias_ai_schedule_logs FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can create logs"
ON public.noticias_ai_schedule_logs FOR INSERT
WITH CHECK (true);