'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { InventoryFilter } from "@/components/InventoryFilter";
import SupplierForm from "./SupplierForm";
import {DeleteDialog} from "@/components/DeleteDialog";
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier, Supplier } from "@/lib/api";
import Link from "next/dist/client/link";

export default function Suppliers() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const data = await getSuppliers();
            setSuppliers(data.suppliers);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch suppliers');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitSupplier = async (supplierData: Omit<Supplier, 'id' | 'supplier_id' | 'createdAt' | 'updatedAt'>) => {
        try {
            if (formMode === 'add') {
                await createSupplier(supplierData);
            } else if (selectedSupplier) {
                await updateSupplier(selectedSupplier.supplier_id, supplierData);
            }
            setIsFormOpen(false);
            setSelectedSupplier(null);
            fetchSuppliers();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to save supplier');
        }
    };

    const handleDeleteSupplier = async () => {
        if (selectedSupplier) {
            try {
                await deleteSupplier(selectedSupplier.supplier_id);
                setIsDeleteOpen(false);
                setSelectedSupplier(null);
                fetchSuppliers();
            } catch (err) {
                alert(err instanceof Error ? err.message : 'Failed to delete supplier');
            }
        }
    };

    const openAddDialog = () => {
        setFormMode('add');
        setSelectedSupplier(null);
        setIsFormOpen(true);
    };

    const openEditDialog = (supplier: Supplier) => {
        setFormMode('edit');
        setSelectedSupplier(supplier);
        setIsFormOpen(true);
    };

    const openDeleteDialog = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setIsDeleteOpen(true);
    };

    if (loading) {
        return (
            <main>
                <div className="p-4 bg-white rounded-lg shadow-md mx-auto mt-2 text-center">
                    <h1 className="text-2xl font-bold text-black">Suppliers</h1>
                    <p className="mt-2 text-gray-600">Loading suppliers...</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main>
                <div className="p-4 bg-white rounded-lg shadow-md mx-auto mt-2 text-center">
                    <h1 className="text-2xl font-bold text-black">Suppliers</h1>
                    <p className="mt-2 text-red-600">Error: {error}</p>
                </div>
            </main>
        );
    }

    return (
        <main>
            <div className="p-4 bg-white rounded-lg shadow-md mx-auto mt-2 text-center mb-4">
                <h1 className="text-2xl font-bold text-black">Suppliers</h1>
                <p className="mt-2 text-gray-600">View all suppliers in your inventory.</p>
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
                        <h1 className="font-bold text-2xl pb-5">Supplier Table</h1>
                        <div className="flex gap-2 ">
                            <InventoryFilter href="/inventory/supplier" label="Filter Suppliers"/>
                            <Button className="mb-4 rounded-md" onClick={openAddDialog}>Add Item</Button>
                        </div>
                    </nav>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse min-w-[800px]">
                            <thead>
                            <tr className="font-bold bg-gray-50">
                                <th id="cell">Supplier ID</th>
                                <th id="cell">Supplier Name</th>
                                <th id="cell">Email</th>
                                <th id="cell">Phone</th>
                                <th id="cell">Address</th>
                                <th id="cell">Created At</th>
                                <th id="cell">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.length === 0 ? (
                                <tr>
                                    <td colSpan={8} id="cell" className="text-center text-gray-500">
                                        No suppliers found. Click "Add Item" to create one.
                                    </td>
                                </tr>
                            ) : (
                                suppliers.map((supplier) => (
                                    <tr key={supplier.id} className="bg-gray-50 transition-colors hover:bg-gray-100">
                                        <td id="cell">{supplier.id}</td>
                                        <td id="cell">{supplier.name}</td>
                                        <td id="cell">{supplier.email || '-'}</td>
                                        <td id="cell">{supplier.phone || '-'}</td>
                                        <td id="cell">{supplier.address || '-'}</td>
                                        <td id="cell">{supplier.createdAt}</td>
                                    <td id="cell">
                                        <div className="flex gap-1 sm:gap-2 justify-center">
                                            <Button 
                                                size="sm" 
                                                className="text-xs"
                                                onClick={() => openEditDialog(supplier)}
                                            >
                                                Edit
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="destructive" 
                                                className="text-xs"
                                                onClick={() => openDeleteDialog(supplier)}
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

            <SupplierForm 
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setSelectedSupplier(null);
                }}
                onSubmit={handleSubmitSupplier}
                supplier={selectedSupplier}
                mode={formMode}
            />

            <DeleteDialog
                isOpen={isDeleteOpen}
                onClose={() => {
                    setIsDeleteOpen(false);
                    setSelectedSupplier(null);
                }}
                onConfirm={handleDeleteSupplier}
                title="Delete Supplier"
                itemName={selectedSupplier?.name || ''}
                description="This action cannot be undone."
            />
        </main>
    );
}
