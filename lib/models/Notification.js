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

    // Get user's email from the database to handle both Clerk ID and email targeting
    let userEmail = null;
    let possibleEmails = [];
    
    try {
        // First, try to find user in users collection
        const user = await db.collection('users').findOne(
            { $or: [{ _id: userId }, { email: userId }] },
            { projection: { email: 1, _id: 1 } }
        );
        
        if (user?.email) {
            userEmail = user.email;
            possibleEmails.push(userEmail);
        }
        
        // If no user found in users collection, check if this is a Clerk user ID
        // and look for their email in orders (shipping email)
        if (!userEmail && userId.startsWith('user_')) {
            console.log(`🔍 Checking orders for Clerk user: ${userId}`);
            const orders = await db.collection('orders').find(
                { userId: userId },
                { projection: { 'shipping.email': 1, customerEmail: 1 } }
            ).toArray();
            
            // Collect unique emails from orders
            const orderEmails = orders.map(order => 
                order.shipping?.email || order.customerEmail
            ).filter(email => email && email.trim());
            
            const uniqueOrderEmails = [...new Set(orderEmails)];
            possibleEmails.push(...uniqueOrderEmails);
            
            console.log(`📧 Found emails in orders: ${uniqueOrderEmails.join(', ')}`);
        }
        
        // If userId looks like an email, add it to possible emails
        if (userId.includes('@')) {
            possibleEmails.push(userId);
        }
        
        console.log(`🔍 User lookup for notifications - ID: ${userId}, Possible emails: ${possibleEmails.join(', ')}`);
    } catch (error) {
        console.error('Error looking up user for notifications:', error);
    }

    // Build the query to match notifications for this user
    const targetConditions = [
        { targetAudience: 'all' },
        { targetAudience: userRole === 'customer' ? 'customers' : 'all' },
        { targetAudience: 'specific_user', targetUserId: userId }
    ];
    
    // Add conditions for each possible email
    possibleEmails.forEach(email => {
        if (email) {
            targetConditions.push({ targetAudience: 'specific_user', targetUserId: email });
        }
    });

    const query = {
        isActive: true,
        $and: [
            { $or: targetConditions },
            {
                $or: [
                    { expiresAt: { $exists: false } },
                    { expiresAt: null },
                    { expiresAt: { $gte: now } }
                ]
            }
        ]
    };

    console.log(`📋 Notification query for user ${userId}:`, JSON.stringify(query, null, 2));

    const result = await notifications
        .find(query)
        .sort({ priority: -1, createdAt: -1 })
        .toArray();

    console.log(`📬 Found ${result.length} notifications for user ${userId}`);
    return result;
}

// Helper function to get unread notifications count for a user
export async function getUnreadNotificationsCount(db, userId, userRole = 'customer') {
    const notifications = getNotificationModel(db);
    const now = new Date();

    // Get user's email from the database to handle both Clerk ID and email targeting
    let possibleEmails = [];
    
    try {
        // First, try to find user in users collection
        const user = await db.collection('users').findOne(
            { $or: [{ _id: userId }, { email: userId }] },
            { projection: { email: 1, _id: 1 } }
        );
        
        if (user?.email) {
            possibleEmails.push(user.email);
        }
        
        // If no user found in users collection, check if this is a Clerk user ID
        if (!user && userId.startsWith('user_')) {
            const orders = await db.collection('orders').find(
                { userId: userId },
                { projection: { 'shipping.email': 1, customerEmail: 1 } }
            ).toArray();
            
            const orderEmails = orders.map(order => 
                order.shipping?.email || order.customerEmail
            ).filter(email => email && email.trim());
            
            const uniqueOrderEmails = [...new Set(orderEmails)];
            possibleEmails.push(...uniqueOrderEmails);
        }
        
        // If userId looks like an email, add it to possible emails
        if (userId.includes('@')) {
            possibleEmails.push(userId);
        }
    } catch (error) {
        console.error('Error looking up user for unread count:', error);
    }

    // Build target conditions
    const targetConditions = [
        { targetAudience: 'all' },
        { targetAudience: userRole === 'customer' ? 'customers' : 'all' },
        { targetAudience: 'specific_user', targetUserId: userId }
    ];
    
    // Add conditions for each possible email
    possibleEmails.forEach(email => {
        if (email) {
            targetConditions.push({ targetAudience: 'specific_user', targetUserId: email });
        }
    });

    const query = {
        isActive: true,
        readBy: { $nin: [userId, ...possibleEmails] }, // User not in readBy for any of their identifiers
        $and: [
            { $or: targetConditions },
            {
                $or: [
                    { expiresAt: { $exists: false } },
                    { expiresAt: null },
                    { expiresAt: { $gte: now } }
                ]
            }
        ]
    };

    return await notifications.countDocuments(query);
}