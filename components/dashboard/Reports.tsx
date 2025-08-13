import { useState, useEffect, useCallback } from "react";
import PeriodDateSelector from "./PeriodDateSelector";
import ReportCard from "./ReportCard";

// Types
type PeriodType = "daily" | "weekly" | "monthly";

interface Order {
  _id: string;
  total: number;
  createdAt: string;
  [key: string]: unknown;
}

interface Expense {
  _id: string;
  amount: number;
  date?: string;
  createdAt?: string;
  [key: string]: unknown;
}

interface Ingredient {
  _id: string;
  name: string;
  currentPrice: number;
  unit: string;
  category: string;
  priceHistory?: Array<{
    price: number;
    date: string;
    source?: string;
  }>;
  [key: string]: unknown;
}

export default function Reports() {
  const [activeCard, setActiveCard] = useState<"orders" | "expenses" | "inventory" | null>(
    null
  );
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [defaultLayout, setDefaultLayout] = useState<(() => unknown) | null>(
    null
  );
  const [Viewer, setViewer] = useState<React.ComponentType<{
    fileUrl: string | null;
    plugins: unknown[];
  }> | null>(null);
  const [Worker, setWorker] = useState<React.ComponentType<{
    workerUrl: string;
    children: React.ReactNode;
  }> | null>(null);
  const [loadingPdf] = useState(false);
  const [period, setPeriod] = useState<PeriodType>("daily");
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [orderSummary, setOrderSummary] = useState("Loading...");
  const [expensesSummary, setExpensesSummary] = useState("Loading...");
  const [inventorySummary, setInventorySummary] = useState("Loading...");

  // Fetch summary data from database
  const fetchSummaryData = useCallback(async () => {
    try {
      setOrderSummary("Loading orders...");
      setExpensesSummary("Loading expenses...");
      setInventorySummary("Loading inventory...");

      // Fetch orders summary by calling our existing orders API to get count
      try {
        // We'll make a simple fetch to get summary data
        // Since we need all orders, we'll call the PDF endpoint with a HEAD request to get the data
        const ordersResponse = await fetch(`/api/orders`);
        const expensesResponse = await fetch(`/api/expenses`);
        const inventoryResponse = await fetch(`/api/ingredients`);

        let orderCount = 0;
        let orderTotal = 0;
        let expenseTotal = 0;
        let inventoryCount = 0;
        let totalInventoryValue = 0;

        if (ordersResponse.ok) {
          const ordersData: Order[] = await ordersResponse.json();
          // Filter orders by date range
          const filteredOrders = ordersData.filter((order: Order) => {
            const orderDate = new Date(order.createdAt);
            const { start, end } = getPeriodRange(period, selectedDate);
            return orderDate >= start && orderDate <= end;
          });

          orderCount = filteredOrders.length;
          orderTotal = filteredOrders.reduce(
            (sum: number, order: Order) => sum + (order.total || 0),
            0
          );
        }

        if (expensesResponse.ok) {
          const expensesData: Expense[] = await expensesResponse.json();
          // Filter expenses by date range
          const filteredExpenses = expensesData.filter((expense: Expense) => {
            const expenseDate = new Date(
              expense.date || expense.createdAt || ""
            );
            const { start, end } = getPeriodRange(period, selectedDate);
            return expenseDate >= start && expenseDate <= end;
          });

          expenseTotal = filteredExpenses.reduce(
            (sum: number, expense: Expense) => sum + (expense.amount || 0),
            0
          );
        }

        if (inventoryResponse.ok) {
          const inventoryData = await inventoryResponse.json();
          const ingredients: Ingredient[] = inventoryData.success ? inventoryData.data : inventoryData;
          
          inventoryCount = ingredients.length;
          totalInventoryValue = ingredients.reduce(
            (sum: number, ingredient: Ingredient) => sum + (ingredient.currentPrice || 0),
            0
          );
        }

        setOrderSummary(
          `Total Orders: ${orderCount}\nTotal Amount: Rs. ${orderTotal.toLocaleString()}`
        );
        setExpensesSummary(
          `Total Expenses: Rs. ${expenseTotal.toLocaleString()}`
        );
        setInventorySummary(
          `Total Ingredients: ${inventoryCount}\nTotal Value: Rs. ${totalInventoryValue.toLocaleString()}`
        );
      } catch (apiError) {
        console.error("Error fetching from API:", apiError);
        // Fallback to showing basic info
        setOrderSummary(
          "Click 'View' or 'Download' to generate report\nReal database data will be shown in PDF"
        );
        setExpensesSummary(
          "Click 'View' or 'Download' to generate report\nReal database data will be shown in PDF"
        );
        setInventorySummary(
          "Click 'View' or 'Download' to generate report\nReal database data will be shown in PDF"
        );
      }
    } catch (error) {
      console.error("Error fetching summary data:", error);
      setOrderSummary("Error loading data");
      setExpensesSummary("Error loading data");
      setInventorySummary("Error loading data");
    }
  }, [period, selectedDate]);

  // Helper function to get date range (same as in PDF API)
  const getPeriodRange = (period: PeriodType, baseDate: string) => {
    const date = new Date(baseDate);
    let start: Date, end: Date;

    if (period === "daily") {
      start = new Date(date);
      end = new Date(date);
    } else if (period === "weekly") {
      const day = date.getDay();
      start = new Date(date);
      start.setDate(date.getDate() - day);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
    } else {
      start = new Date(date.getFullYear(), date.getMonth(), 1);
      end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  // Fetch data when period or date changes
  useEffect(() => {
    fetchSummaryData();
  }, [fetchSummaryData]);

  // Download handler using API endpoint
  const handleOrderDownload = async () => {
    try {
      const response = await fetch(
        `/api/reports/pdf?type=orders&period=${period}&date=${selectedDate}`
      );
      if (!response.ok) throw new Error("Failed to generate PDF");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orders-report-${selectedDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("Error downloading order report:", error);
      alert("Failed to download order report. Please try again.");
    }
  };

  const handleExpensesDownload = async () => {
    try {
      const response = await fetch(
        `/api/reports/pdf?type=expenses&period=${period}&date=${selectedDate}`
      );
      if (!response.ok) throw new Error("Failed to generate PDF");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `expenses-report-${selectedDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("Error downloading expenses report:", error);
      alert("Failed to download expenses report. Please try again.");
    }
  };

  const handleInventoryDownload = async () => {
    try {
      const response = await fetch(
        `/api/reports/pdf?type=inventory&period=${period}&date=${selectedDate}`
      );
      if (!response.ok) throw new Error("Failed to generate PDF");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `inventory-report-${selectedDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("Error downloading inventory report:", error);
      alert("Failed to download inventory report. Please try again.");
    }
  };

  const handleOrderView = async () => {
    try {
      console.log('Fetching order PDF...');
      const response = await fetch(
        `/api/reports/pdf?type=orders&period=${period}&date=${selectedDate}`
      );
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`Failed to generate PDF: ${response.status} - ${errorText}`);
      }

      const blob = await response.blob();
      console.log('Blob size:', blob.size);
      console.log('Blob type:', blob.type);
      
      if (blob.size === 0) {
        throw new Error('Generated PDF is empty');
      }
      
      const url = URL.createObjectURL(blob);
      console.log('PDF URL created:', url);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (error) {
      console.error("Error viewing order report:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Failed to view order report: ${errorMessage}`);
    }
  };

  const handleExpensesView = async () => {
    try {
      console.log('Fetching expenses PDF...');
      const response = await fetch(
        `/api/reports/pdf?type=expenses&period=${period}&date=${selectedDate}`
      );
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`Failed to generate PDF: ${response.status} - ${errorText}`);
      }

      const blob = await response.blob();
      console.log('Blob size:', blob.size);
      console.log('Blob type:', blob.type);
      
      if (blob.size === 0) {
        throw new Error('Generated PDF is empty');
      }
      
      const url = URL.createObjectURL(blob);
      console.log('PDF URL created:', url);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (error) {
      console.error("Error viewing expenses report:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Failed to view expenses report: ${errorMessage}`);
    }
  };

  const handleInventoryView = async () => {
    try {
      console.log('Fetching inventory PDF...');
      const response = await fetch(
        `/api/reports/pdf?type=inventory&period=${period}&date=${selectedDate}`
      );
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`Failed to generate PDF: ${response.status} - ${errorText}`);
      }

      const blob = await response.blob();
      console.log('Blob size:', blob.size);
      console.log('Blob type:', blob.type);
      
      if (blob.size === 0) {
        throw new Error('Generated PDF is empty');
      }
      
      const url = URL.createObjectURL(blob);
      console.log('PDF URL created:', url);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (error) {
      console.error("Error viewing inventory report:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Failed to view inventory report: ${errorMessage}`);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
    setViewer(null);
    setWorker(null);
    setDefaultLayout(null);
  };

  return (
    <div className="space-y-6 font-sans">
      <h2 className="text-2xl font-extrabold text-gray-800">Reports</h2>
      <PeriodDateSelector
        period={period as PeriodType}
        selectedDate={selectedDate}
        setPeriod={setPeriod}
        setSelectedDate={setSelectedDate}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div
          className={`bg-white border border-orange-200 rounded-lg shadow p-6 flex items-center space-x-4 transition cursor-pointer ${
            activeCard === "orders"
              ? "ring-2 ring-orange-500"
              : "hover:shadow-lg hover:border-orange-400"
          }`}
          onClick={() => setActiveCard("orders")}
        >
          <span className="bg-orange-100 p-3 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-orange-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7h18M3 12h18M3 17h18"
              />
            </svg>
          </span>
          <div>
            <div className="font-semibold text-gray-800 text-lg">Orders</div>
            <div className="text-sm text-gray-500">
              View and analyze all orders
            </div>
          </div>
        </div>
        <div
          className={`bg-white border border-orange-200 rounded-lg shadow p-6 flex items-center space-x-4 transition cursor-pointer ${
            activeCard === "expenses"
              ? "ring-2 ring-orange-500"
              : "hover:shadow-lg hover:border-orange-400"
          }`}
          onClick={() => setActiveCard("expenses")}
        >
          <span className="bg-orange-100 p-3 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-orange-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 8v8"
              />
            </svg>
          </span>
          <div>
            <div className="font-semibold text-gray-800 text-lg">Expenses</div>
            <div className="text-sm text-gray-500">
              Track and manage expenses
            </div>
          </div>
        </div>
        <div
          className={`bg-white border border-orange-200 rounded-lg shadow p-6 flex items-center space-x-4 transition cursor-pointer ${
            activeCard === "inventory"
              ? "ring-2 ring-orange-500"
              : "hover:shadow-lg hover:border-orange-400"
          }`}
          onClick={() => setActiveCard("inventory")}
        >
          <span className="bg-orange-100 p-3 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-orange-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </span>
          <div>
            <div className="font-semibold text-gray-800 text-lg">Inventory</div>
            <div className="text-sm text-gray-500">
              View ingredients and stock
            </div>
          </div>
        </div>
      </div>
      {/* Show summary and download/view for selected card */}
      {activeCard === "orders" && (
        <ReportCard
          title="Order Summary"
          summary={orderSummary}
          onDownload={handleOrderDownload}
          onView={handleOrderView}
        />
      )}
      {activeCard === "expenses" && (
        <ReportCard
          title="Expenses Summary"
          summary={expensesSummary}
          onDownload={handleExpensesDownload}
          onView={handleExpensesView}
        />
      )}
      {activeCard === "inventory" && (
        <ReportCard
          title="Inventory Summary"
          summary={inventorySummary}
          onDownload={handleInventoryDownload}
          onView={handleInventoryView}
        />
      )}
      {/* PDF Viewer Modal */}
      {showModal && Viewer && Worker && defaultLayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-white rounded-lg overflow-hidden shadow-lg max-w-3xl w-full">
            <div className="flex justify-between items-center bg-gray-100 px-4 py-2">
              <h3 className="text-lg font-semibold text-gray-800">
                PDF Viewer
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
                title="Close PDF viewer"
                aria-label="Close PDF viewer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-4">
              {loadingPdf ? (
                <div className="flex items-center justify-center py-10">
                  <svg
                    role="status"
                    className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                    viewBox="0 0 100 101"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M50.5 10c-22.91 0-41.5 18.59-41.5 41.5S27.59 93 50.5 93 92 74.41 92 51.5 73.41 10 50.5 10zm0 82c-22.91 0-41.5-18.59-41.5-41.5S27.59 49 50.5 49 92 67.41 92 90.5 73.41 92 50.5 92z"
                      fillOpacity="0.2"
                    />
                    <path d="M93.97 51.078c0-23.75-19.27-42.02-43.03-42.02S7.91 27.328 7.91 51.078c0 23.75 19.27 42.02 43.03 42.02S93.97 74.828 93.97 51.078zM50.5 10.5c22.68 0 41 18.32 41 41s-18.32 41-41 41-41-18.32-41-41 18.32-41 41-41z" />
                  </svg>
                  <span className="text-gray-500">Loading PDF...</span>
                </div>
              ) : (
                <div className="h-[70vh]">
                  <Worker
                    workerUrl={`https://unpkg.com/pdfjs-dist@${"2.10.377"}/build/pdf.worker.min.js`}
                  >
                    <Viewer fileUrl={pdfUrl} plugins={[defaultLayout()]} />
                  </Worker>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
