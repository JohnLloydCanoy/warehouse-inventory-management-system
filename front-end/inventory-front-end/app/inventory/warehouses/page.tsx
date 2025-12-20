'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { InventoryFilter } from "@/components/InventoryFilter";
import WarehouseForm from "./WarehouseForm";
import {DeleteDialog} from "@/components/DeleteDialog";
import { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse, Warehouse } from "@/lib/api";
import Link from "next/dist/client/link";

export default function Warehouses() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const fetchWarehouses = async () => {
        try {
            setLoading(true);
            const data = await getWarehouses();
            setWarehouses(data.warehouses);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch warehouses');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitWarehouse = async (warehouseData: Omit<Warehouse, 'id' | 'warehouse_id' | 'createdAt' | 'updatedAt'>) => {
        try {
            if (formMode === 'add') {
                await createWarehouse(warehouseData);
            } else if (selectedWarehouse) {
                await updateWarehouse(selectedWarehouse.warehouse_id, warehouseData);
            }
            setIsFormOpen(false);
            setSelectedWarehouse(null);
            fetchWarehouses();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to save warehouse');
        }
    };

    const handleDeleteWarehouse = async () => {
        if (selectedWarehouse) {
            try {
                await deleteWarehouse(selectedWarehouse.warehouse_id);
                setIsDeleteOpen(false);
                setSelectedWarehouse(null);
                fetchWarehouses();
            } catch (err) {
                alert(err instanceof Error ? err.message : 'Failed to delete warehouse');
            }
        }
    };

    const openAddDialog = () => {
        setFormMode('add');
        setSelectedWarehouse(null);
        setIsFormOpen(true);
    };

    const openEditDialog = (warehouse: Warehouse) => {
        setFormMode('edit');
        setSelectedWarehouse(warehouse);
        setIsFormOpen(true);
    };

    const openDeleteDialog = (warehouse: Warehouse) => {
        setSelectedWarehouse(warehouse);
        setIsDeleteOpen(true);
    };

    if (loading) {
        return (
            <main>
                <div className="p-4 bg-white rounded-lg shadow-md mx-auto mt-2 text-center">
                    <h1 className="text-2xl font-bold text-black">Warehouses</h1>
                    <p className="mt-2 text-gray-600">Loading warehouses...</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main>
                <div className="p-4 bg-white rounded-lg shadow-md mx-auto mt-2 text-center">
                    <h1 className="text-2xl font-bold text-black">Warehouses</h1>
                    <p className="mt-2 text-red-600">Error: {error}</p>
                </div>
            </main>
        );
    }

    return (
        <main>
            <div className="p-4 bg-white rounded-lg shadow-md mx-auto mt-2 text-center mb-4">
                <h1 className="text-2xl font-bold text-black">Warehouses</h1>
                <p className="mt-2 text-gray-600">View all warehouses in your inventory.</p>
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
                        <h1 className="font-bold text-2xl pb-5">Warehouse Table</h1>
                        <div className="flex gap-2 ">
                            <InventoryFilter href="/inventory/warehouses" label="Filter Warehouses"/>
                            <Button className="mb-4 rounded-md" onClick={openAddDialog}>Add Item</Button>
                        </div>
                    </nav>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse min-w-[800px]">
                            <thead>
                            <tr className="font-bold bg-gray-50">
                                <th id="cell">Warehouse ID</th>
                                <th id="cell">Warehouse Name</th>
                                <th id="cell">Location</th>
                                <th id="cell">Created At</th>
                                <th id="cell">Updated At</th>
                                <th id="cell">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {warehouses.length === 0 ? (
                                <tr>
                                    <td colSpan={5} id="cell" className="text-center text-gray-500">
                                        No warehouses found. Click "Add Item" to create one.
                                    </td>
                                </tr>
                            ) : (
                                warehouses.map((warehouse) => (
                                    <tr key={warehouse.id} className="bg-gray-50 transition-colors hover:bg-gray-100">
                                        <td id="cell">{warehouse.id}</td>
                                        <td id="cell">{warehouse.name}</td>
                                        <td id="cell">{warehouse.location || '-'}</td>
                                        <td id="cell">{warehouse.createdAt || '-'}</td>
                                        <td id="cell">{warehouse.updatedAt || '-'}</td>
                                    <td id="cell">
                                        <div className="flex gap-1 sm:gap-2 justify-center">
                                            <Button 
                                                size="sm" 
                                                className="text-xs"
                                                onClick={() => openEditDialog(warehouse)}
                                            >
                                                Edit
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="destructive" 
                                                className="text-xs"
                                                onClick={() => openDeleteDialog(warehouse)}
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

            <WarehouseForm 
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setSelectedWarehouse(null);
                }}
                onSubmit={handleSubmitWarehouse}
                warehouse={selectedWarehouse}
                mode={formMode}
            />

            <DeleteDialog
                isOpen={isDeleteOpen}
                onClose={() => {
                    setIsDeleteOpen(false);
                    setSelectedWarehouse(null);
                }}
                onConfirm={handleDeleteWarehouse}
                title="Delete Warehouse"
                itemName={selectedWarehouse?.name || ''}
                description="This action cannot be undone."
            />
        </main>
    );
}