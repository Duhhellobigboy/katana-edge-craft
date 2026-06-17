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
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function dumpProductsDetails() {
  const { data, error } = await supabase
    .from("products")
    .select("*");

  if (error) {
    console.error("Error querying products:", error);
    process.exit(1);
  }

  console.log("Products detail dump:");
  data.forEach(p => {
    console.log(`- Slug: ${p.slug}
    Name: ${p.name}
    Product Key: ${p.product_key}
    Active: ${p.active}
    Price Cents: ${p.price_cents}
    Stripe Price ID: ${p.stripe_price_id}
    Stripe Product ID: ${p.stripe_product_id}
    Image URL: ${p.image_url}
    Gallery: ${JSON.stringify(p.gallery)}`);
  });
}

dumpProductsDetails();
