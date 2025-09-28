// Notification Model for MongoDB native driver
// This model handles admin-created notifications for order updates, promotional alerts, and system announcements

import { ObjectId } from 'mongodb';

export default function getNotificationModel(db) {
    return db.collection('notifications');
}

// Notification document structure:
// {
//   _id: ObjectId,
//   type: 'order_update' | 'promotional_alert' | 'system_announcement',
//   title: String (required),
//   message: String (required),
//   targetAudience: 'all' | 'customers' | 'specific_user',
//   targetUserId: String (optional, for specific user notifications),
//   priority: 'low' | 'medium' | 'high',
//   isActive: Boolean (whether notification should be displayed),
//   readBy: [String] (array of userIds who have read this notification),
//   expiresAt: Date (optional, for promotional alerts),
//   createdBy: String (admin userId who created this),
//   createdAt: Date,
//   updatedAt: Date,
//   metadata: Object (optional, for additional data like order details, promotion codes, etc.)
// }

// Helper function to create a new notification
export function createNotificationDocument({
    type,
    title,
    message,
    targetAudience = 'all',
    targetUserId = null,
    priority = 'medium',
    isActive = true,
    expiresAt = null,
    createdBy,
    metadata = {}
}) {
    const now = new Date();

    return {
        type,
        title,
        message,
        targetAudience,
        targetUserId,
        priority,
        isActive,
        readBy: [],
        expiresAt,
        createdBy,
        createdAt: now,
        updatedAt: now,
        metadata
    };
}

// Helper function to mark notification as read by a user
export async function markNotificationAsRead(db, notificationId, userId) {
    const notifications = getNotificationModel(db);

    return await notifications.updateOne(
        {
            _id: new ObjectId(notificationId),
            readBy: { $ne: userId } // Only update if user hasn't already read it
        },
        {
            $addToSet: { readBy: userId },
            $set: { updatedAt: new Date() }
        }
    );
}

// Helper function to get active notifications for a user
export async function getActiveNotificationsForUser(db, userId, userRole = 'customer') {
    const notifications = getNotificationModel(db);
    const now = new Date();

    const query = {
        isActive: true,
        $or: [
            { targetAudience: 'all' },
            { targetAudience: userRole === 'customer' ? 'customers' : 'all' },
            { targetAudience: 'specific_user', targetUserId: userId }
        ],
        $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: null },
            { expiresAt: { $gte: now } }
        ]
    };

    return await notifications
        .find(query)
        .sort({ priority: -1, createdAt: -1 })
        .toArray();
}

// Helper function to get unread notifications count for a user
export async function getUnreadNotificationsCount(db, userId, userRole = 'customer') {
    const notifications = getNotificationModel(db);
    const now = new Date();

    const query = {
        isActive: true,
        readBy: { $ne: userId },
        $or: [
            { targetAudience: 'all' },
            { targetAudience: userRole === 'customer' ? 'customers' : 'all' },
            { targetAudience: 'specific_user', targetUserId: userId }
        ],
        $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: null },
            { expiresAt: { $gte: now } }
        ]
    };

    return await notifications.countDocuments(query);
}