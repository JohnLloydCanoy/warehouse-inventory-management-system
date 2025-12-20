'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { InventoryFilter } from "@/components/InventoryFilter";
import UserForm from "./UserForm";
import { DeleteDialog } from "@/components/DeleteDialog";
import { getUsers, createUser, updateUser, deleteUser } from "@/lib/api";
import Link from "next/dist/client/link";

interface User {
    id: string;
    user_id: number;
    username: string;
    email: string;
    role: string;
    createdAt?: string;
    updatedAt?: string;
}

export default function Users() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch users from database
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getUsers();
            setUsers(data.users);
        } catch (err: any) {
            setError(err.message);
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitUser = async (userData: Omit<User, 'id' | 'user_id' | 'createdAt' | 'updatedAt'>) => {
        try {
            if (formMode === 'add') {
                await createUser(userData);
            } else if (selectedUser) {
                await updateUser(selectedUser.user_id, userData);
            }
            await fetchUsers(); // Refresh the list
            setIsFormOpen(false);
            setSelectedUser(null);
        } catch (err: any) {
            console.error('Error saving user:', err);
            alert(`Error: ${err.message}`);
        }
    };

    const handleDeleteUser = async () => {
        if (selectedUser) {
            try {
                await deleteUser(selectedUser.user_id);
                await fetchUsers(); // Refresh the list
                setIsDeleteOpen(false);
                setSelectedUser(null);
            } catch (err: any) {
                console.error('Error deleting user:', err);
                alert(`Error: ${err.message}`);
            }
        }
    };

    const openAddDialog = () => {
        setFormMode('add');
        setSelectedUser(null);
        setIsFormOpen(true);
    };

    const openEditDialog = (user: User) => {
        setFormMode('edit');
        setSelectedUser(user);
        setIsFormOpen(true);
    };

    const openDeleteDialog = (user: User) => {
        setSelectedUser(user);
        setIsDeleteOpen(true);
    };

    if (loading) {
        return (
            <main>
                <div className="p-4 bg-white rounded-lg shadow-md mx-auto mt-2 text-center">
                    <h1 className="text-2xl font-bold text-black">Users</h1>
                    <p className="mt-2 text-gray-600">Loading users...</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main>
                <div className="p-4 bg-white rounded-lg shadow-md mx-auto mt-2 text-center">
                    <h1 className="text-2xl font-bold text-black">Users</h1>
                    <p className="mt-2 text-red-600">Error: {error}</p>
                    <Button onClick={fetchUsers} className="mt-4">Retry</Button>
                </div>
            </main>
        );
    }

    return (
        <main>
            <div className="p-4 bg-white rounded-lg shadow-md mx-auto mt-2 text-center mb-4">
                <h1 className="text-2xl font-bold text-black">Users</h1>
                <p className="mt-2 text-gray-600">View all users in your inventory.</p>
            </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2 mb-4">
                <Link href="/inventory/products" className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg text-center font-semibold transition-colors">
                    Products
                </Link>
                <Link href="/inventory/categories" className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg text-center font-semibold transition-colors">
                    Categories
                </Link>
                <Link href="/inventory/Supplier" className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-lg text-center font-semibold transition-colors">
                    Suppliers
                </Link>
                <Link href="/inventory/warehouses" className="bg-yellow-500 hover:bg-yellow-600 text-white p-4 rounded-lg text-center font-semibold transition-colors">
                    Warehouses
                </Link>
                <Link href="/inventory" className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-lg text-center font-semibold transition-colors">
                    Inventory
                </Link>
                <Link href="/inventory/Orders" className="bg-indigo-500 hover:bg-indigo-600 text-white p-4 rounded-lg text-center font-semibold transition-colors">
                    Orders
                </Link>
                <Link href="/inventory/Users" className="bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-lg text-center font-semibold transition-colors">
                    Users
                </Link>
            </div>
            <nav id="generalizationComponent" className="p-4 rounded-lg shadow-md mt-2 text-black">
                <div>
                    <nav className="flex items-center justify-between mb-4">
                        <h1 className="font-bold text-2xl pb-5">User Table</h1>
                        <div className="flex gap-2 ">
                            <InventoryFilter href="/inventory/users" label="Filter Users"/>
                            <Button className="mb-4 rounded-md" onClick={openAddDialog}>Add Item</Button>
                        </div>
                    </nav>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse min-w-[800px]">
                            <thead>
                            <tr className="font-bold bg-gray-50">
                                <th id="cell">User ID</th>
                                <th id="cell">Username</th>
                                <th id="cell">Email</th>
                                <th id="cell">Role</th>
                                <th id="cell">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="bg-gray-50 transition-colors hover:bg-gray-100">
                                    <td id="cell">{user.user_id}</td>
                                    <td id="cell">{user.username}</td>
                                    <td id="cell">{user.email}</td>
                                    <td id="cell">{user.role}</td>
                                    <td id="cell">
                                        <div className="flex gap-1 sm:gap-2 justify-center">
                                            <Button 
                                                size="sm" 
                                                className="text-xs"
                                                onClick={() => openEditDialog(user)}
                                            >
                                                Edit
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="destructive" 
                                                className="text-xs"
                                                onClick={() => openDeleteDialog(user)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </nav>

            <UserForm 
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setSelectedUser(null);
                }}
                onSubmit={handleSubmitUser}
                user={selectedUser}
                mode={formMode}
            />

            <DeleteDialog
                isOpen={isDeleteOpen}
                onClose={() => {
                    setIsDeleteOpen(false);
                    setSelectedUser(null);
                }}
                onConfirm={handleDeleteUser}
                title="Delete User"
                itemName={selectedUser?.username || ''}
                description="This action cannot be undone."
            />
        </main>
    );
}