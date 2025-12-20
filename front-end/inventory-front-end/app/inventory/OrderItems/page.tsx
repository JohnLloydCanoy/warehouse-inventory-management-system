"use client";

import { Button } from "@/components/ui/button";
import {InventoryFilter }from "@/components/InventoryFilter";
import { useState, useEffect } from "react";
import { OrderItemForm } from "./OrderItemForm";
import { DeleteDialog } from "@/components/DeleteDialog";
import { getOrderItems, createOrderItem, updateOrderItem, deleteOrderItem } from "@/lib/api";

interface OrderItem {
    id: string;
    order_item_id: number;
    orderId: string;
    productId: string;
    quantity: number;
    unitPrice: string;
    subtotal: string;
    createdAt?: string;
}

export default function Products() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedOrderItem, setSelectedOrderItem] = useState<OrderItem | null>(null);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch order items from database
    useEffect(() => {
        fetchOrderItems();
    }, []);

    const fetchOrderItems = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getOrderItems();
            setOrderItems(data.orderItems);
        } catch (err: any) {
            setError(err.message);
            console.error('Error fetching order items:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitOrderItem = async (formData: FormData) => {
        try {
            const orderItemData = {
                orderId: formData.get('orderId') as string,
                productId: formData.get('productId') as string,
                quantity: Number(formData.get('quantity')),
                unitPrice: formData.get('unitPrice') as string,
            };

            if (formMode === 'add') {
                await createOrderItem(orderItemData);
            } else if (selectedOrderItem) {
                await updateOrderItem(selectedOrderItem.order_item_id, orderItemData);
            }
            await fetchOrderItems(); // Refresh the list
            setIsFormOpen(false);
            setSelectedOrderItem(null);
        } catch (err: any) {
            console.error('Error saving order item:', err);
            alert(`Error: ${err.message}`);
        }
    };

    const handleDeleteOrderItem = async () => {
        if (selectedOrderItem) {
            try {
                await deleteOrderItem(selectedOrderItem.order_item_id);
                await fetchOrderItems(); // Refresh the list
                setIsDeleteOpen(false);
                setSelectedOrderItem(null);
            } catch (err: any) {
                console.error('Error deleting order item:', err);
                alert(`Error: ${err.message}`);
            }
        }
    };

    const openAddDialog = () => {
        setFormMode('add');
        setSelectedOrderItem(null);
        setIsFormOpen(true);
    };

    const openEditDialog = (orderItem: OrderItem) => {
        setFormMode('edit');
        setSelectedOrderItem(orderItem);
        setIsFormOpen(true);
    };

    const openDeleteDialog = (orderItem: OrderItem) => {
        setSelectedOrderItem(orderItem);
        setIsDeleteOpen(true);
    };

    if (loading) {
        return (
            <main>
                <div className="p-4 bg-white rounded-lg shadow-md mx-auto mt-2 text-center">
                    <h1 className="text-2xl font-bold text-black">Order Item</h1>
                    <p className="mt-2 text-gray-600">Loading order items...</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main>
                <div className="p-4 bg-white rounded-lg shadow-md mx-auto mt-2 text-center">
                    <h1 className="text-2xl font-bold text-black">Order Item</h1>
                    <p className="mt-2 text-red-600">Error: {error}</p>
                    <Button onClick={fetchOrderItems} className="mt-4">Retry</Button>
                </div>
            </main>
        );
    }

    return (
        <main>
            <div className="p-4 bg-white rounded-lg shadow-md mx-auto mt-2 text-center">
                <h1 className="text-2xl font-bold text-black">Order Item</h1>
                <p className="mt-2 text-gray-600">View all Order Item in your inventory.</p>
            </div>
            <nav id="generalizationComponent" className="p-4 rounded-lg shadow-md mt-2 text-black">
                <div>
                    <nav className="flex items-center justify-between mb-4">
                        <h1 className="font-bold text-2xl pb-5">Order Items Table</h1>
                        <div className="flex gap-2 ">
                            <InventoryFilter href="/inventory/OrderItems" label="Filter"/>
                            <Button className="mb-4 rounded-md" onClick={openAddDialog}>Add Item</Button>
                        </div>
                    </nav>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse min-w-[800px]">
                            <thead>
                            <tr className="font-bold bg-gray-50">
                                <th id="cell">Order Item ID</th>
                                <th id="cell">Order ID</th>
                                <th id="cell">Product ID</th>
                                <th id="cell">Quantity</th>
                                <th id="cell">Unit Price</th>
                                <th id="cell">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orderItems.map((orderItem) => (
                                <tr key={orderItem.id} className="bg-gray-50 transition-colors">
                                    <td id="cell">{orderItem.id}</td>
                                    <td id="cell">{orderItem.orderId}</td>
                                    <td id="cell">{orderItem.productId}</td>
                                    <td id="cell">{orderItem.quantity}</td>
                                    <td id="cell">${parseFloat(orderItem.unitPrice).toFixed(2)}</td>
                                    <td id="cell">
                                        <div className="flex gap-1 sm:gap-2 justify-center">
                                            <Button size="sm" className="text-xs" onClick={() => openEditDialog(orderItem)}>Edit</Button>
                                            <Button size="sm" variant="destructive" className="text-xs" onClick={() => openDeleteDialog(orderItem)}>Delete</Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </nav>

        <OrderItemForm
            isOpen={isFormOpen}
            onClose={() => {
                setIsFormOpen(false);
                setSelectedOrderItem(null);
            }}
            onSubmit={handleSubmitOrderItem}
            orderItem={selectedOrderItem}
            mode={formMode}
        />

        <DeleteDialog
            isOpen={isDeleteOpen}
            onClose={() => {
                setIsDeleteOpen(false);
                setSelectedOrderItem(null);
            }}
            onConfirm={handleDeleteOrderItem}
            itemName={selectedOrderItem?.id || ''}
        />
        </main>
    );
}