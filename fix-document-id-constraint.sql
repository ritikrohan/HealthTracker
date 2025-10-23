-- Migration to allow null document_id in health_reports table
-- This is needed since we're now only storing analysis reports, not documents

-- Remove the NOT NULL constraint from document_id column
ALTER TABLE public.health_reports 
ALTER COLUMN document_id DROP NOT NULL;

-- Add a comment to document the change
COMMENT ON COLUMN public.health_reports.document_id IS 'Reference to health_documents table. Can be null when only analysis results are stored without the original document.';

-- Verify the constraint was removed
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'health_reports' 
AND column_name = 'document_id'
AND table_schema = 'public';
