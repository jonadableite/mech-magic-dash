# Etapa base
FROM node:20-alpine AS base

# Etapa de dependências
FROM base AS deps
RUN apk add --no-cache libc6-compat python3 make g++ py3-pip openssl openssl1.1-compat
WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm ci --prefer-offline --no-audit --progress=false

# Etapa de build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Garante que o Prisma use engines compatíveis com OpenSSL 3
ENV PRISMA_OPENSSL_VERSION="openssl-3.0.x"

RUN npx prisma generate
RUN npm run build

# Etapa final
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Usuário seguro (Next.js recomenda)
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Copia arquivos essenciais
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
