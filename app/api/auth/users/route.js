// Force Node.js runtime to support MongoDB connections
export const runtime = 'nodejs';

import clientPromise from '@/lib/mongodb';
import getUserModel from '@/lib/models/User';
import { NextResponse } from 'next/server';
import { updateClerkUserRoleByEmail, createClerkUser } from '@/lib/clerkApi';

// GET /api/auth/users - List all users (for admin dashboard)
export async function GET() {
  try {
    console.log("📋 Fetching users from MongoDB...");
    const client = await clientPromise;
    const db = client.db('cakezone');
    const users = getUserModel(db);
    const allUsers = await users.find({}, { projection: { password: 0 } }).toArray(); // Hide password
    console.log(`✅ Found ${allUsers.length} users in MongoDB`);
    return NextResponse.json({ success: true, data: allUsers });
  } catch (err) {
    console.error("❌ Failed to fetch users:", err);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to fetch users: ${err.message}` 
    }, { status: 500 });
  }
}

// POST /api/auth/users - Add a new user (admin/owner only)
export async function POST(req) {
  try {
    const { name, email, password, role, status = 'Active', creatorRole } = await req.json();
    // Only admin/owner can add users
    if (!creatorRole || !['admin', 'owner'].includes(creatorRole)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }
    if (!name || !email || !role) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    if (['admin', 'owner'].includes(role) && !password) {
      return NextResponse.json({ success: false, error: 'Password required for admin/owner' }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db('cakezone');
    const users = getUserModel(db);
    // Check if user already exists
    const exists = await users.findOne({ email });
    if (exists) {
      return NextResponse.json({ success: false, error: 'User already exists' }, { status: 409 });
    }
    // Hash password for admin/owner (simple hash for demo, use bcrypt in production)
    let hashedPassword = password;
    if (password) {
      // TODO: Replace with bcrypt in production
      hashedPassword = Buffer.from(password).toString('base64');
    }
    const now = new Date();
    const newUser = {
      name,
      email,
      password: hashedPassword || undefined,
      role,
      status,
      createdAt: now,
      updatedAt: now,
    };
    await users.insertOne(newUser);
    // --- Clerk: Check if user exists, create if not, or update role if exists ---
    const { getClerkUserByEmail } = await import('@/lib/clerkApi');
    const existingClerkUser = await getClerkUserByEmail(email);
    
    let clerkResult;
    if (existingClerkUser) {
      // User exists in Clerk, just update their role
      clerkResult = await updateClerkUserRoleByEmail(email, role);
      if (!clerkResult.success) {
        return NextResponse.json({ 
          success: false, 
          error: 'User added to DB but failed to update Clerk user role: ' + clerkResult.error 
        }, { status: 500 });
      }
    } else {
      // User doesn't exist in Clerk, create new user
      clerkResult = await createClerkUser({ email, password, role });
      if (!clerkResult.success) {
        return NextResponse.json({ 
          success: false, 
          error: 'User added to DB but failed to create Clerk user: ' + clerkResult.error 
        }, { status: 500 });
      }
    }
    
    return NextResponse.json({ success: true, data: { ...newUser, password: undefined } });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to add user' }, { status: 500 });
  }
}

// PATCH /api/auth/users - Update user status or role (admin/owner only)
export async function PATCH(req) {
  try {
    const { userId, status, role, updaterRole } = await req.json();
    if (!updaterRole || !['admin', 'owner'].includes(updaterRole)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db('cakezone');
    const users = getUserModel(db);
    const update = { updatedAt: new Date() };
    if (status) update.status = status;
    if (role) update.role = role;
    const result = await users.updateOne({ _id: typeof userId === 'string' ? new (await import('mongodb')).ObjectId(userId) : userId }, { $set: update });
    if (result.modifiedCount === 0) {
      return NextResponse.json({ success: false, error: 'User not found or not updated' }, { status: 404 });
    }
    // --- Clerk: update role in Clerk metadata if role changed ---
    if (role) {
      // Find user by id to get email
      const userDoc = await users.findOne({ _id: typeof userId === 'string' ? new (await import('mongodb')).ObjectId(userId) : userId });
      if (userDoc && userDoc.email) {
        await updateClerkUserRoleByEmail(userDoc.email, role);
      }
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to update user' }, { status: 500 });
  }
}
