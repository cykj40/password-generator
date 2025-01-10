import { nanoid } from 'nanoid';
import CryptoJS from 'crypto-js';
import zxcvbn from 'zxcvbn';

const charSets = {
    lower: 'abcdefghijklmnopqrstuvwxyz',
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    special: '!@#$%^&*()_-+={}[]|;:<>?/~'
};

async function collectEntropy() {
    const timeStamp = Date.now().toString();
    const performanceNow = performance.now().toString();
    const screenData = `${window.screen.width}${window.screen.height}${window.screen.colorDepth}`;
    const navigatorData = navigator.userAgent;

    return timeStamp + performanceNow + screenData + navigatorData;
}

function ensureAllCharTypes(password: string): string {
    const array = new Uint32Array(4);
    crypto.getRandomValues(array);

    return (
        charSets.lower[array[0] % charSets.lower.length] +
        charSets.upper[array[1] % charSets.upper.length] +
        charSets.numbers[array[2] % charSets.numbers.length] +
        charSets.special[array[3] % charSets.special.length] +
        password.slice(4)
    );
}

export interface GeneratedPassword {
    password: string;
    strength: number;
    entropy: number;
    crackTime: string;
    hash: string;
}

export interface PasswordOptions {
    length: number;
    includeLowercase?: boolean;
    includeUppercase?: boolean;
    includeNumbers?: boolean;
    includeSpecial?: boolean;
}

const DEFAULT_OPTIONS: PasswordOptions = {
    length: 20,
    includeLowercase: true,
    includeUppercase: true,
    includeNumbers: true,
    includeSpecial: true,
};

export async function generateSecurePassword(options: Partial<PasswordOptions> = {}): Promise<GeneratedPassword> {
    const finalOptions = { ...DEFAULT_OPTIONS, ...options };

    // Validate length
    if (finalOptions.length < 8) finalOptions.length = 8;
    if (finalOptions.length > 128) finalOptions.length = 128;

    // Build character set based on options
    const selectedCharSets: Record<string, string> = {};
    if (finalOptions.includeLowercase) selectedCharSets.lower = charSets.lower;
    if (finalOptions.includeUppercase) selectedCharSets.upper = charSets.upper;
    if (finalOptions.includeNumbers) selectedCharSets.numbers = charSets.numbers;
    if (finalOptions.includeSpecial) selectedCharSets.special = charSets.special;

    const allChars = Object.values(selectedCharSets).join('');

    // Generate entropy and password
    const entropy = await collectEntropy();
    const seed = CryptoJS.SHA3(entropy).toString();
    const nanoId = nanoid(finalOptions.length);

    const array = new Uint32Array(finalOptions.length);
    crypto.getRandomValues(array);

    let password = Array.from(array)
        .map((x, i) => {
            const combined = seed[i % seed.length] + nanoId[i % nanoId.length];
            return allChars[x % allChars.length];
        })
        .join('');

    // Ensure at least one character from each selected set
    if (Object.keys(selectedCharSets).length > 0) {
        const ensureArray = new Uint32Array(Object.keys(selectedCharSets).length);
        crypto.getRandomValues(ensureArray);

        let ensuredPassword = '';
        Object.entries(selectedCharSets).forEach(([_, chars], index) => {
            ensuredPassword += chars[ensureArray[index] % chars.length];
        });

        password = ensuredPassword + password.slice(ensuredPassword.length);
    }

    const strength = zxcvbn(password);

    return {
        password,
        strength: strength.score,
        entropy: strength.guesses_log10,
        crackTime: strength.crack_times_display.offline_fast_hashing_1e10_per_second,
        hash: CryptoJS.SHA256(password).toString()
    };
} 