import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(req) {
  const { email } = await req.json();

  console.log("📥 Incoming email:", email); // 👈 LOG

  if (!email) {
    return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db('cakezone'); // ✅ Make sure your DB name is 'cakezone'

    const user = await db.collection('users').findOne({
      email: new RegExp(`^${email}$`, 'i') // ✅ case-insensitive match
    });

    console.log("🔍 MongoDB User Result:", user); // 👈 LOG

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, role: user.role });
  } catch (error) {
    console.error("❌ MongoDB Error:", error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
