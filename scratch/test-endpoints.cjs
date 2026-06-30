const checkoutSessionId = "44444444-4444-4444-4444-444444444444"; // mock UUID

async function runTests() {
  const url = "http://localhost:8080/api/create-checkout-session";
  console.log("Starting Stripe mapping verification tests...");

  // Test Case 1: Valid product key (thunder)
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        checkoutSessionId,
        items: [{ productKey: "thunder", quantity: 1 }],
        fullName: "John Doe",
        email: "john@example.com",
        phone: "555-555-5555"
      })
    });
    const data = await res.json();
    console.log("\nTest Case 1 (Valid productKey: thunder):");
    console.log("Status:", res.status);
    console.log("URL generated:", Boolean(data.url));
    if (!data.url) console.log("Response details:", data);
  } catch (e) {
    console.error("Test Case 1 failed:", e.message);
  }

  // Test Case 2: Invalid product key (unknown)
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        checkoutSessionId,
        items: [{ productKey: "unknown_product_key", quantity: 1 }],
        fullName: "John Doe",
        email: "john@example.com",
        phone: "555-555-5555"
      })
    });
    const data = await res.json();
    console.log("\nTest Case 2 (Invalid productKey: unknown_product_key):");
    console.log("Status:", res.status);
    console.log("Response:", data);
  } catch (e) {
    console.error("Test Case 2 failed:", e.message);
  }

  // Test Case 3: Empty product key but variantKey starts with bamboo_thinning
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        checkoutSessionId,
        items: [{ productKey: "", variantKey: "bamboo_thinning_60_classic", quantity: 1 }],
        fullName: "John Doe",
        email: "john@example.com",
        phone: "555-555-5555"
      })
    });
    const data = await res.json();
    console.log("\nTest Case 3 (Resolve bamboo_thinning from variantKey):");
    console.log("Status:", res.status);
    console.log("URL generated:", Boolean(data.url));
    if (!data.url) console.log("Response details:", data);
  } catch (e) {
    console.error("Test Case 3 failed:", e.message);
  }

  // Test Case 4: Empty product key but variantKey starts with bamboo
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        checkoutSessionId,
        items: [{ productKey: "", variantKey: "bamboo_60_classic", quantity: 1 }],
        fullName: "John Doe",
        email: "john@example.com",
        phone: "555-555-5555"
      })
    });
    const data = await res.json();
    console.log("\nTest Case 4 (Resolve bamboo from variantKey):");
    console.log("Status:", res.status);
    console.log("URL generated:", Boolean(data.url));
    if (!data.url) console.log("Response details:", data);
  } catch (e) {
    console.error("Test Case 4 failed:", e.message);
  }
}

runTests();
