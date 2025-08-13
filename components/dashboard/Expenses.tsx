"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Trash2,
  Loader2,
  RefreshCw,
  X,
  AlertTriangle,
} from "lucide-react";
import { useExpense } from "@/lib/hooks/useExpense";

// Define proper TypeScript interfaces
interface Expense {
  _id: string;
  category: string;
  amount: number;
  description?: string;
  date: string | Date;
}

interface NewExpense {
  category: string;
  amount: string;
  description: string;
}

interface DeleteModal {
  isOpen: boolean;
  expenseId: string;
  expenseDetails: Expense | null;
  isDeleting: boolean;
}

interface Notification {
  show: boolean;
  type: "success" | "error";
  message: string;
}

export default function Expenses() {
  const {
    loading,
    error,
    fetchExpenses,
    addExpense,
    deleteExpense,
    getExpensesByMonth,
  } = useExpense();

  const [newExpense, setNewExpense] = useState<NewExpense>({
    category: "Labour",
    amount: "",
    description: "",
  });

  // Fixed date calculations
  const [currentMonth] = useState(() => new Date().getMonth() + 1);
  const [currentYear] = useState(() => new Date().getFullYear());
  const [previousMonth] = useState(() => {
    const today = new Date();
    const prevDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    return prevDate.getMonth() + 1;
  });
  const [previousYear] = useState(() => {
    const today = new Date();
    const prevDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    return prevDate.getFullYear();
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState<DeleteModal>({
    isOpen: false,
    expenseId: "",
    expenseDetails: null,
    isDeleting: false,
  });
  const [notification, setNotification] = useState<Notification>({
    show: false,
    type: "success",
    message: "",
  });

  const expenseCategories = [
    "Labour",
    "Inventory",
    "Utilities",
    "Others",
  ] as const;
  type ExpenseCategory = (typeof expenseCategories)[number];

  const categoryColors: Record<ExpenseCategory, string> = {
    Labour: "#f97316", // Orange
    Inventory: "#06b6d4", // Cyan
    Utilities: "#10b981", // Emerald
    Others: "#ec4899", // Pink
  };

  // Fetch expenses on component mount
  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Handle add expense
  const handleAddExpense = async () => {
    if (!newExpense.amount || parseFloat(newExpense.amount) <= 0) {
      showNotification("error", "Please enter a valid amount");
      return;
    }

    try {
      setIsSubmitting(true);

      console.log("=== ADD EXPENSE TO CAKEZONE DATABASE ===");
      console.log("Form data:", newExpense);
      console.log("Parsed amount:", parseFloat(newExpense.amount));
      console.log("Category:", newExpense.category);
      console.log("Description:", newExpense.description);

      const expenseData = {
        category: newExpense.category,
        amount: parseFloat(newExpense.amount),
        description: newExpense.description,
        date: new Date(),
      };

      console.log("📝 Sending to CakeZone database:", expenseData);

      // Use the hook's addExpense function directly (no duplicate API call)
      const createdExpense = await addExpense(expenseData);

      console.log(
        "✅ Expense added to CakeZone database successfully:",
        createdExpense
      );

      // Reset form
      setNewExpense({ category: "Labour", amount: "", description: "" });
      showNotification(
        "success",
        "Expense added successfully to CakeZone database!"
      );

      console.log("=== ADD EXPENSE COMPLETED ===");
    } catch (err) {
      console.error("=== ADD EXPENSE ERROR ===");
      console.error("Error details:", err);
      console.error("Error message:", (err as Error).message);

      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      showNotification("error", `Failed to add expense: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  // Handle delete expense - improved with better error handling
  const handleDeleteExpense = (expense: Expense) => {
    console.log("Preparing to delete expense:", expense);
    console.log("Expense ID:", expense._id);

    // Validate that the expense has a valid ID
    if (!expense._id || typeof expense._id !== "string") {
      showNotification(
        "error",
        "Invalid expense ID. Cannot delete this expense."
      );
      return;
    }

    setDeleteModal({
      isOpen: true,
      expenseId: expense._id,
      expenseDetails: expense,
      isDeleting: false,
    });
  };

  // Show notification
  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "success", message: "" });
    }, 4000);
  };

  // Confirm delete with proper error handling
  const confirmDelete = async () => {
    setDeleteModal((prev) => ({ ...prev, isDeleting: true }));

    try {
      console.log("=== DELETE FROM CAKEZONE DATABASE ===");
      console.log("Expense ID to delete:", deleteModal.expenseId);
      console.log("Expense details:", deleteModal.expenseDetails);
      console.log("ID type:", typeof deleteModal.expenseId);
      console.log("ID length:", deleteModal.expenseId.length);

      // Use the hook's deleteExpense function directly
      console.log("🗑️ Calling deleteExpense hook...");
      const result = await deleteExpense(deleteModal.expenseId);

      console.log("✅ Delete successful from CakeZone database:", result);

      // Close modal and show success
      setDeleteModal({
        isOpen: false,
        expenseId: "",
        expenseDetails: null,
        isDeleting: false,
      });
      showNotification(
        "success",
        "Expense deleted successfully from CakeZone database!"
      );

      console.log("=== DELETE COMPLETED ===");
    } catch (err) {
      console.error("=== DELETE ERROR ===");
      console.error("Delete error:", err);

      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      showNotification("error", `Failed to delete expense: ${errorMessage}`);
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));

      console.log("=== DELETE FAILED ===");
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteModal({
      isOpen: false,
      expenseId: "",
      expenseDetails: null,
      isDeleting: false,
    });
  };
  // Get current and previous month expenses with useMemo to prevent re-calculation
  const currentMonthExpenses: Expense[] = useMemo(() => {
    return getExpensesByMonth(currentMonth - 1, currentYear) || [];
  }, [getExpensesByMonth, currentMonth, currentYear]);

  const previousMonthExpenses: Expense[] = useMemo(() => {
    return getExpensesByMonth(previousMonth - 1, previousYear) || [];
  }, [getExpensesByMonth, previousMonth, previousYear]);

  // Debug the month filtering
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("=== MONTH FILTERING DEBUG ===");
      console.log("Current date:", new Date());
      console.log("Current month (1-based):", currentMonth);
      console.log("Current year:", currentYear);
      console.log("Filter using month index (0-based):", currentMonth - 1);
      console.log("Current month expenses found:", currentMonthExpenses.length);
      console.log(
        "Previous month expenses found:",
        previousMonthExpenses.length
      );
      console.log("============================");
    }
  }, [currentMonthExpenses, previousMonthExpenses, currentMonth, currentYear]);

  // Calculate totals for current month
  const getCurrentCategoryTotal = (category: string): number => {
    return currentMonthExpenses
      .filter((expense) => expense.category === category)
      .reduce((total, expense) => total + expense.amount, 0);
  };

  const getPreviousCategoryTotal = (category: string): number => {
    return previousMonthExpenses
      .filter((expense) => expense.category === category)
      .reduce((total, expense) => total + expense.amount, 0);
  };

  // Prepare data for charts
  const comparisonData = expenseCategories.map((category) => ({
    category,
    current: getCurrentCategoryTotal(category),
    previous: getPreviousCategoryTotal(category),
    change:
      getCurrentCategoryTotal(category) - getPreviousCategoryTotal(category),
  }));

  const pieData = expenseCategories
    .map((category) => ({
      name: category,
      value: getCurrentCategoryTotal(category),
      color: categoryColors[category],
    }))
    .filter((item) => item.value > 0);
  const totalCurrent = currentMonthExpenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );
  const totalPrevious = previousMonthExpenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );
  const totalChange = totalCurrent - totalPrevious;
  const changePercentage =
    totalPrevious > 0 ? ((totalChange / totalPrevious) * 100).toFixed(1) : "0";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-700">Loading expenses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={() => fetchExpenses()}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:shadow-md flex items-center gap-2 mx-auto transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-orange-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-pink-600 p-8 rounded-xl text-white shadow-lg mb-8">
          <div className="absolute top-0 right-0 opacity-20">
            <DollarSign className="h-32 w-32 text-white" />
          </div>
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              Expense Analytics
            </h1>
            <p className="text-orange-100 text-lg">
              Track, analyze, and optimize your business spending
            </p>
            <div className="mt-4 flex items-center space-x-4">
              <div className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                📊 Financial Insights
              </div>
              <div className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                💰 Cost Management
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Current Month Card */}
          <div className="group relative overflow-hidden bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity">
              <DollarSign className="h-16 w-16 text-blue-600" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <DollarSign className="text-white w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-700">Current Month</h3>
              </div>
              <p className="text-3xl font-bold text-gray-800 mb-2">
                Rs. {totalCurrent.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total expenses this month</p>
            </div>
          </div>

          {/* Previous Month Card */}
          <div className="group relative overflow-hidden bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity">
              <DollarSign className="h-16 w-16 text-gray-600" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-3">
                <div className="p-2 bg-gray-500 rounded-lg">
                  <DollarSign className="text-white w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-700">Previous Month</h3>
              </div>
              <p className="text-3xl font-bold text-gray-800 mb-2">
                Rs. {totalPrevious.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                Last month&apos;s expenses
              </p>
            </div>
          </div>

          {/* Change Analysis Card */}
          <div
            className={`group relative overflow-hidden bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
              totalChange >= 0
                ? "bg-gradient-to-br from-red-50 to-red-100"
                : "bg-gradient-to-br from-green-50 to-green-100"
            }`}
          >
            <div className="absolute top-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity">
              {totalChange >= 0 ? (
                <TrendingUp
                  className={`h-16 w-16 ${
                    totalChange >= 0 ? "text-red-600" : "text-green-600"
                  }`}
                />
              ) : (
                <TrendingDown
                  className={`h-16 w-16 ${
                    totalChange >= 0 ? "text-red-600" : "text-green-600"
                  }`}
                />
              )}
            </div>
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-3">
                <div
                  className={`p-2 rounded-lg ${
                    totalChange >= 0 ? "bg-red-500" : "bg-green-500"
                  }`}
                >
                  {totalChange >= 0 ? (
                    <TrendingUp className="text-white w-5 h-5" />
                  ) : (
                    <TrendingDown className="text-white w-5 h-5" />
                  )}
                </div>
                <h3 className="font-semibold text-gray-700">
                  {totalChange >= 0 ? "Increase" : "Decrease"}
                </h3>
              </div>
              <p
                className={`text-3xl font-bold mb-2 ${
                  totalChange >= 0 ? "text-red-700" : "text-green-700"
                }`}
              >
                Rs. {Math.abs(totalChange).toLocaleString()}
              </p>
              <div className="flex items-center space-x-2">
                <p
                  className={`text-sm font-medium ${
                    totalChange >= 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {totalChange >= 0 ? "+" : "-"}
                  {Math.abs(Number(changePercentage))}%
                </p>
                <p className="text-xs text-gray-500">vs last month</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Add Expense Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-2 rounded-lg">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Add New Expense
              </h2>
              <p className="text-sm text-gray-500">
                Record your business expenses for better tracking
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                value={newExpense.category}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, category: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              >
                {expenseCategories.map((category) => (
                  <option
                    key={category}
                    value={category}
                    className="text-gray-700"
                  >
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Amount (Rs.)
              </label>
              <input
                type="number"
                placeholder="Enter amount"
                value={newExpense.amount}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, amount: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Description
              </label>
              <input
                type="text"
                placeholder="Optional description"
                value={newExpense.description}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, description: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Action
              </label>
              <button
                onClick={handleAddExpense}
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 font-semibold disabled:opacity-50 hover:from-orange-600 hover:to-pink-600"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {isSubmitting ? "Adding..." : "Add Expense"}
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Comparison Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Monthly Comparison
                </h3>
                <p className="text-sm text-gray-500">
                  Current vs previous month breakdown
                </p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="category"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  axisLine={{ stroke: "#e5e7eb" }}
                />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickFormatter={(value) => `Rs. ${value.toLocaleString()}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                  formatter={(value: number) => [
                    `Rs. ${value.toLocaleString()}`,
                    "",
                  ]}
                  labelStyle={{ color: "#374151", fontWeight: "600" }}
                />
                <Bar
                  dataKey="previous"
                  fill="#9ca3af"
                  name="Previous Month"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="current"
                  fill="#f97316"
                  name="Current Month"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-2 rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Expense Distribution
                </h3>
                <p className="text-sm text-gray-500">
                  Current month category breakdown
                </p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                  formatter={(value: number) => [
                    `Rs. ${value.toLocaleString()}`,
                    "Amount",
                  ]}
                  labelStyle={{ color: "#374151", fontWeight: "600" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Enhanced Category Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {expenseCategories.map((category) => {
            const currentAmount = getCurrentCategoryTotal(category);
            const previousAmount = getPreviousCategoryTotal(category);
            const change = currentAmount - previousAmount;
            const changePercent =
              previousAmount > 0
                ? ((change / previousAmount) * 100).toFixed(1)
                : "0";

            return (
              <div
                key={category}
                className={`group relative overflow-hidden bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
                  change >= 0 ? "hover:bg-red-50" : "hover:bg-green-50"
                }`}
              >
                <div className="absolute top-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: categoryColors[category] }}
                  >
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-gray-800">{category}</h4>
                    <div
                      className="w-4 h-4 rounded-full shadow-sm"
                      style={{ backgroundColor: categoryColors[category] }}
                    ></div>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 mb-2">
                    Rs. {currentAmount.toLocaleString()}
                  </p>
                  <div className="flex items-center justify-between">
                    <p
                      className={`text-sm font-medium ${
                        change >= 0 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {change >= 0 ? "+" : ""}
                      {Math.abs(Number(changePercent))}%
                    </p>
                    <p className="text-xs text-gray-500">vs last month</p>
                  </div>
                  {/* Additional insight */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600">
                      {currentAmount > previousAmount
                        ? `↗️ Increased by Rs. ${(
                            currentAmount - previousAmount
                          ).toLocaleString()}`
                        : currentAmount < previousAmount
                        ? `↘️ Decreased by Rs. ${(
                            previousAmount - currentAmount
                          ).toLocaleString()}`
                        : "💰 Same as last month"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enhanced Expenses List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 p-2 rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Expense Records
                </h3>
                <p className="text-sm text-gray-500">
                  All expenses for current month
                </p>
              </div>
            </div>
            <div className="px-3 py-1 bg-gray-100 rounded-full">
              <span className="text-sm font-medium text-gray-700">
                {currentMonthExpenses.length} items
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentMonthExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center">
                        <DollarSign className="h-12 w-12 text-gray-300 mb-2" />
                        <p className="text-gray-500 font-medium">
                          No expenses recorded this month
                        </p>
                        <p className="text-gray-400 text-sm">
                          Add your first expense above to get started
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentMonthExpenses.map((expense: Expense) => (
                    <tr
                      key={expense._id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor:
                                categoryColors[
                                  expense.category as ExpenseCategory
                                ],
                            }}
                          ></div>
                          <span className="text-sm font-medium text-gray-700">
                            {expense.category}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                        Rs. {expense.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                        {expense.description || (
                          <span className="text-gray-400 italic">
                            No description
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeleteExpense(expense)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                          title={`Delete expense (ID: ${expense._id?.substring(
                            0,
                            8
                          )}...)`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Summary footer */}
          {currentMonthExpenses.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Total entries: {currentMonthExpenses.length}
                </p>
                <p className="text-lg font-bold text-gray-800">
                  Total: Rs. {totalCurrent.toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modern Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Confirm Deletion
                </h3>
              </div>
              <button
                onClick={cancelDelete}
                disabled={deleteModal.isDeleting}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete this expense? This action cannot
                be undone.
              </p>

              {/* Expense Details */}
              {deleteModal.expenseDetails && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Amount:</span>
                      <p className="text-lg font-bold text-red-600">
                        Rs. {deleteModal.expenseDetails.amount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Category:
                      </span>
                      <div className="flex items-center space-x-2 mt-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor:
                              categoryColors[
                                deleteModal.expenseDetails
                                  .category as ExpenseCategory
                              ],
                          }}
                        ></div>
                        <span className="text-gray-800">
                          {deleteModal.expenseDetails.category}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium text-gray-700">Date:</span>
                      <p className="text-gray-800">
                        {new Date(
                          deleteModal.expenseDetails.date
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    {deleteModal.expenseDetails.description && (
                      <div className="col-span-2">
                        <span className="font-medium text-gray-700">
                          Description:
                        </span>
                        <p className="text-gray-800">
                          {deleteModal.expenseDetails.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-3 p-6 bg-gray-50 rounded-b-2xl">
              <button
                onClick={cancelDelete}
                disabled={deleteModal.isDeleting}
                className="flex-1 px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteModal.isDeleting}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {deleteModal.isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Expense</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
          <div
            className={`flex items-center space-x-3 px-6 py-4 rounded-lg shadow-lg border-l-4 ${
              notification.type === "success"
                ? "bg-green-50 border-green-500 text-green-800"
                : "bg-red-50 border-red-500 text-red-800"
            }`}
          >
            <div
              className={`p-1 rounded-full ${
                notification.type === "success" ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {notification.type === "success" ? (
                <div className="w-5 h-5 text-green-600">✓</div>
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div>
              <p className="font-medium">
                {notification.type === "success" ? "Success" : "Error"}
              </p>
              <p className="text-sm opacity-90">{notification.message}</p>
            </div>
            <button
              onClick={() =>
                setNotification({ show: false, type: "success", message: "" })
              }
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
