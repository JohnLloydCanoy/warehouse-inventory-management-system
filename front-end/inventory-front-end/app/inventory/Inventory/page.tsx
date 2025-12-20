"use client";

import { Button } from "@/components/ui/button";
import {InventoryFilter }from "@/components/InventoryFilter";
import { useState, useEffect } from "react";
import { InventoryForm } from "./InventoryForm";
import { DeleteDialog } from "@/components/DeleteDialog";
import { getInventory, createInventory, updateInventory, deleteInventory, Inventory } from "@/lib/api";
import Link from "next/dist/client/link";

export default function Products() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null);
    const [inventories, setInventories] = useState<Inventory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getInventory();
            console.log('Inventory API Response:', response);
            console.log('Inventory array:', response?.inventories);
            // Add safety check here
            setInventories(response?.inventories || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch inventory');
            console.error('Error fetching inventory:', err);
            setInventories([]); // Set to empty array on error
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitInventory = async (inventoryData: Omit<Inventory, 'id' | 'inventory_id' | 'lastUpdated' | 'createdAt'>) => {
        try {
            if (formMode === 'add') {
                await createInventory(inventoryData);
            } else if (selectedInventory) {
                await updateInventory(selectedInventory.inventory_id, inventoryData);
            }
            setIsFormOpen(false);
            setSelectedInventory(null);
            await fetchInventory();
        } catch (err) {
            console.error('Error submitting inventory:', err);
            alert(err instanceof Error ? err.message : 'Failed to save inventory. Please try again.');
        }
    };

    const handleDeleteInventory = async () => {
        if (selectedInventory) {
            try {
                await deleteInventory(selectedInventory.inventory_id);
                setIsDeleteOpen(false);
                setSelectedInventory(null);
                await fetchInventory();
            } catch (err) {
                console.error('Error deleting inventory:', err);
                alert('Failed to delete inventory. Please try again.');
            }
        }
    };

    const openAddDialog = () => {
        setFormMode('add');
        setSelectedInventory(null);
        setIsFormOpen(true);
    };

    const openEditDialog = (inventory: Inventory) => {
        setFormMode('edit');
        setSelectedInventory(inventory);
        setIsFormOpen(true);
    };

    const openDeleteDialog = (inventory: Inventory) => {
        setSelectedInventory(inventory);
        setIsDeleteOpen(true);
    };

    if (loading) {
        return (
            <main>
                <div className="p-4 bg-white rounded-lg shadow-md mx-auto mt-2 text-center">
                    <h1 className="text-2xl font-bold text-black">Inventory</h1>
                    <p className="mt-2 text-gray-600">Loading inventory...</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main>
                <div className="p-4 bg-white rounded-lg shadow-md mx-auto mt-2 text-center">
                    <h1 className="text-2xl font-bold text-black">Inventory</h1>
                    <p className="mt-2 text-red-600">Error: {error}</p>
                    <Button onClick={fetchInventory} className="mt-4">Retry</Button>
                </div>
            </main>
        );
    }

    return (
        <main>
            <div className="p-4 bg-white rounded-lg shadow-md mx-auto mt-2 text-center mb-4">
                <h1 className="text-2xl font-bold text-black">Inventory</h1>
                <p className="mt-2 text-gray-600">View all inventory in your system. Total: {inventories?.length || 0}</p>
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
                        <h1 className="font-bold text-2xl pb-5">Inventory Table</h1>
                        <div className="flex gap-2 ">
                            <InventoryFilter href="/inventory/Inventory" label="Filter Inventory"/>
                            <Button className="mb-4 rounded-md" onClick={openAddDialog}>Add Item</Button>
                        </div>
                    </nav>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse min-w-[800px]">
                            <thead>
                            <tr className="font-bold bg-gray-50">
                                <th id="cell">Inventory ID</th>
                                <th id="cell">Product ID</th>
                                <th id="cell">Product Name</th>
                                <th id="cell">Warehouse </th>
                                <th id="cell">Category</th>
                                <th id="cell">Quantity</th>
                                <th id="cell">Last Updated</th>
                                <th id="cell">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!inventories || inventories.length === 0 ? (
                                <tr>
                                    <td colSpan={8} id="cell" className="text-center text-gray-500 py-8">
                                        No inventory items found. Click "Add Item" to create one.
                                    </td>
                                </tr>
                            ) : (
                                inventories.map((inventory) => (
                                    <tr key={inventory.id} className="bg-gray-50 transition-colors hover:bg-gray-100">
                                        <td id="cell">{inventory.id}</td>
                                        <td id="cell">{inventory.productId}</td>
                                        <td id="cell">{inventory.productName}</td>
                                        <td id="cell">{inventory.warehouseName}</td>
                                        <td id="cell">{inventory.Category || '-'}</td>
                                        <td id="cell">{inventory.quantity.toLocaleString()}</td>
                                        <td id="cell">{inventory.lastUpdated || '-'}</td>
                                        <td id="cell">
                                            <div className="flex gap-1 sm:gap-2 justify-center">
                                                <Button size="sm" className="text-xs" onClick={() => openEditDialog(inventory)}>Edit</Button>
                                                <Button size="sm" variant="destructive" className="text-xs" onClick={() => openDeleteDialog(inventory)}>Delete</Button>
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

        <InventoryForm
            isOpen={isFormOpen}
            onClose={() => {
                setIsFormOpen(false);
                setSelectedInventory(null);
            }}
            onSubmit={handleSubmitInventory}
            inventory={selectedInventory}
            mode={formMode}
        />

        <DeleteDialog
            isOpen={isDeleteOpen}
            onClose={() => {
                setIsDeleteOpen(false);
                setSelectedInventory(null);
            }}
            onConfirm={handleDeleteInventory}
            title="Delete Inventory Item"
            itemName={`Inventory #${selectedInventory?.id}` || ''}
            description="This action cannot be undone."
        />
        </main>
    );
}