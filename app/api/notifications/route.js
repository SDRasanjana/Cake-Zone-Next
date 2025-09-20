// API Route: /api/notifications
// Handles CRUD operations for notifications with admin authorization
// GET: Fetch notifications for current user or all notifications for admin
// POST: Create new notification (admin only)
// PATCH: Update notification or mark as read
// DELETE: Delete notification (admin only)

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import getNotificationModel, {
    createNotificationDocument,
    markNotificationAsRead,
    getActiveNotificationsForUser,
    getUnreadNotificationsCount
} from '@/lib/models/Notification';
import { ObjectId } from 'mongodb';

// Helper function to get user info from Clerk
async function getUserFromClerk(userId) {
    try {
        // For this implementation, we'll check the MongoDB users collection
        const client = await clientPromise;
        const db = client.db('cakezone');
        const user = await db.collection('users').findOne({
            $or: [
                { _id: new ObjectId(userId) },
                { email: userId } // In case userId is actually an email
            ]
        });
        return user;
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}

// GET: Fetch notifications
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const userRole = searchParams.get('userRole') || 'customer';
        const isAdmin = searchParams.get('admin') === 'true';
        const unreadOnly = searchParams.get('unreadOnly') === 'true';

        const client = await clientPromise;
        const db = client.db('cakezone');
        const notifications = getNotificationModel(db);

        if (isAdmin) {
            // Admin: Get all notifications for management
            const allNotifications = await notifications
                .find({})
                .sort({ createdAt: -1 })
                .toArray();

            // Get total counts
            const totalNotifications = await notifications.countDocuments({});
            const activeNotifications = await notifications.countDocuments({ isActive: true });
            const expiredNotifications = await notifications.countDocuments({
                expiresAt: { $exists: true, $lt: new Date() }
            });

            return NextResponse.json({
                success: true,
                notifications: allNotifications,
                stats: {
                    total: totalNotifications,
                    active: activeNotifications,
                    expired: expiredNotifications
                }
            });
        } else if (userId) {
            // Regular user: Get notifications for this user
            if (unreadOnly) {
                const count = await getUnreadNotificationsCount(db, userId, userRole);
                return NextResponse.json({
                    success: true,
                    unreadCount: count
                });
            } else {
                const userNotifications = await getActiveNotificationsForUser(db, userId, userRole);
                return NextResponse.json({
                    success: true,
                    notifications: userNotifications
                });
            }
        } else {
            return NextResponse.json({
                success: false,
                error: 'User ID is required'
            }, { status: 400 });
        }
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch notifications'
        }, { status: 500 });
    }
}

// POST: Create new notification (admin only)
export async function POST(req) {
    try {
        const body = await req.json();
        const {
            type,
            title,
            message,
            targetAudience,
            targetUserId,
            priority,
            expiresAt,
            createdBy,
            metadata
        } = body;

        // Validate required fields
        if (!type || !title || !message || !createdBy) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields: type, title, message, createdBy'
            }, { status: 400 });
        }

        // Validate notification type
        const validTypes = ['order_update', 'promotional_alert', 'system_announcement'];
        if (!validTypes.includes(type)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid notification type'
            }, { status: 400 });
        }

        // Verify user is admin/owner
        const user = await getUserFromClerk(createdBy);
        if (!user || !['admin', 'owner'].includes(user.role)) {
            return NextResponse.json({
                success: false,
                error: 'Unauthorized: Admin access required'
            }, { status: 403 });
        }

        const client = await clientPromise;
        const db = client.db('cakezone');
        const notifications = getNotificationModel(db);

        // Create notification document
        const notificationDoc = createNotificationDocument({
            type,
            title,
            message,
            targetAudience: targetAudience || 'all',
            targetUserId,
            priority: priority || 'medium',
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            createdBy,
            metadata: metadata || {}
        });

        const result = await notifications.insertOne(notificationDoc);

        return NextResponse.json({
            success: true,
            notificationId: result.insertedId,
            message: 'Notification created successfully'
        });
    } catch (error) {
        console.error('Error creating notification:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to create notification'
        }, { status: 500 });
    }
}

// PATCH: Update notification or mark as read
export async function PATCH(req) {
    try {
        const body = await req.json();
        const { notificationId, userId, action, ...updateFields } = body;

        if (!notificationId) {
            return NextResponse.json({
                success: false,
                error: 'Notification ID is required'
            }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('cakezone');
        const notifications = getNotificationModel(db);

        if (action === 'markAsRead' && userId) {
            // Mark notification as read by user
            const result = await markNotificationAsRead(db, notificationId, userId);

            if (result.success) {
                return NextResponse.json({
                    success: true,
                    message: 'Notification marked as read'
                });
            } else {
                return NextResponse.json({
                    success: false,
                    error: result.error || 'Failed to mark notification as read'
                }, { status: 400 });
            }
        } else {
            // Admin update notification
            if (updateFields.createdBy) {
                const user = await getUserFromClerk(updateFields.createdBy);
                if (!user || !['admin', 'owner'].includes(user.role)) {
                    return NextResponse.json({
                        success: false,
                        error: 'Unauthorized: Admin access required'
                    }, { status: 403 });
                }
            }

            const updateDoc = {
                ...updateFields,
                updatedAt: new Date()
            };

            // Convert date strings if needed
            if (updateDoc.expiresAt) {
                updateDoc.expiresAt = new Date(updateDoc.expiresAt);
            }

            const result = await notifications.updateOne(
                { _id: new ObjectId(notificationId) },
                { $set: updateDoc }
            );

            if (result.matchedCount === 0) {
                return NextResponse.json({
                    success: false,
                    error: 'Notification not found'
                }, { status: 404 });
            }

            return NextResponse.json({
                success: true,
                message: 'Notification updated successfully'
            });
        }
    } catch (error) {
        console.error('Error updating notification:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update notification'
        }, { status: 500 });
    }
}

// DELETE: Delete notification (admin only)
export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url);
        const notificationId = searchParams.get('id');
        const userId = searchParams.get('userId');

        if (!notificationId || !userId) {
            return NextResponse.json({
                success: false,
                error: 'Notification ID and User ID are required'
            }, { status: 400 });
        }

        // Verify user is admin/owner
        const user = await getUserFromClerk(userId);
        if (!user || !['admin', 'owner'].includes(user.role)) {
            return NextResponse.json({
                success: false,
                error: 'Unauthorized: Admin access required'
            }, { status: 403 });
        }

        const client = await clientPromise;
        const db = client.db('cakezone');
        const notifications = getNotificationModel(db);

        const result = await notifications.deleteOne({
            _id: new ObjectId(notificationId)
        });

        if (result.deletedCount === 0) {
            return NextResponse.json({
                success: false,
                error: 'Notification not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to delete notification'
        }, { status: 500 });
    }
}