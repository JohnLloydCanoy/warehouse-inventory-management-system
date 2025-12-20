'use client';

import { useState, useEffect } from 'react';
import { getInventory, getProducts, getOrders, getOrderItems, getWarehouses, Inventory, Product, Order, OrderItem, Warehouse } from '@/lib/api';
import Link from 'next/link';

export default function Dashboard() {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchData();
    // Update calendar every minute
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      const [invData, prodData, ordersData, itemsData, warehouseData] = await Promise.all([
        getInventory(),
        getProducts(),
        getOrders(),
        getOrderItems(),
        getWarehouses()
      ]);
      setInventory(invData.inventories || []);
      setProducts(prodData.products || []);
      setOrders(ordersData.orders || []);
      setOrderItems(itemsData.orderItems || []);
      setWarehouses(warehouseData.warehouses || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const totalProducts = products.length;
  const totalInventoryQuantity = inventory.reduce((sum, inv) => sum + (inv.quantity || 0), 0);
  
  // Calculate total sold (sum of all order item quantities)
  const totalSold = orderItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  
  // Calculate total sales amount
  const totalSales = orders.reduce((sum, order) => {
    const amount = typeof order.totalAmount === 'string' 
      ? parseFloat(order.totalAmount.replace(/[₱,]/g, '')) 
      : order.totalAmount || 0;
    return sum + amount;
  }, 0);
  
  // Calculate out of stock items - only count inventory records that exist and have 0 quantity
  // This filters out products that don't have inventory records yet
  const outOfStock = inventory.filter(inv => {
    // Check if this inventory record actually has a quantity of 0 (not undefined or null)
    return inv.quantity === 0 && inv.inventory_id !== undefined;
  }).length;
  
  // Count unique customers (both supplier IDs and customer names)
  const uniqueCustomers = new Set([
    ...orders.filter(o => o.supplierId).map(o => `supplier_${o.supplierId}`),
    ...orders.filter(o => o.customerName).map(o => `customer_${o.customerName}`)
  ]).size;

  // Calculate most sold products
  const productSales = orderItems.reduce((acc, item) => {
    const productId = item.productId.toString();
    acc[productId] = (acc[productId] || 0) + item.quantity;
    return acc;
  }, {} as Record<string, number>);

  const topProducts = Object.entries(productSales)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([productId, quantity]) => {
      const product = products.find(p => p.product_id.toString() === productId);
      return { name: product?.name || 'Unknown', quantity };
    });

  // Calculate customer type distribution
  const registeredCustomers = orders.filter(o => o.supplierId).length;
  const regularCustomers = orders.filter(o => o.customerName).length;

  // Calculate warehouse inventory distribution
  const warehouseDistribution = warehouses.map(warehouse => {
    const warehouseInventory = inventory.filter(inv => {
      const invWarehouseId = (inv as any).warehouse_id || inv.warehouseId;
      return invWarehouseId === warehouse.warehouse_id || invWarehouseId === warehouse.warehouse_id.toString();
    });
    const totalQty = warehouseInventory.reduce((sum, inv) => sum + inv.quantity, 0);
    return { name: warehouse.name, quantity: totalQty };
  });

  // Calendar helpers
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const today = currentDate.getDate();

  if (loading) {
    return (
      <main className="p-4">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-0">
      {/* Header */}
      <div className="p-4 bg-white rounded-lg shadow-md mb-4">
        <h1 className="text-2xl font-bold text-black">Dashboard Overview</h1>
        <p className="mt-2 text-gray-600">Company performance and inventory summary</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold opacity-90">Total Customers Served</h3>
          <p className="text-3xl font-bold mt-2">{uniqueCustomers}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold opacity-90">Total Products</h3>
          <p className="text-3xl font-bold mt-2">{totalProducts}</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold opacity-90">Total Sold</h3>
          <p className="text-3xl font-bold mt-2">{totalSold}</p>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold opacity-90">Total Sales</h3>
          <p className="text-3xl font-bold mt-2">₱{totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold opacity-90">Out of Stock</h3>
          <p className="text-3xl font-bold mt-2">{outOfStock}</p>
        </div>
      </div>

      {/* Charts and Calendar Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Top Selling Products */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-black mb-4">Top Selling Products</h2>
          <div className="space-y-3">
            {topProducts.length > 0 ? (
              topProducts.map((product, idx) => {
                const maxQty = Math.max(...topProducts.map(p => p.quantity));
                const percentage = (product.quantity / maxQty) * 100;
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-red-500'];
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-black font-medium">{product.name}</span>
                      <span className="text-gray-600">{product.quantity} units</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`${colors[idx]} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center">No sales data yet</p>
            )}
          </div>
        </div>

        {/* Customer Type Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-black mb-4">Customer Types</h2>
          <div className="flex flex-col items-center">
            {registeredCustomers + regularCustomers > 0 ? (
              <>
                <div className="relative w-48 h-48">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    {/* Regular Customers */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="20"
                      strokeDasharray={`${(regularCustomers / (registeredCustomers + regularCustomers)) * 251.2} 251.2`}
                    />
                    {/* Registered Customers */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="20"
                      strokeDasharray={`${(registeredCustomers / (registeredCustomers + regularCustomers)) * 251.2} 251.2`}
                      strokeDashoffset={`-${(regularCustomers / (registeredCustomers + regularCustomers)) * 251.2}`}
                    />
                  </svg>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-sm text-black">Regular: {regularCustomers}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-sm text-black">Registered: {registeredCustomers}</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-center mt-8">No customer data yet</p>
            )}
          </div>
        </div>

        {/* Warehouse Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-black mb-4">Warehouse Inventory</h2>
          <div className="space-y-3">
            {warehouseDistribution.length > 0 ? (
              warehouseDistribution.map((warehouse, idx) => {
                const maxQty = Math.max(...warehouseDistribution.map(w => w.quantity), 1);
                const percentage = (warehouse.quantity / maxQty) * 100;
                const colors = ['bg-indigo-500', 'bg-pink-500', 'bg-teal-500', 'bg-orange-500', 'bg-cyan-500'];
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-black font-medium">{warehouse.name}</span>
                      <span className="text-gray-600">{warehouse.quantity} items</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`${colors[idx % colors.length]} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center">No warehouse data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Links and Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick Links */}
        <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-black mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
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
            <Link href="/Sale" className="bg-indigo-500 hover:bg-indigo-600 text-white p-4 rounded-lg text-center font-semibold transition-colors">
              Sales
            </Link>
            <Link href="/Users_Management" className="bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-lg text-center font-semibold transition-colors">
              Users
            </Link>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-bold text-black mb-2 text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="font-bold text-gray-600 py-1">{day}</div>
            ))}
            {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
              <div key={`empty-${idx}`} className="py-1"></div>
            ))}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const isToday = day === today;
              return (
                <div
                  key={day}
                  className={`py-1 rounded ${
                    isToday
                      ? 'bg-[#1E6640] text-white font-bold'
                      : 'text-black hover:bg-gray-100'
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}