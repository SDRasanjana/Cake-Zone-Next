// Helper to update Clerk user metadata by email
// Requires: npm install node-fetch (or use global fetch in Node 18+)
const CLERK_API_KEY = process.env.CLERK_SECRET_KEY;
const CLERK_API_BASE = 'https://api.clerk.com/v1';

export async function getClerkUserByEmail(email) {
  const res = await fetch(`${CLERK_API_BASE}/users?email_address=${encodeURIComponent(email)}`, {
    headers: { 'Authorization': `Bearer ${CLERK_API_KEY}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.length > 0 ? data[0] : null;
}

export async function updateClerkUserRoleByEmail(email, role) {
  const user = await getClerkUserByEmail(email);
  if (!user) return { success: false, error: 'User not found in Clerk' };
  const res = await fetch(`${CLERK_API_BASE}/users/${user.id}/metadata`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${CLERK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ public_metadata: { role } }),
  });
  if (!res.ok) return { success: false, error: 'Failed to update Clerk metadata' };
  return { success: true };
}

export async function createClerkUser({ email, password, role }) {
  const body = {
    email_address: [email], // Clerk expects an array
    public_metadata: { role },
  };
  if (password) {
    body.password = password;
  } else {
    body.send_email_invite = true;
  }
  const res = await fetch(`${CLERK_API_BASE}/users`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CLERK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json();
    return { success: false, error: err.errors?.[0]?.message || 'Failed to create Clerk user' };
  }
  return { success: true };
}
