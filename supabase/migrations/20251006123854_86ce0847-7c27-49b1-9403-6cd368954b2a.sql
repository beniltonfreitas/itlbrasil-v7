-- Adicionar coluna author_id na tabela webstories
ALTER TABLE public.webstories 
ADD COLUMN author_id uuid REFERENCES public.authors(id);

-- Atualizar webstories existentes para usar "Redação ITL Brasil" como autor padrão
UPDATE public.webstories
SET author_id = '04ff5b92-dde9-427b-9371-e3b2813bcab5'
WHERE author_id IS NULL;

-- Criar índice para melhor performance
CREATE INDEX idx_webstories_author_id ON public.webstories(author_id);