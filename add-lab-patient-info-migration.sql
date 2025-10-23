-- Migration to add lab and patient information columns to health_reports table
-- This allows storing lab details and patient information extracted from health reports

-- Add lab information columns
ALTER TABLE public.health_reports 
ADD COLUMN lab_name TEXT,
ADD COLUMN lab_address TEXT,
ADD COLUMN lab_contact TEXT,
ADD COLUMN lab_code TEXT;

-- Add patient information columns
ALTER TABLE public.health_reports 
ADD COLUMN patient_name TEXT,
ADD COLUMN patient_age INTEGER,
ADD COLUMN patient_gender TEXT,
ADD COLUMN patient_id TEXT;

-- Add comments to document the new columns
COMMENT ON COLUMN public.health_reports.lab_name IS 'Name of the laboratory or clinic where the test was performed';
COMMENT ON COLUMN public.health_reports.lab_address IS 'Address of the laboratory';
COMMENT ON COLUMN public.health_reports.lab_contact IS 'Phone or contact information of the laboratory';
COMMENT ON COLUMN public.health_reports.lab_code IS 'Laboratory code or reference number';

COMMENT ON COLUMN public.health_reports.patient_name IS 'Name of the patient if available in the report';
COMMENT ON COLUMN public.health_reports.patient_age IS 'Age of the patient if available';
COMMENT ON COLUMN public.health_reports.patient_gender IS 'Gender of the patient if available';
COMMENT ON COLUMN public.health_reports.patient_id IS 'Patient ID or reference number if available';

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'health_reports' 
AND table_schema = 'public'
AND column_name IN ('lab_name', 'lab_address', 'lab_contact', 'lab_code', 'patient_name', 'patient_age', 'patient_gender', 'patient_id')
ORDER BY column_name;
