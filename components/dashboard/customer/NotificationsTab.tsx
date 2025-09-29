import React, { useState, useEffect, useCallback } from "react";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  Gift,
  ShoppingBag,
} from "lucide-react";
import { DashboardTab } from "@/contexts/DashboardTabContext";
import { useUser } from "@clerk/nextjs";

interface NotificationMetadata {
  actionUrl?: string;
  actionText?: string;
  [key: string]: unknown;
}

interface Notification {
  _id: string;
  type: "order_update" | "promotional_alert" | "system_announcement";
  title: string;
  message: string;
  targetAudience: "all" | "customers" | "specific_user";
  targetUserId?: string;
  priority: "low" | "medium" | "high";
  isActive: boolean;
  readBy: string[];
  expiresAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  metadata?: NotificationMetadata;
}

interface NotificationsTabProps {
  setActiveTab?: (tab: DashboardTab) => void;
  onUnreadCountChange?: (count: number) => void; // Callback to notify parent about count changes
}

const NotificationsTab: React.FC<NotificationsTabProps> = ({
  setActiveTab,
  onUnreadCountChange,
}) => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Calculate unread count
  const unreadCount = notifications.filter((notification) => {
    const isRead = user?.id ? notification.readBy.includes(user.id) : false;
    const isExpired =
      notification.expiresAt && new Date(notification.expiresAt) < new Date();
    return !isRead && !isExpired;
  }).length;

  // Fetch notifications for current user
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/notifications?userId=${user.id}&userRole=customer`
      );
      const data = await response.json();

      if (data.success) {
        setNotifications(data.notifications || []);
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

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Notify parent component when unread count changes
  useEffect(() => {
    if (onUnreadCountChange) {
      onUnreadCountChange(unreadCount);
    }
  }, [unreadCount, onUnreadCountChange]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!user?.id) return;

    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationId,
          userId: user.id,
          action: "markAsRead",
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state to mark as read
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === notificationId
              ? { ...notif, readBy: [...notif.readBy, user.id] }
              : notif
          )
        );
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  // Get icon based on notification type
  const getNotificationIcon = (type: string, priority: string) => {
    const iconProps = {
      className: `w-5 h-5 mt-1 mr-3 ${
        priority === "high"
          ? "text-red-600"
          : priority === "medium"
          ? "text-yellow-600"
          : "text-blue-600"
      }`,
    };

    switch (type) {
      case "order_update":
        return <ShoppingBag {...iconProps} />;
      case "promotional_alert":
        return <Gift {...iconProps} />;
      case "system_announcement":
        return <Info {...iconProps} />;
      default:
        return <Bell {...iconProps} />;
    }
  };

  // Get background color based on type and priority
  const getNotificationBg = (
    type: string,
    priority: string,
    isRead: boolean
  ) => {
    const baseColors = {
      order_update: "bg-blue-50 border-blue-200",
      promotional_alert: "bg-orange-50 border-orange-200",
      system_announcement: "bg-purple-50 border-purple-200",
    };

    const priorityRing =
      priority === "high" && !isRead ? "ring-2 ring-red-200" : "";

    return `${
      baseColors[type as keyof typeof baseColors] ||
      "bg-gray-50 border-gray-200"
    } ${priorityRing}`;
  };

  // Check if notification is read by current user
  const isNotificationRead = (notification: Notification) => {
    return user?.id ? notification.readBy.includes(user.id) : false;
  };

  // Get time ago string
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Notifications
        </h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                <div className="w-5 h-5 bg-gray-300 rounded-full mt-1 mr-3"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
          {unreadCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="relative px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full shadow-lg">
                {unreadCount} new
                {unreadCount > 5 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></span>
                )}
              </span>
              <Bell className="w-4 h-4 text-red-500 animate-bounce" />
            </div>
          )}
        </div>
        <button
          onClick={fetchNotifications}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No notifications yet</p>
            <p className="text-sm text-gray-400">
              You&apos;ll see updates about your orders and special offers here
            </p>
          </div>
        ) : unreadCount === 0 && notifications.length > 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
            <p className="text-green-600 font-medium">All caught up!</p>
            <p className="text-sm text-gray-400">
              You&apos;ve read all {notifications.length} notifications
            </p>
          </div>
        ) : (
          notifications.map((notification) => {
            const isRead = isNotificationRead(notification);
            const isExpired =
              notification.expiresAt &&
              new Date(notification.expiresAt) < new Date();

            if (isExpired) return null; // Don't show expired notifications

            return (
              <div
                key={notification._id}
                className={`
                  flex items-start p-4 rounded-lg border transition-all duration-200 hover:shadow-md
                  ${getNotificationBg(
                    notification.type,
                    notification.priority,
                    isRead
                  )}
                  ${!isRead ? "shadow-sm" : "opacity-75"}
                `}
              >
                {getNotificationIcon(notification.type, notification.priority)}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 mb-1">
                        {notification.title}
                        {!isRead && (
                          <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          {getTimeAgo(notification.createdAt)}
                        </p>
                        <div className="flex items-center gap-2">
                          {notification.priority === "high" && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                              Urgent
                            </span>
                          )}
                          {notification.type === "promotional_alert" && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                              Offer
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {!isRead && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        className="ml-4 p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Mark as read"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Special actions for promotional alerts */}
                  {notification.type === "promotional_alert" &&
                    notification.metadata?.actionUrl && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => {
                            markAsRead(notification._id);
                            const actionUrl = notification.metadata
                              ?.actionUrl as string;
                            if (actionUrl?.includes("menu")) {
                              window.location.href = "/menu";
                            } else if (actionUrl?.includes("cart")) {
                              window.location.href = "/shopping-cart";
                            }
                          }}
                          className="text-sm bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                        >
                          {(notification.metadata?.actionText as string) ||
                            "View Offer"}
                        </button>
                      </div>
                    )}

                  {/* Order-related actions */}
                  {notification.type === "order_update" && setActiveTab && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => {
                          markAsRead(notification._id);
                          setActiveTab("orders");
                        }}
                        className="text-sm bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        View Orders
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Show notification count summary */}
      {notifications.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {unreadCount > 0 ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-red-600">
                    {unreadCount} unread notification
                    {unreadCount !== 1 ? "s" : ""}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600">
                    All notifications read
                  </span>
                </div>
              )}
              <span className="text-sm text-gray-500">
                {notifications.length} total
              </span>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={async () => {
                  // Mark all as read efficiently
                  const unreadNotifications = notifications.filter(
                    (notification) => !isNotificationRead(notification)
                  );

                  // Update UI immediately for better UX
                  setNotifications((prev) =>
                    prev.map((notif) =>
                      unreadNotifications.some(
                        (unread) => unread._id === notif._id
                      )
                        ? {
                            ...notif,
                            readBy: [...notif.readBy, user?.id || ""],
                          }
                        : notif
                    )
                  );

                  // Send API requests for all unread notifications
                  unreadNotifications.forEach((notification) => {
                    markAsRead(notification._id);
                  });
                }}
                className="text-xs text-blue-600 hover:text-blue-800 transition-colors px-3 py-1 border border-blue-200 rounded-full hover:bg-blue-50 font-medium"
              >
                Mark all as read ({unreadCount})
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsTab;
