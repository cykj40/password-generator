'use client';

import { useState, useEffect } from 'react';
import { ClipboardDocumentIcon, ArrowPathIcon, BookmarkIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { SignOutButton } from "@clerk/nextjs";
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import zxcvbn from 'zxcvbn';

interface SavedPassword {
    id: string;
    title: string;
    username: string;
    password: string;
    url?: string;
    notes?: string;
    expirationDate?: string;
}

interface PasswordStrength {
    score: number;
    color: string;
    label: string;
    suggestions: string[];
    warning?: string;
    examples?: string[];
}

export default function DashboardPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [length, setLength] = useState(16);
    const [useNumbers, setUseNumbers] = useState(true);
    const [useSymbols, setUseSymbols] = useState(true);
    const [useLowercase, setUseLowercase] = useState(true);
    const [useUppercase, setUseUppercase] = useState(true);
    const [excludeSimilar, setExcludeSimilar] = useState(false);
    const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
    const [savePasswordModal, setSavePasswordModal] = useState(false);
    const [title, setTitle] = useState('');
    const [username, setUsername] = useState('');
    const [url, setUrl] = useState('');
    const [notes, setNotes] = useState('');
    const [passwords, setPasswords] = useState<SavedPassword[]>([]);
    const [showPasswordId, setShowPasswordId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showGenerator, setShowGenerator] = useState(false);
    const [expirationDate, setExpirationDate] = useState('');

    useEffect(() => {
        fetchPasswords();
    }, []);

    const fetchPasswords = async () => {
        try {
            const response = await fetch('http://localhost:3001/passwords', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setPasswords(data);
            } else {
                setError('Failed to fetch passwords');
            }
        } catch (err) {
            setError('Failed to fetch passwords');
            console.error('Error fetching passwords:', err);
        } finally {
            setLoading(false);
        }
    };

    const deletePassword = async (id: string) => {
        if (!confirm('Are you sure you want to delete this password?')) return;

        try {
            const response = await fetch(`http://localhost:3001/passwords/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (response.ok) {
                toast.success('Password deleted successfully');
                fetchPasswords();
            } else {
                toast.error('Failed to delete password');
            }
        } catch (err) {
            toast.error('Failed to delete password');
            console.error('Error deleting password:', err);
        }
    };

    const generatePassword = () => {
        let charset = '';
        if (useLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
        if (useUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (useNumbers) charset += '0123456789';
        if (useSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

        // Remove similar characters if option is selected
        if (excludeSimilar) {
            charset = charset.replace(/[ilLI|`1oO0]/g, '');
        }

        // Remove ambiguous characters if option is selected
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

        // Fill the rest randomly
        while (newPassword.length < length) {
            newPassword += charArray[Math.floor(Math.random() * charArray.length)];
        }

        // Shuffle the password
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
                setSavePasswordModal(false);
                setTitle('');
                setUsername('');
                setUrl('');
                setNotes('');
                setExpirationDate('');
                fetchPasswords();
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

    const getPasswordStrengthForSaved = (password: string): PasswordStrength => {
        const result = zxcvbn(password);
        const colors = [
            'bg-red-500',
            'bg-orange-500',
            'bg-yellow-500',
            'bg-blue-500',
            'bg-green-500'
        ];
        const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

        // Generate example improvements based on the password and suggestions
        const examples = generateImprovedExamples(password, result.feedback.suggestions);

        return {
            score: result.score,
            color: colors[result.score],
            label: labels[result.score],
            suggestions: result.feedback.suggestions,
            warning: result.feedback.warning,
            examples
        };
    };

    const generateImprovedExamples = (password: string, suggestions: string[]): string[] => {
        const examples: string[] = [];

        // Only generate examples for weak passwords (score < 3)
        if (suggestions.length === 0) return examples;

        // Add numbers if they're missing
        if (!/\d/.test(password)) {
            examples.push(password + '123456' + '!');
        }

        // Add special characters if they're missing
        if (!/[!@#$%^&*]/.test(password)) {
            examples.push(password + '@#$');
        }

        // Add length if too short
        if (password.length < 12) {
            examples.push(password + password.split('').reverse().join('') + '!');
        }

        // Add word combinations if simple
        if (password.length < 16) {
            examples.push(password + '-secure-2024!');
        }

        // Limit to 3 examples
        return examples.slice(0, 3).map(example =>
            example.length > 20 ? example.slice(0, 20) + '...' : example
        );
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header with Logout */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Password Manager</h1>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/dashboard/new')}
                            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Add New Password
                        </button>
                        <button
                            onClick={() => setShowGenerator(!showGenerator)}
                            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <ArrowPathIcon className="w-5 h-5" />
                            {showGenerator ? 'Hide Generator' : 'Show Generator'}
                        </button>
                        <SignOutButton>
                            <button
                                onClick={() => toast.success('Logging out...')}
                                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
                            >
                                Logout
                            </button>
                        </SignOutButton>
                    </div>
                </div>

                {/* Password Generator Section - Now at the top when visible */}
                {showGenerator && (
                    <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-8 animate-slide-in-bottom">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Password Generator</h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={generatePassword}
                                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <ArrowPathIcon className="w-5 h-5" />
                                    Generate
                                </button>
                                {password && (
                                    <button
                                        onClick={() => setSavePasswordModal(true)}
                                        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <BookmarkIcon className="w-5 h-5" />
                                        Save
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Password Display */}
                        <div className="bg-gray-900 p-4 rounded-lg mb-6 flex items-center justify-between">
                            <span className="font-mono text-xl">{password || 'Click generate to create password'}</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={copyToClipboard}
                                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                    title="Copy to clipboard"
                                >
                                    <ClipboardDocumentIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Password Strength Indicator */}
                        {password && (
                            <div className="mb-6">
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

                        {/* Generator Options */}
                        <div className="space-y-4">
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
                    </div>
                )}

                {/* Password List Section */}
                <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Saved Passwords</h2>
                    </div>
                    {loading ? (
                        <p className="text-gray-400">Loading passwords...</p>
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : passwords.length === 0 ? (
                        <p className="text-gray-400">No passwords saved yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {passwords.map((pwd) => (
                                <div key={pwd.id} className="bg-gray-900 p-4 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-grow">
                                            <h3 className="font-semibold">{pwd.title}</h3>
                                            {pwd.username && (
                                                <p className="text-gray-400 text-sm">{pwd.username}</p>
                                            )}
                                            <div className="flex items-center mt-2">
                                                <div className="font-mono bg-gray-800 px-3 py-1 rounded">
                                                    {showPasswordId === pwd.id ? pwd.password : '••••••••'}
                                                </div>
                                                <button
                                                    onClick={() => setShowPasswordId(showPasswordId === pwd.id ? null : pwd.id)}
                                                    className="ml-2 p-1 hover:bg-gray-700 rounded"
                                                    title={showPasswordId === pwd.id ? 'Hide password' : 'Show password'}
                                                >
                                                    {showPasswordId === pwd.id ? (
                                                        <EyeSlashIcon className="w-4 h-4" />
                                                    ) : (
                                                        <EyeIcon className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => navigator.clipboard.writeText(pwd.password).then(() => toast.success('Password copied!'))}
                                                    className="ml-2 p-1 hover:bg-gray-700 rounded"
                                                    title="Copy password"
                                                >
                                                    <ClipboardDocumentIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="mt-2 relative group">
                                                <div className="h-1.5 w-full max-w-[200px] bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${getPasswordStrengthForSaved(pwd.password).color} transition-all duration-300`}
                                                        style={{ width: `${(getPasswordStrengthForSaved(pwd.password).score + 1) * 20}%` }}
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-400 mt-1 flex items-center">
                                                    Strength: {getPasswordStrengthForSaved(pwd.password).label}
                                                    {(getPasswordStrengthForSaved(pwd.password).suggestions.length > 0 || getPasswordStrengthForSaved(pwd.password).warning) && (
                                                        <span className="ml-1 cursor-help relative">
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                                                            </svg>
                                                            <div className="invisible group-hover:visible absolute left-0 bottom-full mb-2 w-72 bg-gray-700 p-3 rounded-lg text-sm shadow-lg z-10">
                                                                {getPasswordStrengthForSaved(pwd.password).warning && (
                                                                    <p className="text-yellow-400 mb-2">{getPasswordStrengthForSaved(pwd.password).warning}</p>
                                                                )}
                                                                {getPasswordStrengthForSaved(pwd.password).suggestions.length > 0 && (
                                                                    <>
                                                                        <p className="font-semibold mb-1">Suggestions:</p>
                                                                        <ul className="list-disc list-inside space-y-1">
                                                                            {getPasswordStrengthForSaved(pwd.password).suggestions.map((suggestion, index) => (
                                                                                <li key={index} className="text-gray-300">{suggestion}</li>
                                                                            ))}
                                                                        </ul>
                                                                    </>
                                                                )}
                                                                {getPasswordStrengthForSaved(pwd.password).examples &&
                                                                    getPasswordStrengthForSaved(pwd.password).examples!.length > 0 && (
                                                                        <>
                                                                            <div className="mt-3 pt-3 border-t border-gray-600">
                                                                                <p className="font-semibold mb-2">Example Improvements:</p>
                                                                                <ul className="space-y-2">
                                                                                    {getPasswordStrengthForSaved(pwd.password).examples!.map((example, index) => (
                                                                                        <li key={index} className="bg-gray-800 p-2 rounded font-mono text-sm text-green-400">
                                                                                            {example}
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        </>
                                                                    )}
                                                            </div>
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                            {pwd.expirationDate && (
                                                <p className={`text-sm mt-2 ${new Date(pwd.expirationDate) < new Date() ? 'text-red-500' : 'text-yellow-500'}`}>
                                                    Expires: {new Date(pwd.expirationDate).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => deletePassword(pwd.id)}
                                                className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-red-500"
                                                title="Delete password"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Floating Action Button for Quick Generate */}
                {!showGenerator && (
                    <button
                        onClick={() => {
                            setShowGenerator(true);
                            generatePassword();
                        }}
                        className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl group"
                        title="Generate Password"
                    >
                        <ArrowPathIcon className="w-6 h-6 transition-transform group-hover:rotate-180" />
                    </button>
                )}

                {/* Save Password Modal */}
                {savePasswordModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-xl font-bold mb-4">Save Password</h3>
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
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        onClick={() => setSavePasswordModal(false)}
                                        className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={savePassword}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                    >
                                        Save Password
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 