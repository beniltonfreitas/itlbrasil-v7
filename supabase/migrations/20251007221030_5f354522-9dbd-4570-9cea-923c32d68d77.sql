-- Tabela de perfis de emissão de NFS-e (por prefeitura)
CREATE TABLE IF NOT EXISTS public.nfse_perfis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(120) NOT NULL,
  provedor VARCHAR(40) NOT NULL,
  ambiente VARCHAR(20) NOT NULL DEFAULT 'PRODUCAO',
  im VARCHAR(20) NOT NULL,
  token TEXT,
  endpoint TEXT,
  prestador_cnpj VARCHAR(20) NOT NULL,
  prestador_im VARCHAR(20) NOT NULL,
  prestador_razao VARCHAR(200) NOT NULL,
  prestador_fantasia VARCHAR(200),
  cnae VARCHAR(20),
  item_lista VARCHAR(10) NOT NULL DEFAULT '107',
  aliquota NUMERIC(5,4) NOT NULL DEFAULT 0.02,
  municipio_ibge INTEGER NOT NULL DEFAULT 3513009,
  natureza INTEGER NOT NULL DEFAULT 1,
  optante_simples INTEGER NOT NULL DEFAULT 1,
  iss_retido INTEGER NOT NULL DEFAULT 2,
  incentivador INTEGER NOT NULL DEFAULT 2,
  rps_serie VARCHAR(10) NOT NULL DEFAULT 'A',
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de controle de sequência de RPS
CREATE TABLE IF NOT EXISTS public.nfse_rps_sequencia (
  perfil_id UUID REFERENCES public.nfse_perfis(id) ON DELETE CASCADE,
  serie VARCHAR(10) NOT NULL,
  proximo_numero BIGINT NOT NULL DEFAULT 1,
  PRIMARY KEY (perfil_id, serie)
);

-- Tabela de clientes (tomadores)
CREATE TABLE IF NOT EXISTS public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo VARCHAR(5) NOT NULL,
  documento VARCHAR(20) NOT NULL,
  razao_social VARCHAR(200) NOT NULL,
  email VARCHAR(200),
  telefone VARCHAR(30),
  logradouro VARCHAR(200),
  numero VARCHAR(20),
  bairro VARCHAR(100),
  municipio_ibge INTEGER,
  uf CHAR(2),
  cep VARCHAR(15),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (documento)
);

-- Tabela de notas fiscais
CREATE TABLE IF NOT EXISTS public.nfse_notas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id UUID NOT NULL REFERENCES public.nfse_perfis(id),
  cliente_id UUID REFERENCES public.clientes(id),
  rps_serie VARCHAR(10) NOT NULL,
  rps_numero BIGINT NOT NULL,
  valor_servicos NUMERIC(14,2) NOT NULL,
  discriminacao TEXT NOT NULL,
  numero_nfse VARCHAR(50),
  codigo_verificacao VARCHAR(100),
  situacao VARCHAR(30) NOT NULL DEFAULT 'EM_PROCESSO',
  retorno_bruto TEXT,
  xml_path TEXT,
  pdf_path TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (perfil_id, rps_serie, rps_numero)
);

-- Tabela de arquivos anexos
CREATE TABLE IF NOT EXISTS public.nfse_arquivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nota_id UUID NOT NULL REFERENCES public.nfse_notas(id) ON DELETE CASCADE,
  tipo VARCHAR(10) NOT NULL,
  path TEXT NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de logs de auditoria
CREATE TABLE IF NOT EXISTS public.nfse_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id UUID REFERENCES public.nfse_perfis(id),
  nota_id UUID REFERENCES public.nfse_notas(id),
  acao VARCHAR(50) NOT NULL,
  detalhe TEXT,
  ip VARCHAR(100),
  user_id UUID,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.nfse_perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nfse_rps_sequencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nfse_notas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nfse_arquivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nfse_logs ENABLE ROW LEVEL SECURITY;

-- Policies: Apenas admins podem gerenciar NFS-e
CREATE POLICY "Admins podem gerenciar perfis"
  ON public.nfse_perfis
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins podem gerenciar sequências"
  ON public.nfse_rps_sequencia
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins podem gerenciar clientes"
  ON public.clientes
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins podem gerenciar notas"
  ON public.nfse_notas
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins podem gerenciar arquivos"
  ON public.nfse_arquivos
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins podem visualizar logs"
  ON public.nfse_logs
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Sistema pode inserir logs"
  ON public.nfse_logs
  FOR INSERT
  WITH CHECK (true);

-- Inserir perfil inicial Cotia/SP
INSERT INTO public.nfse_perfis (
  nome, provedor, ambiente, im, endpoint,
  prestador_cnpj, prestador_im, prestador_razao, prestador_fantasia
) VALUES (
  'Cotia/SP (API GIAP)',
  'COTIA_GIAP',
  'PRODUCAO',
  '6023077',
  'https://webservice.giap.com.br/WSNfsesCotia/nfseresources/ws/v2',
  '13794818000175',
  '6023077',
  'Benilton Silva Freitas Informática ME',
  'AB SOLUÇÕES'
)
ON CONFLICT DO NOTHING;

-- Inicializar sequência RPS série A
INSERT INTO public.nfse_rps_sequencia (perfil_id, serie, proximo_numero)
SELECT id, 'A', 1
FROM public.nfse_perfis
WHERE nome = 'Cotia/SP (API GIAP)'
ON CONFLICT DO NOTHING;