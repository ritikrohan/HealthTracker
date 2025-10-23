-- =====================================================
-- HEALTH TRACKER - COMPLETE SUPABASE SETUP
-- =====================================================
-- Run this entire script in your Supabase SQL Editor
-- This will create all tables, storage, and policies needed

-- 1. CREATE STORAGE BUCKET FOR HEALTH DOCUMENTS
-- =====================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('health-documents', 'health-documents', true)
ON CONFLICT (id) DO NOTHING;

-- 2. CREATE USERS TABLE (extends Supabase auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CREATE HEALTH DOCUMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.health_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  document_type TEXT CHECK (document_type IN ('lab_report', 'medical_record', 'prescription', 'other')) NOT NULL,
  status TEXT CHECK (status IN ('processing', 'completed', 'failed')) DEFAULT 'processing',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CREATE HEALTH REPORTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.health_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  document_id UUID REFERENCES public.health_documents(id) ON DELETE CASCADE NOT NULL,
  test_name TEXT NOT NULL,
  test_category TEXT CHECK (test_category IN ('blood_work', 'imaging', 'vital_signs', 'specialized', 'other')) NOT NULL,
  test_date DATE NOT NULL,
  results JSONB NOT NULL,
  ai_summary TEXT,
  normal_ranges JSONB,
  flagged_values TEXT[],
  recommendations TEXT[],
  ai_analysis JSONB,
  health_tables JSONB,
  processing_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CREATE TEST COMPARISONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.test_comparisons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  current_report_id UUID REFERENCES public.health_reports(id) ON DELETE CASCADE NOT NULL,
  previous_report_id UUID REFERENCES public.health_reports(id) ON DELETE CASCADE NOT NULL,
  test_name TEXT NOT NULL,
  comparison_data JSONB NOT NULL,
  trends JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_health_documents_user_id ON public.health_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_health_documents_upload_date ON public.health_documents(upload_date);
CREATE INDEX IF NOT EXISTS idx_health_reports_user_id ON public.health_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_health_reports_test_category ON public.health_reports(test_category);
CREATE INDEX IF NOT EXISTS idx_health_reports_test_date ON public.health_reports(test_date);
CREATE INDEX IF NOT EXISTS idx_test_comparisons_user_id ON public.test_comparisons(user_id);

-- 7. ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_comparisons ENABLE ROW LEVEL SECURITY;

-- 8. CREATE RLS POLICIES FOR USERS TABLE
-- =====================================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 9. CREATE RLS POLICIES FOR HEALTH DOCUMENTS TABLE
-- =====================================================
DROP POLICY IF EXISTS "Users can view own documents" ON public.health_documents;
CREATE POLICY "Users can view own documents" ON public.health_documents
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own documents" ON public.health_documents;
CREATE POLICY "Users can insert own documents" ON public.health_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own documents" ON public.health_documents;
CREATE POLICY "Users can update own documents" ON public.health_documents
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own documents" ON public.health_documents;
CREATE POLICY "Users can delete own documents" ON public.health_documents
  FOR DELETE USING (auth.uid() = user_id);

-- 10. CREATE RLS POLICIES FOR HEALTH REPORTS TABLE
-- =====================================================
DROP POLICY IF EXISTS "Users can view own reports" ON public.health_reports;
CREATE POLICY "Users can view own reports" ON public.health_reports
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own reports" ON public.health_reports;
CREATE POLICY "Users can insert own reports" ON public.health_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reports" ON public.health_reports;
CREATE POLICY "Users can update own reports" ON public.health_reports
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reports" ON public.health_reports;
CREATE POLICY "Users can delete own reports" ON public.health_reports
  FOR DELETE USING (auth.uid() = user_id);

-- 11. CREATE RLS POLICIES FOR TEST COMPARISONS TABLE
-- =====================================================
DROP POLICY IF EXISTS "Users can view own comparisons" ON public.test_comparisons;
CREATE POLICY "Users can view own comparisons" ON public.test_comparisons
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own comparisons" ON public.test_comparisons;
CREATE POLICY "Users can insert own comparisons" ON public.test_comparisons
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comparisons" ON public.test_comparisons;
CREATE POLICY "Users can delete own comparisons" ON public.test_comparisons
  FOR DELETE USING (auth.uid() = user_id);

-- 12. CREATE FUNCTION TO HANDLE USER CREATION
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. CREATE TRIGGER FOR NEW USER CREATION
-- =====================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 14. CREATE FUNCTION TO UPDATE UPDATED_AT TIMESTAMP
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 15. CREATE TRIGGERS FOR UPDATED_AT
-- =====================================================
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_health_documents_updated_at ON public.health_documents;
CREATE TRIGGER update_health_documents_updated_at
  BEFORE UPDATE ON public.health_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_health_reports_updated_at ON public.health_reports;
CREATE TRIGGER update_health_reports_updated_at
  BEFORE UPDATE ON public.health_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 16. CREATE STORAGE POLICIES FOR HEALTH DOCUMENTS BUCKET
-- =====================================================
-- Allow authenticated users to upload files
DROP POLICY IF EXISTS "Authenticated users can upload health documents" ON storage.objects;
CREATE POLICY "Authenticated users can upload health documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'health-documents' AND
    auth.role() = 'authenticated'
  );

-- Allow users to view their own files
DROP POLICY IF EXISTS "Users can view own health documents" ON storage.objects;
CREATE POLICY "Users can view own health documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'health-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to update their own files
DROP POLICY IF EXISTS "Users can update own health documents" ON storage.objects;
CREATE POLICY "Users can update own health documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'health-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own files
DROP POLICY IF EXISTS "Users can delete own health documents" ON storage.objects;
CREATE POLICY "Users can delete own health documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'health-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 17. VERIFY SETUP
-- =====================================================
-- Check if tables were created successfully
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'health_documents', 'health_reports', 'test_comparisons')
ORDER BY tablename;

-- Check if storage bucket was created
SELECT * FROM storage.buckets WHERE id = 'health-documents';

-- Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'health_documents', 'health_reports', 'test_comparisons')
ORDER BY tablename;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Your Supabase database is now ready for the Health Tracker application.
-- You can now:
-- 1. Sign up for new accounts
-- 2. Upload health documents
-- 3. Process documents with AI
-- 4. View health reports and comparisons
-- =====================================================

