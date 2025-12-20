'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log('Attempting login with:', username);
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok && data.success) {
                // Store user info in localStorage
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Redirect to main page
                router.push('/');
                window.location.href = '/'; // Force full page reload to update layout
            } else {
                setError(data.error || 'Invalid username or password');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Login failed. Please check the console for details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0B2B1A] to-[#1E6640]">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-[#0B2B1A] mb-2">
                        Inventory Management System
                    </h1>
                    <p className="text-gray-600">Sign in to continue</p>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E6640] focus:border-transparent text-black"
                            placeholder="Enter your username"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E6640] focus:border-transparent text-black"
                            placeholder="Enter your password"
                            required
                            disabled={loading}
                        />
                    </div>

                    <Button 
                        type="submit" 
                        className="w-full bg-[#1E6640] hover:bg-[#0B2B1A] text-white py-3 text-lg font-semibold"
                        disabled={loading}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    <p>Contact your administrator for account access</p>
                </div>
            </div>
        </div>
    );
}
