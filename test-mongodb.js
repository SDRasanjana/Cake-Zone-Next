// Test MongoDB connection
import clientPromise from "./lib/mongodb.js";

async function testConnection() {
    try {
        console.log("Testing MongoDB connection...");
        console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);

        const client = await clientPromise;
        const db = client.db("cakezone");

        // Test the connection by listing collections
        const collections = await db.listCollections().toArray();
        console.log("✅ MongoDB connection successful!");
        console.log("Available collections:", collections.map(c => c.name));

        // Test a simple query
        const ordersCount = await db.collection("orders").countDocuments();
        console.log("Orders count:", ordersCount);

    } catch (error) {
        console.error("❌ MongoDB connection failed:");
        console.error("Error type:", error.constructor.name);
        console.error("Error message:", error.message);

        if (error.message.includes("Server selection timed out")) {
            console.log("\n🔍 Troubleshooting tips:");
            console.log("1. Check if MongoDB Atlas cluster is running");
            console.log("2. Verify IP address is whitelisted (0.0.0.0/0 for development)");
            console.log("3. Check MongoDB URI format");
            console.log("4. Ensure network connectivity");
        }
    }
}

testConnection();
