'use client';

import { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser, User } from '@/lib/api';
import { Button } from '@/components/ui/button';

export default function UsersManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        role: 'Employee',
        password: ''
    });
    const [changingPassword, setChangingPassword] = useState<number | null>(null);
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getUsers();
            setUsers(data.users || []);
            setError(null);
        } catch (err: any) {
            setError(err.message);
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.username || !formData.email) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            if (editingUser) {
                // Update existing user
                await updateUser(editingUser.user_id, {
                    username: formData.username,
                    email: formData.email,
                    role: formData.role
                });
                alert('User updated successfully!');
            } else {
                // Create new user
                await createUser({
                    username: formData.username,
                    email: formData.email,
                    role: formData.role,
                    password: formData.password || 'TempPass123'
                } as any);
                alert('New employee registered successfully!');
            }
            
            // Reset form and refresh users list
            setFormData({ username: '', email: '', role: 'Employee', password: '' });
            setIsFormOpen(false);
            setEditingUser(null);
            fetchUsers();
        } catch (err: any) {
            alert(`Error: ${err.message}`);
            console.error('Error saving user:', err);
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            email: user.email,
            role: user.role,
            password: ''
        });
        setIsFormOpen(true);
    };

    const handleDelete = async (userId: number, username: string) => {
        if (confirm(`Are you sure you want to delete user "${username}"?`)) {
            try {
                await deleteUser(userId);
                alert('User deleted successfully!');
                fetchUsers();
            } catch (err: any) {
                alert(`Error: ${err.message}`);
                console.error('Error deleting user:', err);
            }
        }
    };

    const handleCancel = () => {
        setFormData({ username: '', email: '', role: 'Employee', password: '' });
        setIsFormOpen(false);
        setEditingUser(null);
    };

    const handleChangePassword = async (userId: number) => {
        if (!newPassword) {
            alert('Please enter a new password');
            return;
        }

        try {
            await updateUser(userId, { password: newPassword });
            alert('Password changed successfully!');
            setChangingPassword(null);
            setNewPassword('');
            fetchUsers();
        } catch (err: any) {
            alert(`Error: ${err.message}`);
            console.error('Error changing password:', err);
        }
    };

    if (loading) {
        return (
            <main className="p-4">
                <div className="p-4 bg-white rounded-lg shadow-md text-center">
                    <h1 className="text-2xl font-bold text-black">Users Management</h1>
                    <p className="mt-2 text-gray-600">Loading users...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="p-4">
            <div className="p-4 bg-white rounded-lg shadow-md mb-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-black">Users Management</h1>
                        <p className="mt-2 text-gray-600">Manage employee accounts and roles</p>
                    </div>
                    <Button 
                        onClick={() => setIsFormOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        + Register New Employee
                    </Button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-4">
                    Error: {error}
                </div>
            )}

            {/* Registration/Edit Form */}
            {isFormOpen && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-4">
                    <h2 className="text-xl font-bold text-black mb-4">
                        {editingUser ? 'Edit Employee' : 'Register New Employee'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Username <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Role <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                                    required
                                >
                                    <option value="Employee">Employee</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Sales">Sales</option>
                                </select>
                            </div>
                            {!editingUser && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                                        placeholder="Optional"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2 pt-4">
                            <Button type="submit" className="bg-green-600 hover:bg-green-700">
                                {editingUser ? 'Update Employee' : 'Register Employee'}
                            </Button>
                            <Button 
                                type="button" 
                                onClick={handleCancel}
                                className="bg-gray-500 hover:bg-gray-600"
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Users List */}
            <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-xl font-semibold text-black mb-4">
                    Registered Employees ({users.length})
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50 font-bold">
                                <th className="p-3 border text-black text-left">User ID</th>
                                <th className="p-3 border text-black text-left">Username</th>
                                <th className="p-3 border text-black text-left">Email</th>
                                <th className="p-3 border text-black text-left">Password</th>
                                <th className="p-3 border text-black text-left">Role</th>
                                <th className="p-3 border text-black text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-4 text-center text-gray-500">
                                        No employees registered yet. Click "Register New Employee" to add one.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.user_id} className="hover:bg-gray-50">
                                        <td className="p-3 border text-black">{user.id}</td>
                                        <td className="p-3 border text-black font-medium">{user.username}</td>
                                        <td className="p-3 border text-black">{user.email}</td>
                                        <td className="p-3 border text-black">
                                            {changingPassword === user.user_id ? (
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        placeholder="New password"
                                                        className="px-2 py-1 border rounded text-sm"
                                                    />
                                                    <Button
                                                        onClick={() => handleChangePassword(user.user_id)}
                                                        className="bg-green-500 hover:bg-green-600 text-xs px-2 py-1"
                                                    >
                                                        Save
                                                    </Button>
                                                    <Button
                                                        onClick={() => { setChangingPassword(null); setNewPassword(''); }}
                                                        className="bg-gray-500 hover:bg-gray-600 text-xs px-2 py-1"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-sm">{user.password || '••••••••'}</span>
                                                    <Button
                                                        onClick={() => setChangingPassword(user.user_id)}
                                                        className="bg-blue-500 hover:bg-blue-600 text-xs px-2 py-1"
                                                    >
                                                        Change
                                                    </Button>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-3 border text-black">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                user.role === 'Admin' 
                                                    ? 'bg-red-100 text-red-800'
                                                    : user.role === 'Manager'
                                                    ? 'bg-purple-100 text-purple-800'
                                                    : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-3 border text-center">
                                            <div className="flex gap-2 justify-center">
                                                <Button
                                                    onClick={() => handleEdit(user)}
                                                    className="bg-yellow-500 hover:bg-yellow-600 text-xs px-3 py-1"
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    onClick={() => handleDelete(user.user_id, user.username)}
                                                    className="bg-red-500 hover:bg-red-600 text-xs px-3 py-1"
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}