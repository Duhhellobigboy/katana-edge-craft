const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env manually
const envPath = path.resolve(__dirname, '../.env');
const envConfig = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] ? match[2].trim() : '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.substring(1, value.length - 1);
      }
      envConfig[match[1]] = value;
    }
  });
}

const supabaseUrl = envConfig['VITE_SUPABASE_URL'];
const supabaseKey = envConfig['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  const { data, error } = await supabase.rpc('execute_sql', {
    sql_query: 'select column_name, data_type, is_nullable, column_default from information_schema.columns where table_schema = \'public\' and table_name = \'products\';'
  });

  if (error) {
    // If execute_sql is not defined, we can try direct REST query to pg_catalog or query table info
    console.log("execute_sql rpc failed, trying to inspect column types by checking postgrest Swagger spec or querying fields");
    const { data: selectData, error: selectErr } = await supabase
      .from("products")
      .select("*")
      .limit(1);

    if (selectErr) {
       console.error("Error querying products:", selectErr);
    } else {
       console.log("Queried products successfully. Item keys:", Object.keys(selectData[0]));
    }
  } else {
    console.log("Products columns schema info:", data);
  }
}

checkColumns();
