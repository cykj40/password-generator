'use client';

import { useState } from 'react';
import { ClipboardDocumentIcon, ArrowPathIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import zxcvbn from 'zxcvbn';

export default function NewPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [length, setLength] = useState(16);
    const [useNumbers, setUseNumbers] = useState(true);
    const [useSymbols, setUseSymbols] = useState(true);
    const [useLowercase, setUseLowercase] = useState(true);
    const [useUppercase, setUseUppercase] = useState(true);
    const [excludeSimilar, setExcludeSimilar] = useState(false);
    const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
    const [title, setTitle] = useState('');
    const [username, setUsername] = useState('');
    const [url, setUrl] = useState('');
    const [notes, setNotes] = useState('');
    const [expirationDate, setExpirationDate] = useState('');

    const generatePassword = () => {
        let charset = '';
        if (useLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
        if (useUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (useNumbers) charset += '0123456789';
        if (useSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

        if (excludeSimilar) {
            charset = charset.replace(/[ilLI|`1oO0]/g, '');
        }

        if (excludeAmbiguous) {
            charset = charset.replace(/[{}[\]()\/\\'"~,;:.<>]/g, '');
        }

        let newPassword = '';
        const charArray = charset.split('');

        // Ensure at least one character from each selected type
        if (useLowercase) newPassword += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
        if (useUppercase) newPassword += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
        if (useNumbers) newPassword += '0123456789'[Math.floor(Math.random() * 10)];
        if (useSymbols) newPassword += '!@#$%^&*()_+-='[Math.floor(Math.random() * 14)];

        while (newPassword.length < length) {
            newPassword += charArray[Math.floor(Math.random() * charArray.length)];
        }

        newPassword = newPassword.split('').sort(() => Math.random() - 0.5).join('');
        setPassword(newPassword);
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(password);
            toast.success('Password copied to clipboard!');
        } catch (err) {
            toast.error('Failed to copy password');
            console.error('Failed to copy password:', err);
        }
    };

    const savePassword = async () => {
        if (!title) {
            toast.error('Please enter a title');
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/passwords', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    username,
                    password,
                    url,
                    notes,
                    expirationDate: expirationDate || null
                }),
                credentials: 'include'
            });

            if (response.ok) {
                toast.success('Password saved successfully!');
                router.push('/dashboard');
            } else {
                toast.error('Failed to save password');
            }
        } catch (error) {
            toast.error('Failed to save password');
            console.error('Error saving password:', error);
        }
    };

    const getPasswordStrength = () => {
        if (!password) return { score: 0, color: 'bg-gray-200' };
        const result = zxcvbn(password);
        const colors = [
            'bg-red-500',
            'bg-orange-500',
            'bg-yellow-500',
            'bg-blue-500',
            'bg-green-500'
        ];
        return { score: result.score, color: colors[result.score] };
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Generate New Password</h1>
                <button
                    onClick={() => router.push('/dashboard')}
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    Back to Dashboard
                </button>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                {/* Password Display */}
                <div className="bg-gray-900 p-4 rounded-lg mb-6">
                    <div className="flex justify-between items-center">
                        <span className="font-mono text-xl">{password || 'Click generate to create password'}</span>
                        <div className="flex gap-2">
                            <button
                                onClick={copyToClipboard}
                                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                title="Copy to clipboard"
                            >
                                <ClipboardDocumentIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={generatePassword}
                                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                title="Generate new password"
                            >
                                <ArrowPathIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Password Strength Indicator */}
                    {password && (
                        <div className="mt-4">
                            <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${getPasswordStrength().color} transition-all duration-300`}
                                    style={{ width: `${(getPasswordStrength().score + 1) * 20}%` }}
                                />
                            </div>
                            <p className="text-sm text-gray-400 mt-2">
                                Password Strength: {['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][getPasswordStrength().score]}
                            </p>
                        </div>
                    )}
                </div>

                {/* Generator Options */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Password Length: {length}</label>
                        <input
                            type="range"
                            min="8"
                            max="32"
                            value={length}
                            onChange={(e) => setLength(Number(e.target.value))}
                            className="w-full"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={useUppercase}
                                onChange={(e) => setUseUppercase(e.target.checked)}
                                className="rounded bg-gray-700 border-gray-600"
                            />
                            <span>Uppercase Letters</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={useLowercase}
                                onChange={(e) => setUseLowercase(e.target.checked)}
                                className="rounded bg-gray-700 border-gray-600"
                            />
                            <span>Lowercase Letters</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={useNumbers}
                                onChange={(e) => setUseNumbers(e.target.checked)}
                                className="rounded bg-gray-700 border-gray-600"
                            />
                            <span>Numbers</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={useSymbols}
                                onChange={(e) => setUseSymbols(e.target.checked)}
                                className="rounded bg-gray-700 border-gray-600"
                            />
                            <span>Symbols</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={excludeSimilar}
                                onChange={(e) => setExcludeSimilar(e.target.checked)}
                                className="rounded bg-gray-700 border-gray-600"
                            />
                            <span>Exclude Similar (i, l, 1, L, o, 0, O)</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={excludeAmbiguous}
                                onChange={(e) => setExcludeAmbiguous(e.target.checked)}
                                className="rounded bg-gray-700 border-gray-600"
                            />
                            <span>Exclude Ambiguous ({`{ } [ ] ( ) / \ ' " ~ , ; : . < >`})</span>
                        </label>
                    </div>
                </div>

                {/* Save Password Form */}
                <div className="mt-8 pt-8 border-t border-gray-700">
                    <h2 className="text-xl font-bold mb-4">Save Password</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Title *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                                placeholder="e.g., Gmail Account"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Username/Email</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                                placeholder="e.g., john@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">URL</label>
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                                placeholder="e.g., https://gmail.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Notes</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 h-24"
                                placeholder="Add any additional notes..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Expiration Date</label>
                            <input
                                type="date"
                                value={expirationDate}
                                onChange={(e) => setExpirationDate(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={savePassword}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <BookmarkIcon className="w-5 h-5" />
                            Save Password
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 