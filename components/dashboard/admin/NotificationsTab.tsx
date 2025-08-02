import React, { useState, useEffect } from "react";
import { Bell, CheckCircle, AlertCircle, Package, Trash2, RefreshCw } from "lucide-react";

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  orderId?: string;
  customerName?: string;
  orderTotal?: number;
  priority: string;
  isRead: boolean;
  createdAt: string;
  metadata?: {
    itemCount?: number;
    items?: Array<{ name?: string; [key: string]: unknown }>;
    deliveryDate?: string;
    customerEmail?: string;
    customerPhone?: string;
    [key: string]: unknown;
  };
}

interface NotificationsTabProps {
  notifications?: Notification[]; // Legacy prop, now fetched from API
}

const NotificationsTab: React.FC<NotificationsTabProps> = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch notifications from API
  const fetchNotifications = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const response = await fetch("/api/notifications?targetRole=admin&limit=50");
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.pagination.unreadCount);
        setError("");
      } else {
        setError(data.error || "Failed to fetch notifications");
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to fetch notifications");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationIds: [notificationId],
          isRead: true
        })
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, isRead: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markAllAsRead: true,
          targetRole: "admin"
        })
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: "DELETE"
      });
      
      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
        // Adjust unread count if the deleted notification was unread
        const deletedNotif = notifications.find(n => n._id === notificationId);
        if (deletedNotif && !deletedNotif.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  // Get icon for notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_placed':
        return <Package className="w-5 h-5" />;
      case 'order_completed':
        return <CheckCircle className="w-5 h-5" />;
      case 'order_cancelled':
        return <AlertCircle className="w-5 h-5" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  // Get background color based on type and priority
  const getNotificationStyle = (notification: Notification) => {
    const baseClass = notification.isRead ? "opacity-75" : "";
    
    switch (notification.type) {
      case 'order_placed':
        return `bg-green-50 border-green-400 ${baseClass}`;
      case 'order_completed':
        return `bg-blue-50 border-blue-400 ${baseClass}`;
      case 'order_cancelled':
        return `bg-red-50 border-red-400 ${baseClass}`;
      case 'alert':
        return `bg-yellow-50 border-yellow-400 ${baseClass}`;
      default:
        return `bg-gray-50 border-gray-400 ${baseClass}`;
    }
  };

  // Get text color based on type
  const getTextColor = (notification: Notification) => {
    switch (notification.type) {
      case 'order_placed':
        return "text-green-800";
      case 'order_completed':
        return "text-blue-800";
      case 'order_cancelled':
        return "text-red-800";
      case 'alert':
        return "text-yellow-800";
      default:
        return "text-gray-800";
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  useEffect(() => {
    fetchNotifications();
    
    // Set up polling for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-[#141C24]">Notification Center</h2>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full">
              {unreadCount} unread
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchNotifications(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-[#F4C753] text-[#141C24] rounded-lg font-medium hover:bg-[#F59E0B] transition-colors"
            >
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center text-gray-500 py-8">
            Loading notifications...
          </div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center text-red-600 py-8">
            Error: {error}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-6">
          {notifications.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No notifications yet</p>
              <p className="text-sm">You&apos;ll see new order notifications here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification: Notification) => (
                <div
                  key={notification._id}
                  className={`p-4 rounded-lg border-l-4 transition-all duration-200 ${getNotificationStyle(notification)} ${
                    !notification.isRead ? "ring-2 ring-opacity-20 ring-blue-400 shadow-md" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`mt-1 ${getTextColor(notification)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-semibold ${getTextColor(notification)} text-lg`}>
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          )}
                          {notification.priority === 'urgent' && (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                              URGENT
                            </span>
                          )}
                          {notification.priority === 'high' && (
                            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-medium">
                              HIGH
                            </span>
                          )}
                        </div>
                        <p className={`${getTextColor(notification)} mb-2`}>
                          {notification.message}
                        </p>
                        
                        {/* Additional order details for order notifications */}
                        {notification.orderId && (
                          <div className="bg-white bg-opacity-50 rounded p-3 mt-2 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="font-medium">Order ID:</span> #{notification.orderId.slice(-8)}
                              </div>
                              {notification.customerName && (
                                <div>
                                  <span className="font-medium">Customer:</span> {notification.customerName}
                                </div>
                              )}
                              {notification.orderTotal && (
                                <div>
                                  <span className="font-medium">Amount:</span> Rs. {notification.orderTotal.toLocaleString()}
                                </div>
                              )}
                              {notification.metadata?.itemCount && (
                                <div>
                                  <span className="font-medium">Items:</span> {notification.metadata.itemCount}
                                </div>
                              )}
                            </div>
                            {notification.metadata?.deliveryDate && (
                              <div className="mt-2">
                                <span className="font-medium">Delivery:</span> {new Date(notification.metadata.deliveryDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        )}
                        
                        <p className="text-sm text-gray-500 mt-2">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="text-sm text-blue-600 hover:text-blue-800 px-2 py-1 rounded transition-colors"
                          title="Mark as read"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification._id)}
                        className="text-sm text-red-600 hover:text-red-800 px-2 py-1 rounded transition-colors"
                        title="Delete notification"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsTab;
