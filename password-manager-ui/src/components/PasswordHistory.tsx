'use client';

import { useState } from 'react';
import { EyeIcon, EyeSlashIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { isPasswordExpired } from '../utils/storage';

interface PasswordHistoryEntry {
    password: string;
    timestamp: Date;
    strength: number;
    expiresAt: Date;
}

export default function PasswordHistory({
    history,
    onSelect
}: {
    history: PasswordHistoryEntry[];
    onSelect: (password: string) => void;
}) {
    const [showPasswords, setShowPasswords] = useState<Record<number, boolean>>({});

    const handleCopy = async (password: string) => {
        try {
            await navigator.clipboard.writeText(password);
            toast.success('Password copied to clipboard');
        } catch (err) {
            toast.error('Failed to copy password');
        }
    };

    const getExpirationStatus = (expiresAt: Date) => {
        const daysUntilExpiration = Math.ceil((expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiration < 0) {
            return <span className="text-red-500 text-xs">Expired</span>;
        }
        if (daysUntilExpiration < 7) {
            return <span className="text-yellow-500 text-xs">Expires in {daysUntilExpiration} days</span>;
        }
        return <span className="text-gray-400 text-xs">Expires in {daysUntilExpiration} days</span>;
    };

    if (history.length === 0) {
        return null;
    }

    return (
        <div className="mt-4 space-y-2">
            <h3 className="text-sm font-medium text-gray-300">Previously Generated Passwords</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
                {history.map((entry, index) => (
                    <div key={index} className="bg-gray-700/30 rounded-md p-3 space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <button
                                    type="button"
                                    onClick={() => onSelect(entry.password)}
                                    className="text-sm text-indigo-400 hover:text-indigo-300"
                                    disabled={isPasswordExpired(entry.expiresAt.toISOString())}
                                >
                                    Use this password
                                </button>
                                <span className="text-xs text-gray-400">
                                    {entry.timestamp.toLocaleTimeString()}
                                </span>
                            </div>
                            <div className="flex items-center space-x-4">
                                {getExpirationStatus(entry.expiresAt)}
                                <button
                                    type="button"
                                    onClick={() => handleCopy(entry.password)}
                                    className="text-gray-400 hover:text-gray-300"
                                >
                                    <ClipboardDocumentIcon className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(prev => ({ ...prev, [index]: !prev[index] }))}
                                    className="text-gray-400 hover:text-gray-300"
                                >
                                    {showPasswords[index] ? (
                                        <EyeSlashIcon className="h-4 w-4" />
                                    ) : (
                                        <EyeIcon className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="font-mono text-sm">
                            {showPasswords[index] ? entry.password : '•'.repeat(entry.password.length)}
                        </div>
                        <PasswordStrengthMeter password={entry.password} />
                    </div>
                ))}
            </div>
        </div>
    );
} 