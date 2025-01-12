'use client';

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import PasswordList from "@/components/PasswordList";
import { useState } from "react";

interface Password {
    id: string;
    title: string;
    username: string;
    password: string;
    url?: string;
    createdAt: Date;
}

export default function Dashboard() {
    const [passwords, setPasswords] = useState<Password[]>([]);

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/passwords/${id}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete password');
            }

            // Update local state after successful deletion
            setPasswords(prevPasswords =>
                prevPasswords.filter(password => password.id !== id)
            );
        } catch (error) {
            console.error('Error deleting password:', error);
            throw error; // Re-throw to be handled by the PasswordList component
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-semibold text-gray-900">Password Manager</h1>
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900">Total Passwords</h3>
                        <p className="text-3xl font-bold text-blue-600">{passwords.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900">Weak Passwords</h3>
                        <p className="text-3xl font-bold text-red-600">0</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900">Strong Passwords</h3>
                        <p className="text-3xl font-bold text-green-600">0</p>
                    </div>
                </div>

                {/* Password List Section */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-900">Your Passwords</h2>
                        <Link
                            href="/dashboard/new"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                        >
                            Add New Password
                        </Link>
                    </div>
                    <div className="border-t border-gray-200">
                        <PasswordList
                            passwords={passwords}
                            onDelete={handleDelete}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
} 