# 🦎 Squamata-login | Core de Identidade Calango Inc.

## 📌 Visão Geral
O **Squamata-login** é o microsserviço central de autenticação e autorização do ecossistema Calango Inc. Ele foi projetado para ser um **Provedor de Identidade (IdP) Dinâmico**, capaz de servir diferentes telas de login (white-label) para diversos produtos, como Calango Bot e Calango Food.

## 🛠 Stack Tecnológica
- **Arquitetura:** Monorepo (NPM Workspaces)
- **Frontend:** React 19 + Vite 8 + Chakra UI v3 + React Router 7
- **Backend:** Node.js (ESM) + Express 5 + MongoDB (Mongoose 9)
- **Segurança:** JWT, Passport.js (Google OAuth2), BcryptJS, Rate Limiters
- **Infraestrutura:** Fedora Server (Home Lab), PM2, Cloudflare Tunnels

## 🏗 Estrutura do Projeto
- `packages/frontend`: Interface visual que adapta cores e logos via parâmetros de URL (`app` e `tenant`).
- `packages/backend`: API REST para gestão de usuários, validação de tokens e controle de acesso por plataforma.

## 🔑 Conceitos Chave (Business Rules)
1. **Multi-tenancy:** O acesso é validado pelo par `tenantId` (cliente) + `appSlug` (produto).
2. **Separação de Poderes:** O Squamata-login gerencia apenas o acesso ao ecossistema Calango Inc. Sua responsabilidade é garantir que a página de login tenha a identidade visual coerente e que traga segurança e uma barreira contra ataques externos.
3. **Identidade Única:** Um único e-mail/senha permite acesso a todo o ecossistema, desde que a licença para o produto específico esteja ativa.

## 🚦 Fluxo de Autenticação
1. O App Origem redireciona para o Squamata-login com `?app=slug&tenant=id`.
2. O Frontend busca a identidade visual baseada no `app`.
3. Após login (E-mail ou Google), o Backend verifica se o usuário tem uma entrada ativa no array `access` para aquele `app`.
4. Um JWT é gerado contendo `uid`, `tenantId` e `appSlug`.

## 📝 Notas de Desenvolvimento
- Manter o padrão de **Alto Contraste** e **Clean UI**.
- Todas as rotas de backend devem ser versionadas (`/v1/...`).
- O banco de dados dedicado é o `squamata_login_db`.