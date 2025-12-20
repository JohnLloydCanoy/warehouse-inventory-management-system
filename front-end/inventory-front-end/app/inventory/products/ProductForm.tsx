'use client';

import { useState, useEffect } from "react";
import { FormDialog } from "@/components/FormDialog";
import { getCategories, Category } from "@/lib/api";

interface Product {
    id: string;
    product_id: number;
    name: string;
    description: string;
    categoryId: string;
    category?: Category;
    supplierId: string;
    unitPrice: string;
    sku: string;
    costPrice: string;
    createdAt?: string;
    updatedAt?: string;
}

interface ProductFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (product: Omit<Product, 'id' | 'product_id' | 'createdAt' | 'updatedAt' | 'category'>) => Promise<void>;
    product?: Product | null;
    mode: 'add' | 'edit';
    categories: Category[];
}

export default function ProductForm({ isOpen, onClose, onSubmit, product, mode, }: ProductFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        categoryId: '',
        supplierId: '',
        unitPrice: '',
        sku: '',
        costPrice: ''
    });
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [errorCategories, setErrorCategories] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            const fetchCategories = async () => {
                try {
                    setLoadingCategories(true);
                    setErrorCategories(null);
                    const data = await getCategories();
                    setCategories(data.categories);
                } catch (err: any) {
                    setErrorCategories(err.message);
                } finally {
                    setLoadingCategories(false);
                }
            };
            fetchCategories();
        }
    }, [isOpen]);

    useEffect(() => {
        if (mode === 'edit' && product) {
            setFormData({
                name: product.name,
                description: product.description,
                categoryId: `${product.category?.category_id ?? product.categoryId ?? ''}`,
                supplierId: product.supplierId,
                unitPrice: product.unitPrice.replace('₱', '').replace(',', ''),
                sku: product.sku,
                costPrice: product.costPrice.replace('₱', '').replace(',', '')
            });
        } else {
            setFormData({
                name: '',
                description: '',
                categoryId: '',
                supplierId: '',
                unitPrice: '',
                sku: '',
                costPrice: ''
            });
        }
    }, [mode, product, isOpen]);

    const handleSubmit = async (data: FormData) => {
        const productData = {
            name: data.get('name') as string,
            description: data.get('description') as string,
            categoryId: data.get('categoryId') as string,
            supplierId: data.get('supplierId') as string,
            unitPrice: `₱${data.get('unitPrice')}`,
            sku: data.get('sku') as string,
            costPrice: `₱${data.get('costPrice')}`
        };
        await onSubmit(productData);
    };

    return (
        <FormDialog
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'add' ? 'Add New Product' : 'Edit Product'}
            description={mode === 'add' 
                ? 'Fill in the details below to add a new product.' 
                : 'Update the product information.'}
            onSubmit={handleSubmit}
            submitButtonText={mode === 'add' ? 'Add Product' : 'Update Product'}
        >
            <div className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                        Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter product name"
                        defaultValue={formData.name}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        placeholder="Enter product description"
                        defaultValue={formData.description}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="categoryId" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                            Category
                        </label>
                        {loadingCategories ? (
                            <p>Loading categories...</p>
                        ) : errorCategories ? (
                            <p className="text-red-500">{errorCategories}</p>
                        ) : (
                            <select
                                id="categoryId"
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 dark:bg-gray-700 dark:border-gray-600"
                            >
                                <option value="">Select a category</option>
                                {categories.map(category => (
                                    <option key={category.category_id} value={category.category_id}>{category.name}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div>
                        <label htmlFor="supplierId" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                            Supplier ID
                        </label>
                        <input
                            id="supplierId"
                            name="supplierId"
                            type="text"
                            placeholder="Enter supplier ID"
                            defaultValue={formData.supplierId}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="sku" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                        SKU <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="sku"
                        name="sku"
                        type="string"
                        placeholder="Enter SKU"
                        defaultValue={formData.sku}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="unitPrice" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                            Unit Price (₱) <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="unitPrice"
                            name="unitPrice"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            defaultValue={formData.unitPrice}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>

                    <div>
                        <label htmlFor="costPrice" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                            Cost Price (₱) <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="costPrice"
                            name="costPrice"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            defaultValue={formData.costPrice}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                </div>
            </div>
        </FormDialog>
    );
}