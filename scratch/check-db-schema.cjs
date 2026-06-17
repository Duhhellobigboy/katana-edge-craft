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

async function checkSchema() {
  console.log("Checking if product_variants table exists...");
  const { data, error } = await supabase
    .from("product_variants")
    .select("*")
    .limit(1);

  if (error) {
    console.log("Error querying product_variants:", error.code, error.message);
  } else {
    console.log("product_variants table exists!");
  }

  console.log("Checking if product_variants_public view exists...");
  const { data: viewData, error: viewError } = await supabase
    .from("product_variants_public")
    .select("*")
    .limit(1);

  if (viewError) {
    console.log("Error querying product_variants_public view:", viewError.code, viewError.message);
  } else {
    console.log("product_variants_public view exists!");
  }
}

checkSchema();
