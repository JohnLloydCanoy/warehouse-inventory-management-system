'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { InventoryFilter } from "@/components/InventoryFilter";
import OrderForm from "./OrderForm";
import {DeleteDialog} from "@/components/DeleteDialog";
import { getOrders, createOrder, updateOrder, deleteOrder, Order } from "@/lib/api";
import Link from "next/dist/client/link";

export default function Orders() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getOrders();
            setOrders(response.orders);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch orders');
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitOrder = async (orderData: Omit<Order, 'id' | 'order_id' | 'orderDate' | 'createdAt' | 'updatedAt'>) => {
        try {
            if (formMode === 'add') {
                await createOrder(orderData);
            } else if (selectedOrder) {
                await updateOrder(selectedOrder.order_id, orderData);
            }
            setIsFormOpen(false);
            setSelectedOrder(null);
            await fetchOrders();
        } catch (err) {
            console.error('Error submitting order:', err);
            alert(err instanceof Error ? err.message : 'Failed to save order. Please try again.');
        }
    };

    const handleDeleteOrder = async () => {
        if (selectedOrder) {
            try {
                await deleteOrder(selectedOrder.order_id);
                setIsDeleteOpen(false);
                setSelectedOrder(null);
                await fetchOrders();
            } catch (err) {
                console.error('Error deleting order:', err);
                alert('Failed to delete order. Please try again.');
            }
        }
    };

    const openAddDialog = () => {
        setFormMode('add');
        setSelectedOrder(null);
        setIsFormOpen(true);
    };

    const openEditDialog = (order: Order) => {
        setFormMode('edit');
        setSelectedOrder(order);
        setIsFormOpen(true);
    };

    const openDeleteDialog = (order: Order) => {
        setSelectedOrder(order);
        setIsDeleteOpen(true);
    };

    if (loading) {
        return (
            <main>
                <div className="p-4 bg-white rounded-lg shadow-md mx-auto mt-2 text-center">
                    <h1 className="text-2xl font-bold text-black">Orders</h1>
                    <p className="mt-2 text-gray-600">Loading orders...</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main>
                <div className="p-4 bg-white rounded-lg shadow-md mx-auto mt-2 text-center">
                    <h1 className="text-2xl font-bold text-black">Orders</h1>
                    <p className="mt-2 text-red-600">Error: {error}</p>
                    <Button onClick={fetchOrders} className="mt-4">Retry</Button>
                </div>
            </main>
        );
    }

    return (
        <main>
            <div className="p-4 bg-white rounded-lg shadow-md mx-auto mt-2 text-center mb-4">
                <h1 className="text-2xl font-bold text-black">Orders</h1>
                <p className="mt-2 text-gray-600">View all orders in your inventory.</p>
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
                        <h1 className="font-bold text-2xl pb-5">Orders Table</h1>
                        <div className="flex gap-2 ">
                            <InventoryFilter href="/inventory/orders" label="Filter Orders"/>
                            <Button className="mb-4 rounded-md" onClick={openAddDialog}>Add Item</Button>
                        </div>
                    </nav>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse min-w-[800px]">
                            <thead>
                            <tr className="font-bold bg-gray-50">
                                <th id="cell">Order ID</th>
                                <th id="cell">Supplier ID</th>
                                <th id="cell">Order Date</th>
                                <th id="cell">Status</th>
                                <th id="cell">Total Amount</th>
                                <th id="cell">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} id="cell" className="text-center text-gray-500 py-8">
                                        No orders found. Click "Add Item" to create one.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="bg-gray-50 transition-colors hover:bg-gray-100">
                                        <td id="cell">{order.id}</td>
                                        <td id="cell">{order.supplierId}</td>
                                        <td id="cell">{order.orderDate}</td>
                                        <td id="cell">{order.status}</td>
                                        <td id="cell">{order.totalAmount}</td>
                                    <td id="cell">
                                        <div className="flex gap-1 sm:gap-2 justify-center">
                                            <Button 
                                                size="sm" 
                                                className="text-xs"
                                                onClick={() => openEditDialog(order)}
                                            >
                                                Edit
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="destructive" 
                                                className="text-xs"
                                                onClick={() => openDeleteDialog(order)}
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

            <OrderForm 
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setSelectedOrder(null);
                }}
                onSubmit={handleSubmitOrder}
                order={selectedOrder}
                mode={formMode}
            />

            <DeleteDialog
                isOpen={isDeleteOpen}
                onClose={() => {
                    setIsDeleteOpen(false);
                    setSelectedOrder(null);
                }}
                onConfirm={handleDeleteOrder}
                title="Delete Order"
                itemName={selectedOrder?.id || ''}
                description="This action cannot be undone."
            />
        </main>
    );
}

