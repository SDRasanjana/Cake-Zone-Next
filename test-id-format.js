// Test script to demonstrate the new ID formatting
// Run with: node test-id-format.js

// Test script to demonstrate the new improved ID formatting
// Run with: node test-id-format.js

const formatOrderId = (id) => {
  if (!id) return "CZO001";
  // Create a more predictable numeric ID based on the original ID
  const lastPart = id.slice(-8); // Take last 8 characters
  let numericValue = 0;
  
  // Convert characters to numbers (letters become numbers too)
  for (let i = 0; i < lastPart.length; i++) {
    const char = lastPart[i];
    if (char >= '0' && char <= '9') {
      numericValue = numericValue * 10 + parseInt(char);
    } else {
      // Convert letters to numbers (a=1, b=2, etc.)
      numericValue = numericValue * 10 + (char.toLowerCase().charCodeAt(0) - 96);
    }
  }
  
  // Ensure we get a 3-digit number between 001-999
  const finalId = (Math.abs(numericValue) % 999) + 1;
  return `CZO${finalId.toString().padStart(3, '0')}`;
};

const formatUserId = (id) => {
  if (!id) return "CZC001";
  // Create a more predictable numeric ID based on the original ID
  const lastPart = id.slice(-8); // Take last 8 characters
  let numericValue = 0;
  
  // Convert characters to numbers (letters become numbers too)
  for (let i = 0; i < lastPart.length; i++) {
    const char = lastPart[i];
    if (char >= '0' && char <= '9') {
      numericValue = numericValue * 10 + parseInt(char);
    } else {
      // Convert letters to numbers (a=1, b=2, etc.)
      numericValue = numericValue * 10 + (char.toLowerCase().charCodeAt(0) - 96);
    }
  }
  
  // Ensure we get a 3-digit number between 001-999
  const finalId = (Math.abs(numericValue) % 999) + 1;
  return `CZC${finalId.toString().padStart(3, '0')}`;
};

// Test with sample MongoDB ObjectIds and User IDs
console.log("=== Order ID Format Test ===");
console.log("MongoDB ObjectId: 67890abcdef12345 → " + formatOrderId("67890abcdef12345"));
console.log("MongoDB ObjectId: 678901234567890a → " + formatOrderId("678901234567890a"));
console.log("MongoDB ObjectId: 5f8d12345abcdef0 → " + formatOrderId("5f8d12345abcdef0"));

console.log("\n=== User ID Format Test ===");
console.log("User ID: user_abc123xyz789def → " + formatUserId("user_abc123xyz789def"));
console.log("User ID: user_xyz456abc123ghi → " + formatUserId("user_xyz456abc123ghi"));
console.log("User ID: user_2N5X7QK8R3P9M1L4 → " + formatUserId("user_2N5X7QK8R3P9M1L4"));

console.log("\n=== Edge Cases Test ===");
console.log("Empty OrderId: '' → " + formatOrderId(""));
console.log("Empty UserId: '' → " + formatUserId(""));
console.log("Short ID: '123' → " + formatOrderId("123"));