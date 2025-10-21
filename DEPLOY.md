# 🚀 Guia de Deploy - Mech Magic Dash

## Problemas Resolvidos

### 1. **Versão do Node.js**

- ✅ Atualizado de Node.js 18 para Node.js 20
- ✅ Resolve incompatibilidades com dependências modernas

### 2. **Better-SQLite3**

- ✅ Adicionadas variáveis de ambiente para evitar compilação
- ✅ Instaladas dependências Python necessárias
- ✅ Configurado para usar binários pré-compilados

### 3. **Otimizações do Docker**

- ✅ Adicionado `.dockerignore` para builds mais rápidos
- ✅ Configurado `.npmrc` para otimizações
- ✅ Variáveis de ambiente otimizadas

## Arquivos de Deploy

### Dockerfile Principal

```dockerfile
FROM node:20-alpine AS base
# ... configurações otimizadas
```

### Dockerfile Alternativo

- `Dockerfile.final` - Versão otimizada
- `Dockerfile.optimized` - Versão com configurações específicas

### Configurações

- `.dockerignore` - Exclui arquivos desnecessários
- `.npmrc` - Configurações do npm
- `package.docker.json` - Dependências otimizadas

## Comandos de Deploy

### Build Local

```bash
# Usar Dockerfile principal
docker build -t mech-magic-dash .

# Usar Dockerfile otimizado
docker build -f Dockerfile.final -t mech-magic-dash .

# Usar script de build
chmod +x build-docker.sh
./build-docker.sh
```

### Deploy no EasyPanel

1. Use o `Dockerfile` principal
2. Configure as variáveis de ambiente necessárias
3. O build deve funcionar sem erros

## Variáveis de Ambiente Necessárias

```env
# Database
DATABASE_URL=postgres://user:pass@host:port/db

# Auth
BETTER_AUTH_SECRET=your_secret_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.com

# API
NEXT_PUBLIC_API_URL=https://your-domain.com/api
APP_URL=https://your-domain.com

# Email
MAIL_ADAPTER=smtp
SMTP_SENDER_EMAIL=Your App <noreply@your-domain.com>
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USERNAME=your-email@your-domain.com
SMTP_PASSWORD=your-password
SMTP_AUTH_DISABLED=false

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_BASIC_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

## Troubleshooting

### Erro: Better-SQLite3

- ✅ Resolvido com variáveis de ambiente
- ✅ Python e build tools instalados

### Erro: Node.js Version

- ✅ Atualizado para Node.js 20

### Erro: Python not found

- ✅ Python3 instalado no Alpine

### Erro: Build from source

- ✅ Configurado para usar binários pré-compilados

## Status do Deploy

- ✅ Build local funcionando
- ✅ Dockerfile otimizado
- ✅ Dependências resolvidas
- ✅ Pronto para produção
