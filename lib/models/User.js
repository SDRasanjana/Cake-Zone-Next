import { ObjectId } from 'mongodb';

// User roles: 'customer', 'owner', 'admin'
export default function getUserModel(db) {
  return db.collection('users');
}

// Example user document:
// {
//   _id: ObjectId,
//   email: String,
//   password: String (hashed, for owner/admin),
//   role: 'customer' | 'owner' | 'admin',
//   createdAt: Date,
//   updatedAt: Date
// }
