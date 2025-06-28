import React from "react";

interface Notification {
  id: number;
  type: string;
  message: string;
  time: string;
  read: boolean;
}

interface NotificationsTabProps {
  notifications: Notification[];
}

const NotificationsTab: React.FC<NotificationsTabProps> = ({
  notifications,
}) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold text-[#141C24]">Notification Center</h2>
      <button className="px-4 py-2 bg-[#F4C753] text-[#141C24] rounded-lg font-medium hover:bg-[#F59E0B] transition-colors">
        Send Notification
      </button>
    </div>
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="space-y-4">
        {notifications.map((notification: Notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg border-l-4 ${
              notification.type === "order"
                ? "bg-green-50 border-green-400"
                : notification.type === "alert"
                ? "bg-yellow-50 border-yellow-400"
                : "bg-blue-50 border-blue-400"
            } ${
              !notification.read ? "ring-2 ring-opacity-20 ring-blue-400" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    notification.read ? "bg-gray-300" : "bg-blue-500"
                  }`}
                ></div>
                <div>
                  <p className="font-medium text-[#141C24]">
                    {notification.message}
                  </p>
                  <p className="text-sm text-[#3F5374]">{notification.time}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {!notification.read && (
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    Mark as read
                  </button>
                )}
                <button className="text-sm text-red-600 hover:text-red-800">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default NotificationsTab;
