// Service for creating and managing notifications
// Provides helper functions for different types of notifications

import dbConnect from '../dbConnect.js';
import Notification from '../models/Notification.js';

/**
 * Creates a new order notification for admin when customer places an order
 * @param {Object} orderData - The order data
 * @param {string} orderData.orderId - Order ID
 * @param {string} orderData.userId - Customer user ID
 * @param {string} orderData.customerName - Customer full name
 * @param {number} orderData.total - Order total amount
 * @param {Array} orderData.items - Order items
 * @returns {Promise<Object>} - Notification creation result
 */
export async function createOrderNotification(orderData) {
  try {
    await dbConnect();
    
    const { orderId, userId, customerName, total, items } = orderData;
    
    // Generate cake names for display
    const cakeNames = items && items.length > 0 
      ? items.map(item => item.name || 'Cake').slice(0, 3).join(', ')
      : 'New cake order';
    
    const moreItems = items && items.length > 3 ? ` +${items.length - 3} more` : '';
    
    const notificationData = {
      type: 'order_placed',
      title: 'New Cake Order Received',
      message: `${customerName || 'Customer'} placed an order for ${cakeNames}${moreItems}. Total: Rs. ${total?.toLocaleString() || '0'}`,
      orderId: orderId,
      userId: userId,
      customerName: customerName,
      orderTotal: total,
      priority: 'high',
      targetRole: 'admin',
      metadata: {
        itemCount: items?.length || 0,
        items: items?.slice(0, 5) || [] // Store first 5 items for details
      }
    };

    // Create notification directly in database instead of API call
    const notification = new Notification(notificationData);
    const savedNotification = await notification.save();

    const result = { 
      success: true, 
      notificationId: savedNotification._id,
      notification: savedNotification 
    };
    
    if (result.success) {
      console.log('Order notification created successfully:', result.notificationId);
      return { success: true, notificationId: result.notificationId };
    } else {
      console.error('Failed to create order notification:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('Error creating order notification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Creates a notification for order status updates
 * @param {Object} updateData - The order update data
 * @returns {Promise<Object>} - Notification creation result
 */
export async function createOrderUpdateNotification(updateData) {
  try {
    await dbConnect();
    
    const { orderId, status, customerName, total } = updateData;
    
    let title, message, priority;
    
    switch (status) {
      case 'completed':
      case 'delivered':
        title = 'Order Completed';
        message = `Order for ${customerName || 'Customer'} has been completed successfully. Amount: Rs. ${total?.toLocaleString() || '0'}`;
        priority = 'medium';
        break;
      case 'cancelled':
        title = 'Order Cancelled';
        message = `Order for ${customerName || 'Customer'} has been cancelled. Amount: Rs. ${total?.toLocaleString() || '0'}`;
        priority = 'medium';
        break;
      default:
        title = 'Order Status Update';
        message = `Order for ${customerName || 'Customer'} status updated to ${status}. Amount: Rs. ${total?.toLocaleString() || '0'}`;
        priority = 'low';
    }

    const notificationData = {
      type: status === 'cancelled' ? 'order_cancelled' : 'order_completed',
      title,
      message,
      orderId,
      customerName,
      orderTotal: total,
      priority,
      targetRole: 'admin'
    };

    // Create notification directly in database instead of API call
    const notification = new Notification(notificationData);
    const savedNotification = await notification.save();

    return { 
      success: true, 
      notificationId: savedNotification._id,
      notification: savedNotification 
    };
  } catch (error) {
    console.error('Error creating order update notification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Creates a system notification
 * @param {Object} systemData - The system notification data
 * @returns {Promise<Object>} - Notification creation result
 */
export async function createSystemNotification(systemData) {
  try {
    await dbConnect();
    
    const { title, message, priority = 'low', targetRole = 'admin' } = systemData;
    
    const notificationData = {
      type: 'system',
      title,
      message,
      priority,
      targetRole
    };

    // Create notification directly in database instead of API call
    const notification = new Notification(notificationData);
    const savedNotification = await notification.save();

    return { 
      success: true, 
      notificationId: savedNotification._id,
      notification: savedNotification 
    };
  } catch (error) {
    console.error('Error creating system notification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Creates an alert notification
 * @param {Object} alertData - The alert notification data
 * @returns {Promise<Object>} - Notification creation result
 */
export async function createAlertNotification(alertData) {
  try {
    await dbConnect();
    
    const { title, message, priority = 'urgent', targetRole = 'admin' } = alertData;
    
    const notificationData = {
      type: 'alert',
      title,
      message,
      priority,
      targetRole
    };

    // Create notification directly in database instead of API call
    const notification = new Notification(notificationData);
    const savedNotification = await notification.save();

    return { 
      success: true, 
      notificationId: savedNotification._id,
      notification: savedNotification 
    };
  } catch (error) {
    console.error('Error creating alert notification:', error);
    return { success: false, error: error.message };
  }
}

// Helper function to make server-side API calls (for use in API routes)
export async function createNotificationDirect(client, notificationData) {
  try {
    const db = client.db("cakezone");
    
    const notification = {
      ...notificationData,
      createdAt: new Date(),
      updatedAt: new Date(),
      isRead: false
    };

    const result = await db.collection("notifications").insertOne(notification);
    
    console.log('Notification created directly:', result.insertedId);
    return { success: true, notificationId: result.insertedId };
  } catch (error) {
    console.error('Error creating notification directly:', error);
    return { success: false, error: error.message };
  }
}
