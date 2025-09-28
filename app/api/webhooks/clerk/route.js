import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import getUserModel from '@/lib/models/User';

// Clerk webhook endpoint for user deletion
export async function POST(req) {
  try {
    const event = await req.json();
    console.log('Clerk Webhook Event:', JSON.stringify(event, null, 2));
    if (event.type === 'user.deleted') {
      const email = event.data.email_addresses?.[0]?.email_address;
      console.log('User deleted event received for email:', email);
      if (email) {
        const client = await clientPromise;
        const db = client.db('cakezone');
        const users = getUserModel(db);
        await users.deleteOne({ email });
        console.log('User deleted from MongoDB:', email);
        return NextResponse.json({ success: true, message: 'User deleted from MongoDB' });
      }
    } else if (event.type === 'user.created') {
      const email = event.data.email_addresses?.[0]?.email_address;
      const firstName = event.data.first_name || '';
      const lastName = event.data.last_name || '';
      const imageUrl = event.data.image_url || '';
      const name = `${firstName} ${lastName}`.trim() || email?.split('@')[0];
      console.log('User created event received for email:', email);
      if (email) {
        const client = await clientPromise;
        const db = client.db('cakezone');
        const users = getUserModel(db);
        const existing = await users.findOne({ email });
        if (!existing) {
          const now = new Date();
          const user = {
            email,
            name,
            firstName,
            lastName,
            imageUrl,
            role: 'customer',
            status: 'Active',
            createdAt: now,
            updatedAt: now
          };
          await users.insertOne(user);
          console.log('User inserted into MongoDB:', user);
        } else {
          console.log('User already exists in MongoDB:', email);
        }
        return NextResponse.json({ success: true, message: 'User created in MongoDB' });
      }
    }
    return NextResponse.json({ success: false, error: 'Invalid event or missing email' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Webhook error' }, { status: 500 });
  }
}
