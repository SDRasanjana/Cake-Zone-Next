// API Route: /api/notifications/customer
// Handles customer-specific notifications
// GET: Fetch notifications for a specific customer (order updates, promotions, etc.)

import clientPromise from "@/lib/mongodb";

// Force Node.js runtime to support MongoDB connections
export const runtime = 'nodejs';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit")) || 20;
    const page = parseInt(searchParams.get("page")) || 1;
    const skip = (page - 1) * limit;

    if (!userId) {
      return Response.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("cakezone");
    
    // For customers, we'll show order-related notifications and general announcements
    // For now, we'll create mock notifications based on their orders
    const orders = await db
      .collection("orders")
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    // Generate notifications from orders
    const notifications = [];
    
    for (const order of orders) {
      // Order confirmation notification
      notifications.push({
        _id: `order_${order._id}_confirmation`,
        type: 'order_confirmation',
        title: '🎂 Order Confirmed!',
        message: `Your cake order has been confirmed. Total: Rs. ${order.total?.toLocaleString() || '0'}`,
        orderId: order._id.toString(),
        priority: 'medium',
        isRead: false,
        createdAt: order.createdAt
      });

      // If order is paid, add payment confirmation
      if (order.paymentStatus === 'paid') {
        notifications.push({
          _id: `order_${order._id}_payment`,
          type: 'payment_confirmation',
          title: '✅ Payment Successful',
          message: `Payment confirmed for your cake order. Your delicious cakes will be prepared soon!`,
          orderId: order._id.toString(),
          priority: 'medium',
          isRead: false,
          createdAt: new Date(new Date(order.createdAt).getTime() + 60000) // 1 minute after order
        });
      }

      // If delivery date is coming up, add reminder
      if (order.deliveryDate) {
        const deliveryDate = new Date(order.deliveryDate);
        const now = new Date();
        const daysDiff = Math.ceil((deliveryDate - now) / (1000 * 60 * 60 * 24));
        
        if (daysDiff > 0 && daysDiff <= 2) {
          notifications.push({
            _id: `order_${order._id}_reminder`,
            type: 'delivery_reminder',
            title: `🚚 Delivery ${daysDiff === 1 ? 'Tomorrow' : `in ${daysDiff} days`}`,
            message: `Your cake order will be delivered on ${deliveryDate.toLocaleDateString()}. Get ready for something sweet!`,
            orderId: order._id.toString(),
            priority: 'high',
            isRead: false,
            createdAt: new Date(deliveryDate.getTime() - (daysDiff * 24 * 60 * 60 * 1000))
          });
        }
      }
    }

    // Add some general promotional notifications
    if (notifications.length < 5) {
      notifications.push(
        {
          _id: 'promo_welcome',
          type: 'promotion',
          title: '🎉 Welcome to CakeZone!',
          message: 'Get 20% off on your next order above Rs. 2000. Use code: SWEET20',
          priority: 'low',
          isRead: false,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
        },
        {
          _id: 'promo_seasonal',
          type: 'promotion',
          title: '🍰 Special Seasonal Offer',
          message: 'Try our new collection of winter special cakes. Limited time only!',
          priority: 'low',
          isRead: false,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
        }
      );
    }

    // Sort by creation date (newest first) and apply pagination
    const sortedNotifications = notifications
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(skip, skip + limit);

    return Response.json({
      success: true,
      notifications: sortedNotifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(notifications.length / limit),
        totalCount: notifications.length
      }
    });

  } catch (error) {
    console.error("Error fetching customer notifications:", error);
    return Response.json(
      { success: false, error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
