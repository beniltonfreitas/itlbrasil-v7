# 🚀 Instruções de Bootstrap do Sistema Superadmin

## ⚠️ IMPORTANTE: Leia antes de executar!

Este processo cria os usuários iniciais do sistema e **só pode ser executado UMA VEZ**. Após a primeira execução, a função se auto-desativa por segurança.

---

## 📋 Usuários que serão criados:

### 1. **Super Admin** (Acesso Total)
- **Email**: `bs7freitas@gmail.com`
- **Senha**: `S!pErAdm1n#7Kz9Rvx2QbT6y!`
- **Role**: `superadmin`
- **Permissões**: Acesso total ao sistema, incluindo:
  - Criar/remover qualquer usuário
  - Atribuir qualquer role (incluindo outros superadmins)
  - Acessar logs de sistema
  - Configurações críticas de segurança

### 2. **Admin** (Administrador)
- **Email**: `chiquinhomachado@gmail.com`
- **Senha**: `fcsm303118`
- **Role**: `admin`
- **Permissões**: Acesso administrativo completo, exceto:
  - ❌ Não pode criar outros admins
  - ❌ Não pode acessar configurações críticas de segurança

---

## 🔧 Como executar o Bootstrap

### Opção 1: Via cURL (Linux/Mac)

```bash
curl -X POST https://adllopjxodsyglyctqdz.supabase.co/functions/v1/bootstrap-superadmin \
  -H "Content-Type: application/json" \
  -d '{"secret": "SEU_TOKEN_BOOTSTRAP_AQUI"}'
```

### Opção 2: Via PowerShell (Windows)

```powershell
$body = @{
    secret = "SEU_TOKEN_BOOTSTRAP_AQUI"
} | ConvertTo-Json

Invoke-RestMethod -Method Post `
  -Uri "https://adllopjxodsyglyctqdz.supabase.co/functions/v1/bootstrap-superadmin" `
  -ContentType "application/json" `
  -Body $body
```

### Opção 3: Via Postman/Insomnia

1. **Método**: POST
2. **URL**: `https://adllopjxodsyglyctqdz.supabase.co/functions/v1/bootstrap-superadmin`
3. **Headers**:
   ```
   Content-Type: application/json
   ```
4. **Body** (raw JSON):
   ```json
   {
     "secret": "SEU_TOKEN_BOOTSTRAP_AQUI"
   }
   ```

---

## ✅ Resposta de Sucesso

Se tudo funcionar corretamente, você verá:

```json
{
  "success": true,
  "message": "Bootstrap completed successfully",
  "users": {
    "superadmin": {
      "email": "bs7freitas@gmail.com",
      "id": "uuid-do-usuario",
      "role": "superadmin"
    },
    "admin": {
      "email": "chiquinhomachado@gmail.com",
      "id": "uuid-do-usuario",
      "role": "admin"
    }
  },
  "note": "This function is now disabled and can only be used once."
}
```

---

## ❌ Possíveis Erros

### Erro: "Invalid bootstrap secret"
```json
{
  "error": "Unauthorized: Invalid bootstrap secret"
}
```
**Solução**: Verifique se o token está correto no Supabase Secrets.

### Erro: "Bootstrap already completed"
```json
{
  "error": "Bootstrap already completed. Superadmin exists.",
  "message": "This function can only be used once and is now disabled."
}
```
**Solução**: Os usuários já foram criados. Use a função `admin-users` para criar novos usuários.

---

## 🔒 Após o Bootstrap

1. **Faça login** com um dos usuários criados em: `/auth`
2. **Altere as senhas** imediatamente após o primeiro login (recomendado)
3. **Desabilite a confirmação de email** no Supabase se ainda não fez (configuração > auth > email)
4. **Configure outros usuários** através do painel admin em: `/admin/users-manager`

---

## 📚 Hierarquia de Roles

```
SUPERADMIN (Coroa 👑)
    ↓
  ADMIN (Escudo 🛡️)
    ↓
  EDITOR (Lápis ✏️)
    ↓
  AUTHOR (Documento 📄)
```

---

## 🔑 Próximos Passos

1. Execute o comando de bootstrap acima
2. Faça login com `bs7freitas@gmail.com`
3. Acesse o painel em `/admin/`
4. Gerencie roles em `/admin/role-manager`
5. Crie novos usuários em `/admin/users-manager`

---

## 🆘 Suporte

Se algo der errado:
1. Verifique os logs da Edge Function no Supabase Dashboard
2. Confirme que o `BOOTSTRAP_SECRET_TOKEN` está configurado corretamente
3. Verifique se as migrations foram aplicadas com sucesso

---

**Data de criação**: 2025-10-06
**Versão**: 1.0
