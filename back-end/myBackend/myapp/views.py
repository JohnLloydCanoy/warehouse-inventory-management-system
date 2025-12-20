# 

# Import JsonResponse to send JSON data as a response
from django.http import JsonResponse
# Decorator to allow requests without CSRF token (for APIs)
from django.views.decorators.csrf import csrf_exempt
# Decorator to specify allowed HTTP methods for a view
from django.views.decorators.http import require_http_methods
# Exception for when an object is not found in the database
from django.core.exceptions import ObjectDoesNotExist
# Import json to parse request bodies
import json
# Import all models used in the app
from .models import Product, Category, Supplier, Warehouse, Inventory, Order, OrderItem, User
# Import datetime for formatting dates
from datetime import datetime


# Helper function to format datetime objects to 12-hour format with AM/PM
def format_datetime_12hr(dt):
    if dt:
        return dt.strftime("%Y-%m-%d %I:%M:%S %p")  # Format date and time
    return ""  # Return empty string if no date


# Health check endpoint to verify backend is running
@csrf_exempt
@require_http_methods(["GET"])
def health_check(request):
    return JsonResponse({
        "status": "ok",  # Status message
        "message": "Backend is running",  # Custom message
        "database": "connected"  # Simulated DB status
    })

# ==================== PRODUCT VIEWS ====================

# Get all products from the database
@csrf_exempt
@require_http_methods(["GET"])
def get_products(request):
    try:
        products = Product.objects.all()  # Query all products
        products_list = []  # List to store product data
        
        for product in products:
            # Look up category name if category_id exists
            category_name = ""
            if product.category_id:
                try:
                    category = Category.objects.get(category_id=product.category_id)
                    category_name = category.category_name
                except Category.DoesNotExist:
                    category_name = ""
            
            # Add each product's details to the list
            products_list.append({
                "id": f"P{str(product.product_id).zfill(3)}",  # Custom product ID with leading zeros
                "product_id": product.product_id,  # Database product ID
                "name": product.product_name,  # Product name
                "description": product.description or "",  # Description or empty
                "categoryId": str(product.category_id) if product.category_id else "",  # Category ID as string
                "categoryName": category_name,  # Category name
                "supplierId": str(product.supplier_id) if product.supplier_id else "",  # Supplier ID as string
                "unitPrice": f"₱{float(product.unit_price):,.2f}",  # Price formatted with peso sign
                "sku": product.sku,  # SKU code
                "costPrice": f"₱{float(product.cost_price):,.2f}" if product.cost_price else "₱0.00",  # Cost price
                "createdAt": format_datetime_12hr(product.created_at),  # Created date
                "updatedAt": format_datetime_12hr(product.updated_at)  # Updated date
            })
        
        return JsonResponse({"products": products_list})  # Return all products as JSON
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)  # Return error if any


# Create a new product in the database
@csrf_exempt  # Allow requests without CSRF token (for API use)
@require_http_methods(["POST"])  # Only allow POST requests
def create_product(request):
    """Create a new product"""
    try:
        # Parse the JSON body from the request
        data = json.loads(request.body)
        
        # Convert unit price from string (with peso sign and commas) to float
        unit_price = float(data.get('unitPrice', '0').replace('₱', '').replace(',', ''))
        # Convert cost price from string (with peso sign and commas) to float
        cost_price = float(data.get('costPrice', '0').replace('₱', '').replace(',', ''))
        
        # Create a new Product object with the provided data
        product = Product(
            product_name=data.get('name'),  # Set product name
            description=data.get('description', ''),  # Set description (default empty)
            category_id=int(data.get('categoryId')) if data.get('categoryId') else None,  # Set category ID if provided
            supplier_id=int(data.get('supplierId')) if data.get('supplierId') else None,  # Set supplier ID if provided
            unit_price=unit_price,  # Set unit price
            sku=data.get('sku'),  # Set SKU
            cost_price=cost_price  # Set cost price
        )
        product.save()  # Save the product to the database
        
        # Return a JSON response with the new product's details
        return JsonResponse({
            "success": True,  # Indicate success
            "product": {
                "id": f"P{str(product.product_id).zfill(3)}",  # Custom product ID with leading zeros
                "product_id": product.product_id,  # Database product ID
                "name": product.product_name,  # Product name
                "description": product.description,  # Description
                "categoryId": str(product.category_id) if product.category_id else "",  # Category ID as string
                "supplierId": str(product.supplier_id) if product.supplier_id else "",  # Supplier ID as string
                "unitPrice": f"₱{float(product.unit_price):,.2f}",  # Unit price formatted
                "sku": product.sku,  # SKU
                "costPrice": f"₱{float(product.cost_price):,.2f}" if product.cost_price else "₱0.00",  # Cost price formatted
                "createdAt": format_datetime_12hr(product.created_at),  # Created date
                "updatedAt": format_datetime_12hr(product.updated_at)  # Updated date
            }
        }, status=201)
    except Exception as e:
        # If any error occurs, return an error message
        return JsonResponse({"error": str(e)}, status=400)


