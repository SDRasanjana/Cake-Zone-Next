// Notification Bell Component with unread count for customer navbar
"use client";

import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { useUser } from "@clerk/nextjs";

interface NotificationBellProps {
  className?: string;
  onClick?: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  className = "",
  onClick,
}) => {
  const { user } = useUser();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(
          `/api/notifications?userId=${user.id}&userRole=customer&unreadOnly=true`
        );
        const data = await response.json();

        if (data.success) {
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (err) {
        console.error("Error fetching unread count:", err);
      }
    };

    fetchUnreadCount();

    // Refresh count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [user?.id]);

  return (
    <button
      onClick={onClick}
      className={`relative p-2 hover:bg-gray-100 rounded-lg transition-colors ${className}`}
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
