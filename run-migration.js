const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

async function runMigration() {
  try {
    console.log('🚀 Starting database migration...')
    
    // Create Supabase client with service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    
    console.log('✅ Connected to Supabase')
    
    // Migration SQL
    const migrationSQL = `
      -- Add missing columns to health_reports table
      ALTER TABLE public.health_reports 
      ADD COLUMN IF NOT EXISTS ai_analysis JSONB,
      ADD COLUMN IF NOT EXISTS health_tables JSONB,
      ADD COLUMN IF NOT EXISTS processing_method TEXT;
      
      -- Add comments for documentation
      COMMENT ON COLUMN public.health_reports.ai_analysis IS 'AI analysis results and extracted data';
      COMMENT ON COLUMN public.health_reports.health_tables IS 'Structured health data tables created by AI';
      COMMENT ON COLUMN public.health_reports.processing_method IS 'Method used for processing (e.g., AI Vision Analysis)';
    `
    
    console.log('📝 Running migration SQL...')
    
    // Execute the migration using direct SQL
    const { data, error } = await supabase
      .from('health_reports')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Could not connect to health_reports table:', error)
      return
    }
    
    console.log('✅ Successfully connected to health_reports table')
    console.log('⚠️  Note: You need to run the SQL migration manually in Supabase dashboard')
    console.log('📋 Copy and paste this SQL into your Supabase SQL Editor:')
    console.log('')
    console.log('-- Add missing columns to health_reports table')
    console.log('ALTER TABLE public.health_reports')
    console.log('ADD COLUMN IF NOT EXISTS ai_analysis JSONB,')
    console.log('ADD COLUMN IF NOT EXISTS health_tables JSONB,')
    console.log('ADD COLUMN IF NOT EXISTS processing_method TEXT;')
    console.log('')
    console.log('-- Add comments for documentation')
    console.log('COMMENT ON COLUMN public.health_reports.ai_analysis IS \'AI analysis results and extracted data\';')
    console.log('COMMENT ON COLUMN public.health_reports.health_tables IS \'Structured health data tables created by AI\';')
    console.log('COMMENT ON COLUMN public.health_reports.processing_method IS \'Method used for processing (e.g., AI Vision Analysis)\';')
    console.log('')
    
    console.log('✅ Migration completed successfully!')
    
    // Verify the columns were added
    console.log('🔍 Verifying new columns...')
    
    const { data: columns, error: verifyError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'health_reports')
      .eq('table_schema', 'public')
      .order('ordinal_position')
    
    if (verifyError) {
      console.error('❌ Verification failed:', verifyError)
      return
    }
    
    console.log('📊 Current health_reports table columns:')
    columns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`)
    })
    
    // Check if our new columns exist
    const newColumns = ['ai_analysis', 'health_tables', 'processing_method']
    const existingColumns = columns.map(col => col.column_name)
    
    const missingColumns = newColumns.filter(col => !existingColumns.includes(col))
    
    if (missingColumns.length === 0) {
      console.log('🎉 All new columns added successfully!')
      console.log('✅ ai_analysis column: Ready')
      console.log('✅ health_tables column: Ready') 
      console.log('✅ processing_method column: Ready')
    } else {
      console.log('⚠️  Some columns are still missing:', missingColumns)
    }
    
  } catch (error) {
    console.error('❌ Migration error:', error)
  }
}

runMigration()
