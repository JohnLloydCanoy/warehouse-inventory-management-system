'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import SalesForm from './SalesForm';
import { getOrders, getOrderItems, Order, OrderItem, getProducts, Product } from '@/lib/api';

export default function SalesPage() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [ordersData, itemsData, productsData] = await Promise.all([
                getOrders(),
                getOrderItems(),
                getProducts()
            ]);
            setOrders(ordersData.orders || []);
            setOrderItems(itemsData.orderItems || []);
            setProducts(productsData.products || []);
            setError(null);
        } catch (err: any) {
            setError(err.message);
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const getProductName = (productId: string) => {
        const product = products.find(p => p.product_id.toString() === productId || p.id === productId);
        return product?.name || 'Unknown Product';
    };

    const getOrderItemsForOrder = (orderId: number) => {
        return orderItems.filter(item => {
            const itemOrderId = typeof item.orderId === 'string' ? parseInt(item.orderId) : item.orderId;
            return itemOrderId === orderId;
        });
    };

    if (loading) {
        return (
            <main className="p-4">
                <div className="p-4 bg-white rounded-lg shadow-md text-center">
                    <h1 className="text-2xl font-bold text-black">Sales Orders</h1>
                    <p className="mt-2 text-gray-600">Loading sales data...</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="p-4">
                <div className="p-4 bg-white rounded-lg shadow-md text-center">
                    <h1 className="text-2xl font-bold text-black">Sales Orders</h1>
                    <p className="mt-2 text-red-600">Error: {error}</p>
                    <Button onClick={fetchData} className="mt-4">Retry</Button>
                </div>
            </main>
        );
    }

    return (
        <main className="p-4">
            <div className="p-4 bg-white rounded-lg shadow-md mb-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-black">Sales Orders</h1>
                        <p className="mt-2 text-gray-600">Process customer sales and view order history</p>
                    </div>
                    <Button 
                        onClick={() => setIsFormOpen(true)}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        + New Sale
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-xl font-semibold text-black mb-4">Recent Orders</h2>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-gray-50 font-bold">
                                <th className="p-2 border text-black">Order ID</th>
                                <th className="p-2 border text-black">Date</th>
                                <th className="p-2 border text-black">Customer</th>
                                <th className="p-2 border text-black">Status</th>
                                <th className="p-2 border text-black">Total Amount</th>
                                <th className="p-2 border text-black">Items</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-4 text-center text-gray-500">
                                        No sales orders yet. Click "New Sale" to create one.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => {
                                    const items = getOrderItemsForOrder(order.order_id);
                                    return (
                                        <tr key={order.order_id} className="hover:bg-gray-50">
                                            <td className="p-2 border text-center text-black">{order.id}</td>
                                            <td className="p-2 border text-black">{order.orderDate}</td>
                                            <td className="p-2 border text-black">
                                                {order.customerName || (order.supplierId ? `Supplier #${order.supplierId}` : 'N/A')}
                                            </td>
                                            <td className="p-2 border text-center">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                    order.status === 'Completed' 
                                                        ? 'bg-green-100 text-green-800'
                                                        : order.status === 'Pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="p-2 border text-right text-black font-semibold">
                                                {order.totalAmount}
                                            </td>
                                            <td className="p-2 border text-black">
                                                {items.length > 0 ? (
                                                    <div className="text-sm">
                                                        {items.map((item, idx) => (
                                                            <div key={idx} className="mb-1">
                                                                {getProductName(item.productId)} × {item.quantity}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">No items</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <SalesForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={fetchData}
            />
        </main>
    );
}