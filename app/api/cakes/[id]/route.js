import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Cake from "@/lib/models/Cake";

export async function GET(request, { params }) {
  await dbConnect();
  const { id } = params;
  try {
    const cake = await Cake.findById(id);
    if (!cake) {
      return NextResponse.json({ message: "Cake not found" }, { status: 404 });
    }
    return NextResponse.json(cake);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching cake", error: error.message }, { status: 500 });
  }
}
