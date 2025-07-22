import { NextResponse } from "next/server";

export async function GET() {
    console.log("API: Simple GET request received");

    const testData = [
        {
            _id: "test-1",
            name: "Test Cake 1",
            price: 100,
            image: "/Butterscoch-Fudge-Cake.jpg",
            rating: 4.5,
            description: "Test cake description",
            category: "Test",
            stock: 10,
            weight: "1kg",
            ingredients: ["flour", "sugar"]
        },
        {
            _id: "test-2",
            name: "Test Cake 2",
            price: 120,
            image: "/Marble-Cake-1.jpg",
            rating: 4.7,
            description: "Another test cake",
            category: "Test",
            stock: 5,
            weight: "1kg",
            ingredients: ["flour", "butter"]
        }
    ];

    return NextResponse.json(testData);
}

export async function POST() {
    return NextResponse.json({ message: "POST not implemented" }, { status: 501 });
}
