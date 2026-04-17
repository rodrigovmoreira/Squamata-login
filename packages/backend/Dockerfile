# Squamata-login Dockerfile backend - Corrigido para monorepo
# Multi-stage build otimizado para produção

# STAGE 1: Build
FROM node:20-alpine as builder

WORKDIR /app

# Copiar arquivos de dependências do monorepo
COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/

# Instalar ALL dependências (incluindo devDependencies para build)
RUN npm install

# Copiar código-fonte
COPY packages/backend ./packages/backend/

# STAGE 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Copiar package.json para reference
COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/

# Instalar APENAS dependências de produção
RUN npm ci --omit=dev

# Copiar código compilado/fonte do builder
COPY --from=builder /app/packages/backend ./packages/backend/

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/v1/auth/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start
CMD ["node", "packages/backend/src/index.js"]
