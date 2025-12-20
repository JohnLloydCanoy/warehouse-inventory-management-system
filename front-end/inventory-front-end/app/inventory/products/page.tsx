'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { InventoryFilter } from "@/components/InventoryFilter";
import ProductForm from "./ProductForm";
import { DeleteDialog } from "@/components/DeleteDialog";
import { getProducts, createProduct, updateProduct, deleteProduct, getCategories, Category, Product } from "@/lib/api";
import Link from "next/dist/client/link";

export default function Products() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch products from database
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [productsData, categoriesData] = await Promise.all([
                getProducts(),
                getCategories(),
            ]);
            setProducts(productsData.products);
            setCategories(categoriesData.categories);
        } catch (err: any) {
            setError(err.message);
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitProduct = async (productData: Omit<Product, 'id' | 'product_id' | 'createdAt' | 'updatedAt' | 'category'>) => {
        try {
            if (formMode === 'add') {
                await createProduct(productData);
            } else if (selectedProduct) {
                await updateProduct(selectedProduct.product_id, productData);
            }
            await fetchData(); // Refresh the list
            setIsFormOpen(false);
            setSelectedProduct(null);
        } catch (err: any) {
            console.error('Error saving product:', err);
            alert(`Error: ${err.message}`);
        }
    }

    const handleDeleteProduct = async () => {
        if (selectedProduct) {
            try {
                await deleteProduct(selectedProduct.product_id);
                await fetchData(); // Refresh the list
                setIsDeleteOpen(false);
                setSelectedProduct(null);
            } catch (err: any) {
                console.error('Error deleting product:', err);
                alert(`Error: ${err.message}`);
            }
        }
    };

    const openAddDialog = () => {
        setFormMode('add');
        setSelectedProduct(null);
        setIsFormOpen(true);
    };

    const openEditDialog = (product: Product) => {
        setFormMode('edit');
        setSelectedProduct(product);
        setIsFormOpen(true);
    };

    const openDeleteDialog = (product: Product) => {
        setSelectedProduct(product);
        setIsDeleteOpen(true);
    };

    if (loading) {
        return (
            <main>
                <div className="p-4 bg-white rounded-lg shadow-md mx-auto mt-2 text-center">
                    <h1 className="text-2xl font-bold text-black">Products</h1>
                    <p className="mt-2 text-gray-600">Loading products...</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main>
                <div className="p-4 bg-white rounded-lg shadow-md mx-auto mt-2 text-center">
                    <h1 className="text-2xl font-bold text-black">Products</h1>
                    <p className="mt-2 text-red-600">Error: {error}</p>
                    <Button onClick={fetchData} className="mt-4">
                        Retry
                    </Button>
                </div>
            </main>
        );
    }

    return (
        <main>
            <div className="p-4 bg-white rounded-lg shadow-md mx-auto mt-2 text-center mb-4">
                <h1 className="text-2xl font-bold text-black">Products</h1>
                <p className="mt-2 text-gray-600">View all products in your inventory. Total: {products.length}</p>
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
                        <h1 className="font-bold text-2xl pb-5">Product Table</h1>
                        <div className="flex gap-2 ">
                            <InventoryFilter href="/inventory/products" label="Filter Products"/>
                            <Button 
                                className="mb-4 rounded-md" 
                                onClick={openAddDialog}
                            >
                                Add Item
                            </Button>
                        </div>
                    </nav>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse min-w-[800px]">
                            <thead>
                                <tr className="font-bold bg-gray-50">
                                    <th id="cell">Product ID</th>
                                    <th id="cell">Product Name</th>
                                    <th id="cell">Description</th>
                                    <th id="cell">Supplier ID</th>
                                    <th id="cell">Unit Price</th>
                                    <th id="cell">SKU</th>
                                    <th id="cell">Cost Price</th>
                                    <th id="cell">Created At</th>
                                    <th id="cell">Updated At</th>
                                    <th id="cell">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan={11} className="text-center py-8 text-gray-500">
                                            No products found. Click "Add Item" to create one.
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((product) => {
                                        const category = categories.find(cat => cat.id === product.categoryId);
                                        return (
                                            <tr key={product.product_id} className="bg-gray-50 transition-colors hover:bg-gray-100">
                                                <td id="cell">{product.id}</td>
                                                <td id="cell">{product.name}</td>
                                                <td id="cell">{product.description}</td>
                                                <td id="cell">{product.supplierId}</td>
                                                <td id="cell">{product.unitPrice}</td>
                                                <td id="cell">{product.sku}</td>
                                                <td id="cell">{product.costPrice}</td>
                                                <td id="cell">{product.createdAt || 'N/A'}</td>
                                                <td id="cell">{product.updatedAt || 'N/A'}</td>
                                                <td id="cell">
                                                    <div className="flex gap-1 sm:gap-2 justify-center">
                                                        <Button 
                                                            size="sm" 
                                                            className="text-xs"
                                                            onClick={() => openEditDialog(product)}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant="destructive" 
                                                            className="text-xs"
                                                            onClick={() => openDeleteDialog(product)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </nav>
            
            <ProductForm
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setSelectedProduct(null);
                }}
                onSubmit={handleSubmitProduct}
                mode={formMode}
                product={selectedProduct}
                categories={categories}
            />

            <DeleteDialog
                isOpen={isDeleteOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setSelectedProduct(null);
                }}
                onConfirm={handleDeleteProduct}
                title="Delete Product"
                itemName={selectedProduct?.name || ''}
                description="This action cannot be undone."
            />
        </main>
    );
}