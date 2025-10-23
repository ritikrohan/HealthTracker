const https = require('https')
require('dotenv').config()

async function executeMigration() {
  try {
    console.log('🚀 Executing database migration via Supabase REST API...')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('❌ Missing Supabase credentials in .env file')
      return
    }
    
    // SQL migration commands
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
    
    // Make request to Supabase REST API
    const postData = JSON.stringify({
      query: migrationSQL
    })
    
    const options = {
      hostname: 'ckfpchxvxqwuomgcxkfu.supabase.co',
      port: 443,
      path: '/rest/v1/rpc/exec',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      }
    }
    
    console.log('📝 Sending migration request to Supabase...')
    
    const req = https.request(options, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log('✅ Migration executed successfully!')
          console.log('📊 Response:', data)
        } else {
          console.log('⚠️  Migration response:', res.statusCode)
          console.log('📊 Response:', data)
        }
      })
    })
    
    req.on('error', (error) => {
      console.error('❌ Request failed:', error)
    })
    
    req.write(postData)
    req.end()
    
  } catch (error) {
    console.error('❌ Migration error:', error)
  }
}

executeMigration()

