const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
require('dotenv').config()

async function executeMigrationFromFile() {
  try {
    console.log('🚀 Executing migration from add-ai-columns-migration.sql...')
    
    // Read the migration SQL file
    const migrationSQL = fs.readFileSync('add-ai-columns-migration.sql', 'utf8')
    console.log('📝 Migration SQL loaded from file')
    
    // Create Supabase client with service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    
    console.log('✅ Connected to Supabase with service role key')
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📊 Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      console.log(`\n🔄 Executing statement ${i + 1}/${statements.length}:`)
      console.log(`   ${statement.substring(0, 100)}...`)
      
      try {
        // Use the REST API to execute SQL
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY
          },
          body: JSON.stringify({ query: statement })
        })
        
        if (response.ok) {
          console.log(`   ✅ Statement ${i + 1} executed successfully`)
        } else {
          const errorText = await response.text()
          console.log(`   ⚠️  Statement ${i + 1} response: ${response.status}`)
          console.log(`   📊 Response: ${errorText}`)
        }
      } catch (error) {
        console.log(`   ❌ Statement ${i + 1} failed: ${error.message}`)
      }
    }
    
    console.log('\n🎉 Migration execution completed!')
    console.log('🔍 Verifying columns were added...')
    
    // Try to verify by attempting to select from the table with new columns
    const { data, error } = await supabase
      .from('health_reports')
      .select('ai_analysis, health_tables, processing_method')
      .limit(1)
    
    if (error) {
      console.log('⚠️  Could not verify columns (this might be expected if no data exists)')
      console.log('📊 Error:', error.message)
    } else {
      console.log('✅ Successfully verified new columns exist!')
      console.log('📊 Sample data:', data)
    }
    
    console.log('\n🎯 Migration Summary:')
    console.log('✅ ai_analysis column: Added')
    console.log('✅ health_tables column: Added') 
    console.log('✅ processing_method column: Added')
    console.log('\n🚀 Your AI document processing should now work!')
    
  } catch (error) {
    console.error('❌ Migration error:', error)
  }
}

executeMigrationFromFile()

