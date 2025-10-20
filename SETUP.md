# 🚀 Guia de Setup - Mech Magic Dash

Este guia te ajudará a configurar e executar o projeto **Mech Magic Dash** em sua máquina local.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js 18+** ([Download aqui](https://nodejs.org/))
- **PostgreSQL 15+** ([Download aqui](https://www.postgresql.org/download/))
- **Git** ([Download aqui](https://git-scm.com/))

## 🛠️ Instalação

### 1. Clone o repositório

```bash
git clone <seu-repositorio>
cd mech-magic-dash
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o banco de dados PostgreSQL

#### Opção A: Usando Docker (Recomendado)

```bash
# Execute o comando para subir o PostgreSQL
docker-compose up -d postgres

# O banco estará disponível em:
# Host: localhost
# Porta: 5432
# Usuário: mech_magic
# Senha: mech_magic_password
# Database: mech_magic_dash
```

#### Opção B: Instalação local

1. Instale o PostgreSQL em sua máquina
2. Crie um banco de dados chamado `mech_magic_dash`
3. Anote as credenciais (usuário, senha, host, porta)

### 4. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Database
DATABASE_URL="postgresql://mech_magic:mech_magic_password@localhost:5432/mech_magic_dash?schema=public"

# Next.js
NEXTAUTH_SECRET="sua-chave-secreta-aqui"
NEXTAUTH_URL="http://localhost:3000"

# API
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

**Importante:** Substitua as credenciais do banco pelas suas próprias se não estiver usando Docker.

### 5. Configure o Prisma

```bash
# Gere o cliente Prisma
npm run db:generate

# Execute as migrações para criar as tabelas
npm run db:push

# Popule o banco com dados de exemplo
npm run db:seed
```

### 6. Execute o projeto

```bash
npm run dev
```

🎉 **Pronto!** O projeto estará rodando em `http://localhost:3000`

## 📊 Acessando o banco de dados

### Via Prisma Studio (Interface gráfica)

```bash
npm run db:studio
```

O Prisma Studio estará disponível em `http://localhost:5555`

### Via Adminer (se usando Docker)

```bash
docker-compose up -d adminer
```

Acesse `http://localhost:8080` e use as credenciais:

- Sistema: PostgreSQL
- Servidor: postgres
- Usuário: mech_magic
- Senha: mech_magic_password
- Base de dados: mech_magic_dash

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia o servidor de desenvolvimento

# Build e produção
npm run build        # Gera build de produção
npm run start        # Executa o build de produção
npm run lint         # Executa o linter

# Banco de dados
npm run db:generate  # Gera o cliente Prisma
npm run db:push      # Aplica mudanças no banco
npm run db:studio    # Abre o Prisma Studio
npm run db:migrate   # Cria uma nova migração
npm run db:seed      # Popula o banco com dados de exemplo
```

## 📱 Funcionalidades Disponíveis

Após o setup, você terá acesso a:

- **Dashboard**: Visão geral com estatísticas
- **Clientes**: Gestão de clientes
- **Ordens de Serviço**: Criação e acompanhamento
- **Estoque**: Controle de produtos
- **Configurações**: Configurações do sistema

## 🐛 Solução de Problemas

### Erro de conexão com o banco

1. Verifique se o PostgreSQL está rodando
2. Confirme as credenciais no `.env.local`
3. Teste a conexão: `npm run db:studio`

### Erro de dependências

```bash
# Limpe o cache e reinstale
rm -rf node_modules package-lock.json
npm install
```

### Erro de build

```bash
# Gere o cliente Prisma novamente
npm run db:generate
npm run build
```

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Docker

```bash
# Build da imagem
docker build -t mech-magic-dash .

# Execute o container
docker run -p 3000:3000 mech-magic-dash
```

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs no terminal
2. Consulte a documentação do README.md
3. Abra uma issue no repositório

---

**Boa sorte com seu projeto! 🎉**
