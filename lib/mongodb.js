// lib/mongodb.js
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    family: 4, // Use IPv4, skip trying IPv6
    maxPoolSize: 10, // Maintain up to 10 socket connections
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
            global._mongoClientPromise = client.connect();
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
        clientPromise = client.connect();
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
