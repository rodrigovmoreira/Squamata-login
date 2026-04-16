# Guia Rápido: Como Subir Containers do Squamata-login ✅

## 📋 Pré-requisitos
- Docker Desktop instalado e rodando
- Docker Compose v2.0+
- Porta 3001, 5174 e 27017 disponíveis

---

## 🚀 Passo a Passo

### 1️⃣ **Substituir os arquivos Docker**
```bash
# Fazer backup dos arquivos originais
cp packages/backend/Dockerfile packages/backend/Dockerfile.bak
cp packages/frontend/Dockerfile packages/frontend/Dockerfile.bak
cp docker-compose.yml docker-compose.yml.bak

# Remover os arquivos antigos
rm packages/backend/Dockerfile
rm packages/frontend/Dockerfile
rm docker-compose.yml

# Renomear os corrigidos
mv packages/backend/Dockerfile.corrigido packages/backend/Dockerfile
mv packages/frontend/Dockerfile.corrigido packages/frontend/Dockerfile
mv docker-compose.corrigido.yml docker-compose.yml
```

---

### 2️⃣ **Verificar arquivo .env.docker**
```bash
# O arquivo já foi criado com as variáveis básicas
# Se você tem valores diferentes, atualize:
cat .env.docker
```

**Variáveis importantes**:
- `MONGO_URI=mongodb://mongo:27017/squamata_login_db` ✓ (Docker)
- `VITE_API_URL=http://localhost:3001/api/v1` ✓
- `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` (seus valores)
- `JWT_SECRET` (seu secret seguro)

---

### 3️⃣ **Limpar tudo antes de subir (Primeira vez)**
```bash
# Remove containers, networks e volumes antigos
docker-compose down -v

# Remove images antigas
docker rmi squamata-login-backend squamata-login-frontend -f
```

---

### 4️⃣ **Subir os containers**
```bash
# Opção A: Nível verbose (ver logs em tempo real)
docker-compose up --build

# Opção B: Background (rodar em 2º plano)
docker-compose up -d --build

# Opção C: Rebuild completo
docker-compose build --no-cache && docker-compose up
```

---

### 5️⃣ **Verificar status**
```bash
# Ver todos containers
docker-compose ps

# Ver logs do backend
docker-compose logs squamata-login-backend -f

# Ver logs do frontend
docker-compose logs squamata-login-frontend -f

# Ver logs do mongo
docker-compose logs mongo -f

# Ver tudo junto
docker-compose logs -f
```

---

## ✅ Checklist de Sucesso

### Backend deve mostrar:
```
squamata-login-backend | 📦 Connected to MongoDB (squamata_login_db)
squamata-login-backend | 🚀 Backend running on http://localhost:3001
```

### Frontend deve mostrar:
```
squamata-login-frontend | ▲ [PM2] Starting /app/node_modules/.bin/serve in fork_mode --color
squamata-login-frontend | ▲ Accepting connections at http://localhost:5174
```

### MongoDB deve estar healthy:
```
squamata-login-mongodb ... (healthy)
```

---

## 🔗 Acessar a aplicação

| Componente | URL | Descrição |
|-----------|-----|-----------|
| Frontend | http://localhost:5174 | Aplicação React |
| Backend API | http://localhost:3001/api/v1 | API REST |
| MongoDB | localhost:27017 | Database (interno) |

---

## 🐛 Troubleshooting

### ❌ "Portas já em uso"
```bash
# Liberar as portas (Windows PowerShell)
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Ou mudar as portas em docker-compose.yml
# Linha 18: "3001:3001" → "3002:3001"
# Linha 34: "5174:5174" → "5175:5174"
```

### ❌ "Backend não conecta ao MongoDB"
```bash
# Verificar se MongoDB está saudável
docker-compose logs mongo

# Reiniciar apenas o MongoDB
docker-compose restart mongo
```

### ❌ "Frontend mostra erro de API undefined"
```bash
# Verificar se .env.docker foi carregado
docker-compose exec squamata-login-frontend printenv | grep VITE_API_URL

# Rebuildar frontend com novo .env
docker-compose up -d --build squamata-login-frontend
```

### ❌ "Build falha com 'npm install failed'"
```bash
# Limpar cache do Docker
docker system prune -a

# Tentar rebuild
docker-compose build --no-cache
```

---

## 📊 Monitoramento

### Dashboard em tempo real
```bash
# Instalar lazydocker (opcional)
lazydocker

# Ou ver estatísticas
docker stats
```

### Logs estruturados
```bash
# Salvar logs em arquivo
docker-compose logs > logs.txt

# Ver últimas 100 linhas
docker-compose logs --tail=100
```

---

## 🛑 Parar e limpar

```bash
# Parar containers (preserva dados)
docker-compose stop

# Parar e remover containers
docker-compose down

# Remover tudo incluso volumes (cuidado!)
docker-compose down -v

# Remover tudo e images
docker-compose down -v --remove-orphans --rmi all
```

---

## 📝 Mudanças Feitas

### ✅ Backend Dockerfile
- Multi-stage build (builder + runtime)
- Instalação correta de dependências do monorepo
- Health check adicionado
- Porta 3001 exposta

### ✅ Frontend Dockerfile
- Multi-stage build (builder + runtime)
- Vite build com workspace correto
- `serve` para rodar build estático
- Health check adicionado

### ✅ docker-compose.yml
- ✅ Caminhos de build CORRIGIDOS (`./packages/backend`, `./packages/frontend`)
- ✅ Adicionado MongoDB como serviço
- ✅ `.env.docker` carregado automaticamente
- ✅ Health checks em todos os serviços
- ✅ `depends_on` com health conditions
- ✅ Volume para persistência do MongoDB
- ✅ Network bridge configurada

### ✅ .env.docker
- Variáveis para containers
- MongoDB URI apontando para container `mongo`
- URLs de API corretas

---

## 💡 Dicas

**Customize as portas**:
```yaml
# em docker-compose.yml, altere:
ports:
  - "3001:3001"  # 1º número = porta do host, 2º = porta do container
  - "5174:5174"
```

**Executar comandos dentro do container**:
```bash
docker-compose exec squamata-login-backend node -e "console.log('test')"
docker-compose exec squamata-login-frontend npm test
docker-compose exec mongo mongosh
```

**Ver variáveis de ambiente dentro do container**:
```bash
docker-compose exec squamata-login-backend env | grep MONGO
docker-compose exec squamata-login-frontend env | grep VITE
```

---

## 🎯 Próximos Passos

1. **Hoje**: Testar com `docker-compose up`
2. **Amanhã**: Verificar conectividade entre frontend-backend
3. **Esta semana**: Configurar CI/CD para automático build em Docker
4. **Produção**: Use variáveis de ambiente seguras (secrets)

