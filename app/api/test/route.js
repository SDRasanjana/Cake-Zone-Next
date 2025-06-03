// app/api/test/route.js
import clientPromise from "@/lib/mongodb";

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db("cakezone"); // DB name
        const collection = db.collection("cake");

        const data = await collection.find({}).toArray();

        return Response.json(data);
    } catch (error) {
        console.error(error);
        return new Response("Error fetching data", { status: 500 });
    }
}
