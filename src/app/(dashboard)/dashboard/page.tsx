'use client';

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useState, useEffect, useCallback, MouseEvent, useMemo } from "react";
import { toast } from "react-hot-toast";
import { EyeIcon, EyeSlashIcon, ArrowPathIcon, MagnifyingGlassIcon, PencilIcon } from "@heroicons/react/24/outline";
import zxcvbn from 'zxcvbn';

interface Password {
    id: string;
    title: string;
    username: string;
    password: string;
    url?: string;
    createdAt: Date;
    notes?: string;
    expirationDate?: string;
    isPending?: boolean;
    syncStatus?: 'synced' | 'pending' | 'failed';
    lastSyncAttempt?: Date;
    category?: string;
    tags?: string[];
}

export default function Dashboard() {
    const [passwords, setPasswords] = useState<Password[]>([]);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [title, setTitle] = useState('');
    const [username, setUsername] = useState('');
    const [url, setUrl] = useState('');
    const [notes, setNotes] = useState('');
    const [expirationDate, setExpirationDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [isOffline, setIsOffline] = useState(false);
    const MAX_RETRIES = 3;
    const [searchQuery, setSearchQuery] = useState('');
    const [editingPassword, setEditingPassword] = useState<Password | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [sortBy, setSortBy] = useState<'title' | 'createdAt' | 'category'>('title');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [categories] = useState([
        'all',
        'social',
        'work',
        'finance',
        'shopping',
        'email',
        'entertainment',
        'other'
    ]);

    // Add offline detection
    useEffect(() => {
        const handleOnline = () => {
            setIsOffline(false);
            toast.success('Back online! Refreshing data...');
            fetchPasswords();
        };

        const handleOffline = () => {
            setIsOffline(true);
            toast.error('You are offline. Some features may be unavailable.');
        };

        // Check initial online status
        setIsOffline(!navigator.onLine);

        // Add event listeners
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Add handler functions with correct types
    const handleRetry = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        fetchPasswords(false);
    };

    const handleSave = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        await saveExistingPassword(false);
    };

    // Add offline cache
    const [offlinePasswords, setOfflinePasswords] = useState<Password[]>([]);

    // Enhanced fetchPasswords with offline cache
    const fetchPasswords = useCallback(async (isRetry = false) => {
        if (isOffline) {
            setError('You are offline. Using cached passwords.');
            setPasswords(offlinePasswords);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:3001/passwords', {
                credentials: 'include'
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Authentication required. Please sign in again.');
                }
                if (response.status === 404) {
                    throw new Error('Password service not found. Please try again later.');
                }
                throw new Error('Failed to fetch passwords. Server returned: ' + response.status);
            }

            const data = await response.json();
            setPasswords(data);
            setOfflinePasswords(data); // Cache the passwords
            setRetryCount(0);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setError(errorMessage);

            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                if (retryCount < MAX_RETRIES && !isRetry) {
                    toast.error(`Network error. Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
                    setRetryCount(prev => prev + 1);
                    setTimeout(() => fetchPasswords(true), 2000 * (retryCount + 1)); // Exponential backoff
                } else {
                    toast.error('Network error: Please check your internet connection');
                }
            } else {
                toast.error(errorMessage);
            }
            console.error('Error fetching passwords:', error);
        } finally {
            setIsLoading(false);
        }
    }, [retryCount, isOffline, offlinePasswords]);

    // Load passwords on component mount
    useEffect(() => {
        fetchPasswords();
    }, []);

    // Add password strength check effect
    useEffect(() => {
        if (newPassword) {
            const result = zxcvbn(newPassword);
            setPasswordStrength(result.score);
        } else {
            setPasswordStrength(0);
        }
    }, [newPassword]);

    const getStrengthColor = (score: number) => {
        switch (score) {
            case 0: return 'bg-red-600';
            case 1: return 'bg-orange-600';
            case 2: return 'bg-yellow-600';
            case 3: return 'bg-blue-600';
            case 4: return 'bg-green-600';
            default: return 'bg-gray-600';
        }
    };

    const getStrengthText = (score: number) => {
        switch (score) {
            case 0: return 'Very Weak';
            case 1: return 'Weak';
            case 2: return 'Fair';
            case 3: return 'Strong';
            case 4: return 'Very Strong';
            default: return 'None';
        }
    };

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

    // Enhanced saveExistingPassword with offline queue
    const saveExistingPassword = async (isRetry = false) => {
        if (isOffline) {
            // Store in offline queue
            const offlinePassword: Password = {
                id: `offline_${Date.now()}`,
                title,
                username,
                password: newPassword,
                url: url || undefined,
                createdAt: new Date(),
                notes,
                expirationDate: expirationDate || undefined,
                isPending: true // Mark as pending sync
            };

            setOfflinePasswords(prev => [...prev, offlinePassword]);
            toast.success('Password saved offline. Will sync when online.');
            setShowSaveModal(false);
            resetForm();
            return;
        }

        if (!title || !newPassword) {
            toast.error('Title and password are required');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:3001/passwords', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    username,
                    password: newPassword,
                    url,
                    notes,
                    expirationDate: expirationDate || null
                }),
                credentials: 'include'
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Authentication required. Please sign in again.');
                }
                if (response.status === 413) {
                    throw new Error('Password data too large. Please shorten your input.');
                }
                throw new Error('Failed to save password. Server returned: ' + response.status);
            }

            toast.success('Password saved successfully!');
            setShowSaveModal(false);
            resetForm();
            fetchPasswords();
            setRetryCount(0); // Reset retry count on success
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setError(errorMessage);

            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                if (retryCount < MAX_RETRIES && !isRetry) {
                    toast.error(`Save failed. Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
                    setRetryCount(prev => prev + 1);
                    setTimeout(() => saveExistingPassword(true), 2000 * (retryCount + 1)); // Exponential backoff
                } else {
                    toast.error('Network error: Please check your internet connection');
                }
            } else {
                toast.error(errorMessage);
            }
            console.error('Error saving password:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Helper function to reset form
    const resetForm = () => {
        setTitle('');
        setUsername('');
        setNewPassword('');
        setUrl('');
        setNotes('');
        setExpirationDate('');
        setShowPassword(false);
        setPasswordStrength(0);
    };

    // Enhanced search and filter functionality
    const filteredAndSortedPasswords = useMemo(() => {
        const query = searchQuery.toLowerCase();
        const allPasswords = [...passwords, ...offlinePasswords.filter(p => p.isPending)];

        // Filter by search query and category
        const filtered = allPasswords.filter(password => {
            const matchesSearch = !query ||
                password.title.toLowerCase().includes(query) ||
                password.username.toLowerCase().includes(query) ||
                password.url?.toLowerCase().includes(query) ||
                password.notes?.toLowerCase().includes(query) ||
                password.tags?.some(tag => tag.toLowerCase().includes(query));

            const matchesCategory = selectedCategory === 'all' ||
                password.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });

        // Sort passwords
        return filtered.sort((a, b) => {
            if (sortBy === 'title') {
                return sortOrder === 'asc'
                    ? a.title.localeCompare(b.title)
                    : b.title.localeCompare(a.title);
            }
            if (sortBy === 'createdAt') {
                return sortOrder === 'asc'
                    ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                    : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            if (sortBy === 'category') {
                return sortOrder === 'asc'
                    ? (a.category || 'other').localeCompare(b.category || 'other')
                    : (b.category || 'other').localeCompare(a.category || 'other');
            }
            return 0;
        });
    }, [passwords, offlinePasswords, searchQuery, selectedCategory, sortBy, sortOrder]);

    // Enhanced password editing
    const handleEdit = async (password: Password) => {
        if (isOffline && !password.isPending) {
            toast.error('Cannot edit synced passwords while offline');
            return;
        }

        setEditingPassword(password);
        setTitle(password.title);
        setUsername(password.username);
        setNewPassword(password.password);
        setUrl(password.url || '');
        setNotes(password.notes || '');
        setExpirationDate(password.expirationDate || '');
        setShowEditModal(true);
    };

    // Enhanced save with edit support
    const savePassword = async (isEdit: boolean = false) => {
        if (isOffline) {
            const passwordData: Password = {
                id: isEdit ? editingPassword!.id : `offline_${Date.now()}`,
                title,
                username,
                password: newPassword,
                url: url || undefined,
                createdAt: isEdit ? editingPassword!.createdAt : new Date(),
                notes,
                expirationDate: expirationDate || undefined,
                isPending: true,
                syncStatus: 'pending',
                lastSyncAttempt: new Date()
            };

            if (isEdit) {
                setOfflinePasswords(prev =>
                    prev.map(p => p.id === editingPassword!.id ? passwordData : p)
                );
            } else {
                setOfflinePasswords(prev => [...prev, passwordData]);
            }

            toast.success(`Password ${isEdit ? 'updated' : 'saved'} offline. Will sync when online.`);
            setShowEditModal(false);
            setShowSaveModal(false);
            resetForm();
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`http://localhost:3001/passwords${isEdit ? `/${editingPassword!.id}` : ''}`, {
                method: isEdit ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    username,
                    password: newPassword,
                    url,
                    notes,
                    expirationDate: expirationDate || null
                }),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Failed to ${isEdit ? 'update' : 'save'} password. Server returned: ${response.status}`);
            }

            toast.success(`Password ${isEdit ? 'updated' : 'saved'} successfully!`);
            setShowEditModal(false);
            setShowSaveModal(false);
            resetForm();
            fetchPasswords();
        } catch (error) {
            handleSaveError(error, isEdit);
        } finally {
            setIsLoading(false);
        }
    };

    // Enhanced sync with status tracking
    const syncOfflineChanges = async () => {
        const pendingPasswords = offlinePasswords.filter(p => p.isPending);
        if (pendingPasswords.length === 0) return;

        for (const password of pendingPasswords) {
            try {
                // Update sync status to attempting
                setOfflinePasswords(prev =>
                    prev.map(p => p.id === password.id ? {
                        ...p,
                        syncStatus: 'pending' as const,
                        lastSyncAttempt: new Date()
                    } : p)
                );

                const response = await fetch('http://localhost:3001/passwords', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: password.title,
                        username: password.username,
                        password: password.password,
                        url: password.url,
                        notes: password.notes,
                        expirationDate: password.expirationDate
                    }),
                    credentials: 'include'
                });

                if (!response.ok) throw new Error('Failed to sync password');

                // Remove from offline queue after successful sync
                setOfflinePasswords(prev =>
                    prev.filter(p => p.id !== password.id)
                );

                toast.success(`Synced: ${password.title}`);
            } catch (error) {
                console.error('Error syncing password:', error);
                // Update sync status to failed
                setOfflinePasswords(prev =>
                    prev.map(p => p.id === password.id ? {
                        ...p,
                        syncStatus: 'failed' as const,
                        lastSyncAttempt: new Date()
                    } : p)
                );
                toast.error(`Failed to sync: ${password.title}`);
            }
        }
    };

    // Add effect to sync when coming back online
    useEffect(() => {
        if (!isOffline) {
            syncOfflineChanges();
        }
    }, [isOffline]);

    // Add error handling function
    const handleSaveError = (error: unknown, isEdit: boolean) => {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setError(errorMessage);

        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            if (retryCount < MAX_RETRIES) {
                toast.error(`${isEdit ? 'Update' : 'Save'} failed. Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
                setRetryCount(prev => prev + 1);
                setTimeout(() => savePassword(isEdit), 2000 * (retryCount + 1));
            } else {
                toast.error('Network error: Please check your internet connection');
            }
        } else {
            toast.error(errorMessage);
        }
    };

    // Add category selection to password form
    const renderCategorySelect = () => (
        <div>
            <label className="block text-sm font-medium mb-1 text-white">Category</label>
            <select
                value={editingPassword?.category || 'other'}
                onChange={(e) => setEditingPassword(prev => prev ? { ...prev, category: e.target.value } : null)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
                {categories.filter(cat => cat !== 'all').map(category => (
                    <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                ))}
            </select>
        </div>
    );

    // Add tags input
    const [tagInput, setTagInput] = useState('');

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (editingPassword) {
                const newTags = [...(editingPassword.tags || []), tagInput.trim()];
                setEditingPassword({ ...editingPassword, tags: newTags });
            }
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        if (editingPassword) {
            const newTags = editingPassword.tags?.filter(tag => tag !== tagToRemove) || [];
            setEditingPassword({ ...editingPassword, tags: newTags });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Offline Banner */}
            {isOffline && (
                <div className="bg-yellow-500 text-white px-4 py-2 text-center">
                    <p className="flex items-center justify-center gap-2">
                        <span className="inline-block w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                        You are currently offline. Some features may be unavailable.
                    </p>
                </div>
            )}

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
                {/* Category Filter and Sort Controls */}
                <div className="mb-6 flex flex-wrap gap-4 items-center">
                    <div className="flex-1 min-w-[200px]">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category === 'all' ? 'All Categories' :
                                        category.charAt(0).toUpperCase() + category.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-2 items-center">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'title' | 'createdAt' | 'category')}
                            className="rounded-lg border border-gray-300 px-3 py-2"
                        >
                            <option value="title">Sort by Title</option>
                            <option value="createdAt">Sort by Date</option>
                            <option value="category">Sort by Category</option>
                        </select>
                        <button
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                            className="p-2 text-gray-500 hover:text-gray-700"
                        >
                            {sortOrder === 'asc' ? '↑' : '↓'}
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search passwords..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                </div>

                {/* Error Display with Retry Button */}
                {error && (
                    <div className="mb-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center justify-between" role="alert">
                        <div>
                            <strong className="font-bold">Error: </strong>
                            <span className="block sm:inline">{error}</span>
                        </div>
                        {!isOffline && (
                            <button
                                onClick={handleRetry}
                                className="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition-colors flex items-center gap-2"
                                disabled={isLoading}
                            >
                                <ArrowPathIcon className="w-4 h-4" />
                                Retry
                            </button>
                        )}
                    </div>
                )}

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
                        <h2 className="text-xl font-semibold text-gray-900">
                            Your Passwords
                            {searchQuery && ` (${filteredAndSortedPasswords.length} results)`}
                        </h2>
                        <div className="flex gap-4 items-center">
                            {isLoading && (
                                <span className="text-gray-500">Loading...</span>
                            )}
                            <button
                                onClick={() => setShowSaveModal(true)}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
                            >
                                Save Existing Password
                            </button>
                            <Link
                                href="/dashboard/new"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                            >
                                Add New Password
                            </Link>
                        </div>
                    </div>
                    <div className="border-t border-gray-200">
                        {isLoading ? (
                            <div className="p-4 text-center text-gray-500">Loading passwords...</div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {filteredAndSortedPasswords.map(password => (
                                    <div key={password.id} className="p-4 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                                {password.title}
                                                {password.category && (
                                                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                                        {password.category}
                                                    </span>
                                                )}
                                                {password.syncStatus === 'pending' && (
                                                    <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                                                        Pending Sync
                                                    </span>
                                                )}
                                            </h3>
                                            <p className="text-sm text-gray-500">{password.username}</p>
                                            {password.tags && password.tags.length > 0 && (
                                                <div className="mt-1 flex flex-wrap gap-1">
                                                    {password.tags.map(tag => (
                                                        <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEdit(password)}
                                                className="p-2 text-gray-400 hover:text-gray-600"
                                                disabled={isOffline && !password.isPending}
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(password.id)}
                                                className="p-2 text-gray-400 hover:text-gray-600"
                                                disabled={isOffline && !password.isPending}
                                            >
                                                <EyeSlashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Save Existing Password Modal */}
                {showSaveModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-xl font-bold mb-4 text-white">Save Existing Password</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-white">Title *</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                                        placeholder="e.g., Gmail Account"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-white">Password *</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 pr-10 text-white"
                                            placeholder="Enter your existing password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                        >
                                            {showPassword ? (
                                                <EyeSlashIcon className="h-5 w-5" />
                                            ) : (
                                                <EyeIcon className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                    {/* Password Strength Indicator */}
                                    {newPassword && (
                                        <div className="mt-2">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm text-gray-300">
                                                    Password Strength: {getStrengthText(passwordStrength)}
                                                </span>
                                            </div>
                                            <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${getStrengthColor(passwordStrength)} transition-all duration-300`}
                                                    style={{ width: `${(passwordStrength + 1) * 20}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
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
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => {
                                        setShowSaveModal(false);
                                        resetForm();
                                    }}
                                    className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                                    disabled={isLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Saving...' : 'Save Password'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Password Modal */}
                {showEditModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-xl font-bold mb-4 text-white">Edit Password</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-white">Title *</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                                        placeholder="e.g., Gmail Account"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-white">Password *</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 pr-10 text-white"
                                            placeholder="Enter your existing password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                        >
                                            {showPassword ? (
                                                <EyeSlashIcon className="h-5 w-5" />
                                            ) : (
                                                <EyeIcon className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                    {/* Password Strength Indicator */}
                                    {newPassword && (
                                        <div className="mt-2">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm text-gray-300">
                                                    Password Strength: {getStrengthText(passwordStrength)}
                                                </span>
                                            </div>
                                            <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${getStrengthColor(passwordStrength)} transition-all duration-300`}
                                                    style={{ width: `${(passwordStrength + 1) * 20}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
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
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        resetForm();
                                    }}
                                    className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                                    disabled={isLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => savePassword(true)}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Category Select */}
                {renderCategorySelect()}

                {/* Add Tags Input */}
                <div className="mt-4">
                    <label className="block text-sm font-medium mb-1 text-white">Tags</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {editingPassword?.tags?.map(tag => (
                            <span
                                key={tag}
                                className="px-2 py-1 bg-gray-700 text-white rounded-full flex items-center gap-1"
                            >
                                #{tag}
                                <button
                                    onClick={() => handleRemoveTag(tag)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                    <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                        placeholder="Add tags (press Enter)"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    />
                </div>

                {/* Add offline queue indicator */}
                {isOffline && offlinePasswords.some(p => p.isPending) && (
                    <div className="fixed bottom-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg">
                        <p className="flex items-center gap-2">
                            <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse"></span>
                            {offlinePasswords.filter(p => p.isPending).length} passwords pending sync
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
} 