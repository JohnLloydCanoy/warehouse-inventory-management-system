from django.db import models

class Category(models.Model):
    category_id = models.AutoField(primary_key=True)
    category_name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'categories'
        managed = False

    def __str__(self):
        return self.category_name

class Supplier(models.Model):
    supplier_id = models.AutoField(primary_key=True)
    supplier_name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'suppliers'
        managed = False

    def __str__(self):
        return self.supplier_name

class Warehouse(models.Model):
    warehouse_id = models.AutoField(primary_key=True)
    warehouse_name = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'warehouses'
        managed = False

    def __str__(self):
        return self.warehouse_name

class Product(models.Model):
    product_id = models.AutoField(primary_key=True)
    product_name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    category_id = models.IntegerField(blank=True, null=True)
    supplier_id = models.IntegerField(blank=True, null=True)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    sku = models.CharField(max_length=100, unique=True)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'products'
        managed = False

    def __str__(self):
        return self.product_name

class Inventory(models.Model):
    inventory_id = models.AutoField(primary_key=True)
    product_id = models.IntegerField()
    warehouse_id = models.IntegerField()
    quantity = models.IntegerField()
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'inventory'
        managed = False

class Order(models.Model):
    order_id = models.AutoField(primary_key=True)
    order_date = models.DateTimeField(auto_now_add=True)
    supplier_id = models.IntegerField(blank=True, null=True)
    customer_name = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=50, blank=True, null=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    class Meta:
        db_table = 'orders'
        managed = False

class OrderItem(models.Model):
    order_item_id = models.AutoField(primary_key=True)
    order_id = models.IntegerField()
    product_id = models.IntegerField()
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    class Meta:
        db_table = 'order_items'
        managed = False

class User(models.Model):
    user_id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=255, unique=True)
    email = models.EmailField()
    password_hash = models.CharField(max_length=255, default='default_hash')
    role = models.CharField(max_length=50)
    # Note: do not define `created_at`/`updated_at` here because the
    # existing `users` database table doesn't include those columns.
    # Defining them in the model causes Django to include them in SQL
    # SELECTs which leads to "Unknown column 'users.created_at'" errors.

    class Meta:
        db_table = 'users'
        managed = False