import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../lib/generated/prisma'; // Adjusted path

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication and authorization check here
    // For example, verify if the current user is an ADMIN
    // const session = await getServerSession(authOptions);
    // if (!session || session.user.role !== 'ADMIN') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    // }

    const usersWithRoles = await prisma.user.findMany({
      include: {
        role: true, // Include the related UserRole
      },
    });

    // Optionally, map the result to a more friendly format if needed
    const formattedUsers = usersWithRoles.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role ? user.role.name : null, // Display role name, or null if no role
      roleId: user.roleId,
      // Do not include sensitive data like password hashes if they were on the model
    }));

    return NextResponse.json(formattedUsers, { status: 200 });

  } catch (error) {
    console.error('Error fetching users with roles:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect().catch(console.error);
  }
}
