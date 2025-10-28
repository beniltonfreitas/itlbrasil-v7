# 📋 Formato JSON do Jornalista Pró

## Estrutura Completa Esperada

```json
{
  "noticias": [
    {
      "titulo": "string (obrigatório)",
      "slug": "string-slug-url (obrigatório)",
      "categoria": "string (deve existir no banco de dados)",
      "resumo": "string (máximo 160 caracteres)",
      "conteudo": "string HTML formatado (NÃO array!)",
      "fonte": "string (ex: Agência Brasil)",
      "imagem": "string URL (NÃO objeto!)",
      "imagem_alt": "string (descrição acessível, 10-140 caracteres)",
      "imagem_credito": "string (ex: © FNDE/Divulgação)",
      "imagens_adicionais": ["url1", "url2", "url3"],
      "featured": boolean (opcional, marca artigo como destaque),
      "tags": ["tag1", "tag2", ..., "tag12"],
      "seo": {
        "meta_titulo": "string (máximo 60 caracteres)",
        "meta_descricao": "string (máximo 160 caracteres)"
      }
    }
  ]
}
```

## ✅ Exemplo de JSON Correto

```json
{
  "noticias": [
    {
      "titulo": "Brasil é referência mundial em alimentação escolar",
      "slug": "brasil-referencia-alimentacao-escolar",
      "categoria": "Educação",
      "resumo": "Especialistas destacam que o Brasil é modelo mundial em alimentação escolar.",
      "conteudo": "<p>O Brasil consolidou-se como uma das maiores referências mundiais em <strong>alimentação escolar</strong>.</p><h2>Reconhecimento Internacional</h2><p>Segundo pesquisadores, o modelo brasileiro combina nutrição saudável com valorização da agricultura local.</p><blockquote>\"Mais de 60 países já se inspiraram na experiência brasileira\"</blockquote>",
      "fonte": "Agência Brasil",
      "imagem": "https://itlbrasil.com/uploads/2025/10/alimentacao-escolar.jpg",
      "imagem_alt": "Estudantes do ensino básico recebendo alimentação escolar saudável",
      "imagem_credito": "© FNDE/Divulgação",
      "imagens_adicionais": [
        "https://itlbrasil.com/uploads/2025/10/cozinha-escolar.jpg",
        "https://itlbrasil.com/uploads/2025/10/agricultura-familiar.jpg"
      ],
      "featured": true,
      "tags": ["alimentação escolar", "FNDE", "educação", "nutrição", "agricultura familiar", "PNAE", "merenda escolar", "políticas públicas", "segurança alimentar", "Brasil", "desenvolvimento regional", "sustentabilidade"],
      "seo": {
        "meta_titulo": "Brasil é referência mundial em alimentação escolar",
        "meta_descricao": "O Brasil é modelo mundial em alimentação escolar e inspirou políticas públicas em mais de 60 países, segundo especialistas."
      }
    }
  ]
}
```

## ⚠️ Erros Comuns e Como Corrigir

### 1. **Imagem como objeto (ERRADO)**

❌ **ERRADO:**
```json
"imagem": {
  "url": "https://exemplo.com/foto.jpg",
  "alt": "Descrição",
  "credito": "© Agência/Fotógrafo"
}
```

✅ **CORRETO:**
```json
"imagem": "https://exemplo.com/foto.jpg",
"imagem_alt": "Descrição objetiva da cena mostrada na foto",
"imagem_credito": "© Agência/Fotógrafo"
```

---

### 2. **Conteúdo como array (ERRADO)**

❌ **ERRADO:**
```json
"conteudo": [
  "Primeiro parágrafo",
  "Segundo parágrafo",
  "## Subtítulo",
  "Terceiro parágrafo"
]
```

✅ **CORRETO:**
```json
"conteudo": "<p>Primeiro parágrafo</p><p>Segundo parágrafo</p><h2>Subtítulo</h2><p>Terceiro parágrafo</p>"
```

---

### 3. **Galeria em vez de imagens_adicionais (ERRADO)**

❌ **ERRADO:**
```json
"galeria": [
  {
    "url": "https://exemplo.com/foto1.jpg",
    "legenda": "Descrição da foto",
    "fonte": "Agência"
  }
]
```

✅ **CORRETO:**
```json
"imagens_adicionais": [
  "https://exemplo.com/foto1.jpg",
  "https://exemplo.com/foto2.jpg"
]
```

