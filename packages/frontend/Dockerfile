# Squamata-login Dockerfile frontend - Corrigido para monorepo
# Multi-stage build otimizado para produção

# STAGE 1: Builder (node para build)
FROM node:20-alpine as builder

WORKDIR /app

# Copiar dependências do monorepo
COPY package*.json ./
COPY packages/frontend/package*.json ./packages/frontend/

# Instalar todas as dependências
RUN npm install

# Copiar código-fonte
COPY packages/frontend ./packages/frontend/

# Build da aplicação Vite
RUN npm run build --workspace=@squamata-login/frontend

# STAGE 2: Runtime (server leve)
FROM node:20-alpine

WORKDIR /app

# Instalar serve para rodar build estático
RUN npm install -g serve

# Copiar build do stage anterior
COPY --from=builder /app/packages/frontend/dist ./dist

EXPOSE 5174

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5174/ || exit 1

# Iniciar servidor em modo estático
CMD ["serve", "-s", "dist", "-l", "5174"]