import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import passport from 'passport';
import { configurePassport } from './config/passport.js';

// 1. Importações nativas do Node.js para lidar com caminhos de arquivos
import path from 'path';
import { fileURLToPath } from 'url';

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

  mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/squamata_login_db')
    .then(() => {
      console.log('📦 Connected to MongoDB (squamata_login_db)');
      app.listen(PORT, () => {
        console.log(`🚀 Backend running on http://localhost:${PORT}`);
      });
    })
    .catch(err => {
      console.error('❌ MongoDB Connection Error:', err);
    });
