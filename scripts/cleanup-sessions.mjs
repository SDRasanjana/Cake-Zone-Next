// Cleanup script for expired checkout sessions
// This should be run periodically to clean up abandoned checkout sessions

import clientPromise from "../lib/mongodb.js";

async function cleanupExpiredSessions() {
  try {
    const client = await clientPromise;
    const db = client.db("cakezone");
    
    const result = await db.collection("checkout_sessions").deleteMany({
      expiresAt: { $lt: new Date() }
    });
    
    console.log(`Cleaned up ${result.deletedCount} expired checkout sessions`);
    return result.deletedCount;
  } catch (error) {
    console.error("Error cleaning up expired sessions:", error);
    throw error;
  }
}

// If run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanupExpiredSessions()
    .then((count) => {
      console.log(`Successfully cleaned up ${count} expired sessions`);
      process.exit(0);
    })
    .catch((error) => {
      console.error("Cleanup failed:", error);
      process.exit(1);
    });
}

export { cleanupExpiredSessions };