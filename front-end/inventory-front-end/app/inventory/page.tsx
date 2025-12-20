'use client';

import { useEffect, useState } from 'react';
import { getInventory, getCategories, getProducts, getSuppliers, getWarehouses, updateProduct, createInventory, updateInventory, Inventory, Category, Product, Supplier, Warehouse } from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function InventoryPage() {
    const [inventory, setInventory] = useState<Inventory[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingCell, setEditingCell] = useState<{ productId: number; field: string } | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const [savingCell, setSavingCell] = useState<{ productId: number; field: string } | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [invData, catData, prodData, suppData, wareData] = await Promise.all([
                getInventory(),
                getCategories(),
                getProducts(),
                getSuppliers(),
                getWarehouses()
            ]);
            console.log('Inventory data:', invData);
            console.log('Products data:', prodData);
            // Try both possible keys for inventory
            setInventory(invData.inventories || []);
            setCategories(catData.categories || []);
            setProducts(prodData.products || []);
            setSuppliers(suppData.suppliers || []);
            setWarehouses(wareData.warehouses || []);
        } catch (err: any) {
            setError(err.message);
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Helper functions to get related data
    const getProductName = (productId: string) => {
        const product = products.find(p => p.product_id.toString() === productId);
        return product?.name || 'N/A';
    };

    const getCategoryName = (productId: string) => {
        const product = products.find(p => p.product_id.toString() === productId);
        if (!product) return 'N/A';
        const category = categories.find(c => c.category_id.toString() === product.categoryId);
        return category?.name || 'N/A';
    };

    const getSupplierName = (productId: string) => {
        const product = products.find(p => p.product_id.toString() === productId);
        if (!product) return 'N/A';
        const supplier = suppliers.find(s => s.supplier_id.toString() === product.supplierId);
        return supplier?.name || 'N/A';
    };

    const getWarehouseName = (warehouseId: string) => {
        const warehouse = warehouses.find(w => w.warehouse_id.toString() === warehouseId);
        return warehouse?.name || 'N/A';
    };

    const getProductDetails = (productId: string) => {
        return products.find(p => p.product_id.toString() === productId);
    };

    const startEditing = (product: Product, invRecord: Inventory | undefined, field: string) => {
        setEditingCell({ productId: product.product_id, field });
        
        // Set initial value based on field
        switch(field) {
            case 'name':
                setEditValue(product.name);
                break;
            case 'categoryId':
                const category = categories.find(c => c.id === product.categoryId || c.category_id.toString() === product.categoryId);
                setEditValue(category?.category_id?.toString() || product.categoryId || '');
                break;
            case 'supplierId':
                const supplier = suppliers.find(s => s.id === product.supplierId || s.supplier_id.toString() === product.supplierId);
                setEditValue(supplier?.supplier_id?.toString() || product.supplierId || '');
                break;
            case 'warehouseId':
                const warehouse = invRecord ? warehouses.find(w => w.id === invRecord.warehouseId || w.warehouse_id.toString() === invRecord.warehouseId) : null;
                setEditValue(warehouse?.warehouse_id?.toString() || invRecord?.warehouseId || '');
                break;
            case 'quantity':
                setEditValue(invRecord?.quantity?.toString() || '0');
                break;
            case 'unitPrice':
                setEditValue(product.unitPrice?.replace(/[₱,]/g, '') || '');
                break;
            case 'sku':
                setEditValue(product.sku || '');
                break;
        }
    };

    const cancelEditing = () => {
        setEditingCell(null);
        setEditValue('');
    };

    const saveCell = async (product: Product, invRecord: Inventory | undefined, field: string) => {
        if (!editingCell || savingCell) return;

        console.log('=== SAVE CELL DEBUG ===');
        console.log('Field:', field);
        console.log('Edit Value:', editValue);
        console.log('Product:', product);
        console.log('Inventory Record:', invRecord);

        // Don't save if value is empty/invalid for required fields
        if (!editValue && (field === 'warehouseId' || field === 'name')) {
            console.log('Canceling - empty value for required field');
            cancelEditing();
            return;
        }

        setSavingCell({ productId: product.product_id, field });

        try {
            if (field === 'quantity' || field === 'warehouseId') {
                // Update inventory
                if (invRecord) {
                    const updateData: any = {};
                    if (field === 'quantity') {
                        updateData.quantity = parseInt(editValue) || 0;
                        // Keep existing warehouse
                        updateData.warehouseId = invRecord.warehouseId;
                    } else {
                        // Warehouse change - ensure we have a valid warehouse ID
                        if (!editValue) {
                            throw new Error('Please select a warehouse');
                        }
                        // Send as string - backend will handle conversion
                        updateData.warehouseId = String(editValue);
                        updateData.quantity = invRecord.quantity;
                    }
                    
                    console.log('Updating inventory ID:', invRecord.inventory_id);
                    console.log('Update data being sent:', updateData);
                    
                    const result = await updateInventory(invRecord.inventory_id, updateData);
                    console.log('Update result:', result);
                    
                    // Update local state immediately - update both camelCase and snake_case fields
                    setInventory(prev => prev.map(inv => {
                        if (inv.inventory_id === invRecord.inventory_id) {
                            return {
                                ...inv,
                                warehouseId: updateData.warehouseId,
                                warehouse_id: parseInt(updateData.warehouseId),
                                quantity: updateData.quantity
                            };
                        }
                        return inv;
                    }));
                } else if (editValue && field === 'warehouseId') {
                    // Create new inventory record when warehouse is assigned
                    const newInvData = {
                        productId: product.id,
                        warehouseId: String(editValue),
                        quantity: 0,
                    };
                    
                    console.log('Creating new inventory with:', newInvData);
                    const result = await createInventory(newInvData);
                    console.log('Create result:', result);
                    await fetchData(); // Refresh to get new inventory_id
                }
            } else {
                // Update product
                const updateData: any = {
                    name: product.name,
                    categoryId: product.categoryId,
                    supplierId: product.supplierId,
                    unitPrice: product.unitPrice,
                    sku: product.sku,
                    description: product.description,
                    costPrice: product.costPrice
                };
                
                if (field === 'name') {
                    updateData.name = editValue;
                } else if (field === 'categoryId') {
                    updateData.categoryId = editValue;
                } else if (field === 'supplierId') {
                    updateData.supplierId = editValue;
                } else if (field === 'unitPrice') {
                    updateData.unitPrice = `₱${editValue}`;
                } else if (field === 'sku') {
                    updateData.sku = editValue;
                }
                
                await updateProduct(product.product_id, updateData);
                
                // Update local state immediately with properly formatted values
                setProducts(prev => prev.map(p => {
                    if (p.product_id === product.product_id) {
                        const updatedProduct = { ...p };
                        
                        if (field === 'name') {
                            updatedProduct.name = editValue;
                        } else if (field === 'categoryId') {
                            updatedProduct.categoryId = editValue;
                        } else if (field === 'supplierId') {
                            updatedProduct.supplierId = editValue;
                        } else if (field === 'unitPrice') {
                            updatedProduct.unitPrice = `₱${parseFloat(editValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                        } else if (field === 'sku') {
                            updatedProduct.sku = editValue;
                        }
                        
                        return updatedProduct;
                    }
                    return p;
                }));
            }
            
            setEditingCell(null);
            setEditValue('');
        } catch (err: any) {
            console.error('Error saving cell:', err);
            // Extract the actual error message from the API response
            const errorMessage = err.message || 'Unknown error occurred';
            alert(`Error saving ${field}: ${errorMessage}`);
            // Don't clear the edit state on error so user can try again
        } finally {
            setSavingCell(null);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, product: Product, invRecord: Inventory | undefined, field: string) => {
        if (e.key === 'Enter') {
            saveCell(product, invRecord, field);
        } else if (e.key === 'Escape') {
            cancelEditing();
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

    return (
        <main className="p-4">
            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                <h1 className="text-2xl font-bold text-black">Inventory Management</h1>
                <p className="text-gray-600 mt-2">Central inventory tracking system. Total products: {products.length}</p>
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

            <div className="bg-white rounded-lg shadow-md p-4">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-[1200px]">
                        <thead>
                            <tr className="bg-gray-50 font-bold">
                                <th className="p-2 border  text-black">Inventory ID</th>
                                <th className="p-2 border  text-black">Product Name</th>
                                <th className="p-2 border  text-black">Category</th>
                                <th className="p-2 border  text-black">Supplier</th>
                                <th className="p-2 border  text-black">Warehouse</th>
                                <th className="p-2 border  text-black">Quantity</th>
                                <th className="p-2 border  text-black">Unit Price</th>
                                <th className="p-2 border  text-black">SKU</th>
                                <th className="p-2 border  text-black">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="p-4 text-center text-gray-500">
                                        No products found
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => {
                                    // Find inventory record for this product - check multiple possible field names
                                    const invRecord = inventory.find(inv => {
                                        const invProductId = (inv as any).product_id || inv.productId;
                                        return invProductId === product.product_id || 
                                                invProductId === product.id ||
                                                invProductId === product.product_id.toString();
                                        });
                                        const category = categories.find(c => c.id === product.categoryId || c.category_id.toString() === product.categoryId);
                                        const supplier = suppliers.find(s => s.id === product.supplierId || s.supplier_id.toString() === product.supplierId);
                                        const warehouse = invRecord ? warehouses.find(w => {
                                            const invWarehouseId = (invRecord as any).warehouse_id || invRecord.warehouseId;
                                            return w.id === invWarehouseId || 
                                                w.warehouse_id.toString() === invWarehouseId ||
                                                w.warehouse_id === invWarehouseId;
                                        }) : null;
                                    
                                    const isEditing = (field: string) => editingCell?.productId === product.product_id && editingCell?.field === field;
                                    const isSaving = (field: string) => savingCell?.productId === product.product_id && savingCell?.field === field;
                                    
                                    return (
                                        <tr key={product.product_id} className="hover:bg-gray-50">
                                            <td className="p-2 border text-center text-black">{invRecord?.inventory_id || 'N/A'}</td>
                                            <td className="p-2 border text-black">
                                                {isEditing('name') ? (
                                                    <input
                                                        type="text"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onBlur={() => saveCell(product, invRecord, 'name')}
                                                        onKeyDown={(e) => handleKeyDown(e, product, invRecord, 'name')}
                                                        className="w-full px-2 py-1 border rounded text-black"
                                                        autoFocus
                                                        disabled={isSaving('name')}
                                                    />
                                                ) : (
                                                    <div 
                                                        onClick={() => startEditing(product, invRecord, 'name')}
                                                        className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                                                    >
                                                        {product.name}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-2 border text-black">
                                                {isEditing('categoryId') ? (
                                                    <select
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onBlur={() => saveCell(product, invRecord, 'categoryId')}
                                                        onKeyDown={(e) => handleKeyDown(e, product, invRecord, 'categoryId')}
                                                        className="w-full px-2 py-1 border rounded text-black"
                                                        autoFocus
                                                        disabled={isSaving('categoryId')}
                                                    >
                                                        <option value="">Select Category</option>
                                                        {categories.map(cat => (
                                                            <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <div 
                                                        onClick={() => startEditing(product, invRecord, 'categoryId')}
                                                        className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                                                    >
                                                        {category?.name || 'N/A'}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-2 border text-black">
                                                {isEditing('supplierId') ? (
                                                    <select
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onBlur={() => saveCell(product, invRecord, 'supplierId')}
                                                        onKeyDown={(e) => handleKeyDown(e, product, invRecord, 'supplierId')}
                                                        className="w-full px-2 py-1 border rounded text-black"
                                                        autoFocus
                                                        disabled={isSaving('supplierId')}
                                                    >
                                                        <option value="">Select Supplier</option>
                                                        {suppliers.map(sup => (
                                                            <option key={sup.supplier_id} value={sup.supplier_id}>{sup.name}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <div 
                                                        onClick={() => startEditing(product, invRecord, 'supplierId')}
                                                        className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                                                    >
                                                        {supplier?.name || 'N/A'}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-2 border text-black">
                                                {isEditing('warehouseId') ? (
                                                    <select
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onBlur={() => saveCell(product, invRecord, 'warehouseId')}
                                                        onKeyDown={(e) => handleKeyDown(e, product, invRecord, 'warehouseId')}
                                                        className="w-full px-2 py-1 border rounded text-black"
                                                        autoFocus
                                                        disabled={isSaving('warehouseId')}
                                                    >
                                                        <option value="">Select Warehouse</option>
                                                        {warehouses.map(wh => (
                                                            <option key={wh.warehouse_id} value={wh.warehouse_id}>{wh.name}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <div 
                                                        onClick={() => startEditing(product, invRecord, 'warehouseId')}
                                                        className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                                                    >
                                                        {warehouse?.name || 'Not Assigned'}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-2 border text-center">
                                                {isEditing('quantity') ? (
                                                    <input
                                                        type="number"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onBlur={() => saveCell(product, invRecord, 'quantity')}
                                                        onKeyDown={(e) => handleKeyDown(e, product, invRecord, 'quantity')}
                                                        className="w-20 px-2 py-1 border rounded text-black text-center"
                                                        autoFocus
                                                        disabled={isSaving('quantity')}
                                                    />
                                                ) : (
                                                    <div 
                                                        onClick={() => startEditing(product, invRecord, 'quantity')}
                                                        className={`cursor-pointer hover:bg-gray-100 px-2 py-1 rounded font-semibold ${invRecord?.quantity === 0 ? 'text-red-500' : 'text-black'}`}
                                                    >
                                                        {invRecord?.quantity ?? 0}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-2 border text-right text-black">
                                                {isEditing('unitPrice') ? (
                                                    <input
                                                        type="text"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onBlur={() => saveCell(product, invRecord, 'unitPrice')}
                                                        onKeyDown={(e) => handleKeyDown(e, product, invRecord, 'unitPrice')}
                                                        className="w-24 px-2 py-1 border rounded text-black text-right"
                                                        placeholder="0.00"
                                                        autoFocus
                                                        disabled={isSaving('unitPrice')}
                                                    />
                                                ) : (
                                                    <div 
                                                        onClick={() => startEditing(product, invRecord, 'unitPrice')}
                                                        className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                                                    >
                                                        {product.unitPrice || 'N/A'}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-2 border text-black">
                                                {isEditing('sku') ? (
                                                    <input
                                                        type="text"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onBlur={() => saveCell(product, invRecord, 'sku')}
                                                        onKeyDown={(e) => handleKeyDown(e, product, invRecord, 'sku')}
                                                        className="w-24 px-2 py-1 border rounded text-black"
                                                        autoFocus
                                                        disabled={isSaving('sku')}
                                                    />
                                                ) : (
                                                    <div 
                                                        onClick={() => startEditing(product, invRecord, 'sku')}
                                                        className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                                                    >
                                                        {product.sku || 'N/A'}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-2 border text-center text-gray-400 text-xs">
                                                Click to edit
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}