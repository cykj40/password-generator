'use client';

import { useState } from 'react';
import { EyeIcon, EyeSlashIcon, ClipboardIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Password {
    id: string;
    title: string;
    username: string;
    password: string;
    url?: string;
    createdAt: Date;
}

interface PasswordListProps {
    passwords: Password[];
    onDelete: (id: string) => Promise<void>;
}

export default function PasswordList({ passwords = [], onDelete }: PasswordListProps) {
    const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const togglePasswordVisibility = (id: string) => {
        setVisiblePasswords(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            // You could add a toast notification here
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            setIsDeleting(true);
            await onDelete(id);
        } catch (error) {
            console.error('Failed to delete password:', error);
        } finally {
            setIsDeleting(false);
            setDeleteConfirmId(null);
        }
    };

    if (passwords.length === 0) {
        return (
            <div className="text-center text-gray-500 py-8">
                No passwords added yet. Click &quot;Add New Password&quot; to get started.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Title
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Username
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Password
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {passwords.map((password) => (
                        <tr key={password.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="text-sm font-medium text-gray-900">
                                        {password.title}
                                    </div>
                                    {password.url && (
                                        <a
                                            href={password.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-2 text-sm text-blue-600 hover:text-blue-800"
                                        >
                                            ↗
                                        </a>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                    {password.username}
                                    <button
                                        onClick={() => copyToClipboard(password.username)}
                                        className="ml-2 text-gray-400 hover:text-gray-600"
                                        title="Copy username"
                                    >
                                        <ClipboardIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium">
                                        {visiblePasswords.has(password.id)
                                            ? password.password
                                            : '••••••••'}
                                    </span>
                                    <button
                                        onClick={() => togglePasswordVisibility(password.id)}
                                        className="text-gray-400 hover:text-gray-600"
                                        title={visiblePasswords.has(password.id) ? "Hide password" : "Show password"}
                                    >
                                        {visiblePasswords.has(password.id)
                                            ? <EyeSlashIcon className="h-4 w-4" />
                                            : <EyeIcon className="h-4 w-4" />}
                                    </button>
                                    <button
                                        onClick={() => copyToClipboard(password.password)}
                                        className="text-gray-400 hover:text-gray-600"
                                        title="Copy password"
                                    >
                                        <ClipboardIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {deleteConfirmId === password.id ? (
                                    <div className="flex items-center justify-end space-x-2">
                                        <button
                                            onClick={() => handleDelete(password.id)}
                                            className="text-red-600 hover:text-red-900 font-medium disabled:opacity-50"
                                            disabled={isDeleting}
                                        >
                                            Confirm
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirmId(null)}
                                            className="text-gray-500 hover:text-gray-700"
                                            disabled={isDeleting}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setDeleteConfirmId(password.id)}
                                        className="text-red-600 hover:text-red-900"
                                        title="Delete password"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
} 