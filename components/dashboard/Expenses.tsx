"use client";

import React, { useState, useEffect } from "react";
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

export default function Expenses() {  const {
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

  const expenseCategories = [
    "Labour",
    "Inventory",
    "Utilities",
    "Others",
  ] as const;
  type ExpenseCategory = (typeof expenseCategories)[number];

  const categoryColors: Record<ExpenseCategory, string> = {
    Labour: "#8b5cf6",
    Inventory: "#06b6d4",
    Utilities: "#10b981",
    Others: "#f59e0b",
  };

  // Fetch expenses on component mount
  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Handle add expense
  const handleAddExpense = async () => {
    if (!newExpense.amount || parseFloat(newExpense.amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      setIsSubmitting(true);
      await addExpense({
        category: newExpense.category,
        amount: parseFloat(newExpense.amount),
        description: newExpense.description,
        date: new Date(),
      });

      setNewExpense({ category: "Labour", amount: "", description: "" });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      alert(`Error adding expense: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  // Handle delete expense - fixed typing
  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    try {
      await deleteExpense(expenseId);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      alert(`Error deleting expense: ${errorMessage}`);
    }
  };
  // Get current and previous month expenses
  const currentMonthExpenses: Expense[] =
    getExpensesByMonth(currentMonth - 1, currentYear) || [];
  const previousMonthExpenses: Expense[] =
    getExpensesByMonth(previousMonth - 1, previousYear) || [];

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-white">Loading expenses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error: {error}</p>
          <button
            onClick={() => fetchExpenses()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Monthly Expenses
          </h1>
          <p className="text-purple-200">
            Track and compare your business expenses
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Current Month</p>
                <p className="text-2xl font-bold text-white">
                  Rs. {totalCurrent.toLocaleString()}
                </p>
              </div>
              <DollarSign className="text-purple-400 w-8 h-8" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Previous Month</p>
                <p className="text-2xl font-bold text-white">
                  Rs. {totalPrevious.toLocaleString()}
                </p>
              </div>
              <DollarSign className="text-purple-400 w-8 h-8" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Change</p>
                <p
                  className={`text-2xl font-bold ${
                    totalChange >= 0 ? "text-red-400" : "text-green-400"
                  }`}
                >
                  Rs. {Math.abs(totalChange).toLocaleString()}
                </p>
                <p
                  className={`text-sm ${
                    totalChange >= 0 ? "text-red-400" : "text-green-400"
                  }`}
                >
                  {totalChange >= 0 ? "+" : "-"}
                  {Math.abs(Number(changePercentage))}%
                </p>
              </div>
              {totalChange >= 0 ? (
                <TrendingUp className="text-red-400 w-8 h-8" />
              ) : (
                <TrendingDown className="text-green-400 w-8 h-8" />
              )}
            </div>
          </div>
        </div>

        {/* Add Expense Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Add New Expense
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <select
              value={newExpense.category}
              onChange={(e) =>
                setNewExpense({ ...newExpense, category: e.target.value })
              }
              className="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {expenseCategories.map((category) => (
                <option
                  key={category}
                  value={category}
                  className="bg-slate-800 text-white"
                >
                  {category}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Enter amount"
              value={newExpense.amount}
              onChange={(e) =>
                setNewExpense({ ...newExpense, amount: e.target.value })
              }
              className="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <input
              type="text"
              placeholder="Description (optional)"
              value={newExpense.description}
              onChange={(e) =>
                setNewExpense({ ...newExpense, description: e.target.value })
              }
              className="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <button
              onClick={handleAddExpense}
              disabled={isSubmitting}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 font-semibold disabled:opacity-50"
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

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Comparison Chart */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">
              Monthly Comparison
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis dataKey="category" tick={{ fill: "white" }} />
                <YAxis tick={{ fill: "white" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                    color: "white",
                  }}
                  formatter={(value: number) => [
                    `Rs. ${value.toLocaleString()}`,
                    "",
                  ]}
                />
                <Bar dataKey="previous" fill="#6366f1" name="Previous Month" />
                <Bar dataKey="current" fill="#8b5cf6" name="Current Month" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">
              Expense Distribution
            </h3>
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
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                    color: "white",
                  }}
                  formatter={(value: number) => [
                    `Rs. ${value.toLocaleString()}`,
                    "Amount",
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
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
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white">{category}</h4>
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: categoryColors[category] }}
                  ></div>
                </div>
                <p className="text-2xl font-bold text-white">
                  Rs. {currentAmount.toLocaleString()}
                </p>
                <p
                  className={`text-sm ${
                    change >= 0 ? "text-red-400" : "text-green-400"
                  }`}
                >
                  {change >= 0 ? "+" : ""}
                  {Math.abs(Number(changePercent))}%
                </p>
              </div>
            );
          })}
        </div>

        {/* Expenses List */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">
            All Expenses (Current Month)
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-white">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-left">Amount</th>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentMonthExpenses.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-4 text-purple-200"
                    >
                      No expenses for this month.
                    </td>
                  </tr>
                ) : (
                  currentMonthExpenses.map((expense: Expense) => (
                    <tr key={expense._id} className="border-b border-white/10">
                      <td className="px-4 py-2">
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">{expense.category}</td>
                      <td className="px-4 py-2">
                        Rs. {expense.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-2">
                        {expense.description || "-"}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleDeleteExpense(expense._id)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                          title="Delete"
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
        </div>
      </div>
    </div>
  );
}
