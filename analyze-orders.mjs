// Script to identify and clean up existing problematic orders
// This helps clean up any orders that were created before the fix

import clientPromise from "./lib/mongodb.js";

async function analyzePendingOrders() {
  try {
    console.log('Analyzing existing orders in the database...');
    
    const client = await clientPromise;
    const db = client.db("cakezone");
    
    // Find all orders with pending payment status
    const pendingOrders = await db.collection("orders").find({
      paymentStatus: "pending"
    }).toArray();
    
    console.log(`\nFound ${pendingOrders.length} orders with pending payment status`);
    
    if (pendingOrders.length > 0) {
      console.log('\nPending Orders Analysis:');
      pendingOrders.forEach((order, index) => {
        const createdDate = new Date(order.createdAt);
        const ageInHours = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);
        
        console.log(`${index + 1}. Order ID: ${order._id}`);
        console.log(`   User: ${order.userId}`);
        console.log(`   Total: $${order.total}`);
        console.log(`   Created: ${createdDate.toLocaleString()}`);
        console.log(`   Age: ${ageInHours.toFixed(1)} hours`);
        console.log(`   Status: ${order.status} | Payment: ${order.paymentStatus}`);
        console.log('');
      });
      
      // Count orders older than 1 hour (likely abandoned)
      const abandonedOrders = pendingOrders.filter(order => {
        const ageInHours = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60);
        return ageInHours > 1;
      });
      
      console.log(`\n📊 Summary:`);
      console.log(`Total pending orders: ${pendingOrders.length}`);
      console.log(`Likely abandoned (>1h old): ${abandonedOrders.length}`);
      
      if (abandonedOrders.length > 0) {
        console.log(`\n⚠️  Recommendation: Consider removing ${abandonedOrders.length} abandoned orders`);
        console.log('These are likely from users who abandoned checkout before our fix.');
      }
    } else {
      console.log('✅ No pending orders found - database is clean!');
    }
    
    // Check for any very recent orders to see if the fix is working
    const recentOrders = await db.collection("orders").find({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    }).sort({ createdAt: -1 }).toArray();
    
    console.log(`\n📈 Recent Orders (last 24h): ${recentOrders.length}`);
    if (recentOrders.length > 0) {
      const paidOrders = recentOrders.filter(order => order.paymentStatus === "paid");
      const pendingRecent = recentOrders.filter(order => order.paymentStatus === "pending");
      
      console.log(`   ✅ Paid orders: ${paidOrders.length}`);
      console.log(`   ⏳ Pending orders: ${pendingRecent.length}`);
      
      if (pendingRecent.length === 0) {
        console.log('🎉 All recent orders are paid - fix is working!');
      }
    }
    
  } catch (error) {
    console.error("Error analyzing orders:", error);
  }
}

// Optional: Function to clean up abandoned orders (use with caution)
async function cleanupAbandonedOrders(dryRun = true) {
  try {
    const client = await clientPromise;
    const db = client.db("cakezone");
    
    // Find orders older than 1 hour with pending payment
    const cutoffTime = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
    
    const abandonedOrders = await db.collection("orders").find({
      paymentStatus: "pending",
      createdAt: { $lt: cutoffTime }
    }).toArray();
    
    console.log(`\nFound ${abandonedOrders.length} abandoned orders to clean up`);
    
    if (dryRun) {
      console.log('🔍 DRY RUN - No orders will be deleted');
      abandonedOrders.forEach(order => {
        console.log(`Would delete: ${order._id} (${order.userId}, $${order.total})`);
      });
    } else {
      console.log('🗑️  DELETING abandoned orders...');
      const result = await db.collection("orders").deleteMany({
        paymentStatus: "pending",
        createdAt: { $lt: cutoffTime }
      });
      console.log(`✅ Deleted ${result.deletedCount} abandoned orders`);
    }
    
  } catch (error) {
    console.error("Error cleaning up orders:", error);
  }
}

// Run analysis
if (import.meta.url === `file://${process.argv[1]}`) {
  analyzePendingOrders()
    .then(() => {
      console.log('\n💡 To run cleanup: node analyze-orders.mjs cleanup');
      console.log('💡 To run dry cleanup: node analyze-orders.mjs cleanup-dry');
    })
    .catch(console.error);
}

export { analyzePendingOrders, cleanupAbandonedOrders };