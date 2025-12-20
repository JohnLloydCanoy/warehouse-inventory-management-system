'use client';

import { useEffect, useState } from 'react';
import { healthCheck, getItems, createItem } from '@/lib/api';

interface Item {
id: number;
name: string;
quantity: number;
price: number;
}

export default function TestConnection() {
const [status, setStatus] = useState<string>('Checking connection...');
const [items, setItems] = useState<Item[]>([]);
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(false);
const [newItemName, setNewItemName] = useState('');
const [newItemQuantity, setNewItemQuantity] = useState('');
const [newItemPrice, setNewItemPrice] = useState('');

const fetchItems = async () => {
try {
    const data = await getItems();
    setItems(data.items);
} catch (err: any) {
    setError(err.message);
}
};

useEffect(() => {
const testConnection = async () => {
    try {
    // Test health check
    const healthData = await healthCheck();
    setStatus(`✓ ${healthData.message} - Database: ${healthData.database}`);
    
    // Fetch items
    await fetchItems();
    setError(null);
    } catch (err: any) {
    setStatus('✗ Connection failed');
    setError(err.message);
    }
};

testConnection();
}, []);

const handleCreateItem = async (e: React.FormEvent) => {
e.preventDefault();
setLoading(true);
setError(null);

try {
    await createItem({
    name: newItemName,
    quantity: parseInt(newItemQuantity),
    price: parseFloat(newItemPrice),
    });
    
    // Clear form
    setNewItemName('');
    setNewItemQuantity('');
    setNewItemPrice('');
    
    // Refresh items
    await fetchItems();
    alert('Item created successfully!');
} catch (err: any) {
    setError(err.message);
} finally {
    setLoading(false);
}
};

return (
<div className="max-w-4xl mx-auto p-6">
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
    <h2 className="text-2xl font-bold mb-4">Backend Connection Test</h2>
    
    <div className="mb-4">
        <p className="text-lg mb-2">
        <span className="font-semibold">Status:</span> {status}
        </p>
        {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
        </div>
        )}
    </div>

    <div className="border-t pt-4">
        <h3 className="text-xl font-semibold mb-3">Inventory Items ({items.length})</h3>
        {items.length === 0 ? (
        <p className="text-gray-500">No items found</p>
        ) : (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => (
                <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.price}</td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        )}
    </div>
    </div>

    <div className="bg-white shadow-md rounded-lg p-6">
    <h3 className="text-xl font-semibold mb-4">Create New Item</h3>
    <form onSubmit={handleCreateItem} className="space-y-4">
        <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
            Item Name
        </label>
        <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
        />
        </div>
        <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity
        </label>
        <input
            type="number"
            value={newItemQuantity}
            onChange={(e) => setNewItemQuantity(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            min="0"
        />
        </div>
        <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
            Price
        </label>
        <input
            type="number"
            step="0.01"
            value={newItemPrice}
            onChange={(e) => setNewItemPrice(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            min="0"
        />
        </div>
        <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
        {loading ? 'Creating...' : 'Create Item'}
        </button>
    </form>
    </div>
</div>
);
}