import clientPromise from '@/lib/mongodb';
import getUserModel from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

// POST /api/auth/register (for customers only)
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
    const existing = await users.findOne({ email });
    if (existing) {
      return NextResponse.json({ success: false, error: 'User already exists' }, { status: 400 });
    }
    const hash = await bcrypt.hash(password, 10);
    const now = new Date();
    const user = {
      email,
      password: hash,
      role: 'customer',
      createdAt: now,
      updatedAt: now
    };
    await users.insertOne(user);
    return NextResponse.json({ success: true, data: { email, role: 'customer' } }, { status: 201 });
  } catch (err) {
  console.error("Registration error:", err);
  return NextResponse.json({ success: false, error: 'Registration failed' }, { status: 500 });
}
}
