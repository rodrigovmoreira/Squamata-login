# 🗺️ Roadmap: Arquitetura de Múltiplos Logins (Abordagem B — `returnUrl` Dinâmico)

> **Status**: Planejado para desenvolvimento futuro. A implementação atual usa Abordagem A (hardcoded por app).
>
> **Objetivo**: Eliminar a necessidade de editar o código do Squamata-Login a cada novo app. Qualquer aplicação do ecossistema poderá integrar SSO apenas passando `?returnUrl=` na query string.

---

## 📋 Problema Atual

O `Login.jsx` do Squamata-Login usa blocos `if` hardcoded por aplicação:

```jsx
// Google OAuth (useEffect)
if (finalSlug === 'calango-food') {
  window.location.href = `${VITE_CALANGO_FOOD_URL}/auth/callback?token=...`;
  return;
}

// Email/Senha (handleAuth)
if (appSlug === 'calango-food') {
  window.location.href = `${VITE_CALANGO_FOOD_URL}/auth/callback?token=...`;
  return;
}
```

**Problemas**:
1. Cada novo app exige editar o código fonte
2. Cada app precisa de uma env var dedicada (`VITE_CALANGO_FOOD_URL`, `VITE_CALANGO_BOT_URL`, etc.)
3. O Google OAuth perde o `returnUrl` — não é passado no parâmetro `state`
4. Viola o `Architecture.md` seção 4.2, que especifica `returnUrl` dinâmico

---

## 🎯 Solução Proposta

### Fluxo Desejado (pós-implementação)

```
1. App cliente redireciona:
   http://localhost:5174/login?appSlug=calango-bot&tenantId=default&returnUrl=http://localhost:3004/auth/callback

2. Login.jsx lê returnUrl dos parâmetros e armazena em localStorage:
   localStorage.setItem('sso_return_url', returnUrl)

3. Google OAuth: returnUrl é codificado no state junto com appSlug e tenantId:
   state = Base64({ appSlug, tenantId, returnUrl })

4. Backend (authRoutes.js): desempacota returnUrl do state após callback

5. Backend (authController.js): repassa returnUrl no redirect:
   res.redirect(`${FRONTEND_URL}/login?token=...&appSlug=...&tenant=...&returnUrl=...`)

6. Login.jsx (useEffect): se returnUrl existe, redireciona para lá (genérico, sem if por app)
```

---

## 📝 Arquivos a Modificar

### 1. `packages/frontend/src/pages/Login.jsx`

**Mudança A — Ler `returnUrl` da URL** (no `useEffect`, início):
```jsx
const returnUrl = params.get('returnUrl');
if (returnUrl) {
  localStorage.setItem('sso_return_url', returnUrl);
}
```

**Mudança B — Substituir blocos hardcoded por lógica genérica** (substituir os 2 blocos `if calango-food`):
```jsx
// 🔁 Redirecionamento SSO Dinâmico (substitui ifs hardcoded)
const returnUrl = localStorage.getItem('sso_return_url');
if (returnUrl) {
  localStorage.removeItem('sso_target_slug');
  localStorage.removeItem('sso_target_tenant');
  localStorage.removeItem('sso_return_url');
  window.location.href = `${returnUrl}?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`;
  return;
}
```

Isso substitui **ambos** os blocos:
- O `if (finalSlug === 'calango-food')` no `useEffect` (~linha 72)
- O `if (appSlug === 'calango-food')` no `handleAuth` (~linha 148)

**Mudança C — Passar `returnUrl` no Google OAuth** (no onClick do botão Google):
```jsx
onClick={() => {
  localStorage.setItem('sso_target_slug', appSlug);
  localStorage.setItem('sso_target_tenant', tenantId);
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
  const returnUrl = localStorage.getItem('sso_return_url') || '';
  window.location.href = `${backendUrl}/auth/google?appSlug=${appSlug}&tenantId=${tenantId}&returnUrl=${encodeURIComponent(returnUrl)}`;
}}
```

### 2. `packages/backend/src/routes/authRoutes.js`

