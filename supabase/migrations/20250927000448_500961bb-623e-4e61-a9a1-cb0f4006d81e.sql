-- Criar usuário administrativo com email bs7freitas@gmail.com
-- Versão corrigida com role válido para a tabela profiles

-- Primeiro, inserir o usuário na tabela auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'bs7freitas@gmail.com',
  crypt('S!pErAdm1n#7Kz9Rvx2QbT6y!', gen_salt('bf')),
  NOW(),
  NULL,
  '',
  NULL,
  '',
  NULL,
  '',
  '',
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Bruno Freitas", "email": "bs7freitas@gmail.com"}',
  false,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL
);

-- Obter o ID do usuário recém-criado e criar perfil
DO $$
DECLARE
  user_uuid uuid;
BEGIN
  -- Buscar o UUID do usuário
  SELECT id INTO user_uuid 
  FROM auth.users 
  WHERE email = 'bs7freitas@gmail.com';
  
  -- Criar perfil na tabela profiles (usando 'admin' ao invés de 'superadmin')
  INSERT INTO public.profiles (
    id,
    user_id, 
    name,
    email,
    role,
    status,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    user_uuid,
    'Bruno Freitas',
    'bs7freitas@gmail.com', 
    'admin',
    'active',
    NOW(),
    NOW()
  );

  -- Criar role de superadmin na tabela user_roles
  INSERT INTO public.user_roles (
    id,
    user_id,
    role,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    user_uuid,
    'superadmin',
    NOW(),
    NOW()
  );
  
END $$;