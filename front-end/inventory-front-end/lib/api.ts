const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

console.log('API_BASE_URL:', API_BASE_URL);

// ==================== INTERFACES ====================

export interface Product {
  id: string;
  product_id: number;
  name: string;
  description: string;
  categoryId: string;
  supplierId: string;
  unitPrice: string;
  sku: string;
  costPrice: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  category_id: number;
  name: string;
  description: string;
}

export interface Supplier {
  id: string;
  supplier_id: number;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Warehouse {
  id: string;
  warehouse_id: number;
  name: string;
  location: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Inventory {
  id: string;
  inventory_id: number;
  productId: string;
  warehouseId: string;
  productName?: string;
  warehouseName?: string;
  quantity: number;
  Category?: string;
  lastUpdated?: string;
  createdAt?: string;
  // Backend also returns these snake_case versions
  product_id?: number;
  warehouse_id?: number;
}

export interface Order {
  id: string;
  order_id: number;
  orderDate: string;
  supplierId: string;
  customerName?: string;
  status: string;
  totalAmount: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  id: string;
  order_item_id: number;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  createdAt?: string;
}

export interface User {
  id: string;
  user_id: number;
  username: string;
  email: string;
  password?: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

// ==================== HELPER FUNCTIONS & API CALLS ====================

async function fetchFromBackend(endpoint: string, options?: RequestInit) {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log('Fetching:', url);
  console.log('Options:', options);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error Response:', errorData);
      const errorMessage = errorData.message || errorData.error || `API error: ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Response data:', data);
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Cannot connect to backend. Make sure Django is running on http://localhost:8000');
    }
    throw error;
  }
}

export async function healthCheck() {
  return fetchFromBackend('/api/health/');
}

// ==================== PRODUCT API ====================

export async function getProducts(): Promise<{ products: Product[] }> {
  return fetchFromBackend('/api/products/');
}

export async function createProduct(product: Omit<Product, 'id' | 'product_id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; product: Product }> {
  return fetchFromBackend('/api/products/create/', {
    method: 'POST',
    body: JSON.stringify(product),
  });
}

export async function updateProduct(productId: number, product: Partial<Product>): Promise<{ success: boolean; product: Product }> {
  return fetchFromBackend(`/api/products/${productId}/update/`, {
    method: 'PUT',
    body: JSON.stringify(product),
  });
}

export async function deleteProduct(productId: number): Promise<{ success: boolean; message: string }> {
  return fetchFromBackend(`/api/products/${productId}/delete/`, {
    method: 'DELETE',
  });
}

// ==================== CATEGORY API ====================

export async function getCategories(): Promise<{ categories: Category[] }> {
  return fetchFromBackend('/api/categories/');
}

export async function createCategory(category: Omit<Category, 'id' | 'category_id'>): Promise<{ success: boolean; category: Category }> {
  return fetchFromBackend('/api/categories/create/', {
    method: 'POST',
    body: JSON.stringify(category),
  });
}

export async function updateCategory(categoryId: number, category: Partial<Category>): Promise<{ success: boolean; category: Category }> {
  return fetchFromBackend(`/api/categories/${categoryId}/update/`, {
    method: 'PUT',
    body: JSON.stringify(category),
  });
}

export async function deleteCategory(categoryId: number): Promise<{ success: boolean; message: string }> {
  return fetchFromBackend(`/api/categories/${categoryId}/delete/`, {
    method: 'DELETE',
  });
}

// ==================== SUPPLIER API ====================

export async function getSuppliers(): Promise<{ suppliers: Supplier[] }> {
  return fetchFromBackend('/api/suppliers/');
}

export async function createSupplier(supplier: Omit<Supplier, 'id' | 'supplier_id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; supplier: Supplier }> {
  return fetchFromBackend('/api/suppliers/create/', {
    method: 'POST',
    body: JSON.stringify(supplier),
  });
}

export async function updateSupplier(supplierId: number, supplier: Partial<Supplier>): Promise<{ success: boolean; supplier: Supplier }> {
  return fetchFromBackend(`/api/suppliers/${supplierId}/update/`, {
    method: 'PUT',
    body: JSON.stringify(supplier),
  });
}

export async function deleteSupplier(supplierId: number): Promise<{ success: boolean; message: string }> {
  return fetchFromBackend(`/api/suppliers/${supplierId}/delete/`, {
    method: 'DELETE',
  });
}

// ==================== WAREHOUSE API ====================

export async function getWarehouses(): Promise<{ warehouses: Warehouse[] }> {
  return fetchFromBackend('/api/warehouses/');
}

export async function createWarehouse(warehouse: Omit<Warehouse, 'id' | 'warehouse_id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; warehouse: Warehouse }> {
  return fetchFromBackend('/api/warehouses/create/', {
    method: 'POST',
    body: JSON.stringify(warehouse),
  });
}

export async function updateWarehouse(warehouseId: number, warehouse: Partial<Warehouse>): Promise<{ success: boolean; warehouse: Warehouse }> {
  return fetchFromBackend(`/api/warehouses/${warehouseId}/update/`, {
    method: 'PUT',
    body: JSON.stringify(warehouse),
  });
}

export async function deleteWarehouse(warehouseId: number): Promise<{ success: boolean; message: string }> {
  return fetchFromBackend(`/api/warehouses/${warehouseId}/delete/`, {
    method: 'DELETE',
  });
}

// ==================== INVENTORY API ====================

export async function getInventory(): Promise<{ inventories: Inventory[] }> {
  return fetchFromBackend('/api/inventory/');
}

export async function createInventory(inventory: Omit<Inventory, 'id' | 'inventory_id' | 'lastUpdated' | 'createdAt' | 'productName' | 'warehouseName'>): Promise<{ success: boolean; inventory: Inventory }> {
  return fetchFromBackend('/api/inventory/create/', {
    method: 'POST',
    body: JSON.stringify(inventory),
  });
}

export async function updateInventory(inventoryId: number, inventory: Partial<Inventory>): Promise<{ success: boolean; inventory: Inventory }> {
  return fetchFromBackend(`/api/inventory/${inventoryId}/update/`, {
    method: 'PUT',
    body: JSON.stringify(inventory),
  });
}

export async function deleteInventory(inventoryId: number): Promise<{ success: boolean; message: string }> {
  return fetchFromBackend(`/api/inventory/${inventoryId}/delete/`, {
    method: 'DELETE',
  });
}

// ==================== ORDER API ====================

export async function getOrders(): Promise<{ orders: Order[] }> {
  return fetchFromBackend('/api/orders/');
}

export async function createOrder(order: Omit<Order, 'id' | 'order_id' | 'orderDate' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; order: Order }> {
  return fetchFromBackend('/api/orders/create/', {
    method: 'POST',
    body: JSON.stringify(order),
  });
}

export async function updateOrder(orderId: number, order: Partial<Order>): Promise<{ success: boolean; order: Order }> {
  return fetchFromBackend(`/api/orders/${orderId}/update/`, {
    method: 'PUT',
    body: JSON.stringify(order),
  });
}

export async function deleteOrder(orderId: number): Promise<{ success: boolean; message: string }> {
  return fetchFromBackend(`/api/orders/${orderId}/delete/`, {
    method: 'DELETE',
  });
}

// ==================== ORDER ITEM API ====================

export async function getOrderItems(): Promise<{ orderItems: OrderItem[] }> {
  return fetchFromBackend('/api/order-items/');
}

export async function createOrderItem(orderItem: Omit<OrderItem, 'id' | 'order_item_id' | 'subtotal' | 'createdAt'>): Promise<{ success: boolean; orderItem: OrderItem }> {
  return fetchFromBackend('/api/order-items/create/', {
    method: 'POST',
    body: JSON.stringify(orderItem),
  });
}

export async function updateOrderItem(orderItemId: number, orderItem: Partial<OrderItem>): Promise<{ success: boolean; orderItem: OrderItem }> {
  return fetchFromBackend(`/api/order-items/${orderItemId}/update/`, {
    method: 'PUT',
    body: JSON.stringify(orderItem),
  });
}

export async function deleteOrderItem(orderItemId: number): Promise<{ success: boolean; message: string }> {
  return fetchFromBackend(`/api/order-items/${orderItemId}/delete/`, {
    method: 'DELETE',
  });
}

// ==================== USER API ====================

export async function getUsers(): Promise<{ users: User[] }> {
  return fetchFromBackend('/api/users/');
}

export async function createUser(user: Omit<User, 'id' | 'user_id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; user: User }> {
  return fetchFromBackend('/api/users/create/', {
    method: 'POST',
    body: JSON.stringify(user),
  });
}

export async function updateUser(userId: number, user: Partial<User>): Promise<{ success: boolean; user: User }> {
  return fetchFromBackend(`/api/users/${userId}/update/`, {
    method: 'PUT',
    body: JSON.stringify(user),
  });
}

export async function deleteUser(userId: number): Promise<{ success: boolean; message: string }> {
  return fetchFromBackend(`/api/users/${userId}/delete/`, {
    method: 'DELETE',
  });
}

export type { Warehouse };
