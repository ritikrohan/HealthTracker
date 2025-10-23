# 🚀 Supabase Setup Guide for Health Tracker

## Step-by-Step Database Setup

### 1. Access Your Supabase Dashboard
- Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
- Log in with your account
- Select your project: `ckfpchxvxqwuomgcxkfu`

### 2. Open SQL Editor
- In the left sidebar, click on **"SQL Editor"**
- Click **"New Query"** to create a new SQL script

### 3. Run the Complete Setup Script
- Copy the entire contents of `supabase-setup-complete.sql`
- Paste it into the SQL Editor
- Click **"Run"** to execute the script

### 4. Verify Setup
After running the script, you should see:

#### ✅ Tables Created:
- `users` - User profiles
- `health_documents` - Uploaded document metadata
- `health_reports` - AI-extracted health data
- `test_comparisons` - Trend analysis data

#### ✅ Storage Bucket Created:
- `health-documents` - For storing uploaded files

#### ✅ Security Policies:
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Secure file upload and access policies

### 5. Test the Setup

#### Check Tables:
```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'health_documents', 'health_reports', 'test_comparisons');
```

#### Check Storage:
```sql
SELECT * FROM storage.buckets WHERE id = 'health-documents';
```

#### Check RLS Policies:
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'health_documents', 'health_reports', 'test_comparisons');
```

### 6. Configure Storage Bucket (Optional)
If you want to make files publicly accessible:

1. Go to **Storage** in your Supabase dashboard
2. Click on the **`health-documents`** bucket
3. Go to **Settings** tab
4. Toggle **"Public bucket"** if you want direct file access

### 7. Test Authentication
1. Go to your app: http://localhost:3001
2. Try signing up for a new account
3. Check if the user appears in the `users` table

### 8. Test File Upload
1. Sign in to your app
2. Go to the dashboard
3. Try uploading a test document
4. Check if the file appears in the `health_documents` table

## 🔧 Troubleshooting

### If Tables Don't Create:
- Make sure you're in the correct Supabase project
- Check for any SQL errors in the editor
- Try running the script in smaller chunks

### If Storage Upload Fails:
- Verify the `health-documents` bucket exists
- Check storage policies are correctly applied
- Ensure RLS is enabled

### If Authentication Fails:
- Verify your environment variables in `.env.local`
- Check that the Supabase URL and keys are correct
- Make sure the user creation trigger is working

## 📊 Database Schema Overview

```
users
├── id (UUID, Primary Key)
├── email (TEXT, Unique)
├── full_name (TEXT)
├── avatar_url (TEXT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

health_documents
├── id (UUID, Primary Key)
├── user_id (UUID, Foreign Key → users.id)
├── file_name (TEXT)
├── file_url (TEXT)
├── file_type (TEXT)
├── file_size (BIGINT)
├── upload_date (TIMESTAMP)
├── document_type (ENUM: lab_report, medical_record, prescription, other)
├── status (ENUM: processing, completed, failed)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

health_reports
├── id (UUID, Primary Key)
├── user_id (UUID, Foreign Key → users.id)
├── document_id (UUID, Foreign Key → health_documents.id)
├── test_name (TEXT)
├── test_category (ENUM: blood_work, imaging, vital_signs, specialized, other)
├── test_date (DATE)
├── results (JSONB)
├── ai_summary (TEXT)
├── normal_ranges (JSONB)
├── flagged_values (TEXT[])
├── recommendations (TEXT[])
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

test_comparisons
├── id (UUID, Primary Key)
├── user_id (UUID, Foreign Key → users.id)
├── current_report_id (UUID, Foreign Key → health_reports.id)
├── previous_report_id (UUID, Foreign Key → health_reports.id)
├── test_name (TEXT)
├── comparison_data (JSONB)
├── trends (JSONB)
└── created_at (TIMESTAMP)
```

## 🎯 Next Steps

Once the database is set up:

1. **Add OpenAI API Key** to `.env.local`
2. **Test the application** by signing up and uploading documents
3. **Verify AI processing** works with your OpenAI key
4. **Check data flow** from upload → processing → reports

Your Health Tracker application will now have a fully functional database backend! 🎉


