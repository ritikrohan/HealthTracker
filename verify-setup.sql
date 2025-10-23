-- =====================================================
-- VERIFICATION SCRIPT - Run this after setup
-- =====================================================
-- This script will verify that everything is set up correctly

-- 1. CHECK IF ALL TABLES EXIST
-- =====================================================
SELECT 
  'Tables Check' as check_type,
  tablename,
  CASE 
    WHEN tablename IN ('users', 'health_documents', 'health_reports', 'test_comparisons') 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'health_documents', 'health_reports', 'test_comparisons')
ORDER BY tablename;

-- 2. CHECK IF STORAGE BUCKET EXISTS
-- =====================================================
SELECT 
  'Storage Check' as check_type,
  id as bucket_name,
  CASE 
    WHEN id = 'health-documents' THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status
FROM storage.buckets 
WHERE id = 'health-documents';

-- 3. CHECK IF RLS IS ENABLED
-- =====================================================
SELECT 
  'RLS Check' as check_type,
  tablename,
  CASE 
    WHEN rowsecurity = true THEN '✅ ENABLED' 
    ELSE '❌ DISABLED' 
  END as status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'health_documents', 'health_reports', 'test_comparisons')
ORDER BY tablename;

-- 4. CHECK IF POLICIES EXIST
-- =====================================================
SELECT 
  'Policies Check' as check_type,
  tablename,
  policyname,
  CASE 
    WHEN policyname IS NOT NULL THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'health_documents', 'health_reports', 'test_comparisons')
ORDER BY tablename, policyname;

-- 5. CHECK IF TRIGGERS EXIST
-- =====================================================
SELECT 
  'Triggers Check' as check_type,
  trigger_name,
  event_object_table,
  CASE 
    WHEN trigger_name IS NOT NULL THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND trigger_name IN ('on_auth_user_created', 'update_users_updated_at', 'update_health_documents_updated_at', 'update_health_reports_updated_at')
ORDER BY trigger_name;

-- 6. CHECK IF FUNCTIONS EXIST
-- =====================================================
SELECT 
  'Functions Check' as check_type,
  routine_name,
  CASE 
    WHEN routine_name IS NOT NULL THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('handle_new_user', 'update_updated_at_column')
ORDER BY routine_name;

-- 7. CHECK STORAGE POLICIES
-- =====================================================
SELECT 
  'Storage Policies Check' as check_type,
  policyname,
  CASE 
    WHEN policyname IS NOT NULL THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%health%'
ORDER BY policyname;

-- =====================================================
-- SUMMARY
-- =====================================================
-- If you see all ✅ marks, your setup is complete!
-- If you see any ❌ marks, re-run the main setup script
-- =====================================================


