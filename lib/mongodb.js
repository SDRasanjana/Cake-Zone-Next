// lib/mongodb.js
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {
    serverSelectionTimeoutMS: 15000, // Increased timeout to 15s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    connectTimeoutMS: 15000, // Give more time to establish initial connection
    family: 4, // Use IPv4, skip trying IPv6
    maxPoolSize: 10, // Maintain up to 10 socket connections
    retryWrites: true,
    retryReads: true,
    maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not defined in environment variables");
    throw new Error("Please add your MongoDB URI to .env.local");
}

if (process.env.NODE_ENV === "development") {
    // Use a global variable to preserve value across hot reloads
    if (!global._mongoClientPromise) {
        try {
            client = new MongoClient(uri, options);
            global._mongoClientPromise = client.connect().catch(error => {
                console.error("MongoDB connection failed:", error);
                // Reset the promise so it can be retried
                global._mongoClientPromise = null;
                throw error;
            });
        } catch (error) {
            console.error("Failed to create MongoDB client:", error);
            throw error;
        }
    }
    clientPromise = global._mongoClientPromise;
} else {
    // In production, it's best to not use a global variable
    try {
        client = new MongoClient(uri, options);
        clientPromise = client.connect().catch(error => {
            console.error("MongoDB connection failed in production:", error);
            throw error;
        });
    } catch (error) {
        console.error("Failed to create MongoDB client in production:", error);
        throw error;
    }
}

// Add connection event listeners
if (client) {
    client.on('error', (error) => {
        console.error('MongoDB connection error:', error);
    });

    client.on('open', () => {
        console.log('MongoDB connection opened');
    });

    client.on('close', () => {
        console.log('MongoDB connection closed');
    });
}

export default clientPromise;
