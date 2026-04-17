import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import passport from 'passport';
import { configurePassport } from './config/passport.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// 2. Recriando o __dirname para o padrão ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 3. Apontando o dotenv EXATAMENTE para a raiz do monorepo (3 níveis acima)
// src -> backend -> packages -> raiz
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

configurePassport();
app.use(passport.initialize());

app.use('/api/v1/auth', authRoutes);

// Rota de Healthcheck para o Docker Compose saber que o sistema está vivo
app.get('/api/v1/auth/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Squamata is alive!' });
});

  mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/squamata_login_db')
    .then(() => {
      console.log('📦 Connected to MongoDB (squamata_login_db)');
      app.listen(PORT, () => {
        console.log(`🚀 Backend running on http://localhost:${PORT}`);
        showBanner();
      });
    })
    .catch(err => {
      console.error('❌ MongoDB Connection Error:', err);
    });


function showBanner() {
  try {
    const banner = fs.readFileSync(path.join(__dirname, 'banner.txt'), 'utf8');
    // Divide o banner em linhas e pinta cada uma de verde
    const lines = banner.split('\n');
    lines.forEach(line => {
      console.log('\x1b[92m%s\x1b[0m', line);
    });

    console.log('\x1b[32m%s\x1b[0m', '      Squamata Login Online!\n');
  } catch (err) {
    console.error(err);
    console.log('Squamata Login Starting without a banner...');
  }
}