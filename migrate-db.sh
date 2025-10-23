#!/bin/bash

# Database Migration Script
echo "🚀 Starting database migration..."

# Get environment variables
SUPABASE_URL="https://ckfpchxvxqwuomgcxkfu.supabase.co"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrZnBjaHh2eHF3dW9tZ2N4a2Z1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDczNTQ1NiwiZXhwIjoyMDc2MzExNDU2fQ.SFk95bv0cPXJ_wdMs9j97cRe_wREpquyhu1Synf13PU"

echo "📝 Executing migration SQL..."

# Create a temporary SQL file
cat > migration.sql << 'EOF'
-- Add missing columns to health_reports table
ALTER TABLE public.health_reports 
ADD COLUMN IF NOT EXISTS ai_analysis JSONB,
ADD COLUMN IF NOT EXISTS health_tables JSONB,
ADD COLUMN IF NOT EXISTS processing_method TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.health_reports.ai_analysis IS 'AI analysis results and extracted data';
COMMENT ON COLUMN public.health_reports.health_tables IS 'Structured health data tables created by AI';
COMMENT ON COLUMN public.health_reports.processing_method IS 'Method used for processing (e.g., AI Vision Analysis)';
EOF

echo "📋 Migration SQL created. Please run this in your Supabase SQL Editor:"
echo ""
cat migration.sql
echo ""
echo "✅ Copy the SQL above and paste it into your Supabase dashboard SQL Editor"
echo "🔗 Go to: https://supabase.com/dashboard/project/ckfpchxvxqwuomgcxkfu/sql"

# Clean up
rm migration.sql

echo "🎉 Migration script completed!"