---

### 4. **Menos de 12 tags (ERRADO)**

❌ **ERRADO:**
```json
"tags": ["tag1", "tag2", "tag3"]
```

✅ **CORRETO:**
```json
"tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10", "tag11", "tag12"]
```

---

### 5. **Menções ao WhatsApp no conteúdo (ERRADO)**

❌ **ERRADO:**
```json
"conteudo": "<p>Texto da notícia...</p><p>>> Siga o canal do WhatsApp</p><p>https://whatsapp.com/channel/...</p>"
```

✅ **CORRETO:**
```json
"conteudo": "<p>Texto da notícia...</p>"
```

**Nota:** O sistema adiciona automaticamente o CTA do WhatsApp em 3 posições estratégicas do artigo.

---

## 📝 Regras de Formatação HTML

O campo `conteudo` deve usar HTML semântico:

- `<p>` para parágrafos normais
- `<h2>` para seções principais
- `<h3>` para subseções
- `<blockquote>` para citações de pessoas
- `<strong>` para texto em negrito
- `<ul><li>` para listas com bullets

**Exemplo:**
```html
<p>O Brasil consolidou-se como referência mundial.</p>
<h2>Reconhecimento Internacional</h2>
<p>Especialistas destacam o modelo brasileiro.</p>
<blockquote>"Mais de 60 países se inspiraram", afirmou Ana Beatriz.</blockquote>
<p>O programa também fortalece o desenvolvimento regional.</p>
```

---

## 📸 Estrutura de Imagens

### Imagem Principal
- `imagem`: URL da imagem (string)
- `imagem_credito`: Crédito da foto (string, opcional)

### Galeria (Imagens Adicionais)
- `imagens_adicionais`: **Array de strings** contendo URLs válidas
- Máximo: 10 imagens válidas
- Cada URL será convertido automaticamente em objeto com caption e credit
- URLs inválidas (que não começam com http/https) serão filtradas automaticamente

**✅ CORRETO:**
```json
{
  "imagem": "https://exemplo.com/foto-principal.jpg",
  "imagem_credito": "© Fotógrafo/Agência",
  "imagens_adicionais": [
    "https://exemplo.com/galeria-1.jpg",
    "https://exemplo.com/galeria-2.jpg"
  ]
}
```

**❌ ERRADO:**
```json
{
  "imagens_adicionais": ""                    // String vazia - NÃO FAZER
  "imagens_adicionais": null                  // Nulo - NÃO FAZER
  "imagens_adicionais": []                    // Array vazio - omita o campo
  "imagens_adicionais": "url1, url2"          // String com vírgulas - NÃO FAZER
}
```

**Dica:** Se não houver imagens adicionais, **omita o campo completamente** ao invés de enviar array vazio.

---

## 🔄 Compatibilidade com Formato Antigo

O sistema possui fallbacks para converter automaticamente formatos antigos:

- **Imagem objeto** → converte para string + credito separado
- **Conteúdo array** → converte para HTML contínuo
- **Galeria** → converte para imagens_adicionais
- **Tags insuficientes** → completa até 12 tags
- **URLs de imagem inválidas** → filtradas automaticamente

Porém, é **altamente recomendado** usar o formato correto desde o início.

---

### 🌟 Artigo em Destaque

- A **primeira notícia** de cada importação é automaticamente marcada como destaque (`featured: true`)
- Notícias da categoria **"Últimas Notícias"** são sempre destaque
- Você pode forçar manualmente adicionando `"featured": true` no JSON
- Artigos em destaque aparecem na página inicial com maior visibilidade

---

## 🚀 Como Usar

1. Gere o JSON no formato especificado acima
2. Importe via painel administrativo em **Jornalista Pró → Importar JSON**
3. Revise as notícias antes de publicar
4. O sistema adicionará automaticamente:
   - Autor (usuário logado)
   - Data de publicação
   - Conversão de slug
   - Upload de imagens para storage
   - Validação de categorias
   - Status "Publicado"
   - Primeira notícia marcada como destaque
   - 3x CTAs do WhatsApp ao longo do artigo
   - Formatação visual adequada
   - Galeria de imagens (se houver)

---

## 📞 Suporte

Se encontrar problemas ou tiver dúvidas sobre o formato, entre em contato com a equipe técnica da ITL Brasil.
