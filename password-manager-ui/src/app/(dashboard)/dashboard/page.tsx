import { PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import React from "react";

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Password Vault</h1>
                <Link
                    href="/dashboard/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Password
                </Link>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700">
                <div className="p-6">
                    {/* We'll add the PasswordList component here later */}
                    <div className="text-gray-400 text-center py-8">
                        No passwords saved yet. Click "Add Password" to get started.
                    </div>
                </div>
            </div>
        </div>
    );
} 