# Update an existing product in the database
@csrf_exempt  # Allow requests without CSRF token (for API use)
@require_http_methods(["PUT"])  # Only allow PUT requests
def update_product(request, product_id):
    """Update an existing product"""
    try:
        # Find the product in the database by its ID
        product = Product.objects.get(product_id=product_id)
        # Parse the JSON body from the request
        data = json.loads(request.body)
        
        # Update product name if provided, otherwise keep the old value
        product.product_name = data.get('name', product.product_name)
        # Update description if provided
        product.description = data.get('description', product.description)
        # Update category ID if provided
        product.category_id = int(data.get('categoryId')) if data.get('categoryId') else product.category_id
        # Update supplier ID if provided
        product.supplier_id = int(data.get('supplierId')) if data.get('supplierId') else product.supplier_id
        # Update unit price (convert from string with peso sign/commas to float)
        product.unit_price = float(data.get('unitPrice', product.unit_price).replace('₱', '').replace(',', ''))
        # Update SKU if provided
        product.sku = data.get('sku', product.sku)
        # Update cost price (convert from string with peso sign/commas to float)
        product.cost_price = float(data.get('costPrice', product.cost_price).replace('₱', '').replace(',', ''))
        
        product.save()  # Save the updated product to the database
        
        # Return a JSON response with the updated product's details
        return JsonResponse({
            "success": True,  # Indicate success
            "product": {
                "id": f"P{str(product.product_id).zfill(3)}",  # Custom product ID with leading zeros
                "product_id": product.product_id,  # Database product ID
                "name": product.product_name,  # Product name
                "description": product.description,  # Description
                "categoryId": str(product.category_id) if product.category_id else "",  # Category ID as string
                "supplierId": str(product.supplier_id) if product.supplier_id else "",  # Supplier ID as string
                "unitPrice": f"₱{float(product.unit_price):,.2f}",  # Unit price formatted
                "sku": product.sku,  # SKU
                "costPrice": f"₱{float(product.cost_price):,.2f}" if product.cost_price else "₱0.00",  # Cost price formatted
                "createdAt": format_datetime_12hr(product.created_at),  # Created date
                "updatedAt": format_datetime_12hr(product.updated_at)  # Updated date
            }
        })
    except ObjectDoesNotExist:
        # If the product does not exist, return a 404 error
        return JsonResponse({"error": "Product not found"}, status=404)
    except Exception as e:
        # If any other error occurs, return an error message
        return JsonResponse({"error": str(e)}, status=400)


# Delete a product from the database
@csrf_exempt  # Allow requests without CSRF token (for API use)
@require_http_methods(["DELETE"])  # Only allow DELETE requests
def delete_product(request, product_id):
    """Delete a product"""
    try:
        # Find the product in the database by its ID
        product = Product.objects.get(product_id=product_id)
        product.delete()  # Delete the product from the database
        # Return a success message
        return JsonResponse({"success": True, "message": "Product deleted successfully"})
    except ObjectDoesNotExist:
        # If the product does not exist, return a 404 error
        return JsonResponse({"error": "Product not found"}, status=404)
    except Exception as e:
        # If any other error occurs, return an error message
        return JsonResponse({"error": str(e)}, status=400)

# ==================== CATEGORY VIEWS ====================

# Get all categories from the database
@csrf_exempt  # Allow requests without CSRF token (for API use)
@require_http_methods(["GET"])  # Only allow GET requests
def get_categories(request):
    """Get all categories"""
    try:
        categories = Category.objects.all()  # Query all categories
        categories_list = []  # List to store category data
        
        for cat in categories:
            # Add each category's details to the list
            categories_list.append({
                "id": f"C{str(cat.category_id).zfill(3)}",  # Custom category ID with leading zeros
                "category_id": cat.category_id,  # Database category ID
                "name": cat.category_name,  # Category name (send as 'name' to frontend)
                "description": cat.description or ""  # Description or empty
            })
        
        return JsonResponse({"categories": categories_list})  # Return all categories as JSON
    except Exception as e:
        # If any error occurs, return an error message
        return JsonResponse({"error": str(e)}, status=500)


# Create a new category in the database
@csrf_exempt  # Allow requests without CSRF token (for API use)
@require_http_methods(["POST"])  # Only allow POST requests
def create_category(request):
    """Create a new category"""
    try:
        # Parse the JSON body from the request
        data = json.loads(request.body)
        
        # Create a new Category object with the provided data
        category = Category(
            category_name=data.get('name'),  # Frontend sends 'name', save as 'category_name'
            description=data.get('description', '')  # Set description (default empty)
        )
        category.save()  # Save the category to the database
        
        # Return a JSON response with the new category's details
        return JsonResponse({
            "success": True,  # Indicate success
            "category": {
                "id": f"C{str(category.category_id).zfill(3)}",  # Custom category ID with leading zeros
                "category_id": category.category_id,  # Database category ID
                "name": category.category_name,  # Return as 'name' to frontend
                "description": category.description  # Description
            }
        }, status=201)
    except Exception as e:
        # If any error occurs, return an error message
        return JsonResponse({"error": str(e)}, status=400)


# Update an existing category in the database
@csrf_exempt  # Allow requests without CSRF token (for API use)
@require_http_methods(["PUT"])  # Only allow PUT requests
def update_category(request, category_id):
    """Update an existing category"""
    try:
        # Find the category in the database by its ID
        category = Category.objects.get(category_id=category_id)
        # Parse the JSON body from the request
        data = json.loads(request.body)
        
        # Update category name if provided, otherwise keep the old value
        category.category_name = data.get('name', category.category_name)  # Frontend sends 'name'
        # Update description if provided
        category.description = data.get('description', category.description)
        
        category.save()  # Save the updated category to the database
        
        # Return a JSON response with the updated category's details
        return JsonResponse({
            "success": True,  # Indicate success
            "category": {
                "id": f"C{str(category.category_id).zfill(3)}",  # Custom category ID with leading zeros
                "category_id": category.category_id,  # Database category ID
                "name": category.category_name,  # Return as 'name' to frontend
                "description": category.description  # Description
            }
        })
    except ObjectDoesNotExist:
        # If the category does not exist, return a 404 error
        return JsonResponse({"error": "Category not found"}, status=404)
    except Exception as e:
        # If any other error occurs, return an error message
        return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
