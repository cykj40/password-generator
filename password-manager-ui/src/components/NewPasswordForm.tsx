'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon, SparklesIcon, ClipboardDocumentIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import { generateSecurePassword, PasswordOptions } from '@/utils/passwordGenerator';
import { validatePassword, DEFAULT_REQUIREMENTS } from '@/utils/passwordValidation';
import PasswordHistory from './PasswordHistory';
import { savePasswordHistory, loadPasswordHistory, saveRequirements, loadRequirements, calculateExpirationDate, loadExpirationDays, saveExpirationDays } from '@/utils/storage';
import ExpirationConfig from './ExpirationConfig';

interface PasswordHistoryEntry {
    password: string;
    timestamp: Date;
    strength: number;
    expiresAt: Date;
}

export default function NewPasswordForm() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [copied, setCopied] = useState(false);
    const [passwordLength, setPasswordLength] = useState(20);
    const [charsetOptions, setCharsetOptions] = useState({
        includeLowercase: true,
        includeUppercase: true,
        includeNumbers: true,
        includeSpecial: true,
    });
    const [formData, setFormData] = useState({
        title: '',
        username: '',
        password: '',
        url: '',
    });
    const [passwordHistory, setPasswordHistory] = useState<PasswordHistoryEntry[]>([]);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [expirationDays, setExpirationDays] = useState(DEFAULT_EXPIRATION_DAYS);

    // Load history on mount
    useEffect(() => {
        const storedHistory = loadPasswordHistory();
        setPasswordHistory(
            storedHistory.map(entry => ({
                ...entry,
                timestamp: new Date(entry.timestamp)
            }))
        );
    }, []);

    // Load saved requirements on mount
    useEffect(() => {
        const savedRequirements = loadRequirements();
        if (savedRequirements) {
            setRequirements(savedRequirements);
        }
    }, []);

    useEffect(() => {
        const savedDays = loadExpirationDays();
        setExpirationDays(savedDays);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validation = validatePassword(formData.password);

        if (!validation.isValid) {
            validation.errors.forEach(error => toast.error(error));
            return;
        }

        // TODO: Add API call to save password
        router.push('/dashboard');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleGeneratePassword = async () => {
        // Ensure at least one charset is selected
        if (!Object.values(charsetOptions).some(Boolean)) {
            setCharsetOptions(prev => ({ ...prev, includeLowercase: true }));
            return;
        }

        const options: PasswordOptions = {
            length: passwordLength,
            ...charsetOptions
        };
        const result = await generateSecurePassword(options);

        // Add to history with expiration
        const newEntry = {
            password: result.password,
            timestamp: new Date(),
            strength: result.strength,
            expiresAt: calculateExpirationDate(expirationDays)
        };

        const updatedHistory = [newEntry, ...passwordHistory.slice(0, 9)];
        setPasswordHistory(updatedHistory);

        // Save to localStorage with ISO string dates
        savePasswordHistory(
            updatedHistory.map(entry => ({
                ...entry,
                timestamp: entry.timestamp.toISOString(),
                expiresAt: entry.expiresAt.toISOString()
            }))
        );

        setFormData(prev => ({
            ...prev,
            password: result.password
        }));
    };

    const handleCharsetChange = (key: keyof typeof charsetOptions) => {
        setCharsetOptions(prev => {
            const newOptions = { ...prev, [key]: !prev[key] };
            // Prevent unchecking all options
            if (!Object.values(newOptions).some(Boolean)) {
                return prev;
            }
            return newOptions;
        });
    };

    const handleCopyPassword = async () => {
        if (!formData.password) {
            toast.error('Generate a password first');
            return;
        }

        try {
            await navigator.clipboard.writeText(formData.password);
            setCopied(true);
            toast.success('Password copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy password:', err);
            toast.error('Failed to copy password');
        }
    };

    const handleSelectFromHistory = (password: string) => {
        setFormData(prev => ({
            ...prev,
            password
        }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value;
        const validation = validatePassword(newPassword);
        setValidationErrors(validation.errors);

        setFormData(prev => ({
            ...prev,
            password: newPassword
        }));
    };

    const handleRequirementsChange = (newRequirements: PasswordRequirements) => {
        setRequirements(newRequirements);
        saveRequirements(newRequirements);
    };

    const handleExpirationChange = (days: number) => {
        setExpirationDays(days);
        saveExpirationDays(days);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-200">
                    Title
                </label>
                <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700/50 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={formData.title}
                    onChange={handleChange}
                />
            </div>

            <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-200">
                    Username or Email
                </label>
                <input
                    type="text"
                    name="username"
                    id="username"
                    required
                    className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700/50 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={formData.username}
                    onChange={handleChange}
                />
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                    Password
                </label>
                <div className="mt-1 space-y-2">
                    <div className="flex items-center gap-4">
                        <label className="text-sm text-gray-400">Length: {passwordLength}</label>
                        <input
                            type="range"
                            min="8"
                            max="128"
                            value={passwordLength}
                            onChange={(e) => setPasswordLength(Number(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={charsetOptions.includeLowercase}
                                onChange={() => handleCharsetChange('includeLowercase')}
                                className="rounded border-gray-600 bg-gray-700/50 text-indigo-500 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-300">Lowercase (a-z)</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={charsetOptions.includeUppercase}
                                onChange={() => handleCharsetChange('includeUppercase')}
                                className="rounded border-gray-600 bg-gray-700/50 text-indigo-500 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-300">Uppercase (A-Z)</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={charsetOptions.includeNumbers}
                                onChange={() => handleCharsetChange('includeNumbers')}
                                className="rounded border-gray-600 bg-gray-700/50 text-indigo-500 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-300">Numbers (0-9)</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={charsetOptions.includeSpecial}
                                onChange={() => handleCharsetChange('includeSpecial')}
                                className="rounded border-gray-600 bg-gray-700/50 text-indigo-500 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-300">Special (!@#$%^&*)</span>
                        </label>
                    </div>

                    <div className="relative rounded-md shadow-sm">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            id="password"
                            required
                            className="block w-full rounded-md border-gray-600 bg-gray-700/50 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pr-28"
                            value={formData.password}
                            onChange={handlePasswordChange}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center">
                            <button
                                type="button"
                                onClick={handleCopyPassword}
                                className="px-2 py-1 text-gray-400 hover:text-indigo-500 transition-colors"
                                title="Copy password"
                            >
                                {copied ? (
                                    <ClipboardDocumentCheckIcon className="h-5 w-5 text-green-500" />
                                ) : (
                                    <ClipboardDocumentIcon className="h-5 w-5" />
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={handleGeneratePassword}
                                className="px-2 py-1 text-gray-400 hover:text-indigo-500 transition-colors"
                                title="Generate password"
                            >
                                <SparklesIcon className="h-5 w-5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="px-2 py-1 text-gray-400 hover:text-indigo-500 transition-colors"
                                title={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <EyeSlashIcon className="h-5 w-5" />
                                ) : (
                                    <EyeIcon className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>
                    <PasswordStrengthMeter password={formData.password} />
                </div>
            </div>

            <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-200">
                    Website URL (optional)
                </label>
                <input
                    type="url"
                    name="url"
                    id="url"
                    className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700/50 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={formData.url}
                    onChange={handleChange}
                />
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                    Password Requirements:
                </label>
                <ul className="mt-1 text-sm space-y-1">
                    {validationErrors.length > 0 ? (
                        validationErrors.map((error, index) => (
                            <li key={index} className="text-red-400">
                                ❌ {error}
                            </li>
                        ))
                    ) : (
                        <li className="text-green-400">✓ Password meets all requirements</li>
                    )}
                </ul>
            </div>

            <PasswordHistory
                history={passwordHistory}
                onSelect={handleSelectFromHistory}
            />

            <div className="border-t border-gray-700 pt-4">
                <h3 className="text-sm font-medium text-gray-200 mb-4">Password Requirements</h3>
                <PasswordRequirementsConfig
                    requirements={requirements}
                    onChange={handleRequirementsChange}
                />
            </div>

            <div className="border-t border-gray-700 pt-4">
                <h3 className="text-sm font-medium text-gray-200 mb-4">Password Expiration</h3>
                <ExpirationConfig
                    defaultDays={expirationDays}
                    onExpirationChange={handleExpirationChange}
                />
            </div>

            <div className="flex justify-end space-x-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
                >
                    Save Password
                </button>
            </div>
        </form>
    );
} 