import clientPromise from '@/lib/mongodb';
import getUserModel from '@/lib/models/User';
import { NextResponse } from 'next/server';

// POST /api/auth/check-status - Check if a user account is active
export async function POST(req) {
  try {
    const data = await req.json();
    const { email, userId } = data;
    
    if (!email && !userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email or userId required' 
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('cakezone');
    const users = getUserModel(db);
    
    // Find user by email or userId (Clerk ID)
    const query = email ? { email } : { clerkId: userId };
    const user = await users.findOne(query);
    
    if (!user) {
      // User not found in MongoDB (might be a new Clerk user)
      // Default to active for new users
      return NextResponse.json({ 
        success: true, 
        data: { status: 'Active', isNewUser: true } 
      });
    }

    // Return user status
    return NextResponse.json({ 
      success: true, 
      data: { 
        status: user.status || 'Active',
        role: user.role || 'customer',
        isNewUser: false 
      } 
    });

  } catch (err) {
    console.error('Status check error:', err);
    return NextResponse.json({ 
      success: false, 
      error: 'Status check failed' 
    }, { status: 500 });
  }
}