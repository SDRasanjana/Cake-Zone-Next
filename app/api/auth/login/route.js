import clientPromise from '@/lib/mongodb';
import getUserModel from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

// POST /api/auth/login (all roles)
export async function POST(req) {
  try {
    const data = await req.json();
    const { email, password } = data;
    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db('cakezone');
    const users = getUserModel(db);
    const user = await users.findOne({ email });
    if (!user) {
      // Not found in MongoDB, fallback to Clerk (customer)
      return NextResponse.json({ success: false, error: 'Use customer login via Clerk' }, { status: 401 });
    }
    // Owner/Admin: check password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }
    // Return role for frontend to redirect
    return NextResponse.json({ success: true, data: { email, role: user.role } });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Login failed' }, { status: 500 });
  }
}
