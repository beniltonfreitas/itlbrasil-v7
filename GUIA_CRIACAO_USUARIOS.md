# 📋 Guia Passo a Passo: Criação de Usuários no Supabase

## 🎯 Objetivo
Criar os usuários iniciais do sistema (Superadmin e Admin) no Supabase.

---

## 📍 Método 1: Via Edge Function (RECOMENDADO)

### Passo 1: Acesse o Supabase Dashboard
1. Acesse: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto: `adllopjxodsyglyctqdz`

### Passo 2: Verifique o Secret Token
1. No menu lateral, clique em **Settings** (⚙️)
2. Clique em **Edge Functions**
3. Role até a seção **Secrets**
4. Localize o secret: `BOOTSTRAP_SECRET_TOKEN`
5. Anote o valor: `@Sfx2537#a`

### Passo 3: Execute via Browser Console
1. Abra o navegador (Chrome, Firefox, Edge)
2. Pressione `F12` para abrir o DevTools
3. Vá para a aba **Console**
4. Cole e execute este código:

```javascript
fetch('https://adllopjxodsyglyctqdz.supabase.co/functions/v1/bootstrap-superadmin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ secret: '@Sfx2537#a' })
})
.then(res => res.json())
.then(data => console.log('✅ Resposta:', data))
.catch(err => console.error('❌ Erro:', err));
```

### Passo 4: Verifique a Resposta
Você deve ver algo assim no console:

```json
{
  "success": true,
  "message": "Bootstrap completed successfully",
  "users": {
    "superadmin": {
      "email": "bs7freitas@gmail.com",
      "id": "uuid-gerado",
      "role": "superadmin"
    },
    "admin": {
      "email": "chiquinhomachado@gmail.com",
      "id": "uuid-gerado",
      "role": "admin"
    }
  }
}
```

---

## 📍 Método 2: Via SQL Editor (ALTERNATIVO)

Se preferir criar manualmente via SQL:

### Passo 1: Acesse o SQL Editor
1. No Supabase Dashboard, clique em **SQL Editor** no menu lateral
2. Clique em **New query**

### Passo 2: Execute o SQL de Criação

```sql
-- 1. Criar usuário Superadmin
DO $$
DECLARE
  v_superadmin_id uuid;
  v_admin_id uuid;
BEGIN
  -- Criar Superadmin (bs7freitas@gmail.com)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'bs7freitas@gmail.com',
    crypt('S!pErAdm1n#7Kz9Rvx2QbT6y!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO v_superadmin_id;

  -- Criar perfil do Superadmin
  INSERT INTO public.profiles (id, user_id, email, name, full_name, role, status)
  VALUES (
    gen_random_uuid(),
    v_superadmin_id,
    'bs7freitas@gmail.com',
    'Super Admin',
    'Super Admin',
    'admin',
    'active'
  );

  -- Criar role de superadmin
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_superadmin_id, 'superadmin');

  RAISE NOTICE 'Superadmin criado: %', v_superadmin_id;

  -- Criar Admin (chiquinhomachado@gmail.com)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'chiquinhomachado@gmail.com',
    crypt('fcsm303118', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO v_admin_id;

  -- Criar perfil do Admin
  INSERT INTO public.profiles (id, user_id, email, name, full_name, role, status)
  VALUES (
    gen_random_uuid(),
    v_admin_id,
    'chiquinhomachado@gmail.com',
    'Admin',
    'Admin',
    'admin',
    'active'
  );

  -- Criar role de admin
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_admin_id, 'admin');

  RAISE NOTICE 'Admin criado: %', v_admin_id;

END $$;
```

### Passo 3: Execute a Query
1. Clique em **Run** (ou pressione `Ctrl + Enter`)
2. Aguarde a mensagem de sucesso

---

## ✅ Verificação dos Usuários Criados

### Verificar na tabela auth.users
```sql
SELECT id, email, created_at
FROM auth.users
WHERE email IN ('bs7freitas@gmail.com', 'chiquinhomachado@gmail.com');
```

### Verificar na tabela profiles
```sql
SELECT id, user_id, email, name, role, status
FROM public.profiles
WHERE email IN ('bs7freitas@gmail.com', 'chiquinhomachado@gmail.com');
```

### Verificar na tabela user_roles
```sql
SELECT ur.id, ur.user_id, ur.role, au.email
FROM public.user_roles ur
JOIN auth.users au ON au.id = ur.user_id
WHERE au.email IN ('bs7freitas@gmail.com', 'chiquinhomachado@gmail.com');
```

---

## 🔑 Credenciais de Acesso

### Superadmin
- **Email**: `bs7freitas@gmail.com`
- **Senha**: `S!pErAdm1n#7Kz9Rvx2QbT6y!`
- **Role**: `superadmin`

### Admin
- **Email**: `chiquinhomachado@gmail.com`
- **Senha**: `fcsm303118`
- **Role**: `admin`

---

## 🔐 Próximos Passos

1. **Teste o Login**
   - Acesse: https://seu-site.com/auth
   - Faça login com uma das credenciais acima

2. **Altere as Senhas** (RECOMENDADO)
   - Após o primeiro login, vá em configurações
   - Altere para senhas mais seguras

3. **Desabilite Confirmação de Email** (Opcional)
   - No Supabase Dashboard
   - Settings > Authentication > Email
   - Desmarque "Enable email confirmations"

4. **Crie Outros Usuários**
   - Acesse: `/admin/users-manager`
   - Crie novos usuários com diferentes roles

---

## 🆘 Solução de Problemas

### Erro: "User already exists"
- **Solução**: Os usuários já foram criados anteriormente
- Delete os usuários existentes ou use emails diferentes

### Erro: "Invalid bootstrap secret"
- **Solução**: Verifique se o token está correto no Supabase Secrets

### Erro: "Cannot insert into auth.users"
- **Solução**: Use o Método 1 (Edge Function) em vez do SQL direto

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs da Edge Function no Supabase
2. Confirme que todas as migrações foram aplicadas
3. Verifique as políticas RLS das tabelas

---

**Criado em**: 06/10/2025  
**Versão**: 1.0
