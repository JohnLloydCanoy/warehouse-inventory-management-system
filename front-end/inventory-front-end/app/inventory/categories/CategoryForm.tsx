'use client';

import { useState, useEffect } from "react";
import { FormDialog } from "@/components/FormDialog";

interface Category {
    id: string;
    category_id: number;
    name: string;
    description: string;
}

interface CategoryFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (category: Omit<Category, 'id' | 'category_id'>) => Promise<void>;
    category?: Category | null;
    mode: 'add' | 'edit';
}

export default function CategoryForm({ isOpen, onClose, onSubmit, category, mode }: CategoryFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    useEffect(() => {
        if (mode === 'edit' && category) {
            setFormData({
                name: category.name,
                description: category.description
            });
        } else {
            setFormData({
                name: '',
                description: ''
            });
        }
    }, [mode, category, isOpen]);

    const handleSubmit = async (data: FormData) => {
        const categoryData = {
            name: data.get('name') as string,
            description: data.get('description') as string
        };
        await onSubmit(categoryData);
    };

    return (
        <FormDialog
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'add' ? 'Add New Category' : 'Edit Category'}
            description={mode === 'add' 
                ? 'Fill in the details below to add a new category.' 
                : 'Update the category information.'}
            onSubmit={handleSubmit}
            submitButtonText={mode === 'add' ? 'Add Category' : 'Update Category'}
        >
            <div className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                        Category Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter category name"
                        defaultValue={formData.name}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-1">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        placeholder="Enter category description"
                        defaultValue={formData.description}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
        </FormDialog>
    );
}