**Mudança — Capturar `returnUrl` no state do Google OAuth** (~linha 13):
```js
router.get('/google', (req, res, next) => {
  const state = Buffer.from(JSON.stringify({ 
    appSlug: req.query.appSlug || 'default', 
    tenantId: req.query.tenantId || 'default',
    returnUrl: req.query.returnUrl || ''  // ← NOVO
  })).toString('base64');
  // ... restante igual
});
```

E desempacotar no callback (~linha 27):
```js
router.get('/google/callback', (req, res, next) => {
  const stateParams = req.query.state 
    ? JSON.parse(Buffer.from(req.query.state, 'base64').toString()) 
    : {};
  req.body.appSlug = stateParams.appSlug;
  req.body.tenantId = stateParams.tenantId;
  req.body.returnUrl = stateParams.returnUrl || '';  // ← NOVO
  googleCallbackRedirect(req, res);
});
```

### 3. `packages/backend/src/controllers/authController.js`

**Mudança — Repassar `returnUrl` no redirect** (~linha 82):
```js
export const googleCallbackRedirect = (req, res) => {
  const user = req.user;
  const slug = req.body.appSlug || 'squamata';
  const tenant = req.body.tenantId || 'default';
  const returnUrl = req.body.returnUrl || '';  // ← NOVO

  const token = generateToken(user, slug, tenant);
  const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5174';

  const returnUrlParam = returnUrl ? `&returnUrl=${encodeURIComponent(returnUrl)}` : '';
  res.redirect(`${frontendURL}/login?token=${token}&appSlug=${slug}&tenant=${tenant}${returnUrlParam}`);
};
```

### 4. Manter retrocompatibilidade

Após a migração, os apps que **não** passarem `returnUrl` continuarão funcionando (fallback: fica na página do Squamata). Os apps existentes (Calango-food, Calango-bot) devem ser atualizados para passar `returnUrl` na query string.

### 5. Env vars que poderão ser removidas (após migração completa)

```
VITE_CALANGO_FOOD_URL  → obsoleto (substituído por returnUrl)
VITE_CALANGO_BOT_URL   → obsoleto (idem)
```

### 6. docker-compose.yml — build args que poderão ser removidos

```yaml
# Poderão ser removidos após migração:
- VITE_CALANGO_FOOD_URL=http://calango-inc-appserver:5173
- VITE_CALANGO_BOT_URL=http://calango-inc-appserver:3004
```

---

## ✅ Checklist de Implementação

| # | Arquivo | Mudança | Teste |
|---|---------|---------|-------|
| 1 | `Login.jsx` | Ler `returnUrl` da URL, salvar em localStorage | Acessar `?returnUrl=X` → localStorage tem `sso_return_url` |
| 2 | `Login.jsx` | Substituir `if calango-food` por lógica genérica | Login email/senha com `returnUrl` → redireciona |
| 3 | `Login.jsx` | Passar `returnUrl` no onClick do Google | Google OAuth com `returnUrl` → redireciona |
| 4 | `authRoutes.js` | Codificar `returnUrl` no state | Google callback preserva `returnUrl` |
| 5 | `authController.js` | Repassar `returnUrl` no redirect | URL pós-Google contém `&returnUrl=...` |
| 6 | Calango-food | Atualizar para passar `?returnUrl=` | Continua funcionando |
| 7 | Calango-bot | Atualizar para passar `?returnUrl=` | Continua funcionando |
| 8 | Limpeza | Remover env vars obsoletas e build args | Build sem warnings |

---

## ⚠️ Riscos

- **Regressão no Calango-food**: Testar exaustivamente antes de deploy
- **Compatibilidade com Google OAuth**: O parâmetro `state` tem limite de tamanho (~4KB). URLs muito longas podem ser truncadas
- **Segurança**: Validar que `returnUrl` pertence a um domínio permitido (whitelist) para evitar open redirect attacks

---

*Roadmap para desenvolvimento futuro. Enquanto isso, a Abordagem A (hardcoded) está em produção e funcionando.*
