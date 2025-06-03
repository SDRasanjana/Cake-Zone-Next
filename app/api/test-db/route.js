import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
    try {
        console.log('Testing MongoDB connection...');
        const client = await clientPromise;
        console.log('Client connected successfully');

        const db = client.db("CakeZone");
        console.log('Database accessed successfully');

        // Test if we can access the database
        const collections = await db.listCollections().toArray();
        console.log('Available collections:', collections.map(c => c.name));

        return NextResponse.json({
            success: true,
            message: 'Database connection successful',
            collections: collections.map(c => c.name)
        });
    } catch (error) {
        console.error('Database connection error:', error);
        return NextResponse.json({
            success: false,
            error: 'Database connection failed',
            message: error.message
        }, { status: 500 });
    }
}
