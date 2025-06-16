import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    return NextResponse.json({ message: "Database connected successfully!" });
  } catch (error) {
    return NextResponse.json({ error: "Database connection error: " + error }, { status: 500 });
  }
}