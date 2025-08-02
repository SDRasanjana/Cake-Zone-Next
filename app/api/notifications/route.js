// API Route: /api/notifications
// Handles notification CRUD operations for admin dashboard
// GET: Fetch notifications for admin/owner
// POST: Create new notification (internal use)
// PATCH: Mark notifications as read/unread

import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Force Node.js runtime to support MongoDB connections
export const runtime = 'nodejs';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const targetRole = searchParams.get("targetRole") || "admin";
    const limit = parseInt(searchParams.get("limit")) || 50;
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const page = parseInt(searchParams.get("page")) || 1;
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db("cakezone");
    
    // Build query filter
    const filter = { targetRole: { $in: [targetRole, "all_staff"] } };
    if (unreadOnly) {
      filter.isRead = false;
    }

    // Fetch notifications with pagination
    const notifications = await db
      .collection("notifications")
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get total count for pagination
    const totalCount = await db.collection("notifications").countDocuments(filter);
    const unreadCount = await db.collection("notifications").countDocuments({
      ...filter,
      isRead: false
    });

    return Response.json({
      success: true,
      notifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        unreadCount
      }
    });

  } catch (error) {
    console.error("Error fetching notifications:", error);
    return Response.json(
      { success: false, error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const notificationData = await req.json();
    
    // Validate required fields
    if (!notificationData.title || !notificationData.message) {
      return Response.json(
        { success: false, error: "Title and message are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("cakezone");

    // Create notification with timestamp
    const notification = {
      ...notificationData,
      createdAt: new Date(),
      updatedAt: new Date(),
      isRead: false
    };

    const result = await db.collection("notifications").insertOne(notification);

    return Response.json({
      success: true,
      notificationId: result.insertedId,
      message: "Notification created successfully"
    });

  } catch (error) {
    console.error("Error creating notification:", error);
    return Response.json(
      { success: false, error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  try {
    const { notificationIds, isRead, markAllAsRead, targetRole } = await req.json();

    const client = await clientPromise;
    const db = client.db("cakezone");

    let result;

    if (markAllAsRead && targetRole) {
      // Mark all notifications as read for a specific role
      result = await db.collection("notifications").updateMany(
        { 
          targetRole: { $in: [targetRole, "all_staff"] },
          isRead: false 
        },
        { 
          $set: { 
            isRead: true, 
            updatedAt: new Date() 
          } 
        }
      );
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read/unread
      const objectIds = notificationIds.map(id => new ObjectId(id));
      result = await db.collection("notifications").updateMany(
        { _id: { $in: objectIds } },
        { 
          $set: { 
            isRead: isRead ?? true, 
            updatedAt: new Date() 
          } 
        }
      );
    } else {
      return Response.json(
        { success: false, error: "Invalid request parameters" },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      modifiedCount: result.modifiedCount,
      message: `Successfully updated ${result.modifiedCount} notification(s)`
    });

  } catch (error) {
    console.error("Error updating notifications:", error);
    return Response.json(
      { success: false, error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const notificationId = searchParams.get("id");
    const olderThan = searchParams.get("olderThan"); // Date string

    const client = await clientPromise;
    const db = client.db("cakezone");

    let result;

    if (notificationId) {
      // Delete specific notification
      result = await db.collection("notifications").deleteOne({
        _id: new ObjectId(notificationId)
      });
    } else if (olderThan) {
      // Delete notifications older than specified date
      const cutoffDate = new Date(olderThan);
      result = await db.collection("notifications").deleteMany({
        createdAt: { $lt: cutoffDate }
      });
    } else {
      return Response.json(
        { success: false, error: "Invalid delete parameters" },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      deletedCount: result.deletedCount,
      message: `Successfully deleted ${result.deletedCount} notification(s)`
    });

  } catch (error) {
    console.error("Error deleting notifications:", error);
    return Response.json(
      { success: false, error: "Failed to delete notifications" },
      { status: 500 }
    );
  }
}
