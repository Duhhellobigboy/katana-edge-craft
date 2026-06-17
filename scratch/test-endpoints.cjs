const checkoutSessionId = "44444444-4444-4444-4444-444444444444"; // mock UUID

async function testEndpoints() {
  const url = "http://localhost:8080/api/create-checkout-session";
  
  console.log("Testing create-checkout-session API endpoint...");

  // Test Case 1: Reject unknown variant key
  try {
    const res1 = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        checkoutSessionId,
        items: [{
          productKey: "thunder",
          variantKey: "thunder_invalid",
          quantity: 1
        }],
        fullName: "John Doe",
        email: "john@example.com",
        phone: "555-555-5555"
      })
    });
    const data1 = await res1.json();
    console.log("\nTest Case 1 (Reject unknown variant):");
    console.log("Status:", res1.status);
    console.log("Response:", data1);
  } catch (e) {
    console.error("Test Case 1 failed to execute fetch:", e.message);
  }

  // Test Case 2: Accept legacy Fujisan key (should resolve via env fallback even if DB table is missing)
  try {
    const res2 = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        checkoutSessionId,
        items: [{
          productKey: "fujisan",
          variantKey: "fujisan",
          quantity: 1
        }],
        fullName: "John Doe",
        email: "john@example.com",
        phone: "555-555-5555"
      })
    });
    const data2 = await res2.json();
    console.log("\nTest Case 2 (Accept legacy Fujisan):");
    console.log("Status:", res2.status);
    console.log("Response URL exists:", Boolean(data2.url));
    if (!data2.url) {
      console.log("Response details:", data2);
    }
  } catch (e) {
    console.error("Test Case 2 failed to execute fetch:", e.message);
  }
}

testEndpoints();
