-- Fase 1: Promover chiquinhomachado@gmail.com para Superadmin
INSERT INTO public.user_roles (user_id, role)
VALUES (
  '859356d1-7baa-437f-b5e5-2852a485f48a',
  'superadmin'::app_role
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Fase 2: Remover Configurações de NFSe da Benilton Silva Freitas

-- 2.1: Remover logs de auditoria relacionados
DELETE FROM public.nfse_logs
WHERE perfil_id = '7b7e3dc0-4654-4ad8-a02f-d520f693e64a';

-- 2.2: Remover sequências RPS
DELETE FROM public.nfse_rps_sequencia
WHERE perfil_id = '7b7e3dc0-4654-4ad8-a02f-d520f693e64a';

-- 2.3: Remover o perfil NFSe
DELETE FROM public.nfse_perfis
WHERE id = '7b7e3dc0-4654-4ad8-a02f-d520f693e64a';

COMMENT ON COLUMN public.user_roles.role IS 'User roles including superadmin for chiquinhomachado@gmail.com';