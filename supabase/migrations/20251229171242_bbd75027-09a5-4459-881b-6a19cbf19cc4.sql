
-- 1. Remover superadmin de bs7freitas@gmail.com
DELETE FROM public.user_roles 
WHERE user_id = 'd125a63d-4abe-44fc-9004-af719687e34c' 
AND role = 'superadmin';

-- 2. Adicionar superadmin para chiquinhomachado@gmail.com
UPDATE public.user_roles 
SET role = 'superadmin' 
WHERE user_id = 'e1a02e28-fd93-41e1-981c-277fad4a2096';

-- 3. Adicionar role admin para bs7freitas@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('d125a63d-4abe-44fc-9004-af719687e34c', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
