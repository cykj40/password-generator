import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import passwordRoutes from './routes/passwords';
import userRoutes from './routes/users';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3001;

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/users', userRoutes);
app.use('/passwords', passwordRoutes);

// Basic health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

process.on('beforeExit', async () => {
    await prisma.$disconnect();
}); 