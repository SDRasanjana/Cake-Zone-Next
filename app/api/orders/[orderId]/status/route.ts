import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma'; // Adjusted path
import { auth } from '@clerk/nextjs/server';

const ALLOWED_ORDER_STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "COMPLETED", "CANCELLED"];

interface UpdateOrderStatusRequest {
  status: string;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { userId: authenticatedUserId, sessionClaims } = auth();
    const orderId = params.orderId;

    if (!authenticatedUserId) {
      return NextResponse.json({ error: 'Unauthorized. User not logged in.' }, { status: 401 });
    }

    // Authorization: Only Admin or Owner can update status
    const userRoleFromClaims = (sessionClaims?.metadata as any)?.role;
    let isAuthorized = userRoleFromClaims === 'ADMIN' || userRoleFromClaims === 'OWNER';

    if (!isAuthorized) {
      // Fallback to DB check if role not in claims or if claims check is not primary method
      const currentUserFromDb = await prisma.user.findUnique({
        where: { id: authenticatedUserId },
        include: { role: true },
      });
      if (currentUserFromDb?.role?.name === 'ADMIN' || currentUserFromDb?.role?.name === 'OWNER') {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden. You do not have permission to update order status.' }, { status: 403 });
    }

    // Validate orderId
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required.' }, { status: 400 });
    }

    const body: UpdateOrderStatusRequest = await request.json();
    const { status: newStatus } = body;

    if (!newStatus || typeof newStatus !== 'string' || !ALLOWED_ORDER_STATUSES.includes(newStatus.toUpperCase())) {
      return NextResponse.json({
        error: `Invalid status. Must be one of: ${ALLOWED_ORDER_STATUSES.join(', ')}`
      }, { status: 400 });
    }

    // Check if order exists before attempting update
    const existingOrder = await prisma.order.findUnique({
        where: { id: orderId },
    });

    if (!existingOrder) {
        return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    const updatedOrder = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: newStatus.toUpperCase(),
      },
      include: { // Return items with updated order as well
        items: true,
      }
    });

    return NextResponse.json(updatedOrder, { status: 200 });

  } catch (error: any) {
    console.error(`Error updating status for order ${params.orderId}:`, error);
    if (error.name === 'SyntaxError' || (error instanceof TypeError && error.message.includes("JSON"))) {
        return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    if (error.code === 'P2025') { // Prisma error: Record to update not found
        return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }
    if (error.code === 'P2023' && error.message.includes("Malformed ObjectID")) {
        return NextResponse.json({ error: 'Invalid Order ID format.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error while updating order status.' }, { status: 500 });
  }
}
