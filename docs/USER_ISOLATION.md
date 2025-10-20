# Sistema de Isolamento por Usuário

## Visão Geral

O sistema foi projetado para garantir que cada usuário tenha acesso apenas aos seus próprios dados. Todas as entidades principais estão vinculadas ao usuário através do campo `usuarioId`.

## Estrutura do Banco de Dados

### Relacionamentos Implementados

Todas as entidades principais agora possuem relação com `Usuario`:

- **Cliente** → `usuarioId` (FK para Usuario)
- **Veículo** → `usuarioId` (FK para Usuario)
- **Produto** → `usuarioId` (FK para Usuario)
- **OrdemServico** → `usuarioId` (FK para Usuario)
- **Agendamento** → `usuarioId` (FK para Usuario)
- **ContaPagar** → `usuarioId` (FK para Usuario)
- **ContaReceber** → `usuarioId` (FK para Usuario)
- **Comissao** → `usuarioId` (FK para Usuario)
- **Caixa** → `usuarioId` (FK para Usuario)

### Constraints de Unicidade

Para evitar conflitos entre usuários, as constraints de unicidade foram ajustadas:

- **Cliente**: `@@unique([email, usuarioId])` - Mesmo email pode existir para usuários diferentes
- **Veículo**: `@@unique([placa, usuarioId])` - Mesma placa pode existir para usuários diferentes
- **Produto**: `@@unique([codigo, usuarioId])` - Mesmo código pode existir para usuários diferentes
- **OrdemServico**: `@@unique([numero, usuarioId])` - Mesmo número pode existir para usuários diferentes

## Middleware de Autorização

### `src/lib/auth-middleware.ts`

Fornece funções utilitárias para verificar acesso:

```typescript
// Verificar se usuário tem acesso a um recurso específico
await verifyUserAccess(request, userId, resourceId, resourceType);

// Filtrar queries por usuário
const filter = getUserFilter(userId, userRole);

// Criar recursos com userId automaticamente
const data = createWithUser(resourceData, userId);
```

### Níveis de Acesso

- **ADMIN**: Pode acessar todos os dados de todos os usuários
- **GERENTE**: Pode acessar dados de sua equipe (implementar conforme necessário)
- **USUARIO**: Pode acessar apenas seus próprios dados

## Exemplo de API Route

### `src/app/api/clientes/route.ts`

Demonstra como implementar CRUD com isolamento por usuário:

```typescript
// GET - Listar apenas clientes do usuário
const clientes = await prisma.cliente.findMany({
  where: getUserFilter(userId, user.role),
  // ... outros filtros
});

// POST - Criar cliente vinculado ao usuário
const cliente = await prisma.cliente.create({
  data: createWithUser(clienteData, userId),
});

// PUT/DELETE - Verificar acesso antes de modificar
const accessCheck = await verifyUserAccess(request, userId, id, "cliente");
if (accessCheck) return accessCheck;
```

## Migração do Banco

### 1. Aplicar Mudanças no Schema

```bash
npx prisma migrate dev --name add-user-isolation
```

### 2. Executar Seed com Dados de Exemplo

```bash
npm run db:seed
```

O seed criará:

- 2 usuários (admin e user comum)
- Dados de exemplo isolados para cada usuário
- Senhas já criptografadas com bcrypt

## Testando o Sistema

### 1. Criar Contas

```bash
# Via API
curl -X POST http://localhost:3000/api/auth/session \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"teste@email.com","password":"123456","action":"signup"}'
```

### 2. Fazer Login

```bash
curl -X POST http://localhost:3000/api/auth/session \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@email.com","password":"123456","action":"signin"}'
```

### 3. Testar Isolamento

```bash
# Listar clientes (apenas os do usuário logado)
curl -H "Cookie: session-token=SEU_TOKEN" \
  http://localhost:3000/api/clientes
```

## Segurança

### ✅ Implementado

- Hash de senhas com bcrypt (salt rounds: 12)
- Migração transparente de senhas em texto puro
- Isolamento completo de dados por usuário
- Middleware de autorização
- Constraints de unicidade por usuário
- Verificação de sessão em todas as operações

### 🔒 Próximos Passos

- Implementar rate limiting
- Adicionar logs de auditoria
- Implementar 2FA (já preparado no Better Auth)
- Adicionar validação de entrada com Zod
- Implementar soft delete para dados críticos

## Estrutura de Arquivos

```
src/
├── lib/
│   └── auth-middleware.ts          # Middleware de autorização
├── app/
│   └── api/
│       ├── auth/
│       │   └── session/route.ts    # Autenticação
│       └── clientes/route.ts       # Exemplo de API isolada
├── providers/
│   └── prisma.ts                   # Cliente Prisma
└── prisma/
    ├── schema.prisma               # Schema atualizado
    └── seed.ts                     # Seed com dados isolados
```

## Benefícios

1. **Segurança**: Cada usuário só vê seus próprios dados
2. **Escalabilidade**: Suporte a múltiplos usuários sem conflitos
3. **Flexibilidade**: Mesmos códigos/emails podem existir para usuários diferentes
4. **Manutenibilidade**: Código limpo com middleware reutilizável
5. **Performance**: Queries otimizadas com filtros por usuário
