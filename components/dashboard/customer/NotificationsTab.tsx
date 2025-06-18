import React from "react";
import { Bell } from "lucide-react";

const NotificationsTab: React.FC = () => (
  <div className="bg-white rounded-xl shadow-sm border p-6">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">
      Notifications
    </h3>
    <div className="space-y-4">
      <div className="flex items-start p-4 bg-blue-50 rounded-lg">
        <Bell className="w-5 h-5 text-blue-600 mt-1 mr-3" />
        <div>
          <p className="font-medium text-gray-800">Order Update</p>
          <p className="text-sm text-gray-600">
            Your Chocolate Birthday Cake has been delivered!
          </p>
          <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
        </div>
      </div>
      <div className="flex items-start p-4 bg-green-50 rounded-lg">
        <Bell className="w-5 h-5 text-green-600 mt-1 mr-3" />
        <div>
          <p className="font-medium text-gray-800">Special Offer</p>
          <p className="text-sm text-gray-600">
            Get 20% off on your next order above ₹2000
          </p>
          <p className="text-xs text-gray-500 mt-1">1 day ago</p>
        </div>
      </div>
      <div className="flex items-start p-4 bg-yellow-50 rounded-lg">
        <Bell className="w-5 h-5 text-yellow-600 mt-1 mr-3" />
        <div>
          <p className="font-medium text-gray-800">Reminder</p>
          <p className="text-sm text-gray-600">
            Don&apos;t forget to rate your last order
          </p>
          <p className="text-xs text-gray-500 mt-1">3 days ago</p>
        </div>
      </div>
    </div>
  </div>
);

export default NotificationsTab;