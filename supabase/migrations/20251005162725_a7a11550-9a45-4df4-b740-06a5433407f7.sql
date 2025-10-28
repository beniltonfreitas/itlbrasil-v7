-- Corrigir o nome do site de objeto JSON para string
UPDATE site_settings 
SET value = '"Instituto Tribuna Livre"'::jsonb
WHERE key = 'site_name';

-- Garantir que site_tagline também seja string se existir
UPDATE site_settings 
SET value = '"Portal de notícias com jornalismo de qualidade"'::jsonb
WHERE key = 'site_tagline' AND value::text LIKE '{%';