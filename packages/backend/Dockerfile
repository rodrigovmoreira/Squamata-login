# Squamata-login Dockerfile backend
# Multi-stage build optimized for production

# Imagem leve para Node.js
FROM node:20-alpine

WORKDIR /usr/src/app

# Copia dependências primeiro para aproveitar o cache
COPY package*.json ./
RUN npm install

# Copia o restante do código
COPY . .

# Expõe a porta do backend
EXPOSE 3001

# Variável de ambiente padrão
ENV NODE_ENV=production

CMD ["npm", "start"]
