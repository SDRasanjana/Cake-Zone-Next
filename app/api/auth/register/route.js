import clientPromise from '@/lib/mongodb';
import getUserModel from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { updateClerkUserRoleByEmail } from '@/lib/clerkApi';

// POST /api/auth/register (for customers only)
export async function POST(req) {
  try {
    const data = await req.json();
    const { email, password, name, firstName, lastName, imageUrl } = data;
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
    // For clerk-oauth users, we don't need to hash the password since Clerk handles authentication
    const hashedPassword = password === 'clerk-oauth' ? 'clerk-managed' : await bcrypt.hash(password, 10);
    
    const now = new Date();
    const user = { //Registration API creates MongoDB user with role customer and status Active in
      email,
      password: hashedPassword,
      name: name || email.split('@')[0], // Use name or fallback to email username
      firstName: firstName || '',
      lastName: lastName || '',
      imageUrl: imageUrl || '',
      role: 'customer',
      status: 'Active',
      createdAt: now,
      updatedAt: now
    };
    
    console.log("💾 Attempting to save user to MongoDB:", { 
      email, 
      name: user.name, 
      firstName: user.firstName,
      lastName: user.lastName,
      role: 'customer' 
    });
    
    const result = await users.insertOne(user);
    console.log("✅ User saved to MongoDB with ID:", result.insertedId);
    
    // Update Clerk user's publicMetadata with role
    try {
      const clerkResult = await updateClerkUserRoleByEmail(email, 'customer');
      if (!clerkResult.success) {
        console.warn('Failed to update Clerk user role:', clerkResult.error);
      }
    } catch (clerkError) {
      console.warn('Error updating Clerk user role:', clerkError);
    }
    
    return NextResponse.json({ success: true, data: { email, role: 'customer' } }, { status: 201 });
  } catch (err) {
    console.error("❌ Registration error details:", {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    return NextResponse.json({ 
      success: false, 
      error: `Registration failed: ${err.message}` 
    }, { status: 500 });
  }
}
