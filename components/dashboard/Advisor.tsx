"use client";

import { useState, useEffect, useCallback } from "react";
import { useExpense } from "@/lib/hooks/useExpense";
import { useIngredients } from "@/lib/hooks/useIngredients";
import {
  TrendingDown,
  RefreshCw,
  Lightbulb,
  BarChart4,
  DollarSign,
  Clipboard,
  AlertTriangle,
} from "lucide-react";

// Define the expense type
interface Expense {
  _id: string;
  category: string;
  amount: number;
  description: string;
  date: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}


// Define the advice type
interface FinancialAdvice {
  category: string;
  type: 'warning' | 'opportunity' | 'insight';
  message: string;
  savings: number;
}

export default function Advisor() {
  const [financialAdvice, setFinancialAdvice] = useState<FinancialAdvice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get expense data using the hook
  const {
    loading: expensesLoading,
    getExpensesByMonth,
  } = useExpense() as {
    expenses: Expense[];
    loading: boolean;
    error: string | null;
    getTotalByCategory: (category: string) => number;
    getExpensesByMonth: (month: number, year: number) => Expense[];
  };
  
  // Get ingredient data using the hook
  const {
    loading: ingredientsLoading,
  } = useIngredients();

  // Get the current month and year for calculations
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  // Function to fetch financial advice from our API
  const fetchFinancialAdvice = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Collect current month expenses data to send to the AI
      const currentMonthExpenses = getExpensesByMonth(currentMonth, currentYear);
      
      // Let's gather data from previous months for comparison
      const previousMonthExpenses = getExpensesByMonth(currentMonth - 1, currentYear);
      const twoMonthsAgoExpenses = getExpensesByMonth(currentMonth - 2, currentYear);
      
      // Prepare the data structure for the API
      const expenseData = {
        currentMonth: {
          total: currentMonthExpenses.reduce(
            (sum, expense) => sum + expense.amount,
            0
          ),
          labour: currentMonthExpenses
            .filter((e) => e.category === "Labour")
            .reduce((sum, expense) => sum + expense.amount, 0),
          inventory: currentMonthExpenses
            .filter((e) => e.category === "Inventory")
            .reduce((sum, expense) => sum + expense.amount, 0),
          utilities: currentMonthExpenses
            .filter((e) => e.category === "Utilities")
            .reduce((sum, expense) => sum + expense.amount, 0),
          others: currentMonthExpenses
            .filter((e) => e.category === "Others")
            .reduce((sum, expense) => sum + expense.amount, 0),
        },
        previousMonth: {
          total: previousMonthExpenses.reduce(
            (sum, expense) => sum + expense.amount,
            0
          ),
          labour: previousMonthExpenses
            .filter((e) => e.category === "Labour")
            .reduce((sum, expense) => sum + expense.amount, 0),
          inventory: previousMonthExpenses
            .filter((e) => e.category === "Inventory")
            .reduce((sum, expense) => sum + expense.amount, 0),
          utilities: previousMonthExpenses
            .filter((e) => e.category === "Utilities")
            .reduce((sum, expense) => sum + expense.amount, 0),
          others: previousMonthExpenses
            .filter((e) => e.category === "Others")
            .reduce((sum, expense) => sum + expense.amount, 0),
        },
        twoMonthsAgo: {
          total: twoMonthsAgoExpenses.reduce(
            (sum, expense) => sum + expense.amount,
            0
          ),
        },
      };

      // Fetch generated advice from API
      const response = await fetch("/api/financial-advisor/generate-advice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ expenseData }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch advice: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.advice) {
        setFinancialAdvice(data.advice);
      } else {
        throw new Error(data.error || "Failed to generate advice");
      }
    } catch (err) {
      console.error("Error fetching financial advice:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );

      // Provide fallback advice if API fails
      setFinancialAdvice([
        {
          category: "General",
          type: "warning",
          message:
            "Based on current spending patterns, consider reviewing your monthly budget allocation.",
          savings: 0,
        },
        {
          category: "Inventory",
          type: "opportunity",
          message:
            "Flour prices are predicted to rise. Consider bulk purchasing in the next week to save on costs.",
          savings: 1250,
        },
        {
          category: "Labour",
          type: "insight",
          message:
            "Labor costs increased by 15% compared to last month. Consider optimizing staff scheduling.",
          savings: 3000,
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getExpensesByMonth, currentMonth, currentYear]);

  // Function to handle refreshing the advice
  const handleRefresh = () => {
    setRefreshing(true);
    fetchFinancialAdvice();
  };

  // Fetch advice on initial load
  useEffect(() => {
    if (!expensesLoading && !ingredientsLoading) {
      fetchFinancialAdvice();
    }
  }, [expensesLoading, ingredientsLoading, fetchFinancialAdvice]);

  // Filter the advice by category if selected
  const filteredAdvice = selectedCategory
    ? financialAdvice.filter(
        (advice) =>
          advice.category === selectedCategory || advice.category === "General"
      )
    : financialAdvice;

  // Calculate potential total savings
  const totalPotentialSavings = financialAdvice.reduce(
    (total, advice) => total + (advice.savings || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Smart Financial Advisor
          </h2>
          <p className="text-gray-500">
            AI-powered insights to optimize your cake shop finances
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            {refreshing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span>{refreshing ? "Refreshing" : "Refresh Advice"}</span>
          </button>
        </div>
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1 rounded-full text-sm ${
            selectedCategory === null
              ? "bg-purple-600 text-white"
              : "bg-gray-100 hover:bg-gray-200 text-gray-800"
          }`}
        >
          All Insights
        </button>
        {["General", "Inventory", "Labour", "Utilities", "Others"].map(
          (category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedCategory === category
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
            >
              {category}
            </button>
          )
        )}
      </div>

      {/* Summary card */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-100">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-purple-800">
              AI-Powered Financial Summary
            </h3>
            <p className="text-purple-600">
              {financialAdvice.length} insights identified for your business
            </p>
          </div>
          <div className="mt-3 md:mt-0 bg-white py-2 px-4 rounded-lg border border-purple-200 shadow-sm">
            <p className="text-sm text-purple-700">Potential monthly savings</p>
            <p className="text-xl font-bold text-purple-900">
              Rs. {totalPotentialSavings.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-red-600">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 flex items-center justify-center">
          <RefreshCw className="h-6 w-6 text-purple-600 animate-spin mr-3" />
          <p>Generating financial insights...</p>
        </div>
      )}

      {/* Financial advice cards */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAdvice.map((advice, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg shadow-sm border ${
                advice.type === "warning"
                  ? "bg-amber-50 border-amber-200"
                  : advice.type === "opportunity"
                  ? "bg-green-50 border-green-200"
                  : "bg-blue-50 border-blue-200"
              }`}
            >
              <div className="flex items-start">
                <div
                  className={`p-2 rounded-full mr-3 ${
                    advice.type === "warning"
                      ? "bg-amber-100 text-amber-600"
                      : advice.type === "opportunity"
                      ? "bg-green-100 text-green-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {advice.type === "warning" ? (
                    <AlertTriangle className="h-6 w-6" />
                  ) : advice.type === "opportunity" ? (
                    <Lightbulb className="h-6 w-6" />
                  ) : (
                    <BarChart4 className="h-6 w-6" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      {advice.category}
                    </span>
                    {advice.savings > 0 && (
                      <span className="bg-white px-2 py-1 rounded text-xs font-medium text-green-700 shadow-sm border border-green-100">
                        Save Rs. {advice.savings.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-gray-700">{advice.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action plan section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Your Financial Action Plan
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="bg-purple-100 p-2 rounded-full text-purple-600">
              <Clipboard className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">
                Review inventory procurement strategy
              </p>
              <p className="text-sm text-gray-600">
                Implement recommendations for optimal ingredient purchasing
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="bg-purple-100 p-2 rounded-full text-purple-600">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">Track monthly expense trends</p>
              <p className="text-sm text-gray-600">
                Monitor category spending to identify and address anomalies
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="bg-purple-100 p-2 rounded-full text-purple-600">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">Implement cost reduction strategies</p>
              <p className="text-sm text-gray-600">
                Follow AI recommendations to optimize operations
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
