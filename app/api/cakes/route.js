import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// GET: Fetch all cakes
export async function GET() {
  try {
    console.log("API: Starting to fetch cakes from database...");

    // Check if MongoDB URI is configured
    if (!process.env.MONGODB_URI) {
      console.error("MONGODB_URI is not configured");
      return NextResponse.json({
        message: "Database connection not configured",
        error: "MONGODB_URI environment variable is missing"
      }, { status: 500 });
    }

    // Add timeout and better error handling for database connection
    const client = await Promise.race([
      clientPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database connection timeout')), 10000)
      )
    ]);

    const db = client.db();
    console.log("API: Successfully connected to database");

    // Fetch all cakes from the 'cakes' collection with timeout
    const cakes = await Promise.race([
      db.collection("cakes").find({}).toArray(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database query timeout')), 5000)
      )
    ]);

    console.log("API: Successfully fetched", cakes.length, "cakes");

    // Return empty array if no cakes found
    if (!cakes || cakes.length === 0) {
      console.log("API: No cakes found, returning fallback data");

      // Fallback data when database is empty or connection fails
      const fallbackCakes = [
        {
          _id: "fallback-1",
          name: "Butterscotch Fudge Cake",
          price: 95,
          image: "/Butterscoch-Fudge-Cake.jpg",
          rating: 4.8,
          description: "A rich, moist cake layered with creamy butterscotch fudge",
          category: "Chocolate",
          stock: 10,
          weight: "1kg",
          ingredients: ["flour", "butter", "sugar", "eggs"]
        },
        {
          _id: "fallback-2",
          name: "Marble Cake",
          price: 89,
          image: "/Marble-Cake-1.jpg",
          rating: 4.6,
          description: "A delicious marble cake with chocolate and vanilla swirls",
          category: "Vanilla",
          stock: 8,
          weight: "1kg",
          ingredients: ["flour", "butter", "sugar", "eggs", "cocoa"]
        },
        {
          _id: "fallback-3",
          name: "Mocha Chocolate Cake",
          price: 105,
          image: "/Mocha-Chocolate-Cake.jpg",
          rating: 4.9,
          description: "Rich chocolate cake with coffee flavor and smooth frosting",
          category: "Chocolate",
          stock: 5,
          weight: "1kg",
          ingredients: ["flour", "butter", "sugar", "eggs", "cocoa", "coffee"]
        }
      ];

      return NextResponse.json(fallbackCakes);
    }

    // Transform the data to ensure consistent structure
    const transformedCakes = cakes.map(cake => ({
      _id: cake._id,
      name: cake.name,
      price: cake.price,
      image: cake.image,
      rating: cake.rating || 4.5,
      description: cake.description || "",
      category: cake.category || "",
      stock: cake.stock || 0,
      weight: cake.weight || "",
      ingredients: cake.ingredients || []
    }));

    return NextResponse.json(transformedCakes);
  } catch (error) {
    console.error("API: Error fetching cakes:", error);

    // If it's a connection error, provide fallback data
    if (error.message.includes('timeout') || error.message.includes('connection')) {
      console.log("API: Connection error, providing fallback data");

      const fallbackCakes = [
        {
          _id: "fallback-1",
          name: "Butterscotch Fudge Cake",
          price: 95,
          image: "/Butterscoch-Fudge-Cake.jpg",
          rating: 4.8,
          description: "A rich, moist cake layered with creamy butterscotch fudge",
          category: "Chocolate",
          stock: 10,
          weight: "1kg",
          ingredients: ["flour", "butter", "sugar", "eggs"]
        },
        {
          _id: "fallback-2",
          name: "Marble Cake",
          price: 89,
          image: "/Marble-Cake-1.jpg",
          rating: 4.6,
          description: "A delicious marble cake with chocolate and vanilla swirls",
          category: "Vanilla",
          stock: 8,
          weight: "1kg",
          ingredients: ["flour", "butter", "sugar", "eggs", "cocoa"]
        },
        {
          _id: "fallback-3",
          name: "Mocha Chocolate Cake",
          price: 105,
          image: "/Mocha-Chocolate-Cake.jpg",
          rating: 4.9,
          description: "Rich chocolate cake with coffee flavor and smooth frosting",
          category: "Chocolate",
          stock: 5,
          weight: "1kg",
          ingredients: ["flour", "butter", "sugar", "eggs", "cocoa", "coffee"]
        }
      ];

      return NextResponse.json(fallbackCakes);
    }

    // Return a more detailed error response
    return NextResponse.json({
      message: "Error fetching cakes",
      error: error.message || "Unknown database error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// POST: Add a new predefined cake to the cakes collection (admin only)
export async function POST(req) {
  try {
    const body = await req.json();
    // Validate required fields
    const { name, price, image, rating, description, category, stock, weight, ingredients } = body;
    if (!name || !price || !image) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection("cakes").insertOne({
      name,
      price,
      image,
      rating: rating || 0,
      description: description || "",
      category: category || "",
      stock: stock || 0,
      weight: weight || "",
      ingredients: ingredients || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return NextResponse.json({ insertedId: result.insertedId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error adding cake", error: error.message }, { status: 500 });
  }
}
