const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateProductImages() {
  console.log("Updating Micro Slit image_url in Supabase...");
  const { error: error1 } = await supabase
    .from("products")
    .update({ image_url: "/products/micro-slit/main.webp" })
    .eq("slug", "micro-slit-shears");

  if (error1) {
    console.error("Error updating Micro Slit image_url:", error1);
  } else {
    console.log("Successfully updated Micro Slit image_url to /products/micro-slit/main.webp");
  }

  console.log("Updating Fujisan image_url in Supabase...");
  const { error: error2 } = await supabase
    .from("products")
    .update({ image_url: "/products/fujisan/main.webp" })
    .eq("slug", "fujisan-thinning-shears");

  if (error2) {
    console.error("Error updating Fujisan image_url:", error2);
  } else {
    console.log("Successfully updated Fujisan image_url to /products/fujisan/main.webp");
  }
}

updateProductImages();
