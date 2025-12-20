'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { InventoryFilter } from "@/components/InventoryFilter";
import CategoryForm from "./CategoryForm";
import { DeleteDialog } from "@/components/DeleteDialog";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/lib/api";
import Link from "next/dist/client/link";

interface Category {
    id: string;
    category_id: number;
    name: string;
    description: string;
}

export default function Categories() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getCategories();
            setCategories(data.categories);
        } catch (err: any) {
            setError(err.message);
            console.error('Error fetching categories:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitCategory = async (categoryData: Omit<Category, 'id' | 'category_id'>) => {
        try {
            if (formMode === 'add') {
                await createCategory(categoryData);
            } else if (selectedCategory) {
                await updateCategory(selectedCategory.category_id, categoryData);
            }
            await fetchCategories();
            setIsFormOpen(false);
            setSelectedCategory(null);
        } catch (err: any) {
            console.error('Error saving category:', err);
            alert(`Error: ${err.message}`);
        }
    };

    const handleDeleteCategory = async () => {
        if (selectedCategory) {
            try {
                await deleteCategory(selectedCategory.category_id);
                await fetchCategories();
                setIsDeleteOpen(false);
                setSelectedCategory(null);
            } catch (err: any) {
                console.error('Error deleting category:', err);
                alert(`Error: ${err.message}`);
            }
        }
    };

    const openAddDialog = () => {
        setFormMode('add');
        setSelectedCategory(null);
        setIsFormOpen(true);
    };

    const openEditDialog = (category: Category) => {
        setFormMode('edit');
        setSelectedCategory(category);
        setIsFormOpen(true);
    };

    const openDeleteDialog = (category: Category) => {
        setSelectedCategory(category);
        setIsDeleteOpen(true);
    };

    if (loading) {
        return (
            <main>
                <div className="p-4 bg-white rounded-lg shadow-md mx-auto mt-2 text-center">
                    <h1 className="text-2xl font-bold text-black">Categories</h1>
                    <p className="mt-2 text-gray-600">Loading categories...</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main>
                <div className="p-4 bg-white rounded-lg shadow-md mx-auto mt-2 text-center mb-4">
                    <h1 className="text-2xl font-bold text-black">Categories</h1>
                    <p className="mt-2 text-red-600">Error: {error}</p>
                    <Button onClick={fetchCategories} className="mt-4">
                        Retry
                    </Button>
                </div>
            </main>
        );
    }

    return (
        <main>
            <div className="p-4 bg-white rounded-lg shadow-md mx-auto mt-2 text-center mb-4">
                <h1 className="text-2xl font-bold text-black">Categories</h1>
                <p className="mt-2 text-gray-600">Manage product categories. Total: {categories.length}</p>
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
                        <h1 className="font-bold text-2xl pb-5">Categories Table</h1>
                        <div className="flex gap-2">
                            <InventoryFilter href="/inventory/categories" label="Filter Categories"/>
                            <Button 
                                className="mb-4 rounded-md" 
                                onClick={openAddDialog}
                            >
                                Add Category
                            </Button>
                        </div>
                    </nav>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse min-w-[600px]">
                            <thead>
                                <tr className="font-bold bg-gray-50">
                                    <th id="cell">Category ID</th>
                                    <th id="cell">Category Name</th>
                                    <th id="cell">Description</th>
                                    <th id="cell">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8 text-gray-500">
                                            No categories found. Click "Add Category" to create one.
                                        </td>
                                    </tr>
                                ) : (
                                    categories.map((category) => (
                                        <tr key={category.category_id} className="bg-gray-50 transition-colors hover:bg-gray-100">
                                            <td id="cell">{category.id}</td>
                                            <td id="cell">{category.name}</td>
                                            <td id="cell">{category.description || 'No description'}</td>
                                            <td id="cell">
                                                <div className="flex gap-1 sm:gap-2 justify-center">
                                                    <Button 
                                                        size="sm" 
                                                        className="text-xs"
                                                        onClick={() => openEditDialog(category)}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="destructive" 
                                                        className="text-xs"
                                                        onClick={() => openDeleteDialog(category)}
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
            </nav>
            
            <CategoryForm
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setSelectedCategory(null);
                }}
                onSubmit={handleSubmitCategory}
                mode={formMode}
                category={selectedCategory}
            />

            <DeleteDialog
                isOpen={isDeleteOpen}
                onClose={() => {
                    setIsDeleteOpen(false);
                    setSelectedCategory(null);
                }}
                onConfirm={handleDeleteCategory}
                title="Delete Category"
                itemName={selectedCategory?.name || ''}
                description="This action cannot be undone. Products using this category will lose their category reference."
            />
        </main>
    );
}