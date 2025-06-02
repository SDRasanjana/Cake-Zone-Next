import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma'; // Adjusted path
import { auth } from '@clerk/nextjs/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: authenticatedUserId } = auth();
    const pathUserId = params.userId;

    if (!authenticatedUserId) {
      return NextResponse.json({ error: 'Unauthorized. User not logged in.' }, { status: 401 });
    }

    // For now, enforce user can only access their own orders.
    // TODO: Enhance with Admin/Owner role check to allow them to view any user's orders.
    // This would involve fetching the authenticated user's role.
    // For example:
    // const user = await prisma.user.findUnique({ where: { id: authenticatedUserId }, include: { role: true } });
    // const isAdminOrOwner = user?.role?.name === 'ADMIN' || user?.role?.name === 'OWNER';
    // if (pathUserId !== authenticatedUserId && !isAdminOrOwner) {
    //   return NextResponse.json({ error: 'Forbidden. You can only access your own orders.' }, { status: 403 });
    // }

    if (pathUserId !== authenticatedUserId) {
        // Placeholder: In a real app, you'd check if authenticatedUserId is an Admin/Owner here.
        // For this iteration, strict self-access is applied.
        console.warn(`User ${authenticatedUserId} attempting to access orders of user ${pathUserId}. Denied.`);
        return NextResponse.json({ error: 'Forbidden. You can only access your own orders.' }, { status: 403 });
    }


    const orders = await prisma.order.findMany({
      where: {
        userId: pathUserId,
      },
      include: {
        items: true, // Include related OrderItems
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!orders) {
      // findMany returns empty array if no records, not null.
      // This check is more for if the prisma client itself had an issue.
      return NextResponse.json({ orders: [] }, { status: 200 });
    }

    return NextResponse.json(orders, { status: 200 });

  } catch (error) {
    console.error(`Error fetching orders for user ${params.userId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error while fetching orders.' }, { status: 500 });
  }
}
