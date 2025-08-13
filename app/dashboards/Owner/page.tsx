"use client";
import { useState, Suspense, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import SidebarNav from "@/components/SidebarNav";
import TopHeader from "@/components/TopHeader";

// Error Boundary Component
import { ErrorBoundary } from "react-error-boundary";

// Static imports as fallback (recommended approach)
import Overview from "@/components/dashboard/Overview";
import Orders from "@/components/dashboard/Orders";
import Inventory from "@/components/dashboard/Inventory";
import CakePricing from "@/components/dashboard/CakePricing";
import Forecast from "@/components/dashboard/Forecast";
import Expenses from "@/components/dashboard/Expenses";
import Reports from "@/components/dashboard/Reports";
import Advisor from "@/components/dashboard/Advisor";

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    <span className="ml-3 text-gray-600">Loading...</span>
  </div>
);

// Error fallback component
const ErrorFallback = ({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) => (
  <div className="flex flex-col items-center justify-center h-64 p-6 bg-red-50 rounded-lg border border-red-200">
    <div className="text-red-600 mb-4">
      <svg
        className="w-12 h-12"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-red-800 mb-2">
      Something went wrong
    </h3>
    <p className="text-red-600 text-center mb-4">{error.message}</p>
    <button
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
    >
      Try again
    </button>
  </div>
);

export default function OwnerDashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Overview");
  const [componentError, setComponentError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && (!isSignedIn || user?.publicMetadata?.role !== "owner")) {
      router.replace("/unauthorized");
    }
  }, [isLoaded, isSignedIn, user, router]);

  const renderTab = () => {
    try {
      switch (activeTab) {
        case "Overview":
          return <Overview />;
        case "Orders":
          return <Orders />;
        case "Inventory":
          return <Inventory />;
        case "Cake Pricing":
          return <CakePricing />;
        case "Price Forecasting":
          return <Forecast />;
        case "Expenses":
          return <Expenses />;
        case "Reports":
          return <Reports />;
        case "Financial Advisor":
          return <Advisor />;
        default:
          return <Overview />;
      }
    } catch (error) {
      console.error("Error rendering component:", error);
      setComponentError(
        error instanceof Error ? error.message : "Unknown error"
      );
      return (
        <div className="flex flex-col items-center justify-center h-64 p-6 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-yellow-800">
            Failed to load component. Please try refreshing the page.
          </p>
          <button
            onClick={() => {
              setComponentError(null);
              window.location.reload();
            }}
            className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            Refresh Page
          </button>
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <SidebarNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <TopHeader />
        <main className="flex-1 p-6 overflow-auto">
          <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onError={(error, errorInfo) => {
              console.error("Dashboard Error:", error, errorInfo);
            }}
            onReset={() => {
              setComponentError(null);
              // Optionally reload the page or reset state
            }}
          >
            <Suspense fallback={<LoadingSpinner />}>
              {componentError ? (
                <ErrorFallback
                  error={new Error(componentError)}
                  resetErrorBoundary={() => setComponentError(null)}
                />
              ) : (
                renderTab()
              )}
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
