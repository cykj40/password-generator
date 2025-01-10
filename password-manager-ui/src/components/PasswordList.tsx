'use client';

import { EyeIcon, EyeSlashIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

type Password = {
    id: string;
    title: string;
    username: string;
    password: string;
    url: string;
    createdAt: Date;
};

export default function PasswordList() {
    const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
    const [passwords, setPasswords] = useState<Password[]>([
        {
            id: '1',
            title: 'Gmail',
            username: 'user@example.com',
            password: 'securePassword123',
            url: 'https://gmail.com',
            createdAt: new Date(),
        },
        // Add more mock data as needed
    ]);

    const togglePassword = (id: string) => {
        setShowPassword(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const handleDelete = async (id: string) => {
        // TODO: Add API call to delete password
        setPasswords(prev => prev.filter(p => p.id !== id));
    };

    if (passwords.length === 0) {
        return (
            <div className="text-gray-400 text-center py-8">
                No passwords saved yet. Click "Add Password" to get started.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
                <thead>
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Username</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Password</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                    {passwords.map((password) => (
                        <tr key={password.id} className="hover:bg-gray-700/30">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="text-sm font-medium text-gray-200">{password.title}</div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-200">{password.username}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-200 font-mono">
                                        {showPassword[password.id] ? password.password : '••••••••'}
                                    </span>
                                    <button
                                        onClick={() => togglePassword(password.id)}
                                        className="text-gray-400 hover:text-gray-300"
                                    >
                                        {showPassword[password.id] ? (
                                            <EyeSlashIcon className="h-5 w-5" />
                                        ) : (
                                            <EyeIcon className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                                <div className="flex items-center space-x-3">
                                    <button className="text-gray-400 hover:text-blue-500">
                                        <PencilIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(password.id)}
                                        className="text-gray-400 hover:text-red-500"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
} 