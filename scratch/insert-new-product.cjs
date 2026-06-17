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

async function insertProduct() {
  const slug = "bamboo-thinning-shears";
  const newProduct = {
    slug,
    name: "Bamboo Thinning Shear",
    product_key: "bamboo_thinning",
    tagline: "Eco-conscious blend. Smooth, bulk texturizing.",
    price_cents: 41999,
    image_url: "/products/bamboo-thinning/main.webp",
    short_description: "30 Teeth: Specifically crafted for efficient bulk removal, these shears offer quick and controlled thinning.",
    long_description: "Designed to handle bulk with precision, the ergonomic construction ensures a comfortable grip, allowing hairstylists to effortlessly create texture and remove excess weight.\n\nThe perfect blend of functionality and eco-conscious design for streamlined hairstyling.",
    active: false,
    currency: "usd",
    features: [],
    benefits: [],
    specs: [],
    faq: [],
    rating: 0,
    review_count: 0
  };

  console.log("Checking if bamboo-thinning-shears exists...");
  const { data: existingNew } = await supabase
    .from("products")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existingNew) {
    console.log("Updating existing bamboo-thinning-shears...");
    const { error: updateError } = await supabase
      .from("products")
      .update(newProduct)
      .eq("slug", slug);

    if (updateError) {
      console.error(`Failed to update ${slug}:`, updateError);
    } else {
      console.log(`Successfully updated ${slug}`);
    }
  } else {
    console.log("Checking if legacy bamboo-thinning exists...");
    const { data: existingLegacy } = await supabase
      .from("products")
      .select("id")
      .eq("slug", "bamboo-thinning")
      .maybeSingle();

    if (existingLegacy) {
      console.log("Found legacy bamboo-thinning. Updating its slug and details...");
      const { error: updateError } = await supabase
        .from("products")
        .update(newProduct)
        .eq("slug", "bamboo-thinning");

      if (updateError) {
        console.error("Failed to update legacy bamboo-thinning:", updateError);
      } else {
        console.log("Successfully updated legacy bamboo-thinning to bamboo-thinning-shears");
      }
    } else {
      console.log("Inserting new bamboo-thinning-shears...");
      const { error: insertError } = await supabase
        .from("products")
        .insert(newProduct);

      if (insertError) {
        console.error("Failed to insert bamboo-thinning-shears:", insertError);
      } else {
        console.log("Successfully inserted bamboo-thinning-shears");
      }
    }
  }
}

insertProduct();
