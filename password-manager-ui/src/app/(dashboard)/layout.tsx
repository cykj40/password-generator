import { UserButton } from "@clerk/nextjs";
import { KeyIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import React from "react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
            <nav className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center">
                            <Link href="/dashboard" className="flex items-center">
                                <KeyIcon className="h-8 w-8 text-indigo-500" />
                                <span className="ml-2 text-xl font-bold text-white">SecurePass</span>
                            </Link>
                        </div>
                        <div className="flex items-center gap-4">
                            <UserButton afterSignOutUrl="/" />
                        </div>
                    </div>
                </div>
            </nav>

            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                {children}
            </main>
        </div>
    );
} 