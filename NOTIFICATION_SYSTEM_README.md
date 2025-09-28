# 🔔 Notification System Documentation

## Overview
A comprehensive notification system for the CakeZone admin dashboard that allows administrators to create and manage notifications for customers, including order updates, promotional alerts, and system announcements.

## Features

### ✅ Admin Dashboard
- **Create Notifications**: Full form with type, priority, targeting options
- **Manage Notifications**: Edit, delete, activate/deactivate notifications
- **Real-time Stats**: Total, active, and expired notification counts
- **Notification Types**: Order updates, promotional alerts, system announcements
- **Targeting Options**: All users, customers only, or specific users
- **Priority Levels**: Low, medium, high priority notifications
- **Expiration Dates**: Set expiration for promotional alerts

### ✅ Customer Experience
- **Dashboard Notifications**: View all relevant notifications in customer dashboard
- **Promotional Banners**: High-priority promotional alerts appear as banners on public pages
- **Mark as Read**: Customers can mark notifications as read
- **Action Buttons**: Direct action buttons for promotional offers and order management
- **Real-time Updates**: Notifications refresh automatically

### ✅ API Endpoints
- **GET /api/notifications**: Fetch notifications (admin or customer specific)
- **POST /api/notifications**: Create new notification (admin only)
- **PATCH /api/notifications**: Update notification or mark as read
- **DELETE /api/notifications**: Delete notification (admin only)

## Database Schema

### Notification Document Structure
```javascript
{
  _id: ObjectId,
  type: 'order_update' | 'promotional_alert' | 'system_announcement',
  title: String (required),
  message: String (required),
  targetAudience: 'all' | 'customers' | 'specific_user',
  targetUserId: String (optional),
  priority: 'low' | 'medium' | 'high',
  isActive: Boolean,
  readBy: [String], // Array of userIds who have read this
  expiresAt: Date (optional),
  createdBy: String (admin email),
  createdAt: Date,
  updatedAt: Date,
  metadata: Object (optional)
}
```

## Usage Guide

### For Administrators

1. **Access Notification Management**
   - Go to Admin Dashboard (`/dashboards/admin`)
   - Click on "Notification Center" tab

2. **Create New Notification**
   - Click "Create Notification" button
   - Fill out the form:
     - **Type**: Choose notification type
     - **Title**: Brief notification title
     - **Message**: Detailed notification message
     - **Target Audience**: Who should see this notification
     - **Priority**: Notification priority level
     - **Expires At**: Optional expiration date

3. **Manage Existing Notifications**
   - View all notifications in the list
   - Use eye icon to activate/deactivate
   - Use edit icon to modify notifications
   - Use trash icon to delete notifications

### For Customers

1. **View Notifications**
   - Go to Customer Dashboard (`/dashboards/customer`)
   - Click on "Notifications" tab

2. **Promotional Banners**
   - High-priority promotional alerts appear as banners on:
     - Home page (`/`)
     - Menu page (`/menu`)
     - About page (`/about`)
     - Contact page (`/contact`)

3. **Interact with Notifications**
   - Click checkmark to mark as read
   - Click action buttons for promotional offers
   - Navigate to orders from order update notifications

## Security Features

- **Admin-only Creation**: Only admin/owner roles can create notifications
- **Role-based Access**: Customers only see relevant notifications
- **Input Validation**: All inputs are validated and sanitized
- **Authorization Checks**: Every API endpoint checks user permissions

## Testing

Run the test script to verify the notification system:

```bash
node scripts/testNotificationSystem.mjs
```

## Example Notification Types

### 📦 Order Updates
- Order confirmation
- Order status changes (processing, shipped, delivered)
- Delivery notifications
- Order cancellations

### 🎁 Promotional Alerts
- Special discounts and offers
- New product announcements
- Seasonal promotions
- Limited-time deals

### 📢 System Announcements
- Maintenance notifications
- Policy updates
- Service changes
- Important system messages

## File Structure

```
lib/models/Notification.js              # MongoDB notification model
app/api/notifications/route.js          # Notification API endpoints
components/dashboard/admin/NotificationsTab.tsx  # Admin management UI
components/dashboard/customer/NotificationsTab.tsx  # Customer notification view
components/PromoBanner.tsx              # Promotional alert banner
components/NotificationBell.tsx         # Notification bell with unread count
```

## Future Enhancements

- Email notification integration
- Push notification support
- Notification templates
- A/B testing for promotional alerts
- Analytics and engagement tracking
- Bulk notification management