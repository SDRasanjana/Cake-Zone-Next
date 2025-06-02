import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../../lib/generated/prisma'; // Adjusted path

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // TODO: Add authentication and authorization check here
    // For example, verify if the current user is an ADMIN
    // const session = await getServerSession(authOptions);
    // if (!session || session.user.role !== 'ADMIN') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    // }

    const { userId } = params;
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { roleName } = body;

    if (!roleName || typeof roleName !== 'string') {
      return NextResponse.json({ error: 'Role name is required and must be a string' }, { status: 400 });
    }

    const validRoles = ["CUSTOMER", "OWNER", "ADMIN"];
    if (!validRoles.includes(roleName.toUpperCase())) {
      return NextResponse.json({ error: `Invalid role name. Must be one of: ${validRoles.join(', ')}` }, { status: 400 });
    }

    // Find the UserRole by roleName
    const userRole = await prisma.userRole.findUnique({
      where: { name: roleName.toUpperCase() },
    });

    if (!userRole) {
      return NextResponse.json({ error: `Role '${roleName}' not found` }, { status: 404 });
    }

    // Find the User by userId
    const userToUpdate = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToUpdate) {
      return NextResponse.json({ error: `User with ID '${userId}' not found` }, { status: 404 });
    }

    // Update the user's roleId
    await prisma.user.update({
      where: { id: userId },
      data: {
        roleId: userRole.id,
      },
    });

    return NextResponse.json({ message: `Role '${roleName}' assigned to user '${userId}' successfully` }, { status: 200 });

  } catch (error) {
    console.error('Error assigning role:', error);
    if (error instanceof Error && error.message.includes('JSON input')) {
        return NextResponse.json({ error: 'Invalid JSON input' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect().catch(console.error);
  }
}
