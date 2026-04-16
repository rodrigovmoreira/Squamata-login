# Squamata-login Dockerfile frontend
# Multi-stage build optimized for production
FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# Gera a versão de produção (build)
RUN npm run build

# Instala um servidor simples para rodar o build
RUN npm install -g serve

# Expõe a porta solicitada
EXPOSE 5174

# Inicia o servidor apontando para a pasta build/dist na porta 5174
CMD ["serve", "-s", "dist", "-l", "5174"]