# Mech Magic Dash - Sistema de Gestão para Oficina Mecânica

Sistema completo de gestão para oficinas mecânicas construído com Next.js 15, Prisma, PostgreSQL e SWR, seguindo os princípios SOLID e totalmente responsivo para mobile.

## 🚀 Tecnologias Utilizadas

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL com Prisma ORM
- **State Management**: SWR para cache e sincronização
- **Icons**: Lucide React
- **Design**: Mobile-first, responsivo

## 📋 Funcionalidades

- **Dashboard**: Visão geral com estatísticas e alertas
- **Clientes**: Gestão completa de clientes e histórico
- **Ordens de Serviço**: Criação e acompanhamento de ordens
- **Estoque**: Controle de produtos e alertas de estoque baixo
- **Configurações**: Configurações do sistema
- **Responsivo**: Interface otimizada para mobile e desktop

## 🏗️ Arquitetura SOLID

### Single Responsibility Principle (SRP)

- Cada classe tem uma única responsabilidade
- Serviços separados por domínio (ClienteService, OrdemService, etc.)
- Componentes com responsabilidades específicas

### Open/Closed Principle (OCP)

- Interfaces bem definidas para extensão
- Hooks SWR reutilizáveis e extensíveis

### Liskov Substitution Principle (LSP)

- Interfaces consistentes entre serviços
- Tipos bem definidos para todas as entidades

### Interface Segregation Principle (ISP)

- Interfaces específicas para cada operação
- Hooks especializados por funcionalidade

### Dependency Inversion Principle (DIP)

- Dependência de abstrações (interfaces)
- Injeção de dependências via hooks

## 📱 Design Responsivo

- **Mobile-first**: Design otimizado para dispositivos móveis
- **Breakpoints**: sm, md, lg, xl para diferentes tamanhos de tela
- **Componentes adaptativos**: Layout que se ajusta automaticamente
- **Touch-friendly**: Interface otimizada para toque

## 🛠️ Instalação e Configuração

### Pré-requisitos

- Node.js 18+
- PostgreSQL
- npm ou yarn

### 1. Clone o repositório

```bash
git clone <repository-url>
cd mech-magic-dash
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o banco de dados

Crie um arquivo `.env.local` na raiz do projeto:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/mech_magic_dash?schema=public"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Configure o Prisma

```bash
# Gere o cliente Prisma
npx prisma generate

# Execute as migrações
npx prisma db push

# Popule o banco com dados de exemplo
npm run db:seed
```

### 5. Execute o projeto

```bash
npm run dev
```

O projeto estará disponível em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router do Next.js
│   ├── (dashboard)/       # Grupo de rotas do dashboard
│   ├── api/               # API Routes
│   └── globals.css        # Estilos globais
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes base (Radix UI)
│   └── providers.tsx     # Providers (SWR, Theme)
├── hooks/                # Hooks customizados (SWR)
├── lib/                  # Utilitários e configurações
│   ├── api.ts           # Cliente API
│   └── prisma.ts        # Cliente Prisma
└── types/               # Definições de tipos
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar em produção
npm run start

# Linting
npm run lint

# Banco de dados
npm run db:generate    # Gerar cliente Prisma
npm run db:push        # Aplicar mudanças no banco
npm run db:studio      # Abrir Prisma Studio
npm run db:migrate     # Criar migração
npm run db:seed        # Popular banco com dados
```

## 📊 API Endpoints

### Clientes

- `GET /api/clientes` - Listar clientes
- `POST /api/clientes` - Criar cliente
- `GET /api/clientes/[id]` - Buscar cliente
- `PUT /api/clientes/[id]` - Atualizar cliente
- `DELETE /api/clientes/[id]` - Excluir cliente

### Ordens de Serviço

- `GET /api/ordens` - Listar ordens
- `POST /api/ordens` - Criar ordem
- http://localhost:3000/api/ordens/[id] - Gerenciar ordem específica

### Produtos

- `GET /api/produtos` - Listar produtos
- `POST /api/produtos` - Criar produto
- `GET /api/produtos/estoque-baixo` - Produtos com estoque baixo

### Dashboard

- `GET /api/dashboard` - Dados do dashboard

## 🎨 Componentes UI

O projeto utiliza uma biblioteca de componentes baseada no Radix UI com Tailwind CSS:

- **Cards**: Para exibir informações organizadas
- **Buttons**: Botões com variantes e tamanhos
- **Forms**: Componentes de formulário com validação
- **Navigation**: Sidebar responsiva
- **Tables**: Tabelas responsivas
- **Modals**: Dialogs e modais
- **Loading**: Skeletons e estados de carregamento

## 📱 Responsividade

### Breakpoints

- **sm**: 640px+
- **md**: 768px+
- **lg**: 1024px+
- **xl**: 1280px+

### Classes Utilitárias

- `container-mobile`: Container responsivo
- `text-responsive`: Texto que se adapta ao tamanho
- `grid-responsive`: Grid que se adapta
- `flex-mobile`: Flex que vira coluna no mobile

## 🔄 Gerenciamento de Estado

### SWR Features

- **Cache automático**: Dados em cache para melhor performance
- **Revalidação**: Atualização automática dos dados
- **Otimistic updates**: Atualizações otimistas
- **Error handling**: Tratamento de erros
- **Loading states**: Estados de carregamento

### Hooks Customizados

- `useClientes()`: Gerenciar clientes
- `useOrdens()`: Gerenciar ordens de serviço
- `useProdutos()`: Gerenciar produtos
- `useDashboard()`: Dados do dashboard

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Outras Plataformas

O projeto é compatível com qualquer plataforma que suporte Next.js:

- Netlify
- Railway
- DigitalOcean
- AWS

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte, entre em contato através dos issues do GitHub ou email.

---

Desenvolvido com ❤️ usando Next.js, Prisma e SWR
