import clientPromise from '@/lib/mongodb';
import getUserModel from '@/lib/models/User';
import bcrypt from 'bcryptjs';

// Run this script ONCE to seed owner/admin users
async function seed() {
  const client = await clientPromise;
  const db = client.db('cakezone');
  const users = getUserModel(db);

  const now = new Date();
  const owner = {
    email: 'owner@cakezone.com',
    password: await bcrypt.hash('ownerpassword', 10),
    role: 'owner',
    createdAt: now,
    updatedAt: now
  };
  const admin = {
    email: 'admin@cakezone.com',
    password: await bcrypt.hash('adminpassword', 10),
    role: 'admin',
    createdAt: now,
    updatedAt: now
  };
  await users.insertMany([owner, admin]);
  console.log('Seeded owner and admin users');
  process.exit(0);
}
seed();
