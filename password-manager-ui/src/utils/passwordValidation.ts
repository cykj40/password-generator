import zxcvbn from 'zxcvbn';

export interface PasswordRequirements {
    minLength: number;
    minStrength: number;
    requireLowercase: boolean;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSpecial: boolean;
}

export const DEFAULT_REQUIREMENTS: PasswordRequirements = {
    minLength: 12,
    minStrength: 3, // Minimum zxcvbn score (0-4)
    requireLowercase: true,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecial: true,
};

export function validatePassword(password: string, requirements = DEFAULT_REQUIREMENTS) {
    const strength = zxcvbn(password);
    const errors: string[] = [];

    if (password.length < requirements.minLength) {
        errors.push(`Password must be at least ${requirements.minLength} characters long`);
    }

    if (strength.score < requirements.minStrength) {
        errors.push('Password is not strong enough');
    }

    if (requirements.requireLowercase && !/[a-z]/.test(password)) {
        errors.push('Password must include lowercase letters');
    }

    if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('Password must include uppercase letters');
    }

    if (requirements.requireNumbers && !/\d/.test(password)) {
        errors.push('Password must include numbers');
    }

    if (requirements.requireSpecial && !/[!@#$%^&*()_\-+={}[\]|;:<>?/~]/.test(password)) {
        errors.push('Password must include special characters');
    }

    return {
        isValid: errors.length === 0,
        errors,
        strength: strength.score,
    };
} 