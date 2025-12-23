-- Adicionar categoria Cultura (entre Internacional e Direitos Humanos)
INSERT INTO public.categories (name, slug, color, description)
VALUES ('Cultura', 'cultura', '#9333EA', 'Notícias sobre cultura, arte e entretenimento')
ON CONFLICT (slug) DO NOTHING;

-- Adicionar categoria Meio Ambiente (entre Justiça e Política)
INSERT INTO public.categories (name, slug, color, description)
VALUES ('Meio Ambiente', 'meio-ambiente', '#22C55E', 'Notícias sobre meio ambiente, sustentabilidade e ecologia')
ON CONFLICT (slug) DO NOTHING;