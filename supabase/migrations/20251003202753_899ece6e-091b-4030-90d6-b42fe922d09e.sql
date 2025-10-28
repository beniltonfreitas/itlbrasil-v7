-- FASE 1: Estrutura de Dados - Gerador de Notícias (Jornal Online)
-- Versão corrigida sem referências a superadmin

-- Tabela: Edições de Jornal
CREATE TABLE IF NOT EXISTS editions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  titulo TEXT NOT NULL,
  subtitulo TEXT,
  numero_edicao TEXT NOT NULL,
  data_publicacao TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'publicado', 'arquivado')),
  tema_visual TEXT DEFAULT 'claro' CHECK (tema_visual IN ('claro', 'escuro', 'sepia')),
  colunas INTEGER DEFAULT 1 CHECK (colunas IN (1, 2)),
  fonte_base TEXT DEFAULT 'serif' CHECK (fonte_base IN ('serif', 'sans')),
  tamanho_fonte_base INTEGER DEFAULT 16,
  interlinha NUMERIC DEFAULT 1.5,
  margem TEXT DEFAULT 'media' CHECK (margem IN ('estreita', 'media', 'larga')),
  cidade TEXT,
  uf TEXT,
  capa_json JSONB DEFAULT '{}',
  sumario_json JSONB DEFAULT '[]',
  acessibilidade_json JSONB DEFAULT '{"vlibras": true, "tts": true}',
  seo_json JSONB DEFAULT '{}',
  total_paginas INTEGER DEFAULT 0,
  visualizacoes INTEGER DEFAULT 0,
  downloads_pdf INTEGER DEFAULT 0,
  downloads_epub INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: Itens da Edição
CREATE TABLE IF NOT EXISTS edition_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id UUID REFERENCES editions(id) ON DELETE CASCADE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('noticia', 'anuncio', 'pagina_custom', 'capa', 'sumario')),
  secao TEXT,
  ordem INTEGER NOT NULL,
  referencia_id UUID,
  layout_hint TEXT,
  pagina_alvo INTEGER,
  configuracao_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: Biblioteca de Anúncios
CREATE TABLE IF NOT EXISTS ads_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('pagina_inteira', 'meia', 'um_quarto', 'banner', 'rodape')),
  img_url TEXT NOT NULL,
  destino_url TEXT,
  anunciante TEXT,
  alt_text TEXT,
  prioridade INTEGER DEFAULT 0,
  validade_inicio DATE,
  validade_fim DATE,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: Seções Pré-configuradas
CREATE TABLE IF NOT EXISTS sections_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  ordem INTEGER NOT NULL,
  cor TEXT DEFAULT '#3B82F6',
  icone TEXT,
  ativo BOOLEAN DEFAULT true
);

-- Tabela: Analytics de Edições
CREATE TABLE IF NOT EXISTS edition_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id UUID REFERENCES editions(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'page_view', 'download_pdf', 'download_epub', 'share')),
  pagina INTEGER,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_editions_status ON editions(status);
CREATE INDEX IF NOT EXISTS idx_editions_slug ON editions(slug);
CREATE INDEX IF NOT EXISTS idx_editions_data_publicacao ON editions(data_publicacao DESC);
CREATE INDEX IF NOT EXISTS idx_edition_items_edition_id ON edition_items(edition_id);
CREATE INDEX IF NOT EXISTS idx_edition_items_ordem ON edition_items(edition_id, ordem);
CREATE INDEX IF NOT EXISTS idx_ads_library_ativo ON ads_library(ativo);
CREATE INDEX IF NOT EXISTS idx_edition_analytics_edition_id ON edition_analytics(edition_id);

-- RLS Policies para editions
ALTER TABLE editions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Edições publicadas são visíveis para todos"
  ON editions FOR SELECT
  USING (status = 'publicado');

CREATE POLICY "Admin/Editor podem ver todas as edições"
  ON editions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admin/Editor podem criar edições"
  ON editions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admin/Editor podem atualizar edições"
  ON editions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admin/Editor podem excluir edições"
  ON editions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

-- RLS Policies para edition_items
ALTER TABLE edition_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Items de edições publicadas são visíveis"
  ON edition_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM editions
      WHERE id = edition_items.edition_id
      AND status = 'publicado'
    )
  );

CREATE POLICY "Admin/Editor podem gerenciar items"
  ON edition_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

-- RLS Policies para ads_library
ALTER TABLE ads_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anúncios ativos são visíveis"
  ON ads_library FOR SELECT
  USING (ativo = true);

CREATE POLICY "Admin pode gerenciar anúncios"
  ON ads_library FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- RLS Policies para sections_library
ALTER TABLE sections_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Seções são visíveis para todos"
  ON sections_library FOR SELECT
  USING (true);

CREATE POLICY "Admin pode gerenciar seções"
  ON sections_library FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- RLS Policies para edition_analytics
ALTER TABLE edition_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem inserir analytics"
  ON edition_analytics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin pode ver analytics"
  ON edition_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

-- Dados Mock: Seções Padrão
INSERT INTO sections_library (nome, ordem, cor, icone, ativo) VALUES
  ('Capa', 0, '#EF4444', 'newspaper', true),
  ('Política', 1, '#3B82F6', 'users', true),
  ('Economia', 2, '#10B981', 'trending-up', true),
  ('Esportes', 3, '#F59E0B', 'trophy', true),
  ('Cultura', 4, '#8B5CF6', 'palette', true),
  ('Geral', 5, '#6B7280', 'globe', true),
  ('Opinião', 6, '#EC4899', 'message-circle', true)
ON CONFLICT DO NOTHING;

-- Dados Mock: Anúncios de Exemplo
INSERT INTO ads_library (nome, tipo, img_url, anunciante, alt_text, prioridade, ativo) VALUES
  ('Anúncio Banco - Página Inteira', 'pagina_inteira', 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800', 'Banco Nacional', 'Campanha de investimentos do Banco Nacional', 10, true),
  ('Banner Supermercado', 'banner', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=970', 'Supermercado Popular', 'Ofertas da semana no Supermercado Popular', 5, true),
  ('Anúncio Tecnologia - Meia Página', 'meia', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600', 'Tech Solutions', 'Soluções tecnológicas para empresas', 7, true)
ON CONFLICT DO NOTHING;