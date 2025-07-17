import { NextResponse } from "next/server";

export async function GET() {
  console.log("API: Simple GET request received");
  
  const testData = [
    {
      _id: "test-1",
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
      _id: "test-2", 
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
      _id: "test-3", 
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
  
  return NextResponse.json(testData);
}

export async function POST() {
  return NextResponse.json({ message: "POST not implemented" }, { status: 501 });
}
