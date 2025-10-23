#!/bin/bash

echo "🚀 Running direct database migration..."

# Get the SQL from the migration file
echo "📝 Reading migration SQL from add-ai-columns-migration.sql..."

# Extract the ALTER TABLE statement (skip comments and verification)
SQL_STATEMENT=$(grep -v "^--" add-ai-columns-migration.sql | grep -v "^$" | tr -d '\n' | sed 's/; */;\n/g' | head -1)

echo "📊 SQL to execute:"
echo "$SQL_STATEMENT"
echo ""

# Execute using curl with Supabase REST API
echo "🔄 Executing migration via Supabase REST API..."

curl -X POST \
  "https://ckfpchxvxqwuomgcxkfu.supabase.co/rest/v1/rpc/exec" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrZnBjaHh2eHF3dW9tZ2N4a2Z1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDczNTQ1NiwiZXhwIjoyMDc2MzExNDU2fQ.SFk95bv0cPXJ_wdMs9j97cRe_wREpquyhu1Synf13PU" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrZnBjaHh2eHF3dW9tZ2N4a2Z1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDczNTQ1NiwiZXhwIjoyMDc2MzExNDU2fQ.SFk95bv0cPXJ_wdMs9j97cRe_wREpquyhu1Synf13PU" \
  -d "{\"query\": \"$SQL_STATEMENT\"}"

echo ""
echo "🎉 Migration attempt completed!"
echo ""
echo "📋 If the above didn't work, please run this SQL manually in Supabase:"
echo ""
cat add-ai-columns-migration.sql
echo ""
echo "🔗 Go to: https://supabase.com/dashboard/project/ckfpchxvxqwuomgcxkfu/sql"

