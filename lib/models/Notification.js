import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['order_placed', 'order_completed', 'order_cancelled', 'system', 'alert'],
    default: 'order_placed'
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  orderId: {
    type: String,
    required: false // Only for order-related notifications
  },
  userId: {
    type: String,
    required: false // Customer who placed the order
  },
  customerName: {
    type: String,
    required: false
  },
  orderTotal: {
    type: Number,
    required: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  targetRole: {
    type: String,
    enum: ['admin', 'owner', 'all_staff'],
    default: 'admin'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed, // For additional data like order items, etc.
    default: {}
  },
  expiresAt: {
    type: Date,
    default: null // Optional: For notifications that should auto-expire
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
NotificationSchema.index({ createdAt: -1 });
NotificationSchema.index({ targetRole: 1 });
NotificationSchema.index({ isRead: 1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ orderId: 1 });

// TTL index for auto-expiring notifications (if expiresAt is set)
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
