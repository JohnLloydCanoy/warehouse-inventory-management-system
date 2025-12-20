-- Add customer_name column to orders table
-- Run this in your MySQL database

ALTER TABLE orders 
ADD COLUMN customer_name VARCHAR(255) NULL;
