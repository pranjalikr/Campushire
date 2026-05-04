-- Migration: Add years_of_experience column to experiences table
-- Run this SQL script to add the new column to your database

ALTER TABLE experiences ADD COLUMN IF NOT EXISTS years_of_experience FLOAT;

-- Verify the column was added
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'experiences' AND column_name = 'years_of_experience';
