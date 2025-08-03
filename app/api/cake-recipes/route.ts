import { NextResponse } from "next/server";
import { ObjectId, MongoClient } from "mongodb";

// Force Node.js runtime to support MongoDB connections
export const runtime = "nodejs";

// Import with proper typing
const clientPromise: Promise<MongoClient> = import("@/lib/mongodb").then(
  (m) => m.default
);

// GET: Fetch all cake recipes
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("cakezone");

    const recipes = await db.collection("cake_recipes").find({}).toArray();

    return NextResponse.json({
      success: true,
      data: recipes,
    });
  } catch (error) {
    console.error("Error fetching cake recipes:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch cake recipes",
        data: [],
      },
      { status: 500 }
    );
  }
}

// POST: Create a new cake recipe
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      category,
      ingredients,
      yield: cakeYield,
      laborCost,
      overheadCost,
    } = body;

    // Enhanced validation
    if (!name || !category || !ingredients || !Array.isArray(ingredients)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: name, category, and ingredients array are required",
        },
        { status: 400 }
      );
    }

    // Validate ingredients array
    if (ingredients.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "At least one ingredient is required",
        },
        { status: 400 }
      );
    }

    // Validate each ingredient has required fields
    const invalidIngredients = ingredients.filter(
      (ing: { name?: string; quantity?: number; unit?: string }) =>
        !ing.name || typeof ing.quantity !== "number" || !ing.unit
    );

    if (invalidIngredients.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Each ingredient must have name, quantity (number), and unit",
        },
        { status: 400 }
      );
    }

    // Validate numeric fields
    if (cakeYield && (typeof cakeYield !== "number" || cakeYield <= 0)) {
      return NextResponse.json(
        {
          success: false,
          error: "Yield must be a positive number",
        },
        { status: 400 }
      );
    }

    if (laborCost && (typeof laborCost !== "number" || laborCost < 0)) {
      return NextResponse.json(
        {
          success: false,
          error: "Labor cost must be a non-negative number",
        },
        { status: 400 }
      );
    }

    if (
      overheadCost &&
      (typeof overheadCost !== "number" || overheadCost < 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Overhead cost must be a non-negative number",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("cakezone");

    const recipe = {
      name,
      category,
      ingredients,
      yield: cakeYield || 1,
      laborCost: laborCost || 0,
      overheadCost: overheadCost || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("cake_recipes").insertOne(recipe);

    return NextResponse.json({
      success: true,
      data: { _id: result.insertedId, ...recipe },
    });
  } catch (error) {
    console.error("Error creating cake recipe:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create cake recipe",
      },
      { status: 500 }
    );
  }
}

// PUT: Update an existing cake recipe
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      _id,
      name,
      category,
      ingredients,
      yield: cakeYield,
      laborCost,
      overheadCost,
    } = body;

    if (!_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Recipe ID is required",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("cakezone");

    const updateData = {
      name,
      category,
      ingredients,
      yield: cakeYield || 1,
      laborCost: laborCost || 0,
      overheadCost: overheadCost || 0,
      updatedAt: new Date(),
    };

    const result = await db
      .collection("cake_recipes")
      .updateOne({ _id: new ObjectId(_id) }, { $set: updateData });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Recipe not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { _id, ...updateData },
    });
  } catch (error) {
    console.error("Error updating cake recipe:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update cake recipe",
      },
      { status: 500 }
    );
  }
}

// DELETE: Delete a cake recipe
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Recipe ID is required",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("cakezone");

    const result = await db
      .collection("cake_recipes")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Recipe not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Recipe deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting cake recipe:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete cake recipe",
      },
      { status: 500 }
    );
  }
}
