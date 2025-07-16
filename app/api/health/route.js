import { NextResponse } from "next/server";

export async function GET() {
    const envCheck = {
        MONGODB_URI: process.env.MONGODB_URI ? "✓ Configured" : "✗ Missing",
        NODE_ENV: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString()
    };

    return NextResponse.json({
        status: "API Working",
        environment: envCheck
    });
}
