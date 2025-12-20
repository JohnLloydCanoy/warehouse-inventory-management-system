    'use client';
    import Link from "next/link";
    import { usePathname } from "next/navigation";
    import { Button } from "@/components/ui/button";

    interface InventoryFilterProps {
    href: string;
    label: string;
    }
    export function InventoryFilter({ href, label }: InventoryFilterProps) {
    const pathname = usePathname();
    const isActive = pathname === href;
    return (
        <div className="relative group">
                                    <Button className="mb-4 rounded-md">
                                        Filter
                                        <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </Button>
                                    <div className="absolute right-0 mt-0 w-48 sm:w-56 md:w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 hidden top-9 group-hover:block z-10">
                                        <div className="py-1" role="menu">
                                            {/* Filter Options, All Items */}
                                            <Link href="/inventory" className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100">Summary</Link>
                                            {/* Filter Options, By Products */}
                                            <Link href="/inventory/products" className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100">Products</Link>
        
                                            <Link href="/inventory/categories" className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100">Categories</Link>
        
                                            <Link href="/inventory/Supplier" className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100">Supplier</Link>

                                            <Link href="/inventory/warehouses" className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100">Warehouses</Link>
                                            
                                            <Link href="/inventory/Inventory" className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100">Inventory Items</Link>
                                            
                                            <Link href="/inventory/Orders" className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100">Orders</Link>
                                            
                                            <Link href="/inventory/OrderItems" className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100">Order Items</Link>
        
                                            <Link href="/inventory/Users" className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100">Users</Link>
                                        </div>
                                    </div>
                                </div>
    );
    }