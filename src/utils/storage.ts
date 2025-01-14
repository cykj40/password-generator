import { PasswordRequirements } from "./passwordValidation";

const HISTORY_KEY = 'password_history';
const REQUIREMENTS_KEY = 'password_requirements';
const EXPIRATION_DAYS_KEY = 'expiration_days';
const DEFAULT_EXPIRATION_DAYS = 90;

export interface StoredPasswordHistory {
    password: string;
    timestamp: string;
    strength: number;
    expiresAt: string; // New field for expiration date
}

export const savePasswordHistory = (history: StoredPasswordHistory[]) => {
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
        console.error('Failed to save password history:', error);
    }
};

export const loadPasswordHistory = (): StoredPasswordHistory[] => {
    try {
        const stored = localStorage.getItem(HISTORY_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Failed to load password history:', error);
        return [];
    }
};

export const saveRequirements = (requirements: PasswordRequirements) => {
    try {
        localStorage.setItem(REQUIREMENTS_KEY, JSON.stringify(requirements));
    } catch (error) {
        console.error('Failed to save password requirements:', error);
    }
};

export const loadRequirements = (): PasswordRequirements | null => {
    try {
        const stored = localStorage.getItem(REQUIREMENTS_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch (error) {
        console.error('Failed to load password requirements:', error);
        return null;
    }
};

export const isPasswordExpired = (expiresAt: string): boolean => {
    const expirationDate = new Date(expiresAt);
    return new Date() > expirationDate;
};

export const calculateExpirationDate = (days: number = DEFAULT_EXPIRATION_DAYS): Date => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
};

export const saveExpirationDays = (days: number) => {
    try {
        localStorage.setItem(EXPIRATION_DAYS_KEY, days.toString());
    } catch (error) {
        console.error('Failed to save expiration days:', error);
    }
};

export const loadExpirationDays = (): number => {
    try {
        const stored = localStorage.getItem(EXPIRATION_DAYS_KEY);
        return stored ? parseInt(stored) : DEFAULT_EXPIRATION_DAYS;
    } catch (error) {
        console.error('Failed to load expiration days:', error);
        return DEFAULT_EXPIRATION_DAYS;
    }
}; 