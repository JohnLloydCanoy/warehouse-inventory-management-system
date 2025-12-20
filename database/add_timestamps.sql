-- Add created_at and updated_at columns to products table
-- Run this in your MySQL database

ALTER TABLE products 
ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Update existing rows to have timestamps
UPDATE products 
SET created_at = NOW(), 
    updated_at = NOW() 
WHERE created_at IS NULL;
