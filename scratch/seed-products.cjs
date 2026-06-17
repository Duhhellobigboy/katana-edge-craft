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

// Define fallback products statically here (derived from products.ts)
const productsToSeed = [
  {
    slug: "micro-slit-shears",
    name: "Micro Slit",
    product_key: "microslit",
    tagline: "Stable, precise dry and wet cutting.",
    price_cents: 109999,
    image_url: "/src/assets/product-microslit.jpg",
    short_description: "Patent-protected shears designed for stable, precise dry and wet hair cutting.",
    long_description: "After years of testing different blade materials and shapes, Micro Slit was created as a better solution for dry hair cutting. Its patent-protected microscopic slits are laser-cut into one side of the blade to help keep dry hair stable while cutting.\n\nDesigned with flat screws and a refined professional finish, Micro Slit delivers precise, comfortable, and effortless cutting for both dry and wet hair.",
    rating: 4.9,
    review_count: 892,
    active: true,
    features: [],
    benefits: [],
    specs: [],
    faq: []
  },
  {
    slug: "fujisan-thinning-shears",
    name: "Fujisan",
    product_key: "fujisan",
    tagline: "Smooth blending. Healthier results.",
    price_cents: 85999,
    image_url: "/src/assets/product-fujisan.jpg",
    short_description: "Premium thinning shears built for smooth blending, clean movement, and healthier results.",
    long_description: "Fujisan is designed to upgrade precision cutting while protecting hair health. The custom-grooved design helps create a smooth, jam-free cut, while rounded corner teeth allow clean movement through the hair.\n\nBuilt for professional stylists and barbers, Fujisan helps reduce stress during blending, softening, and texture work.",
    rating: 4.9,
    review_count: 1248,
    active: true,
    features: [],
    benefits: [],
    specs: [],
    faq: []
  },
  {
    slug: "thunder-shears",
    name: "Thunder",
    product_key: "thunder",
    tagline: "Heavy-duty power. Smooth slices.",
    price_cents: 67999,
    image_url: "/products/thunder/main.webp",
    short_description: "Heavy-duty slicing shears optimized for thick textures and raw power.",
    long_description: "Thunder is engineered with thick, leaf-shaped convex blades designed to slide through dense bulk texturing effortlessly.",
    rating: 0,
    review_count: 0,
    active: false,
    features: [],
    benefits: [],
    specs: [],
    faq: []
  },
  {
    slug: "double-swivel-shears",
    name: "Double Swivel",
    product_key: "double_swivel",
    tagline: "Double axis swivel. Absolute wrist relief.",
    price_cents: 87999,
    image_url: "/products/double-swivel/main.webp",
    short_description: "Double-articulating swivel-handle shears offering maximum ergonomic comfort and wrist relief.",
    long_description: "Double Swivel features two fully independent rotating joints on the thumb ring to reduce repetitive strain injuries.",
    rating: 0,
    review_count: 0,
    active: false,
    features: [],
    benefits: [],
    specs: [],
    faq: []
  },
  {
    slug: "naruto-shears",
    name: "Naruto",
    product_key: "naruto",
    tagline: "Precision blending. Lightweight comfort.",
    price_cents: 57999,
    image_url: "/products/naruto/main.webp",
    short_description: "Ergonomic thinning shears with custom circular cutouts for smooth blending.",
    long_description: "Naruto integrates hollowed blade cutouts to decrease weight while maintaining perfect tension for slide and weight reduction cuts.",
    rating: 0,
    review_count: 0,
    active: false,
    features: [],
    benefits: [],
    specs: [],
    faq: []
  },
  {
    slug: "karakuri-shears",
    name: "Karakuri",
    product_key: "karakuri",
    tagline: "Matte black finish. Precision control.",
    price_cents: 71999,
    image_url: "/products/karakuri/main.webp",
    short_description: "Professional offsets shears featuring a tactical matte black handle coating.",
    long_description: "Karakuri combines structural stiffness with offset rings to protect wrists during heavy, block-style hair cuts.",
    rating: 0,
    review_count: 0,
    active: false,
    features: [],
    benefits: [],
    specs: [],
    faq: []
  },
  {
    slug: "bamboo-shears",
    name: "Bamboo",
    product_key: "bamboo",
    tagline: "Classic balance. Custom jewel tensioner.",
    price_cents: 51999,
    image_url: "/products/bamboo/main.webp",
    short_description: "Classic straight shears fitted with a green-jewel tension adjuster.",
    long_description: "Bamboo offers a balanced body and convex edge that excels at wet blunt cutting and solid line construction.",
    rating: 0,
    review_count: 0,
    active: false,
    features: [],
    benefits: [],
    specs: [],
    faq: []
  },
  {
    slug: "bamboo-thinning",
    name: "Bamboo Thinning",
    product_key: "bamboo_thinning",
    tagline: "Eco-conscious blend. Smooth, bulk texturizing.",
    price_cents: 41999,
    image_url: "/products/bamboo-thinning/main.webp",
    short_description: "30 Teeth: Specifically crafted for efficient bulk removal, these shears offer quick and controlled thinning.",
    long_description: "Designed to handle bulk with precision, the ergonomic construction ensures a comfortable grip, allowing hairstylists to effortlessly create texture and remove excess weight.\n\nThe perfect blend of functionality and eco-conscious design for streamlined hairstyling.",
    rating: 0,
    review_count: 0,
    active: false,
    features: [],
    benefits: [],
    specs: [],
    faq: []
  }
];

async function seedProducts() {
  console.log("Starting product seeding...");
  for (const prod of productsToSeed) {
    console.log(`Upserting ${prod.slug} (${prod.name})...`);
    
    // Check if it already exists
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("slug", prod.slug)
      .maybeSingle();

    if (existing) {
      const { error: updateError } = await supabase
        .from("products")
        .update({
          name: prod.name,
          product_key: prod.product_key,
          tagline: prod.tagline,
          price_cents: prod.price_cents,
          image_url: prod.image_url,
          short_description: prod.short_description,
          long_description: prod.long_description,
          active: prod.active
        })
        .eq("slug", prod.slug);

      if (updateError) {
        console.error(`Failed to update ${prod.slug}:`, updateError);
      } else {
        console.log(`Successfully updated ${prod.slug}`);
      }
    } else {
      const { error: insertError } = await supabase
        .from("products")
        .insert({
          slug: prod.slug,
          name: prod.name,
          product_key: prod.product_key,
          tagline: prod.tagline,
          price_cents: prod.price_cents,
          image_url: prod.image_url,
          short_description: prod.short_description,
          long_description: prod.long_description,
          active: prod.active,
          currency: "usd",
          features: prod.features,
          benefits: prod.benefits,
          specs: prod.specs,
          faq: prod.faq,
          rating: prod.rating,
          review_count: prod.review_count
        });

      if (insertError) {
        console.error(`Failed to insert ${prod.slug}:`, insertError);
      } else {
        console.log(`Successfully inserted ${prod.slug}`);
      }
    }
  }
  console.log("Seeding complete!");
}

seedProducts();
