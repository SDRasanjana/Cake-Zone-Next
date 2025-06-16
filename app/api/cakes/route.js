import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Cake from "@/lib/models/Cake";

export async function GET() {
  await dbConnect();
  const cakes = await Cake.find({});
  return NextResponse.json(cakes);
}

// You can add POST, PUT, DELETE handlers here for admin functionality
