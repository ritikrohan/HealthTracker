-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create health_documents table
CREATE TABLE public.health_documents (
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

-- Create health_reports table
CREATE TABLE public.health_reports (
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

-- Create test_comparisons table
CREATE TABLE public.test_comparisons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  current_report_id UUID REFERENCES public.health_reports(id) ON DELETE CASCADE NOT NULL,
  previous_report_id UUID REFERENCES public.health_reports(id) ON DELETE CASCADE NOT NULL,
  test_name TEXT NOT NULL,
  comparison_data JSONB NOT NULL,
  trends JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_health_documents_user_id ON public.health_documents(user_id);
CREATE INDEX idx_health_documents_upload_date ON public.health_documents(upload_date);
CREATE INDEX idx_health_reports_user_id ON public.health_reports(user_id);
CREATE INDEX idx_health_reports_test_category ON public.health_reports(test_category);
CREATE INDEX idx_health_reports_test_date ON public.health_reports(test_date);
CREATE INDEX idx_test_comparisons_user_id ON public.test_comparisons(user_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_comparisons ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own documents" ON public.health_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" ON public.health_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON public.health_documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own reports" ON public.health_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports" ON public.health_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports" ON public.health_reports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own comparisons" ON public.test_comparisons
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own comparisons" ON public.test_comparisons
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_health_documents_updated_at
  BEFORE UPDATE ON public.health_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_health_reports_updated_at
  BEFORE UPDATE ON public.health_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

