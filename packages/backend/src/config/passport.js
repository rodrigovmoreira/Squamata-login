import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js'; // Nosso novo modelo unificado
import crypto from 'crypto';

// Exporta uma função de configuração para inicializar no index.js
export const configurePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/v1/auth/google/callback',
        proxy: true
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          let user = await User.findOne({ email });

          if (user) {
            // Se o usuário existe (ex: criou via email antes), vincula a conta Google
            if (!user.googleId) {
              user.googleId = profile.id;
              await user.save();
            }
            return done(null, user);
          }

          // Se não existe, cria um novo "cidadão" no ecossistema Calango Inc.
          const randomPassword = crypto.randomBytes(16).toString('hex');

          user = await User.create({
            name: profile.displayName,
            email: email,
            password: randomPassword,
            googleId: profile.id,
            avatarUrl: profile.photos[0]?.value,
            access: [] // Começa sem acessos, dependendo de aprovação ou lógica posterior
          });

          return done(null, user);
        } catch (error) {
          console.error('❌ Erro na Estratégia Google:', error);
          return done(error, null);
        }
      }
    )
  );
};