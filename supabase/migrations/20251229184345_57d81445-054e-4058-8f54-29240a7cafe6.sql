-- Corrigir roles dos usuários: bs7freitas como superadmin, chiquinhomachado como admin

-- 1. Atualizar bs7freitas@gmail.com para superadmin
UPDATE public.user_roles 
SET role = 'superadmin'
WHERE user_id = 'd125a63d-4abe-44fc-9004-af719687e34c';

-- 2. Atualizar chiquinhomachado@gmail.com para admin
UPDATE public.user_roles 
SET role = 'admin'
WHERE user_id = 'e1a02e28-fd93-41e1-981c-277fad4a2096';