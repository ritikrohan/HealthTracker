-- Migration to add AI analysis columns to health_reports table
-- Run this in your Supabase SQL editor

-- Add missing columns to health_reports table
ALTER TABLE public.health_reports 
ADD COLUMN IF NOT EXISTS ai_analysis JSONB,
ADD COLUMN IF NOT EXISTS health_tables JSONB,
ADD COLUMN IF NOT EXISTS processing_method TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.health_reports.ai_analysis IS 'AI analysis results and extracted data';
COMMENT ON COLUMN public.health_reports.health_tables IS 'Structured health data tables created by AI';
COMMENT ON COLUMN public.health_reports.processing_method IS 'Method used for processing (e.g., AI Vision Analysis)';

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'health_reports' 
AND table_schema = 'public'
ORDER BY ordinal_position;

