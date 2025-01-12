import { Router } from 'express';
import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import CryptoJS from 'crypto-js';
import zxcvbn from 'zxcvbn';

// Extend Express Request type
declare module 'express' {
    interface Request {
        user?: {
            id: string;
            email: string;
        }
    }
}

interface UserRequest {
    email: string;
    password: string;
}

const router = Router();
const prisma = new PrismaClient();

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Password requirements
const MIN_PASSWORD_LENGTH = 8;
const MIN_PASSWORD_SCORE = 3; // zxcvbn scores: 0-4 (0 = too guessable, 4 = very unguessable)

const registerHandler: RequestHandler<{}, any, UserRequest> = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate input presence
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        // Validate email format
        if (!EMAIL_REGEX.test(email)) {
            res.status(400).json({
                error: 'Invalid email format',
                details: 'Please enter a valid email address (e.g., user@example.com)'
            });
            return;
        }

        // Validate password length
        if (password.length < MIN_PASSWORD_LENGTH) {
            res.status(400).json({
                error: 'Password too short',
                details: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`
            });
            return;
        }

        // Check password strength
        const passwordStrength = zxcvbn(password);

        if (passwordStrength.score < MIN_PASSWORD_SCORE) {
            res.status(400).json({
                error: 'Password too weak',
                details: passwordStrength.feedback.warning || 'Please choose a stronger password',
                suggestions: passwordStrength.feedback.suggestions,
                score: passwordStrength.score,
                requiredScore: MIN_PASSWORD_SCORE
            });
            return;
        }

        // Convert email to lowercase for consistency
        const normalizedEmail = email.toLowerCase();

        // Check if user already exists (using normalized email)
        const existingUser = await prisma.user.findUnique({
            where: { email: normalizedEmail }
        });

        if (existingUser) {
            res.status(400).json({ error: 'User already exists' });
            return;
        }

        // Generate master key for password encryption
        const masterKey = CryptoJS.lib.WordArray.random(32).toString();

        // Hash the master key with the user's password
        const masterKeyHash = await bcrypt.hash(masterKey + password, 10);

        // Hash the password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create new user with normalized email
        const user = await prisma.user.create({
            data: {
                email: normalizedEmail,
                passwordHash,
                masterKeyHash
            }
        });

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET!,
            { expiresIn: '24h' }
        );

        // Set token in cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        // Return user info (excluding sensitive data)
        res.status(201).json({
            id: user.id,
            email: user.email,
            masterKey // Client needs this for password encryption
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const loginHandler: RequestHandler<{}, any, UserRequest> = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        // Normalize email
        const normalizedEmail = email.toLowerCase();

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail }
        });

        if (!user) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET!,
            { expiresIn: '24h' }
        );

        // Decrypt master key
        const masterKey = await new Promise<string>((resolve, reject) => {
            bcrypt.compare(password, user.masterKeyHash, (err, result) => {
                if (err) reject(err);
                // Extract the master key from the hash
                const masterKeyMatch = user.masterKeyHash.match(/^\$2[ayb]\$[0-9]{2}\$(.+)/);
                if (masterKeyMatch) {
                    resolve(masterKeyMatch[1]);
                } else {
                    reject(new Error('Failed to extract master key'));
                }
            });
        });

        // Set token in cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        // Return user info and master key
        res.json({
            id: user.id,
            email: user.email,
            masterKey
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

router.post('/register', registerHandler);
router.post('/login', loginHandler);

export default router; 