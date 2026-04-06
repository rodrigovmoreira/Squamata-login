import express from 'express';
import passport from 'passport';
import { register, login, googleCallbackRedirect } from '../controllers/authController.js'; 

const router = express.Router();

// Rotas Clássicas (E-mail e Senha)
router.post('/register', register);
router.post('/login', login);

// Rota Google 1: Inicia o fluxo enviando o usuário para o Google
router.get('/google', (req, res, next) => {
  // Empacota de onde o usuário veio
  const state = Buffer.from(JSON.stringify({ 
    appSlug: req.query.appSlug || 'default', 
    tenantId: req.query.tenantId || 'default' 
  })).toString('base64');

  passport.authenticate('google', { 
    scope: ['profile', 'email'], 
    state 
  })(req, res, next);
});

// Rota Google 2: O Google devolve o usuário para cá
router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5174'}/login?error=true` }), 
  (req, res) => {
    // Desempacota o state
    const stateParams = req.query.state ? JSON.parse(Buffer.from(req.query.state, 'base64').toString()) : {};
    
    req.body = req.body || {}; 
    
    req.body.appSlug = stateParams.appSlug;
    req.body.tenantId = stateParams.tenantId;
    
    // Chama o controlador correto
    googleCallbackRedirect(req, res);
  }
);

export default router;