@require_http_methods(["DELETE"])
def delete_category(request, category_id):
    """Delete a category"""
    try:
        category = Category.objects.get(category_id=category_id)
        category.delete()
        return JsonResponse({"success": True, "message": "Category deleted successfully"})
    except ObjectDoesNotExist:
        return JsonResponse({"error": "Category not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

# ==================== SUPPLIER VIEWS ====================
@csrf_exempt  # Allow requests without CSRF token (for API use)
@require_http_methods(["GET"])  # Only allow GET requests
def get_suppliers(request):
    """Get all suppliers"""
    try:
        suppliers = Supplier.objects.all()  # Query all suppliers from the database
        suppliers_list = []  # List to store supplier data
        
        for sup in suppliers:
            # Add each supplier's details to the list
            suppliers_list.append({
                "id": f"S{str(sup.supplier_id).zfill(3)}",  # Custom supplier ID with leading zeros
                "supplier_id": sup.supplier_id,  # Database supplier ID
                "name": sup.supplier_name,  # Supplier name
                "email": getattr(sup, 'email', '') or "",  # Email or empty string
                "phone": sup.phone or "",  # Phone or empty string
                "address": sup.address or "",  # Address or empty string
                "createdAt": format_datetime_12hr(getattr(sup, 'created_at', None)),  # Created date
                "updatedAt": format_datetime_12hr(getattr(sup, 'updated_at', None))  # Updated date
            })
        
        return JsonResponse({"suppliers": suppliers_list})  # Return all suppliers as JSON
    except Exception as e:
        # If any error occurs, return an error message
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt  # Allow requests without CSRF token (for API use)
@require_http_methods(["POST"])  # Only allow POST requests
def create_supplier(request):
    """Create a new supplier"""
    try:
        data = json.loads(request.body)  # Parse the JSON body from the request
        
        # Create a new Supplier object with the provided data
        supplier = Supplier(
            supplier_name=data.get('name'),  # Set supplier name
        )
        # Set optional fields if they exist in the model
        if hasattr(Supplier, 'email'):
            supplier.email = data.get('email', '')  # Set email or empty string
        if hasattr(Supplier, 'phone'):
            supplier.phone = data.get('phone', '')  # Set phone or empty string
        if hasattr(Supplier, 'address'):
            supplier.address = data.get('address', '')  # Set address or empty string
        supplier.save()  # Save the supplier to the database
        
        # Return a JSON response with the new supplier's details
        return JsonResponse({
            "success": True,  # Indicate success
            "supplier": {
                "id": f"S{str(supplier.supplier_id).zfill(3)}",  # Custom supplier ID with leading zeros
                "supplier_id": supplier.supplier_id,  # Database supplier ID
                "name": supplier.supplier_name,  # Supplier name
                "email": getattr(supplier, 'email', ''),  # Email
                "phone": getattr(supplier, 'phone', ''),  # Phone
                "address": getattr(supplier, 'address', ''),  # Address
                "createdAt": format_datetime_12hr(getattr(supplier, 'created_at', None)),  # Created date
                "updatedAt": format_datetime_12hr(getattr(supplier, 'updated_at', None))  # Updated date
            }
        }, status=201)
    except Exception as e:
        # If any error occurs, return an error message
        return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt  # Allow requests without CSRF token (for API use)
@require_http_methods(["PUT"])  # Only allow PUT requests
def update_supplier(request, supplier_id):
    """Update an existing supplier"""
    try:
        supplier = Supplier.objects.get(supplier_id=supplier_id)  # Find the supplier by its ID
        data = json.loads(request.body)  # Parse the JSON body from the request
        
        supplier.supplier_name = data.get('name', supplier.supplier_name)  # Update name if provided
        if hasattr(supplier, 'email'):
            supplier.email = data.get('email', supplier.email)  # Update email if provided
        if hasattr(supplier, 'phone'):
            supplier.phone = data.get('phone', supplier.phone)  # Update phone if provided
        if hasattr(supplier, 'address'):
            supplier.address = data.get('address', supplier.address)  # Update address if provided
        
        supplier.save()  # Save the updated supplier to the database
        
        # Return a JSON response with the updated supplier's details
        return JsonResponse({
            "success": True,  # Indicate success
            "supplier": {
                "id": f"S{str(supplier.supplier_id).zfill(3)}",  # Custom supplier ID with leading zeros
                "supplier_id": supplier.supplier_id,  # Database supplier ID
                "name": supplier.supplier_name,  # Supplier name
                "email": getattr(supplier, 'email', ''),  # Email
                "phone": getattr(supplier, 'phone', ''),  # Phone
                "address": getattr(supplier, 'address', ''),  # Address
                "createdAt": format_datetime_12hr(getattr(supplier, 'created_at', None)),  # Created date
                "updatedAt": format_datetime_12hr(getattr(supplier, 'updated_at', None))  # Updated date
            }
        })
    except ObjectDoesNotExist:
        # If the supplier does not exist, return a 404 error
        return JsonResponse({"error": "Supplier not found"}, status=404)
    except Exception as e:
        # If any other error occurs, return an error message
        return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt  # Allow requests without CSRF token (for API use)
@require_http_methods(["DELETE"])  # Only allow DELETE requests
def delete_supplier(request, supplier_id):
    """Delete a supplier"""
    try:
        supplier = Supplier.objects.get(supplier_id=supplier_id)  # Find the supplier by its ID
        supplier.delete()  # Delete the supplier from the database
        # Return a success message
        return JsonResponse({"success": True, "message": "Supplier deleted successfully"})
    except ObjectDoesNotExist:
        # If the supplier does not exist, return a 404 error
        return JsonResponse({"error": "Supplier not found"}, status=404)
    except Exception as e:
        # If any other error occurs, return an error message
        return JsonResponse({"error": str(e)}, status=400)

# ==================== WAREHOUSE VIEWS ====================
@csrf_exempt  # Allow requests without CSRF token (for API use)
@require_http_methods(["GET"])  # Only allow GET requests
def get_warehouses(request):
    """Get all warehouses"""
    try:
        warehouses = Warehouse.objects.all()  # Query all warehouses from the database
        warehouses_list = []  # List to store warehouse data
        
        for wh in warehouses:
            # Add each warehouse's details to the list
            warehouses_list.append({
                "id": f"W{str(wh.warehouse_id).zfill(3)}",  # Custom warehouse ID with leading zeros
                "warehouse_id": wh.warehouse_id,  # Database warehouse ID
                "name": wh.warehouse_name,  # Warehouse name
                "location": wh.location or "",  # Location or empty string
                "createdAt": format_datetime_12hr(wh.created_at),  # Created date
                "updatedAt": format_datetime_12hr(wh.updated_at)  # Updated date
            })
        
        return JsonResponse({"warehouses": warehouses_list})  # Return all warehouses as JSON
    except Exception as e:
        # If any error occurs, return an error message
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt  # Allow requests without CSRF token (for API use)
@require_http_methods(["POST"])  # Only allow POST requests
def create_warehouse(request):
    """Create a new warehouse"""
    try:
        data = json.loads(request.body)  # Parse the JSON body from the request
        
        # Create a new Warehouse object with the provided data
        warehouse = Warehouse(
            warehouse_name=data.get('name'),  # Set warehouse name
            location=data.get('location', '')  # Set location (default empty)
        )
        warehouse.save()  # Save the warehouse to the database
        
        # Return a JSON response with the new warehouse's details
        return JsonResponse({
            "success": True,  # Indicate success
            "warehouse": {
                "id": f"W{str(warehouse.warehouse_id).zfill(3)}",  # Custom warehouse ID with leading zeros
                "warehouse_id": warehouse.warehouse_id,  # Database warehouse ID
                "name": warehouse.warehouse_name,  # Warehouse name
                "location": warehouse.location,  # Location
                "createdAt": format_datetime_12hr(warehouse.created_at),  # Created date
                "updatedAt": format_datetime_12hr(warehouse.updated_at)  # Updated date
            }
        }, status=201)
    except Exception as e:
        # If any error occurs, return an error message
        return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt  # Allow requests without CSRF token (for API use)
@require_http_methods(["PUT"])  # Only allow PUT requests
def update_warehouse(request, warehouse_id):
    """Update an existing warehouse"""
    try:
        warehouse = Warehouse.objects.get(warehouse_id=warehouse_id)  # Find the warehouse by its ID
        data = json.loads(request.body)  # Parse the JSON body from the request
        
        warehouse.warehouse_name = data.get('name', warehouse.warehouse_name)  # Update name if provided
        warehouse.location = data.get('location', warehouse.location)  # Update location if provided
        
        warehouse.save()  # Save the updated warehouse to the database
        
        # Return a JSON response with the updated warehouse's details
        return JsonResponse({
            "success": True,  # Indicate success
            "warehouse": {
                "id": f"W{str(warehouse.warehouse_id).zfill(3)}",  # Custom warehouse ID with leading zeros
                "warehouse_id": warehouse.warehouse_id,  # Database warehouse ID
                "name": warehouse.warehouse_name,  # Warehouse name
                "location": warehouse.location,  # Location
                "createdAt": format_datetime_12hr(warehouse.created_at),  # Created date
                "updatedAt": format_datetime_12hr(warehouse.updated_at)  # Updated date
            }
        })
    except ObjectDoesNotExist:
        # If the warehouse does not exist, return a 404 error
        return JsonResponse({"error": "Warehouse not found"}, status=404)
    except Exception as e:
        # If any other error occurs, return an error message
        return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt  # Allow requests without CSRF token (for API use)
@require_http_methods(["DELETE"])  # Only allow DELETE requests
def delete_warehouse(request, warehouse_id):
    """Delete a warehouse"""
    try:
        warehouse = Warehouse.objects.get(warehouse_id=warehouse_id)  # Find the warehouse by its ID
        warehouse.delete()  # Delete the warehouse from the database
        # Return a success message
        return JsonResponse({"success": True, "message": "Warehouse deleted successfully"})
    except ObjectDoesNotExist:
        # If the warehouse does not exist, return a 404 error
        return JsonResponse({"error": "Warehouse not found"}, status=404)
    except Exception as e:
        # If any other error occurs, return an error message
        return JsonResponse({"error": str(e)}, status=400)


# ==================== INVENTORY VIEWS ====================
@require_http_methods(["GET"])
def get_inventory(request):
    """Get all inventory items with related product, category, supplier, and warehouse data"""
    inventories = Inventory.objects.all()
    
    # Get all related data in one query each for efficiency
    product_ids = [inv.product_id for inv in inventories]
    warehouse_ids = [inv.warehouse_id for inv in inventories]
    
    products = {p.product_id: p for p in Product.objects.filter(product_id__in=product_ids)}
    warehouses = {w.warehouse_id: w for w in Warehouse.objects.filter(warehouse_id__in=warehouse_ids)}
    
    # Get category and supplier IDs from products
    category_ids = [p.category_id for p in products.values() if p.category_id]
    supplier_ids = [p.supplier_id for p in products.values() if p.supplier_id]
    
    categories = {c.category_id: c for c in Category.objects.filter(category_id__in=category_ids)}
    suppliers = {s.supplier_id: s for s in Supplier.objects.filter(supplier_id__in=supplier_ids)}
    
    data = []
    for inv in inventories:
        product = products.get(inv.product_id)
        warehouse = warehouses.get(inv.warehouse_id)
        
        if not product or not warehouse:
            continue  # Skip if product or warehouse not found
            
        category = categories.get(product.category_id) if product.category_id else None
        supplier = suppliers.get(product.supplier_id) if product.supplier_id else None
        
        data.append({
            'inventory_id': inv.inventory_id,
            'product_id': product.product_id,
            'product_name': product.product_name,
            'description': product.description,
            'category_id': category.category_id if category else None,
            'category_name': category.category_name if category else 'N/A',
            'supplier_id': supplier.supplier_id if supplier else None,
            'supplier_name': supplier.supplier_name if supplier else 'N/A',
            'warehouse_id': warehouse.warehouse_id,
            'warehouse_name': warehouse.warehouse_name,
            'quantity': inv.quantity,
            'unit_price': str(product.unit_price),
            'cost_price': str(product.cost_price) if product.cost_price else '0',
            'sku': product.sku,
        })
    
    return JsonResponse({'inventories': data}, safe=False)

@csrf_exempt
@require_http_methods(["POST"])
def create_inventory(request):
    """Create new inventory item"""
    data = json.loads(request.body)
    
    try:
        # Extract product_id from either 'product_id' or 'productId'
        product_id_value = data.get('product_id') or data.get('productId')
        warehouse_id_value = data.get('warehouse_id') or data.get('warehouseId')
        
        # Handle different ID formats (P001 -> 1, or just 1)
        if isinstance(product_id_value, str) and product_id_value.startswith('P'):
            product_id_value = int(product_id_value[1:])
        else:
            product_id_value = int(product_id_value)
            
        if isinstance(warehouse_id_value, str) and warehouse_id_value.startswith('W'):
            warehouse_id_value = int(warehouse_id_value[1:])
        else:
            warehouse_id_value = int(warehouse_id_value)
        
        inventory = Inventory.objects.create(
            product_id=product_id_value,
            warehouse_id=warehouse_id_value,
            quantity=data.get('quantity', 0)
        )
        
        return JsonResponse({
            'success': True,
            'status': 'success',
            'inventory_id': inventory.inventory_id
        })
    except Exception as e:
        return JsonResponse({'success': False, 'status': 'error', 'message': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["PUT"])
def update_inventory(request, inventory_id):
    """Update inventory item"""
    try:
        data = json.loads(request.body)
        print(f"Update inventory {inventory_id} with data: {data}")  # Debug logging
        
        inventory = Inventory.objects.get(pk=inventory_id)
        
        # Update quantity if provided
        if 'quantity' in data:
            inventory.quantity = int(data['quantity'])
        
        # Update warehouse_id if provided (handle different formats)
        if 'warehouse_id' in data or 'warehouseId' in data:
            warehouse_id_value = data.get('warehouse_id') or data.get('warehouseId')
            
            # Handle empty string
            if warehouse_id_value == '' or warehouse_id_value is None:
                return JsonResponse({'success': False, 'status': 'error', 'message': 'Warehouse ID cannot be empty'}, status=400)
            
            # Convert to integer
            if isinstance(warehouse_id_value, str):
                if warehouse_id_value.startswith('W'):
                    warehouse_id_value = int(warehouse_id_value[1:])
                else:
                    warehouse_id_value = int(warehouse_id_value)
            else:
                warehouse_id_value = int(warehouse_id_value)
            
            # Verify warehouse exists
            try:
                Warehouse.objects.get(warehouse_id=warehouse_id_value)
                inventory.warehouse_id = warehouse_id_value
            except Warehouse.DoesNotExist:
                return JsonResponse({'success': False, 'status': 'error', 'message': f'Warehouse with ID {warehouse_id_value} does not exist'}, status=400)
        
        inventory.save()
        print(f"Successfully updated inventory {inventory_id}")  # Debug logging
        
        return JsonResponse({'success': True, 'status': 'success'})
    except Inventory.DoesNotExist:
        return JsonResponse({'success': False, 'status': 'error', 'message': 'Inventory not found'}, status=404)
    except ValueError as e:
        return JsonResponse({'success': False, 'status': 'error', 'message': f'Invalid data format: {str(e)}'}, status=400)
    except Exception as e:
        print(f"Error updating inventory: {str(e)}")  # Debug logging
        return JsonResponse({'success': False, 'status': 'error', 'message': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["DELETE"])
def delete_inventory(request, inventory_id):
    """Delete inventory item"""
    try:
        inventory = Inventory.objects.get(pk=inventory_id)
        inventory.delete()
        return JsonResponse({'success': True, 'status': 'success', 'message': 'Inventory deleted successfully'})
    except Inventory.DoesNotExist:
        return JsonResponse({'success': False, 'status': 'error', 'message': 'Inventory not found'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'status': 'error', 'message': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def update_product_category(request, product_id):
    """Update product category"""
    data = json.loads(request.body)
    
    try:
        product = Product.objects.get(pk=product_id)
        # Verify category exists
        Category.objects.get(pk=data['category_id'])
        # Update category_id as integer
        product.category_id = data['category_id']
        product.save()
        
        return JsonResponse({'status': 'success'})
    except (Product.DoesNotExist, Category.DoesNotExist) as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=404)



# ==================== ORDER VIEWS ====================
@csrf_exempt  # Allow requests without CSRF token (for API use)
@require_http_methods(["GET"])  # Only allow GET requests
def get_orders(request):
    """Get all orders from the Database"""
    try:
        orders = Order.objects.all()  # Query all orders from the database
        orders_list = []  # List to store order data
        
        for order in orders:
            # Add each order's details to the list
            orders_list.append({
                "id": f"O{str(order.order_id).zfill(3)}",  # Custom order ID with leading zeros
                "order_id": order.order_id,  # Database order ID
                "orderDate": format_datetime_12hr(order.order_date),  # Order date formatted
                "supplierId": str(order.supplier_id) if order.supplier_id else "",  # Supplier ID as string
                "customerName": order.customer_name or "",  # Customer name
                "status": order.status or "Pending",  # Status or default to Pending
                "totalAmount": f"₱{float(order.total_amount):,.2f}" if order.total_amount else "₱0.00",  # Total amount formatted
            })
        
        return JsonResponse({"orders": orders_list})  # Return all orders as JSON
    except Exception as e:
        # If any error occurs, return an error message
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt  # Allow requests without CSRF token (for API use)
@require_http_methods(["POST"])  # Only allow POST requests
def create_order(request):
    """Create a new order"""
    try:
        data = json.loads(request.body)  # Parse the JSON body from the request
        
        total_amount = float(data.get('totalAmount', '0').replace('₱', '').replace(',', ''))  # Convert total amount to float
        
        # Create a new Order object with the provided data
        order = Order(
            supplier_id=int(data.get('supplierId')) if data.get('supplierId') else None,  # Set supplier ID if provided
            customer_name=data.get('customerName', ''),  # Set customer name if provided
            status=data.get('status', 'Pending'),  # Set status (default Pending)
            total_amount=total_amount  # Set total amount
        )
        order.save()  # Save the order to the database
        
        # Return a JSON response with the new order's details
        return JsonResponse({
            "success": True,  # Indicate success
            "order": {
                "id": f"O{str(order.order_id).zfill(3)}",  # Custom order ID with leading zeros
                "order_id": order.order_id,  # Database order ID
                "orderDate": format_datetime_12hr(order.order_date),  # Order date formatted
                "supplierId": str(order.supplier_id) if order.supplier_id else "",  # Supplier ID as string
                "customerName": order.customer_name or "",  # Customer name
                "status": order.status,  # Status
                "totalAmount": f"₱{float(order.total_amount):,.2f}" if order.total_amount else "₱0.00"  # Total amount formatted
            }
        }, status=201)
    except Exception as e:
        # If any error occurs, return an error message
        return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt  # Allow requests without CSRF token (for API use)
@require_http_methods(["PUT"])  # Only allow PUT requests
def update_order(request, order_id):
    """Update an existing order"""
    try:
        order = Order.objects.get(order_id=order_id)  # Find the order by its ID
        data = json.loads(request.body)  # Parse the JSON body from the request
        
        order.supplier_id = int(data.get('supplierId')) if data.get('supplierId') else order.supplier_id  # Update supplier ID if provided
        order.status = data.get('status', order.status)  # Update status if provided
        order.total_amount = float(data.get('totalAmount', order.total_amount).replace('₱', '').replace(',', ''))  # Update total amount
        
        order.save()  # Save the updated order to the database
        
        # Return a JSON response with the updated order's details
        return JsonResponse({
            "success": True,  # Indicate success
            "order": {
                "id": f"O{str(order.order_id).zfill(3)}",  # Custom order ID with leading zeros
                "order_id": order.order_id,  # Database order ID
                "orderDate": format_datetime_12hr(order.order_date),  # Order date formatted
                "supplierId": str(order.supplier_id) if order.supplier_id else "",  # Supplier ID as string
                "status": order.status,  # Status
                "totalAmount": f"₱{float(order.total_amount):,.2f}" if order.total_amount else "₱0.00"  # Total amount formatted
            }
        })
    except ObjectDoesNotExist:
        # If the order does not exist, return a 404 error
        return JsonResponse({"error": "Order not found"}, status=404)
    except Exception as e:
        # If any other error occurs, return an error message
        return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt  # Allow requests without CSRF token (for API use)
@require_http_methods(["DELETE"])  # Only allow DELETE requests
def delete_order(request, order_id):
    """Delete an order"""
    try:
        order = Order.objects.get(order_id=order_id)  # Find the order by its ID
        order.delete()  # Delete the order from the database
        # Return a success message
        return JsonResponse({"success": True, "message": "Order deleted successfully"})
    except ObjectDoesNotExist:
        # If the order does not exist, return a 404 error
        return JsonResponse({"error": "Order not found"}, status=404)
    except Exception as e:
        # If any other error occurs, return an error message
        return JsonResponse({"error": str(e)}, status=400)

# ==================== ORDER ITEM VIEWS ====================
@csrf_exempt  # Allow requests without CSRF token (for API use)
@require_http_methods(["GET"])  # Only allow GET requests
def get_order_items(request):
    """Get all order items"""
    try:
        order_items = OrderItem.objects.all()  # Query all order items from the database
        order_items_list = []  # List to store order item data
        
        for item in order_items:
            # Add each order item's details to the list
            order_items_list.append({
                "id": f"OI{str(item.order_item_id).zfill(3)}",  # Custom order item ID with leading zeros
                "order_item_id": item.order_item_id,  # Database order item ID
                "orderId": str(item.order_id),  # Order ID as string
                "productId": str(item.product_id),  # Product ID as string
                "quantity": item.quantity,  # Quantity
                "unitPrice": f"₱{float(item.unit_price):,.2f}",  # Unit price formatted
            })
        
        return JsonResponse({"orderItems": order_items_list})  # Return all order items as JSON
    except Exception as e:
        # If any error occurs, return an error message
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt  # Allow requests without CSRF token (for API use)
@require_http_methods(["POST"])  # Only allow POST requests
def create_order_item(request):
    """Create a new order item"""
    try:
        data = json.loads(request.body)  # Parse the JSON body from the request
        
        unit_price = float(data.get('unitPrice', '0').replace('₱', '').replace(',', ''))  # Convert unit price to float
        quantity = int(data.get('quantity', 0))  # Convert quantity to int
        product_id = int(data.get('productId'))  # Get product ID
        
        # Update inventory - reduce quantity
        inventory_records = Inventory.objects.filter(product_id=product_id)
        if inventory_records.exists():
            # Update the first matching inventory record
            inventory = inventory_records.first()
            if inventory.quantity >= quantity:
                inventory.quantity -= quantity
                inventory.save()
            else:
                return JsonResponse({
                    "error": f"Insufficient inventory. Available: {inventory.quantity}, Requested: {quantity}"
                }, status=400)
        else:
            return JsonResponse({
                "error": f"No inventory record found for product ID {product_id}"
            }, status=400)
        
        # Create a new OrderItem object with the provided data
        order_item = OrderItem(
            order_id=int(data.get('orderId')),  # Set order ID (convert to int)
            product_id=product_id,  # Set product ID
            quantity=quantity,  # Set quantity
            unit_price=unit_price,  # Set unit price
        )
        order_item.save()  # Save the order item to the database
        
        # Return a JSON response with the new order item's details
        return JsonResponse({
            "success": True,  # Indicate success
            "orderItem": {
                "id": f"OI{str(order_item.order_item_id).zfill(3)}",  # Custom order item ID with leading zeros
                "order_item_id": order_item.order_item_id,  # Database order item ID
                "orderId": str(order_item.order_id),  # Order ID as string
                "productId": str(order_item.product_id),  # Product ID as string
                "quantity": order_item.quantity,  # Quantity
                "unitPrice": f"₱{float(order_item.unit_price):,.2f}",  # Unit price formatted
            }
        }, status=201)
    except Exception as e:
        # If any error occurs, return an error message
        return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt  # Allow requests without CSRF token (for API use)
@require_http_methods(["PUT"])  # Only allow PUT requests
def update_order_item(request, order_item_id):
    """Update an existing order item"""
    try:
        order_item = OrderItem.objects.get(order_item_id=order_item_id)  # Find the order item by its ID
        data = json.loads(request.body)  # Parse the JSON body from the request
        
        order_item.order_id = int(data.get('orderId', order_item.order_id))  # Update order ID if provided
        order_item.product_id = int(data.get('productId', order_item.product_id))  # Update product ID if provided
        order_item.quantity = int(data.get('quantity', order_item.quantity))  # Update quantity if provided
        order_item.unit_price = float(data.get('unitPrice', order_item.unit_price).replace('₱', '').replace(',', ''))  # Update unit price
        
        order_item.save()  # Save the updated order item to the database
        
        # Return a JSON response with the updated order item's details
        return JsonResponse({
            "success": True,  # Indicate success
            "orderItem": {
                "id": f"OI{str(order_item.order_item_id).zfill(3)}",  # Custom order item ID with leading zeros
                "order_item_id": order_item.order_item_id,  # Database order item ID
                "orderId": str(order_item.order_id),  # Order ID as string
                "productId": str(order_item.product_id),  # Product ID as string
                "quantity": order_item.quantity,  # Quantity
                "unitPrice": f"₱{float(order_item.unit_price):,.2f}",  # Unit price formatted
            }
        })
    except ObjectDoesNotExist:
        # If the order item does not exist, return a 404 error
        return JsonResponse({"error": "Order item not found"}, status=404)
    except Exception as e:
        # If any other error occurs, return an error message
        return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt  # Allow requests without CSRF token (for API use)
@require_http_methods(["DELETE"])  # Only allow DELETE requests
def delete_order_item(request, order_item_id):
    """Delete an order item"""
    try:
        order_item = OrderItem.objects.get(order_item_id=order_item_id)  # Find the order item by its ID
        order_item.delete()  # Delete the order item from the database
        # Return a success message
        return JsonResponse({"success": True, "message": "Order item deleted successfully"})
    except ObjectDoesNotExist:
        # If the order item does not exist, return a 404 error
        return JsonResponse({"error": "Order item not found"}, status=404)
    except Exception as e:
        # If any other error occurs, return an error message
        return JsonResponse({"error": str(e)}, status=400)

# ==================== USER VIEWS ====================
@csrf_exempt  # Allow requests without CSRF token (for API use)
@require_http_methods(["GET"])  # Only allow GET requests
def get_users(request):
    """Get all users"""
    try:
        users = User.objects.all()  # Query all users from the database
        users_list = []  # List to store user data
        
        for user in users:
            # Add each user's details to the list
            users_list.append({
                "id": f"U{str(user.user_id).zfill(3)}",  # Custom user ID with leading zeros
                "user_id": user.user_id,  # Database user ID
                "username": user.username,  # Username
                "email": user.email,  # Email
                "password": user.password_hash,  # Password hash
                "role": user.role or "User",  # Role or default to User
            })
        
        return JsonResponse({"users": users_list})  # Return all users as JSON
    except Exception as e:
        # If any error occurs, return an error message
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt  # Allow requests without CSRF token (for API use)
@require_http_methods(["POST"])  # Only allow POST requests
def create_user(request):
    """Create a new user"""
    try:
        data = json.loads(request.body)  # Parse the JSON body from the request
        
        # Create a new User object with the provided data
        user = User(
            username=data.get('username'),  # Set username
            email=data.get('email'),  # Set email
            password_hash=data.get('password', 'temp_password_123'),  # Set password hash (default temp password)
            role=data.get('role', 'Employee')  # Set role (default Employee)
        )
        user.save()  # Save the user to the database
        
        # Return a JSON response with the new user's details
        return JsonResponse({
            "success": True,  # Indicate success
            "user": {
                "id": f"U{str(user.user_id).zfill(3)}",  # Custom user ID with leading zeros
                "user_id": user.user_id,  # Database user ID
                "username": user.username,  # Username
                "email": user.email,  # Email
                "role": user.role,  # Role
            }
        }, status=201)
    except Exception as e:
        # If any error occurs, return an error message
        return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt  # Allow requests without CSRF token (for API use)
@require_http_methods(["PUT"])  # Only allow PUT requests
def update_user(request, user_id):
    """Update an existing user"""
    try:
        user = User.objects.get(user_id=user_id)  # Find the user by its ID
        data = json.loads(request.body)  # Parse the JSON body from the request
        
        user.username = data.get('username', user.username)  # Update username if provided
        user.email = data.get('email', user.email)  # Update email if provided
        user.role = data.get('role', user.role)  # Update role if provided
        if data.get('password'):
            user.password_hash = data.get('password')  # Update password (should hash in production)
        
        user.save()  # Save the updated user to the database
        
        # Return a JSON response with the updated user's details
        return JsonResponse({
            "success": True,  # Indicate success
            "user": {
                "id": f"U{str(user.user_id).zfill(3)}",  # Custom user ID with leading zeros
                "user_id": user.user_id,  # Database user ID
                "username": user.username,  # Username
                "email": user.email,  # Email
                "role": user.role,  # Role
            }
        })
    except ObjectDoesNotExist:
        # If the user does not exist, return a 404 error
        return JsonResponse({"error": "User not found"}, status=404)
    except Exception as e:
        # If any other error occurs, return an error message
        return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt  # Allow requests without CSRF token (for API use)
@require_http_methods(["DELETE"])  # Only allow DELETE requests
def delete_user(request, user_id):
    """Delete a user"""
    try:
        user = User.objects.get(user_id=user_id)  # Find the user by its ID
        user.delete()  # Delete the user from the database
        # Return a success message
        return JsonResponse({"success": True, "message": "User deleted successfully"})
    except ObjectDoesNotExist:
        # If the user does not exist, return a 404 error
        return JsonResponse({"error": "User not found"}, status=404)
    except Exception as e:
        # If any other error occurs, return an error message
        return JsonResponse({"error": str(e)}, status=400)
    
@csrf_exempt  # Allow requests without CSRF token (for API use)
def update_product_category(request, product_id):
    """Update the category of a product"""
    if request.method == 'POST':  # Only allow POST requests
        data = json.loads(request.body)  # Parse the JSON body from the request
        category_id = data.get('category_id')  # Get the new category ID from the request
        try:
            product = Product.objects.get(pk=product_id)  # Find the product by its primary key
            Category.objects.get(pk=category_id)  # Verify the category exists
            product.category_id = category_id  # Set the product's category_id to the new category ID
            product.save()  # Save the updated product to the database
            return JsonResponse({'status': 'success'})  # Return success response
        except (Product.DoesNotExist, Category.DoesNotExist):
            # If either the product or category does not exist, return an error
            return JsonResponse({'status': 'error', 'message': 'Product or Category not found'}, status=404)
    # If the request method is not POST, return an error
    return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)

@csrf_exempt  # Allow requests without CSRF token (for API use)
@require_http_methods(["POST"])  # Only allow POST requests
def login(request):
    """Authenticate user login"""
    try:
        data = json.loads(request.body)  # Parse the JSON body from the request
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return JsonResponse({
                "success": False,
                "error": "Username and password are required"
            }, status=400)
        
        # Find user by username
        try:
            user = User.objects.get(username=username)
            
            # Check if password matches (in production, use proper password hashing)
            if user.password_hash == password:
                return JsonResponse({
                    "success": True,
                    "user": {
                        "user_id": user.user_id,
                        "username": user.username,
                        "email": user.email,
                        "role": user.role
                    }
                })
            else:
                return JsonResponse({
                    "success": False,
                    "error": "Invalid username or password"
                }, status=401)
                
        except User.DoesNotExist:
            return JsonResponse({
                "success": False,
                "error": "Invalid username or password"
            }, status=401)
            
    except Exception as e:
        return JsonResponse({
            "success": False,
            "error": str(e)
        }, status=500)