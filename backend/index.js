import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import dbConnection from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use('/api/user', authRoutes);




 app.listen(PORT, () => {
    dbConnection()
      console.log(`Server running at http://localhost:${PORT}`);
    });