-- Insert default author "Redação ITL Brasil" if not exists
INSERT INTO public.authors (id, name, slug, email, bio)
VALUES (
  '04ff5b92-dde9-427b-9371-e3b2813bcab5',
  'Redação ITL Brasil',
  'redacao-itl-brasil',
  'redacao@itlbrasil.com',
  'Equipe de redação do ITL Brasil'
)
ON CONFLICT (id) DO NOTHING;