-- Alterar a foreign key para CASCADE delete
-- Isso faz com que ao deletar um artigo, os WebStories associados sejam automaticamente deletados

-- Primeiro, verificar se a constraint existe e removê-la
ALTER TABLE IF EXISTS webstories 
DROP CONSTRAINT IF EXISTS webstories_source_article_id_fkey;

-- Recriar a foreign key com ON DELETE CASCADE
ALTER TABLE webstories 
ADD CONSTRAINT webstories_source_article_id_fkey 
FOREIGN KEY (source_article_id) 
REFERENCES articles(id) 
ON DELETE CASCADE;