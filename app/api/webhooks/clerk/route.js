import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import getUserModel from '@/lib/models/User';

// Clerk webhook endpoint for user deletion
export async function POST(req) {
  try {
    const event = await req.json();
    if (event.type === 'user.deleted') {
      const email = event.data.email_addresses?.[0]?.email_address;
      if (email) {
        const client = await clientPromise;
        const db = client.db('cakezone');
        const users = getUserModel(db);
        await users.deleteOne({ email });
        return NextResponse.json({ success: true, message: 'User deleted from MongoDB' });
      }
    }
    return NextResponse.json({ success: false, error: 'Invalid event or missing email' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Webhook error' }, { status: 500 });
  }
}
