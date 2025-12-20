'use client';

import { useState, useEffect } from "react";
import { FormDialog } from "@/components/FormDialog";
import { Inventory } from "@/lib/api";

interface InventoryFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (inventory: Omit<Inventory, 'id' | 'inventory_id' | 'lastUpdated' | 'createdAt'>) => Promise<void>;
    inventory?: Inventory | null;
    mode: 'add' | 'edit';
}

export function InventoryForm({ isOpen, onClose, onSubmit, inventory, mode }: InventoryFormProps) {
    const [formData, setFormData] = useState({
        productId: '',
        warehouseId: '',
        quantity: 0
    });

    useEffect(() => {
        if (mode === 'edit' && inventory) {
            setFormData({
                productId: inventory.productId,
                warehouseId: inventory.warehouseId,
                quantity: inventory.quantity
            });
        } else {
            setFormData({
                productId: '',
                warehouseId: '',
                quantity: 0
            });
        }
    }, [mode, inventory, isOpen]);

    const handleSubmit = async (data: FormData) => {
        const inventoryData = {
            productId: data.get('productId') as string,
            warehouseId: data.get('warehouseId') as string,
            quantity: Number(data.get('quantity')),
            reorderLevel: 0
        };
        await onSubmit(inventoryData);
    };

    return (
        <FormDialog
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'add' ? 'Add Inventory Item' : 'Edit Inventory Item'}
            description={mode === 'add' 
                ? 'Add a new inventory item to your system.' 
                : 'Update the inventory information.'}
            onSubmit={handleSubmit}
            submitButtonText={mode === 'add' ? 'Add Item' : 'Update Item'}
        >
            <div className="space-y-4">
                <div>
                    <label htmlFor="productId" className="block text-sm font-medium mb-1 text-gray-900">
                        Product ID <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="productId"
                        name="productId"
                        type="number"
                        placeholder="Enter product ID"
                        defaultValue={formData.productId}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                </div>

                <div>
                    <label htmlFor="warehouseId" className="block text-sm font-medium mb-1 text-gray-900">
                        Warehouse ID <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="warehouseId"
                        name="warehouseId"
                        type="number"
                        placeholder="Enter warehouse ID"
                        defaultValue={formData.warehouseId}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                </div>

                <div>
                    <label htmlFor="quantity" className="block text-sm font-medium mb-1 text-gray-900">
                        Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="quantity"
                        name="quantity"
                        type="number"
                        placeholder="0"
                        defaultValue={formData.quantity}
                        required
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                </div>
            </div>
        </FormDialog>
    );
}