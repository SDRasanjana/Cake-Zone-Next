// Promotional Alert Banner Component
// Shows promotional notifications at the top of customer pages
"use client";

import React, { useState, useEffect } from "react";
import { X, Gift, ChevronRight } from "lucide-react";
import { useUser } from "@clerk/nextjs";

interface PromoNotification {
  _id: string;
  type: string;
  title: string;
  message: string;
  priority: "low" | "medium" | "high";
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  metadata?: {
    actionUrl?: string;
    actionText?: string;
    [key: string]: unknown;
  };
}

interface PromoBannerProps {
  className?: string;
}

const PromoBanner: React.FC<PromoBannerProps> = ({ className = "" }) => {
  const { user } = useUser();
  const [promoNotification, setPromoNotification] =
    useState<PromoNotification | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const fetchPromoNotification = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(
          `/api/notifications?userId=${user.id}&userRole=customer`
        );
        const data = await response.json();

        if (data.success && data.notifications) {
          // Find the highest priority promotional alert that hasn't been dismissed
          const promos = data.notifications.filter(
            (notif: PromoNotification) =>
              notif.type === "promotional_alert" &&
              notif.isActive &&
              (!notif.expiresAt || new Date(notif.expiresAt) > new Date()) &&
              !localStorage.getItem(`dismissed_promo_${notif._id}`)
          );

          if (promos.length > 0) {
            // Sort by priority (high first) and creation date
            promos.sort((a: PromoNotification, b: PromoNotification) => {
              const priorityOrder = { high: 3, medium: 2, low: 1 };
              const aPriority =
                priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
              const bPriority =
                priorityOrder[b.priority as keyof typeof priorityOrder] || 0;

              if (aPriority !== bPriority) {
                return bPriority - aPriority;
              }

              return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
              );
            });

            setPromoNotification(promos[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching promotional notifications:", err);
      }
    };

    fetchPromoNotification();
  }, [user?.id]);

  const handleDismiss = () => {
    if (promoNotification) {
      localStorage.setItem(`dismissed_promo_${promoNotification._id}`, "true");
      setIsDismissed(true);
    }
  };

  const handleAction = () => {
    if (promoNotification?.metadata?.actionUrl) {
      const actionUrl = promoNotification.metadata.actionUrl as string;
      if (actionUrl.startsWith("/")) {
        window.location.href = actionUrl;
      } else if (actionUrl.includes("menu")) {
        window.location.href = "/menu";
      } else if (actionUrl.includes("cart")) {
        window.location.href = "/shopping-cart";
      }
    }
    handleDismiss();
  };

  if (!promoNotification || isDismissed) {
    return null;
  }

  const getBannerColor = () => {
    switch (promoNotification.priority) {
      case "high":
        return "bg-gradient-to-r from-red-500 to-pink-600 text-white";
      case "medium":
        return "bg-gradient-to-r from-orange-500 to-yellow-600 text-white";
      case "low":
        return "bg-gradient-to-r from-blue-500 to-indigo-600 text-white";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white";
    }
  };

  return (
    <div className={`relative ${getBannerColor()} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Gift className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm sm:text-base truncate">
                {promoNotification.title}
              </p>
              <p className="text-sm opacity-90 hidden sm:block">
                {promoNotification.message}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            {promoNotification.metadata?.actionUrl && (
              <button
                onClick={handleAction}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1"
              >
                {(promoNotification.metadata.actionText as string) ||
                  "View Offer"}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile message */}
        <p className="text-sm opacity-90 mt-2 sm:hidden">
          {promoNotification.message}
        </p>
      </div>
    </div>
  );
};

export default PromoBanner;
