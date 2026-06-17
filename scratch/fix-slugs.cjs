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

async function fixSlugs() {
  console.log("Updating microslit slug to micro-slit-shears...");
  const { error: error1 } = await supabase
    .from("products")
    .update({ slug: "micro-slit-shears" })
    .eq("slug", "microslit");
  
  if (error1) {
    console.error("Failed to update microslit slug:", error1);
  } else {
    console.log("Successfully updated microslit slug.");
  }

  console.log("Updating fujisan slug to fujisan-thinning-shears...");
  const { error: error2 } = await supabase
    .from("products")
    .update({ slug: "fujisan-thinning-shears" })
    .eq("slug", "fujisan");

  if (error2) {
    console.error("Failed to update fujisan slug:", error2);
  } else {
    console.log("Successfully updated fujisan slug.");
  }
}

fixSlugs();
