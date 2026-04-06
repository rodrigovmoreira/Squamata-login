import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/v1/auth', authRoutes);

  mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/squamata_login_db')
    .then(() => {
      console.log('📦 Connected to MongoDB (squamata_login_db)');
      app.listen(PORT, () => {
        console.log(`🚀 Backend running on http://localhost:${PORT}`);
      });
    })
    .catch(err => {
      console.error('❌ MongoDB Connection Error:', err);
    });
