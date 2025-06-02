import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma'; // Adjusted path
import { auth } from '@clerk/nextjs/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { userId: authenticatedUserId, sessionClaims } = auth(); // Get sessionClaims for role metadata
    const orderId = params.orderId;

    if (!authenticatedUserId) {
      return NextResponse.json({ error: 'Unauthorized. User not logged in.' }, { status: 401 });
    }

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required.' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: true, // Include related OrderItems
        user: { // Include user to check ownership (only select necessary fields)
          select: {
            id: true,
            // name: true, // Optionally include name if needed for display, but id is enough for check
          }
        }
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    // Authorization check: User must own the order OR be an Admin/Owner
    if (order.userId !== authenticatedUserId) {
      // Check if user is Admin/Owner based on Clerk session claims (metadata.role)
      // This assumes you've set up custom claims in Clerk: https://clerk.com/docs/users/metadata
      const userRoleFromClaims = (sessionClaims?.metadata as any)?.role;

      if (userRoleFromClaims === 'ADMIN' || userRoleFromClaims === 'OWNER') {
        // Admin/Owner can access any order
      } else {
        // Fallback: Check role from DB if not in claims (more expensive)
        const currentUserFromDb = await prisma.user.findUnique({
          where: { id: authenticatedUserId },
          include: { role: true },
        });
        if (currentUserFromDb?.role?.name !== 'ADMIN' && currentUserFromDb?.role?.name !== 'OWNER') {
          return NextResponse.json({ error: 'Forbidden. You are not authorized to view this order.' }, { status: 403 });
        }
      }
    }

    // Remove user details from order object before sending if not needed, or keep for admin
    // For now, keeping it as fetched. Consider what info client needs.
    // const { user, ...orderData } = order;
    // if (order.userId !== authenticatedUserId) { // if admin is fetching, they might want user id
    //    return NextResponse.json({ ...orderData, userId: user.id }, { status: 200 });
    // }
    // return NextResponse.json(orderData, { status: 200 });


    return NextResponse.json(order, { status: 200 });

  } catch (error) {
    console.error(`Error fetching order ${params.orderId}:`, error);
    if (error instanceof Error && (error as any).code === 'P2023' && (error as any).message.includes("Malformed ObjectID")) {
        return NextResponse.json({ error: 'Invalid Order ID format.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error while fetching the order.' }, { status: 500 });
  }
}
