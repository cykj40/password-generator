'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { ClipboardDocumentIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import zxcvbn from 'zxcvbn';

interface PasswordStrength {
    score: number;
    label: string;
    color: string;
    textColor: string;
}

export default function PasswordGenerator() {
    const [password, setPassword] = useState<string>('');
    const [length, setLength] = useState(16);
    const [useNumbers, setUseNumbers] = useState(true);
    const [useSymbols, setUseSymbols] = useState(true);
    const [useLowercase, setUseLowercase] = useState(true);
    const [useUppercase, setUseUppercase] = useState(true);
    const [excludeSimilar, setExcludeSimilar] = useState(false);
    const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);

    useEffect(() => {
        generatePassword();
    }, []);

    const generatePassword = () => {
        let charset = '';
        let newPassword = '';

        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

        if (useLowercase) charset += lowercase;
        if (useUppercase) charset += uppercase;
        if (useNumbers) charset += numbers;
        if (useSymbols) charset += symbols;

        if (excludeSimilar) {
            charset = charset.replace(/[ilLI|`1oO0]/g, '');
        }
        if (excludeAmbiguous) {
            charset = charset.replace(/[{}[\]()\/\\'"~,;:.<>]/g, '');
        }

        if (useLowercase) newPassword += lowercase[Math.floor(Math.random() * lowercase.length)];
        if (useUppercase) newPassword += uppercase[Math.floor(Math.random() * uppercase.length)];
        if (useNumbers) newPassword += numbers[Math.floor(Math.random() * numbers.length)];
        if (useSymbols) newPassword += symbols[Math.floor(Math.random() * symbols.length)];

        while (newPassword.length < length) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            newPassword += charset[randomIndex];
        }

        newPassword = newPassword.split('').sort(() => Math.random() - 0.5).join('');
        setPassword(newPassword);
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(password);
            toast.success('Password copied!');
        } catch (err) {
            toast.error('Failed to copy password');
            console.error('Failed to copy password:', err);
        }
    };

    const getPasswordStrength = (): PasswordStrength => {
        if (!password) {
            return {
                score: 0,
                label: 'Very Weak',
                color: 'bg-red-600',
                textColor: 'text-red-600'
            };
        }

        const result = zxcvbn(password);
        const strengthLevels: PasswordStrength[] = [
            { score: 0, label: 'Very Weak', color: 'bg-red-600', textColor: 'text-red-600' },
            { score: 1, label: 'Weak', color: 'bg-orange-500', textColor: 'text-orange-500' },
            { score: 2, label: 'Fair', color: 'bg-yellow-500', textColor: 'text-yellow-500' },
            { score: 3, label: 'Strong', color: 'bg-green-500', textColor: 'text-green-500' },
            { score: 4, label: 'Very Secure', color: 'bg-green-600', textColor: 'text-green-600' }
        ];

        return strengthLevels[result.score];
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    const handleLengthChange = (e: ChangeEvent<HTMLInputElement>) => {
        setLength(Number(e.target.value));
    };

    const handleCheckboxChange = (
        e: ChangeEvent<HTMLInputElement>,
        setter: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
        setter(e.target.checked);
    };

    return (
        <main className="min-h-screen bg-gray-900 p-4 sm:p-8">
            <div className="container">
                <h1 className="text-3xl font-bold mb-8 text-center text-white">Password Generator</h1>

                <div className="card">
                    <div className="bg-gray-900/50 p-6 rounded-lg mb-6 border border-gray-800">
                        <div className="flex justify-between items-center gap-4">
                            <input
                                type="text"
                                value={password}
                                onChange={handleInputChange}
                                placeholder="Click generate or type a password"
                                className="w-full font-mono text-xl bg-transparent text-white outline-none focus:ring-2 focus:ring-blue-500 rounded px-4 py-2"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={copyToClipboard}
                                    className="p-3 text-white hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 flex items-center"
                                    title="Copy to clipboard"
                                    disabled={!password}
                                >
                                    <ClipboardDocumentIcon className="h-6 w-6" aria-hidden="true" />
                                </button>
                                <button
                                    onClick={generatePassword}
                                    className="p-3 text-white hover:bg-gray-700 rounded-lg transition-colors flex items-center"
                                    title="Generate new password"
                                >
                                    <ArrowPathIcon className="h-6 w-6" aria-hidden="true" />
                                </button>
                            </div>
                        </div>

                        {password && (
                            <div className="mt-4">
                                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${getPasswordStrength().color}`}
                                        style={{ width: `${(getPasswordStrength().score + 1) * 20}%` }}
                                    />
                                </div>
                                <div className="flex justify-between items-center mt-3">
                                    <p className={`text-sm font-medium ${getPasswordStrength().textColor}`}>
                                        {getPasswordStrength().label}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        {password.length} characters
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Password Length: {length}
                            </label>
                            <input
                                type="range"
                                min="8"
                                max="32"
                                value={length}
                                onChange={handleLengthChange}
                                className="w-full"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="flex items-center space-x-2 text-white">
                                <input
                                    type="checkbox"
                                    checked={useUppercase}
                                    onChange={(e) => handleCheckboxChange(e, setUseUppercase)}
                                />
                                <span>Uppercase Letters</span>
                            </label>
                            <label className="flex items-center space-x-2 text-white">
                                <input
                                    type="checkbox"
                                    checked={useLowercase}
                                    onChange={(e) => handleCheckboxChange(e, setUseLowercase)}
                                />
                                <span>Lowercase Letters</span>
                            </label>
                            <label className="flex items-center space-x-2 text-white">
                                <input
                                    type="checkbox"
                                    checked={useNumbers}
                                    onChange={(e) => handleCheckboxChange(e, setUseNumbers)}
                                />
                                <span>Numbers</span>
                            </label>
                            <label className="flex items-center space-x-2 text-white">
                                <input
                                    type="checkbox"
                                    checked={useSymbols}
                                    onChange={(e) => handleCheckboxChange(e, setUseSymbols)}
                                />
                                <span>Symbols</span>
                            </label>
                            <label className="flex items-center space-x-2 text-white">
                                <input
                                    type="checkbox"
                                    checked={excludeSimilar}
                                    onChange={(e) => handleCheckboxChange(e, setExcludeSimilar)}
                                />
                                <span>Exclude Similar (i, l, 1, L, o, 0, O)</span>
                            </label>
                            <label className="flex items-center space-x-2 text-white">
                                <input
                                    type="checkbox"
                                    checked={excludeAmbiguous}
                                    onChange={(e) => handleCheckboxChange(e, setExcludeAmbiguous)}
                                />
                                <span>Exclude Ambiguous ({`{ } [ ] ( ) / \\ ' " ~ , ; : . < >`})</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
} 