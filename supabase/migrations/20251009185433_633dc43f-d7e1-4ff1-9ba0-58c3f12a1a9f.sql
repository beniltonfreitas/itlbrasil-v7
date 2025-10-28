-- Adicionar categorias faltantes ao sistema
INSERT INTO categories (id, name, slug, description, color, icon, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Últimas Notícias', 'ultimas-noticias', 'Notícias de última hora e destaques', '#EF4444', 'Newspaper', now(), now()),
  (gen_random_uuid(), 'Justiça', 'justica', 'Notícias sobre o sistema judiciário e processos legais', '#8B5CF6', 'Scale', now(), now()),
  (gen_random_uuid(), 'Internacional', 'internacional', 'Notícias do exterior e relações internacionais', '#3B82F6', 'Globe', now(), now()),
  (gen_random_uuid(), 'Meio Ambiente', 'meio-ambiente', 'Questões ambientais e sustentabilidade', '#10B981', 'Leaf', now(), now()),
  (gen_random_uuid(), 'Direitos Humanos', 'direitos-humanos', 'Igualdade, inclusão e direitos sociais', '#F59E0B', 'Users', now(), now()),
  (gen_random_uuid(), 'Geral', 'geral', 'Notícias gerais e variadas', '#6B7280', 'FileText', now(), now())
ON CONFLICT (slug) DO NOTHING;