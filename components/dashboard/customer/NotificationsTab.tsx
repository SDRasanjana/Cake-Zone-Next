import React, { useState, useEffect, useCallback } from "react";
import { Bell, Package, CreditCard, Truck, Gift } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { DashboardTab } from "@/contexts/DashboardTabContext";

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  orderId?: string;
  priority: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsTabProps {
  setActiveTab?: (tab: DashboardTab) => void;
}

const NotificationsTab: React.FC<NotificationsTabProps> = () => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch customer notifications
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/notifications/customer?userId=${user.id}`);
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.notifications);
        setError("");
      } else {
        setError(data.error || "Failed to fetch notifications");
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Get icon for notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_confirmation':
        return <Package className="w-5 h-5" />;
      case 'payment_confirmation':
        return <CreditCard className="w-5 h-5" />;
      case 'delivery_reminder':
        return <Truck className="w-5 h-5" />;
      case 'promotion':
        return <Gift className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  // Get notification styling
  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'order_confirmation':
        return "bg-blue-50 border-l-4 border-blue-400";
      case 'payment_confirmation':
        return "bg-green-50 border-l-4 border-green-400";
      case 'delivery_reminder':
        return "bg-orange-50 border-l-4 border-orange-400";
      case 'promotion':
        return "bg-purple-50 border-l-4 border-purple-400";
      default:
        return "bg-gray-50 border-l-4 border-gray-400";
    }
  };

  // Get icon color
  const getIconColor = (type: string) => {
    switch (type) {
      case 'order_confirmation':
        return "text-blue-600";
      case 'payment_confirmation':
        return "text-green-600";
      case 'delivery_reminder':
        return "text-orange-600";
      case 'promotion':
        return "text-purple-600";
      default:
        return "text-gray-600";
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
  }, [user?.id, fetchNotifications]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Notifications</h3>
        <div className="text-center text-gray-500 py-8">
          Loading notifications...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Notifications</h3>
        <div className="text-center text-red-600 py-8">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Notifications</h3>
      
      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-2">No notifications yet</p>
          <p className="text-sm text-gray-400">
            You&apos;ll receive updates about your orders here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`p-4 rounded-lg transition-all duration-200 ${getNotificationStyle(notification.type)}`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-1 ${getIconColor(notification.type)}`}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-800">
                      {notification.title}
                    </h4>
                    {notification.priority === 'high' && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                        Important
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-2">
                    {notification.message}
                  </p>
                  {notification.orderId && (
                    <div className="bg-white bg-opacity-70 rounded p-2 mb-2 text-sm">
                      <span className="font-medium">Order ID:</span> #{notification.orderId.slice(-8)}
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    {formatTimeAgo(notification.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsTab;
