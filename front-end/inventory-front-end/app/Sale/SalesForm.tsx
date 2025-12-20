'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getProducts, getSuppliers, getInventory, createOrder, createOrderItem, Product, Supplier, Inventory } from '@/lib/api';

interface SalesFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface OrderLineItem {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}

export default function SalesForm({ isOpen, onClose, onSuccess }: SalesFormProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [inventory, setInventory] = useState<Inventory[]>([]);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [lineItems, setLineItems] = useState<OrderLineItem[]>([]);
    const [selectedSupplierId, setSelectedSupplierId] = useState('');
    const [customerType, setCustomerType] = useState<'registered' | 'regular'>('registered');
    const [customerName, setCustomerName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    const fetchData = async () => {
        try {
            const [productsData, suppliersData, inventoryData] = await Promise.all([
                getProducts(),
                getSuppliers(),
                getInventory()
            ]);
            setProducts(productsData.products || []);
            setSuppliers(suppliersData.suppliers || []);
            setInventory(inventoryData.inventories || []);
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    };

    const getAvailableQuantity = (productId: string) => {
        const invRecords = inventory.filter(inv => {
            const invProductId = (inv as any).product_id || inv.productId;
            return invProductId === parseInt(productId) || invProductId === productId || invProductId === productId.toString();
        });
        
        return invRecords.reduce((total, inv) => total + (inv.quantity || 0), 0);
    };

    const addLineItem = () => {
        if (!selectedProductId || quantity <= 0) {
            alert('Please select a product and enter a valid quantity');
            return;
        }

        const product = products.find(p => p.product_id.toString() === selectedProductId);
        if (!product) return;

        const availableQty = getAvailableQuantity(selectedProductId);
        
        if (availableQty === 0) {
            alert(`Cannot add ${product.name} - Out of stock!`);
            return;
        }

        if (quantity > availableQty) {
            alert(`Cannot add ${quantity} units of ${product.name}. Only ${availableQty} available in stock.`);
            return;
        }

        const unitPrice = parseFloat(product.unitPrice.replace(/[₱,]/g, ''));
        const subtotal = unitPrice * quantity;

        const newItem: OrderLineItem = {
            productId: selectedProductId,
            productName: product.name,
            quantity,
            unitPrice,
            subtotal
        };

        setLineItems([...lineItems, newItem]);
        setSelectedProductId('');
        setQuantity(1);
    };

    const removeLineItem = (index: number) => {
        setLineItems(lineItems.filter((_, i) => i !== index));
    };

    const calculateTotal = () => {
        return lineItems.reduce((sum, item) => sum + item.subtotal, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (lineItems.length === 0) {
            alert('Please add at least one product to the order');
            return;
        }

        if (customerType === 'registered' && !selectedSupplierId) {
            alert('Please select a customer');
            return;
        }

        if (customerType === 'regular' && !customerName.trim()) {
            alert('Please enter customer name');
            return;
        }

        setLoading(true);

        try {
            // Create the order
            const orderData: any = {
                status: 'Completed',
                totalAmount: `₱${calculateTotal().toFixed(2)}`
            };

            // Add customer info based on type
            if (customerType === 'registered' && selectedSupplierId) {
                orderData.supplierId = selectedSupplierId;
            } else if (customerType === 'regular' && customerName) {
                orderData.customerName = customerName;
            }

            const orderResult = await createOrder(orderData);
            const orderId = orderResult.order.order_id;

            // Create order items
            for (const item of lineItems) {
                await createOrderItem({
                    orderId: orderId.toString(),
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: `₱${item.unitPrice.toFixed(2)}`
                });
            }

            alert(`Sale completed successfully for ${customerType === 'registered' ? 'registered customer' : customerName}!`);
            resetForm();
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Error creating sale:', err);
            alert(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setLineItems([]);
        setSelectedProductId('');
        setQuantity(1);
        setSelectedSupplierId('');
        setCustomerType('registered');
        setCustomerName('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-black">New Sale</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Customer Type Selection */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Customer Type *
                            </label>
                            <div className="flex gap-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="registered"
                                        checked={customerType === 'registered'}
                                        onChange={(e) => setCustomerType(e.target.value as 'registered')}
                                        className="mr-2"
                                    />
                                    <span className="text-black">Registered Customer</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="regular"
                                        checked={customerType === 'regular'}
                                        onChange={(e) => setCustomerType(e.target.value as 'regular')}
                                        className="mr-2"
                                    />
                                    <span className="text-black">Regular Customer</span>
                                </label>
                            </div>
                        </div>

                        {/* Customer Selection/Input */}
                        {customerType === 'registered' ? (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Customer *
                                </label>
                                <select
                                    value={selectedSupplierId}
                                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                                    required
                                >
                                    <option value="">Select a customer</option>
                                    {suppliers.map(supplier => (
                                        <option key={supplier.supplier_id} value={supplier.supplier_id}>
                                            {supplier.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Customer Name *
                                </label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="Enter customer name"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                                    required
                                />
                            </div>
                        )}

                        {/* Product Selection */}
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-semibold text-black mb-3">Add Products</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Product
                                    </label>
                                    <select
                                        value={selectedProductId}
                                        onChange={(e) => setSelectedProductId(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                                    >
                                        <option value="">Select a product</option>
                                        {products.map(product => {
                                            const availableQty = getAvailableQuantity(product.product_id.toString());
                                            const isOutOfStock = availableQty === 0;
                                            return (
                                                <option 
                                                    key={product.product_id} 
                                                    value={product.product_id}
                                                    disabled={isOutOfStock}
                                                    className={isOutOfStock ? 'text-red-500' : ''}
                                                >
                                                    {product.name} - {product.unitPrice} 
                                                    {isOutOfStock ? ' (OUT OF STOCK)' : ` (${availableQty} available)`}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Quantity
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={selectedProductId ? getAvailableQuantity(selectedProductId) : undefined}
                                        value={quantity}
                                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                                    />
                                    {selectedProductId && (
                                        <p className="text-xs text-gray-600 mt-1">
                                            Max: {getAvailableQuantity(selectedProductId)} available
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-end">
                                    <Button
                                        type="button"
                                        onClick={addLineItem}
                                        className="w-full"
                                    >
                                        Add Item
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Order Items Table */}
                        {lineItems.length > 0 && (
                            <div className="mb-4">
                                <h3 className="font-semibold text-black mb-2">Order Items</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="p-2 border text-left text-black">Product</th>
                                                <th className="p-2 border text-center text-black">Quantity</th>
                                                <th className="p-2 border text-right text-black">Unit Price</th>
                                                <th className="p-2 border text-right text-black">Subtotal</th>
                                                <th className="p-2 border text-center text-black">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {lineItems.map((item, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="p-2 border text-black">{item.productName}</td>
                                                    <td className="p-2 border text-center text-black">{item.quantity}</td>
                                                    <td className="p-2 border text-right text-black">
                                                        ₱{item.unitPrice.toFixed(2)}
                                                    </td>
                                                    <td className="p-2 border text-right text-black">
                                                        ₱{item.subtotal.toFixed(2)}
                                                    </td>
                                                    <td className="p-2 border text-center">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => removeLineItem(index)}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-gray-100 font-bold">
                                                <td colSpan={3} className="p-2 border text-right text-black">
                                                    Total:
                                                </td>
                                                <td className="p-2 border text-right text-black">
                                                    ₱{calculateTotal().toFixed(2)}
                                                </td>
                                                <td className="p-2 border"></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2 mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading || lineItems.length === 0}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {loading ? 'Processing...' : 'Complete Sale'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
