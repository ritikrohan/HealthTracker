# Database Migration Guide

## Issue
The application is trying to insert data into columns that don't exist in the database:
- `ai_analysis` column missing from `health_reports` table
- `health_tables` column missing from `health_reports` table  
- `processing_method` column missing from `health_reports` table

## Solution
Run the migration script to add the missing columns.

## Steps to Fix

### 1. Open Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**

### 2. Run the Migration
Copy and paste the contents of `add-ai-columns-migration.sql` into the SQL editor and execute it.

### 3. Verify the Migration
After running the migration, you should see the new columns in your database:
- `ai_analysis` (JSONB) - AI analysis results and extracted data
- `health_tables` (JSONB) - Structured health data tables created by AI
- `processing_method` (TEXT) - Method used for processing

### 4. Test the Application
Once the migration is complete, try uploading a document again. The AI analysis should now work without database errors.

## Alternative: Fresh Setup
If you prefer to start fresh, you can:
1. Drop the existing tables
2. Run the updated `supabase-setup-complete.sql` script
3. This will create all tables with the new columns included

## Files Updated
- `supabase-schema.sql` - Updated with new columns
- `supabase-setup-complete.sql` - Updated with new columns  
- `add-ai-columns-migration.sql` - Migration script for existing databases

