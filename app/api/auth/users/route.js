import clientPromise from '@/lib/mongodb';
import getUserModel from '@/lib/models/User';
import { NextResponse } from 'next/server';

// TEMPORARY: GET /api/auth/users - List all users (for debug only)
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('cakezone');
    const users = getUserModel(db);
    const allUsers = await users.find({}, { projection: { password: 0 } }).toArray(); // Hide password
    return NextResponse.json({ success: true, data: allUsers });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
  }
}
