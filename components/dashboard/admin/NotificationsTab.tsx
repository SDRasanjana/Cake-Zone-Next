import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Bell,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle,
  X,
} from "lucide-react";

interface Notification {
  _id: string;
  type: "order_update" | "promotional_alert" | "system_announcement";
  title: string;
  message: string;
  targetAudience: "all" | "customers" | "specific_user";
  targetUserId?: string;
  priority: "low" | "medium" | "high";
  isActive: boolean;
  readBy?: string[];
  expiresAt?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}

interface NotificationStats {
  total: number;
  active: number;
  expired: number;
}

interface NotificationsTabProps {
  notifications?: Notification[];
}

const NotificationsTab: React.FC<NotificationsTabProps> = () => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    active: 0,
    expired: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNotification, setEditingNotification] =
    useState<Notification | null>(null);
  const [formData, setFormData] = useState({
    type: "promotional_alert" as
      | "order_update"
      | "promotional_alert"
      | "system_announcement",
    title: "",
    message: "",
    targetAudience: "all" as "all" | "customers" | "specific_user",
    targetUserId: "",
    priority: "medium" as "low" | "medium" | "high",
    expiresAt: "",
  });

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/notifications?admin=true");
      const data = await response.json();

      if (data.success) {
        setNotifications(data.notifications || []);
        setStats(data.stats || { total: 0, active: 0, expired: 0 });
        setError("");
      } else {
        setError(data.error || "Failed to fetch notifications");
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to fetch notifications");
      setNotifications([]);
      setStats({ total: 0, active: 0, expired: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Add state for delete confirmation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    notificationId: string;
    notificationTitle: string;
  }>({
    isOpen: false,
    notificationId: "",
    notificationTitle: "",
  });

  // Handle create/update notification
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.emailAddresses?.[0]?.emailAddress) {
      setError("User not authenticated");
      return;
    }

    // Basic form validation
    if (formData.title.trim().length < 3) {
      setError("Title must be at least 3 characters long");
      return;
    }

    if (formData.message.trim().length < 10) {
      setError("Message must be at least 10 characters long");
      return;
    }

    if (
      formData.targetAudience === "specific_user" &&
      !formData.targetUserId.trim()
    ) {
      setError(
        "Target user ID/email is required for specific user notifications"
      );
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const payload = {
        ...formData,
        title: formData.title.trim(),
        message: formData.message.trim(),
        targetUserId: formData.targetUserId.trim() || undefined,
        createdBy: user.emailAddresses[0].emailAddress,
        expiresAt: formData.expiresAt || null,
      };

      const url = editingNotification
        ? "/api/notifications"
        : "/api/notifications";

      const method = editingNotification ? "PATCH" : "POST";

      const requestBody = editingNotification
        ? { notificationId: editingNotification._id, ...payload }
        : payload;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        await fetchNotifications(); // Refresh the list
        setSuccessMessage(
          editingNotification
            ? "✅ Notification updated successfully!"
            : "🎉 Notification created successfully!"
        );

        // Auto-hide success message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000);

        setShowCreateForm(false);
        setEditingNotification(null);
        setFormData({
          type: "promotional_alert" as
            | "order_update"
            | "promotional_alert"
            | "system_announcement",
          title: "",
          message: "",
          targetAudience: "all" as "all" | "customers" | "specific_user",
          targetUserId: "",
          priority: "medium" as "low" | "medium" | "high",
          expiresAt: "",
        });
        setError("");
      } else {
        setError(data.error || "Failed to save notification");
      }
    } catch (err) {
      console.error("Error saving notification:", err);
      setError("Network error: Failed to save notification. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete notification
  const handleDelete = async (
    notificationId: string,
    notificationTitle: string
  ) => {
    if (!user?.emailAddresses?.[0]?.emailAddress) return;

    // Open confirmation dialog
    setDeleteConfirmation({
      isOpen: true,
      notificationId,
      notificationTitle,
    });
  };

  // Confirm delete notification
  const confirmDelete = async () => {
    if (!user?.emailAddresses?.[0]?.emailAddress) return;

    const { notificationId } = deleteConfirmation;
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(
        `/api/notifications?id=${notificationId}&userId=${user.emailAddresses[0].emailAddress}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (data.success) {
        await fetchNotifications();
        setSuccessMessage("🗑️ Notification deleted successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
        setError("");
      } else {
        setError(data.error || "Failed to delete notification");
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
      setError(
        "Network error: Failed to delete notification. Please try again."
      );
    } finally {
      setIsSubmitting(false);
      setDeleteConfirmation({
        isOpen: false,
        notificationId: "",
        notificationTitle: "",
      });
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteConfirmation({
      isOpen: false,
      notificationId: "",
      notificationTitle: "",
    });
  };

  // Handle toggle active status
  const handleToggleActive = async (notification: Notification) => {
    if (!user?.emailAddresses?.[0]?.emailAddress) return;

    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationId: notification._id,
          isActive: !notification.isActive,
          createdBy: user.emailAddresses[0].emailAddress,
        }),
      });

      const data = await response.json();

      if (data.success) {
        fetchNotifications();
        setError("");
      } else {
        setError(data.error || "Failed to update notification");
      }
    } catch (err) {
      console.error("Error updating notification:", err);
      setError("Failed to update notification");
    }
  };

  // Handle edit notification
  const handleEdit = (notification: Notification) => {
    setEditingNotification(notification);
    setError(""); // Clear any errors
    setSuccessMessage(""); // Clear any success messages
    setFormData({
      type: notification.type,
      title: notification.title,
      message: notification.message,
      targetAudience: notification.targetAudience,
      targetUserId: notification.targetUserId || "",
      priority: notification.priority,
      expiresAt: notification.expiresAt
        ? new Date(
            new Date(notification.expiresAt).getTime() -
              new Date().getTimezoneOffset() * 60000
          )
            .toISOString()
            .slice(0, 16)
        : "",
    });
    setShowCreateForm(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "order_update":
        return "text-blue-600 bg-blue-50";
      case "promotional_alert":
        return "text-orange-600 bg-orange-50";
      case "system_announcement":
        return "text-purple-600 bg-purple-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#141C24]">
            Notification Management
          </h2>
          <p className="text-gray-600 mt-1">
            Create and manage notifications for customers
          </p>
        </div>

        {/* Stats Cards */}
        <div className="flex gap-4">
          <div className="bg-blue-50 rounded-lg px-4 py-2 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.total}
            </div>
            <div className="text-xs text-blue-700">Total</div>
          </div>
          <div className="bg-green-50 rounded-lg px-4 py-2 text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
            <div className="text-xs text-green-700">Active</div>
          </div>
          <div className="bg-red-50 rounded-lg px-4 py-2 text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.expired}
            </div>
            <div className="text-xs text-red-700">Expired</div>
          </div>
        </div>
      </div>

      {/* Create New Button and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowCreateForm(true);
              setEditingNotification(null);
              setError(""); // Clear any errors
              setSuccessMessage(""); // Clear any success messages
              setFormData({
                type: "promotional_alert" as
                  | "order_update"
                  | "promotional_alert"
                  | "system_announcement",
                title: "",
                message: "",
                targetAudience: "all" as "all" | "customers" | "specific_user",
                targetUserId: "",
                priority: "medium" as "low" | "medium" | "high",
                expiresAt: "",
              });
            }}
            className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-lg font-medium hover:from-yellow-500 hover:to-orange-600 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            Create Notification
          </button>

          {(notifications?.length || 0) > 0 && (
            <button
              onClick={() => {
                if (
                  confirm(
                    `Are you sure you want to delete ALL ${
                      notifications?.length || 0
                    } notifications? This action cannot be undone.`
                  )
                ) {
                  // Handle bulk delete - we can implement this if needed
                  setError("Bulk delete feature coming soon!");
                  setTimeout(() => setError(""), 3000);
                }
              }}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors flex items-center gap-2 border border-red-200"
            >
              <Trash2 className="w-4 h-4" />
              Delete All ({notifications?.length || 0})
            </button>
          )}
        </div>

        <button
          onClick={fetchNotifications}
          className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2"
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

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-700 font-medium">{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-4 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {editingNotification
                    ? "Edit Notification"
                    : "Create New Notification"}
                </h3>
                <p className="text-gray-800 text-sm">
                  {editingNotification
                    ? "Update notification details"
                    : "Fill in the details to create a new notification"}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingNotification(null);
                  setError("");
                }}
                className="text-gray-900 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-black/10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Notification Type and Priority Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Notification Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as
                        | "order_update"
                        | "promotional_alert"
                        | "system_announcement",
                    })
                  }
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 bg-white text-gray-900 hover:border-gray-400"
                  required
                >
                  <option value="promotional_alert">
                    🎯 Promotional Alert
                  </option>
                  <option value="order_update">📦 Order Update</option>
                  <option value="system_announcement">
                    📢 System Announcement
                  </option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Choose the type of notification to send
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Priority Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: e.target.value as "low" | "medium" | "high",
                    })
                  }
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 bg-white text-gray-900 hover:border-gray-400"
                  required
                >
                  <option value="low">🟢 Low Priority</option>
                  <option value="medium">🟡 Medium Priority</option>
                  <option value="high">🔴 High Priority</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Set the importance level of this notification
                </p>
              </div>
            </div>

            {/* Title Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Notification Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 hover:border-gray-400"
                placeholder="e.g., 'Special Discount on Birthday Cakes' or 'Order Status Update'"
                required
                maxLength={100}
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">
                  Keep it concise and attention-grabbing
                </p>
                <span className="text-xs text-gray-400">
                  {formData.title.length}/100
                </span>
              </div>
            </div>

            {/* Message Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Notification Message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 resize-none hover:border-gray-400"
                rows={4}
                placeholder="Enter the detailed message that users will see. Be clear and actionable..."
                required
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">
                  Provide clear and helpful information to users
                </p>
                <span className="text-xs text-gray-400">
                  {formData.message.length}/500
                </span>
              </div>
            </div>

            {/* Target Audience and Expiration Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Target Audience <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.targetAudience}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      targetAudience: e.target.value as
                        | "all"
                        | "customers"
                        | "specific_user",
                    })
                  }
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 bg-white text-gray-900 hover:border-gray-400"
                  required
                >
                  <option value="all">👥 All Users</option>
                  <option value="customers">🛍️ Customers Only</option>
                  <option value="specific_user">👤 Specific User</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Who should receive this notification?
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Expiration Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) =>
                    setFormData({ ...formData, expiresAt: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 bg-white text-gray-900 hover:border-gray-400"
                  min={new Date().toISOString().slice(0, 16)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: When should this notification expire?
                </p>
              </div>
            </div>

            {/* Specific User Field - Conditional */}
            {formData.targetAudience === "specific_user" && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Target User ID/Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.targetUserId}
                  onChange={(e) =>
                    setFormData({ ...formData, targetUserId: e.target.value })
                  }
                  className="w-full p-3 border-2 border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 hover:border-yellow-400"
                  placeholder="Enter user ID or email address (e.g., user@example.com)"
                  required={formData.targetAudience === "specific_user"}
                />
                <p className="text-xs text-yellow-700 mt-1">
                  💡 Tip: Enter the exact email address or user ID of the
                  recipient
                </p>
              </div>
            )}

            {/* Form Actions */}
            <div className="bg-gray-50 rounded-lg p-4 border-t">
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingNotification(null);
                    setError("");
                    setFormData({
                      type: "promotional_alert" as
                        | "order_update"
                        | "promotional_alert"
                        | "system_announcement",
                      title: "",
                      message: "",
                      targetAudience: "all" as
                        | "all"
                        | "customers"
                        | "specific_user",
                      targetUserId: "",
                      priority: "medium" as "low" | "medium" | "high",
                      expiresAt: "",
                    });
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all duration-200 border border-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-8 py-3 rounded-lg font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                    isSubmitting
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 hover:from-yellow-500 hover:to-orange-600"
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      {editingNotification ? "Updating..." : "Creating..."}
                    </span>
                  ) : editingNotification ? (
                    "✅ Update Notification"
                  ) : (
                    "🚀 Create Notification"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-lg">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Loading notifications...</span>
            </div>
          </div>
        ) : (notifications?.length || 0) === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No notifications yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start engaging with your customers by creating your first
              notification!
            </p>
            <button
              onClick={() => {
                setShowCreateForm(true);
                setEditingNotification(null);
                setError("");
                setSuccessMessage("");
                setFormData({
                  type: "promotional_alert" as
                    | "order_update"
                    | "promotional_alert"
                    | "system_announcement",
                  title: "",
                  message: "",
                  targetAudience: "all" as
                    | "all"
                    | "customers"
                    | "specific_user",
                  targetUserId: "",
                  priority: "medium" as "low" | "medium" | "high",
                  expiresAt: "",
                });
              }}
              className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-lg font-medium hover:from-yellow-500 hover:to-orange-600 transition-all duration-200 inline-flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-4 h-4" />
              Create Your First Notification
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {(notifications || []).map((notification) => (
              <div key={notification._id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                          notification.type
                        )}`}
                      >
                        {notification.type.replace("_", " ").toUpperCase()}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                          notification.priority
                        )}`}
                      >
                        {notification.priority.toUpperCase()}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          notification.isActive
                            ? "text-green-600 bg-green-50"
                            : "text-gray-600 bg-gray-50"
                        }`}
                      >
                        {notification.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-800 mb-1">
                      {notification.title || "Untitled Notification"}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      {notification.message || "No message content"}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {notification.targetAudience || "Unknown audience"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {notification.createdAt
                          ? new Date(
                              notification.createdAt
                            ).toLocaleDateString()
                          : "Unknown date"}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        {notification.readBy?.length || 0} read
                      </span>
                      <span className="flex items-center gap-1 text-blue-600">
                        <span className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold">A</span>
                        </span>
                        {notification.createdBy
                          ? notification.createdBy.includes("@")
                            ? notification.createdBy.split("@")[0]
                            : notification.createdBy
                          : "Admin"}
                      </span>
                      {notification.expiresAt && (
                        <span className="flex items-center gap-1 text-orange-600">
                          <Calendar className="w-4 h-4" />
                          Expires:{" "}
                          {new Date(
                            notification.expiresAt
                          ).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <div className="bg-gray-50 rounded-lg p-1 flex gap-1">
                      <button
                        onClick={() => handleToggleActive(notification)}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          notification.isActive
                            ? "text-green-600 hover:bg-green-100 hover:text-green-700"
                            : "text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                        }`}
                        title={
                          notification.isActive
                            ? "Deactivate Notification"
                            : "Activate Notification"
                        }
                      >
                        {notification.isActive ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(notification)}
                        className="p-2 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-all duration-200"
                        title="Edit Notification"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(notification._id, notification.title)
                        }
                        className="p-2 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-lg transition-all duration-200 group"
                        title="Delete Notification"
                      >
                        <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-red-50 px-6 py-4 rounded-t-xl border-b border-red-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-800">
                    Delete Notification
                  </h3>
                  <p className="text-sm text-red-600">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete this notification?
              </p>
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="font-medium text-gray-800 text-sm">
                  &ldquo;{deleteConfirmation.notificationTitle}&rdquo;
                </p>
              </div>
              <p className="text-sm text-gray-600">
                This will permanently remove the notification for all users. Any
                users who haven&apos;t read it yet will no longer be able to see
                it.
              </p>
            </div>

            <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isSubmitting
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl"
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </span>
                ) : (
                  "🗑️ Delete Notification"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsTab;
