-- Fix the role column in users table to allow longer role names
-- Run this SQL in your MySQL database

ALTER TABLE users MODIFY COLUMN role VARCHAR(50);
