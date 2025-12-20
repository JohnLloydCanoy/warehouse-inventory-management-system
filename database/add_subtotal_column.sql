-- Add subtotal column to order_items table
-- Run this in your MySQL database

ALTER TABLE order_items 
ADD COLUMN subtotal DECIMAL(10, 2) NULL;

-- Update existing rows to calculate subtotal based on quantity * unit_price
UPDATE order_items 
SET subtotal = quantity * unit_price 
WHERE subtotal IS NULL;
