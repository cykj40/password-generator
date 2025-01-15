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
    minStrength: 3,
    requireLowercase: true,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecial: true,
};

export function validatePassword(password: string, requirements: PasswordRequirements): boolean {
    if (password.length < requirements.minLength) return false;
    if (requirements.requireLowercase && !/[a-z]/.test(password)) return false;
    if (requirements.requireUppercase && !/[A-Z]/.test(password)) return false;
    if (requirements.requireNumbers && !/[0-9]/.test(password)) return false;
    if (requirements.requireSpecial && !/[!@#$%^&*()_+\-=\[\]{};:,.<>?]/.test(password)) return false;
    return true;
} 