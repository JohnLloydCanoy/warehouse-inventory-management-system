'use client';

import { useState, useEffect } from "react";
import { FormDialog } from "@/components/FormDialog";

interface Warehouse {
    id: string;
    warehouse_id: number;
    name: string;
    location: string;
    createdAt?: string;
    updatedAt?: string;
}

interface WarehouseFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (warehouse: Omit<Warehouse, 'id' | 'warehouse_id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    warehouse?: Warehouse | null;
    mode: 'add' | 'edit';
}

export default function WarehouseForm({ isOpen, onClose, onSubmit, warehouse, mode }: WarehouseFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        location: ''
    });

    useEffect(() => {
        if (mode === 'edit' && warehouse) {
            setFormData({
                name: warehouse.name,
                location: warehouse.location
            });
        } else {
            setFormData({
                name: '',
                location: ''
            });
        }
    }, [mode, warehouse, isOpen]);

    const handleSubmit = async (data: FormData) => {
        const warehouseData = {
            name: data.get('name') as string,
            location: data.get('location') as string
        };
        await onSubmit(warehouseData);
    };

    return (
        <FormDialog
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'add' ? 'Add New Warehouse' : 'Edit Warehouse'}
            description={mode === 'add' 
                ? 'Fill in the details below to add a new warehouse.' 
                : 'Update the warehouse information.'}
            onSubmit={handleSubmit}
            submitButtonText={mode === 'add' ? 'Add Warehouse' : 'Update Warehouse'}
        >
            <div className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                        Warehouse Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter warehouse name"
                        defaultValue={formData.name}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="location" className="block text-sm font-medium mb-1">
                        Location
                    </label>
                    <input
                        id="location"
                        name="location"
                        type="text"
                        placeholder="Enter warehouse location"
                        defaultValue={formData.location}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
        </FormDialog>
    );
}