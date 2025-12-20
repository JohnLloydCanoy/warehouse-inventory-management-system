from django.urls import path  # Import path for URL routing
from . import views  # Import views from the current app

# Define all URL patterns for the API endpoints
urlpatterns = [
    # Inventory endpoints (main table)
    path('inventory/', views.get_inventory, name='get_inventory'),
    path('inventory/create/', views.create_inventory, name='create_inventory'),
    path('inventory/<int:inventory_id>/update/', views.update_inventory, name='update_inventory'),
    
    # Product category update
    path('products/<int:product_id>/update-category/', views.update_product_category, name='update_product_category'),
    
    # Categories
    path('categories/', views.get_categories, name='get_categories'),
    
    path('api/health/', views.health_check, name='health_check'),  # Health check endpoint
    
    # Product endpoints
    path('api/products/', views.get_products, name='get_products'),  # Get all products
    path('api/products/create/', views.create_product, name='create_product'),  # Create a new product
    path('api/products/<int:product_id>/update/', views.update_product, name='update_product'),  # Update a product
    path('api/products/<int:product_id>/delete/', views.delete_product, name='delete_product'),  # Delete a product
    
    # Category endpoints
    path('api/categories/', views.get_categories, name='get_categories'),  # Get all categories
    path('api/categories/create/', views.create_category, name='create_category'),  # Create a new category
    path('api/categories/<int:category_id>/update/', views.update_category, name='update_category'),  # Update a category
    path('api/categories/<int:category_id>/delete/', views.delete_category, name='delete_category'),  # Delete a category
    
    # Supplier endpoints
    path('api/suppliers/', views.get_suppliers, name='get_suppliers'),  # Get all suppliers
    path('api/suppliers/create/', views.create_supplier, name='create_supplier'),  # Create a new supplier
    path('api/suppliers/<int:supplier_id>/update/', views.update_supplier, name='update_supplier'),  # Update a supplier
    path('api/suppliers/<int:supplier_id>/delete/', views.delete_supplier, name='delete_supplier'),  # Delete a supplier
    
    # Warehouse endpoints
    path('api/warehouses/', views.get_warehouses, name='get_warehouses'),  # Get all warehouses
    path('api/warehouses/create/', views.create_warehouse, name='create_warehouse'),  # Create a new warehouse
    path('api/warehouses/<int:warehouse_id>/update/', views.update_warehouse, name='update_warehouse'),  # Update a warehouse
    path('api/warehouses/<int:warehouse_id>/delete/', views.delete_warehouse, name='delete_warehouse'),  # Delete a warehouse
    
    # Inventory endpoints
    path('api/inventory/', views.get_inventory, name='get_inventory'),  # Get all inventory
    path('api/inventory/create/', views.create_inventory, name='create_inventory'),  # Create a new inventory entry
    path('api/inventory/<int:inventory_id>/update/', views.update_inventory, name='update_inventory'),  # Update an inventory entry
    path('api/inventory/<int:inventory_id>/delete/', views.delete_inventory, name='delete_inventory'),  # Delete an inventory entry

    
    # Order endpoints
    path('api/orders/', views.get_orders, name='get_orders'),  # Get all orders
    path('api/orders/create/', views.create_order, name='create_order'),  # Create a new order
    path('api/orders/<int:order_id>/update/', views.update_order, name='update_order'),  # Update an order
    path('api/orders/<int:order_id>/delete/', views.delete_order, name='delete_order'),  # Delete an order
    
    # Order Item endpoints
    path('api/order-items/', views.get_order_items, name='get_order_items'),  # Get all order items
    path('api/order-items/create/', views.create_order_item, name='create_order_item'),  # Create a new order item
    path('api/order-items/<int:order_item_id>/update/', views.update_order_item, name='update_order_item'),  # Update an order item
    path('api/order-items/<int:order_item_id>/delete/', views.delete_order_item, name='delete_order_item'),  # Delete an order item
    
    # User endpoints
    path('api/users/', views.get_users, name='get_users'),  # Get all users
    path('api/users/create/', views.create_user, name='create_user'),  # Create a new user
    path('api/users/<int:user_id>/update/', views.update_user, name='update_user'),  # Update a user
    path('api/users/<int:user_id>/delete/', views.delete_user, name='delete_user'),  # Delete a user
    
    # Authentication endpoint
    path('api/auth/login', views.login, name='login'),  # User login
    
    # Product category update endpoint
    path('products/<int:product_id>/update-category/', views.update_product_category, name='update_product_category'),  # Update a product's category
]