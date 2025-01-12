import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateUser } from '../middleware/auth';
import { ParamsDictionary } from 'express-serve-static-core';
import zxcvbn from 'zxcvbn';

const router = express.Router();
const prisma = new PrismaClient();

interface TypedRequest extends Request {
    params: ParamsDictionary & {
        id: string;
    };
    user?: {
        id: string;
        email: string;
    };
}

interface SavePasswordRequest {
    title: string;
    username?: string;
    password: string;
    url?: string;
    notes?: string;
}

// Save new password
router.post('/', authenticateUser, async (req: Request<{}, {}, SavePasswordRequest>, res: Response) => {
    try {
        const { title, username, password, url, notes } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!title || !password) {
            return res.status(400).json({ error: 'Title and password are required' });
        }

        // Calculate password strength
        const strength = zxcvbn(password);

        // Save password with default expiration of 90 days
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 90);

        const savedPassword = await prisma.password.create({
            data: {
                title,
                username,
                password, // Note: This should be encrypted with the user's master key
                url,
                notes,
                strength: strength.score,
                expiresAt,
                userId
            }
        });

        res.status(201).json({
            id: savedPassword.id,
            title: savedPassword.title,
            username: savedPassword.username,
            url: savedPassword.url,
            strength: savedPassword.strength,
            expiresAt: savedPassword.expiresAt
        });
    } catch (error) {
        console.error('Error saving password:', error);
        res.status(500).json({ error: 'Failed to save password' });
    }
});

// Delete password
router.delete('/:id', authenticateUser, async (req: TypedRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const password = await prisma.password.findUnique({
            where: {
                id,
                userId
            }
        });

        if (!password) {
            return res.status(404).json({ error: 'Password not found' });
        }

        await prisma.password.delete({
            where: {
                id
            }
        });

        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

export default router; 