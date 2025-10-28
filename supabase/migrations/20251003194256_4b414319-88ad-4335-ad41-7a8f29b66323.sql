-- Set Modelo ITL 05 as default theme in site_settings
INSERT INTO site_settings (key, value)
VALUES ('portal_theme', '{"model": "modelo-itl-05-v1"}'::jsonb)
ON CONFLICT (key) 
DO UPDATE SET value = '{"model": "modelo-itl-05-v1"}'::jsonb, updated_at = now();