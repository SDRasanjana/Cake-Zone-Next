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
<<<<<<< HEAD
=======
  source?: "AI" | "Analysis" | "Expert Analysis";
  priority?: "HIGH" | "MEDIUM" | "LOW" | "OPTIMIZE" | "EXPANSION";
  benchmarkData?: {
    current: string;
    industry?: number;
    gap?: string;
    target?: string;
    performance?: string;
  };
  costBreakdown?: {
    current?: string;
    optimal?: string;
    excess?: string;
    monthlyCost?: number;
    labour?: string;
    inventory?: string;
    utilities?: string;
    status?: string;
  };
  marketData?: {
    seasonalFactor: number;
    demandLevel: string;
    potentialGrowth: string;
    monthName: string;
  };
}

// Define business metrics interface
interface BusinessMetrics {
  revenue: number;
  totalRevenue: number;
  uniqueCustomers: number;
  avgOrderValue: number;
  profitMargin: number;
  businessHealth: "healthy" | "moderate" | "needs_attention";
  seasonalData: {
    season: string;
    factor: number;
    events: string[];
  };
  ingredientTrends: Record<
    string,
    {
      current: number;
      trend: number;
      status: "rising" | "falling" | "stable";
    }
  >;
  expenseRatio: {
    labour: number;
    inventory: number;
    utilities: number;
    others: number;
  };
>>>>>>> 500a4d91d141af37116544db5e5c36a84865d7b5
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

<<<<<<< HEAD
      {/* Financial advice cards */}
=======
      {/* Enhanced Business Health Dashboard */}
      {businessMetrics && (
        <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <BarChart4 className="h-5 w-5 text-blue-600" />
              Business Health Dashboard
            </h3>
            <div
              className={`px-3 py-1 rounded-full text-sm font-bold ${
                businessMetrics.businessHealth === "healthy"
                  ? "bg-green-100 text-green-700"
                  : businessMetrics.businessHealth === "moderate"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {businessMetrics.businessHealth === "healthy"
                ? "🟢 Healthy"
                : businessMetrics.businessHealth === "moderate"
                ? "🟡 Moderate"
                : "🔴 Needs Attention"}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-blue-100">
              <div className="text-xs text-blue-600 font-medium mb-1">
                Monthly Revenue
              </div>
              <div className="text-xl font-bold text-blue-800">
                Rs. {businessMetrics.revenue.toLocaleString()}
              </div>
              {businessMetrics.seasonalData && (
                <div className="text-xs text-gray-500 mt-1">
                  {businessMetrics.seasonalData.season} Factor:{" "}
                  {businessMetrics.seasonalData.factor}x
                </div>
              )}
            </div>

            <div className="bg-white p-4 rounded-lg border border-green-100">
              <div className="text-xs text-green-600 font-medium mb-1">
                Profit Margin
              </div>
              <div className="text-xl font-bold text-green-800">
                {businessMetrics.profitMargin.toFixed(1)}%
              </div>
              <div
                className={`text-xs mt-1 ${
                  businessMetrics.profitMargin >= 18
                    ? "text-green-600"
                    : businessMetrics.profitMargin >= 12
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {businessMetrics.profitMargin >= 18
                  ? "Above Industry Avg"
                  : businessMetrics.profitMargin >= 12
                  ? "Near Industry Avg"
                  : "Below Industry Avg"}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-purple-100">
              <div className="text-xs text-purple-600 font-medium mb-1">
                Customers
              </div>
              <div className="text-xl font-bold text-purple-800">
                {businessMetrics.uniqueCustomers}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Avg: Rs. {businessMetrics.avgOrderValue.toFixed(0)}/order
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-orange-100">
              <div className="text-xs text-orange-600 font-medium mb-1">
                Cost Efficiency
              </div>
              <div className="text-xl font-bold text-orange-800">
                {businessMetrics.expenseRatio
                  ? (
                      (businessMetrics.expenseRatio.labour +
                        businessMetrics.expenseRatio.inventory) /
                      2
                    ).toFixed(1)
                  : "0"}
                %
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Labor + Inventory
              </div>
            </div>
          </div>

          {/* Expense Ratio Breakdown */}
          {businessMetrics.expenseRatio && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Cost Structure Analysis
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center">
                  <div
                    className={`text-lg font-bold ${
                      businessMetrics.expenseRatio.labour <= 35
                        ? "text-green-600"
                        : businessMetrics.expenseRatio.labour <= 40
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {businessMetrics.expenseRatio.labour.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-600">Labour</div>
                  <div className="text-xs text-gray-500">(Target: 25-35%)</div>
                </div>
                <div className="text-center">
                  <div
                    className={`text-lg font-bold ${
                      businessMetrics.expenseRatio.inventory <= 38
                        ? "text-green-600"
                        : businessMetrics.expenseRatio.inventory <= 45
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {businessMetrics.expenseRatio.inventory.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-600">Inventory</div>
                  <div className="text-xs text-gray-500">(Target: 28-38%)</div>
                </div>
                <div className="text-center">
                  <div
                    className={`text-lg font-bold ${
                      businessMetrics.expenseRatio.utilities <= 12
                        ? "text-green-600"
                        : businessMetrics.expenseRatio.utilities <= 15
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {businessMetrics.expenseRatio.utilities.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-600">Utilities</div>
                  <div className="text-xs text-gray-500">(Target: 8-12%)</div>
                </div>
                <div className="text-center">
                  <div
                    className={`text-lg font-bold ${
                      businessMetrics.expenseRatio.others <= 15
                        ? "text-green-600"
                        : businessMetrics.expenseRatio.others <= 18
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {businessMetrics.expenseRatio.others.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-600">Others</div>
                  <div className="text-xs text-gray-500">(Target: 10-15%)</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ingredient Trends Dashboard */}
      {businessMetrics && businessMetrics.ingredientTrends && (
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl shadow-sm border border-orange-200 mb-6">
          <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Ingredient Price Trends
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(businessMetrics.ingredientTrends).map(
              ([ingredient, data]) => (
                <div
                  key={ingredient}
                  className="bg-white p-4 rounded-lg border border-orange-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold text-gray-800">
                      {ingredient}
                    </div>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        data.status === "rising"
                          ? "bg-red-400"
                          : data.status === "falling"
                          ? "bg-green-400"
                          : "bg-gray-400"
                      }`}
                    ></div>
                  </div>
                  <div className="text-lg font-bold text-gray-800 mb-1">
                    Rs. {data.current.toFixed(0)}
                  </div>
                  <div
                    className={`text-sm font-medium ${
                      data.trend > 5
                        ? "text-red-600"
                        : data.trend < -5
                        ? "text-green-600"
                        : "text-gray-600"
                    }`}
                  >
                    {data.trend > 0 ? "+" : ""}
                    {data.trend.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500 capitalize mt-1">
                    {data.status === "rising"
                      ? "↗️ Rising"
                      : data.status === "falling"
                      ? "↘️ Falling"
                      : "→ Stable"}
                  </div>
                </div>
              )
            )}
          </div>

          {/* Ingredient Strategy Summary */}
          <div className="mt-4 p-4 bg-white rounded-lg border border-orange-200">
            <h4 className="text-sm font-semibold text-orange-700 mb-2">
              💡 Strategic Recommendations
            </h4>
            <div className="text-sm text-gray-700">
              {Object.entries(businessMetrics.ingredientTrends).some(
                ([, data]) => data.status === "rising"
              ) && (
                <div className="mb-2">
                  <span className="font-medium text-red-600">
                    Rising Prices:
                  </span>
                  <span className="ml-1">
                    Consider bulk purchasing for{" "}
                    {Object.entries(businessMetrics.ingredientTrends)
                      .filter(([, data]) => data.status === "rising")
                      .map(([name]) => name)
                      .join(", ")}
                  </span>
                </div>
              )}
              {Object.entries(businessMetrics.ingredientTrends).some(
                ([, data]) => data.status === "falling"
              ) && (
                <div>
                  <span className="font-medium text-green-600">
                    Falling Prices:
                  </span>
                  <span className="ml-1">
                    Excellent time to stock up on{" "}
                    {Object.entries(businessMetrics.ingredientTrends)
                      .filter(([, data]) => data.status === "falling")
                      .map(([name]) => name)
                      .join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Financial advice cards */}
>>>>>>> 500a4d91d141af37116544db5e5c36a84865d7b5
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
<<<<<<< HEAD
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
=======
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-600 bg-white px-2 py-1 rounded">
                        {advice.category}
                      </span>
                      {advice.source === "AI" && (
                        <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded flex items-center gap-1">
                          <Brain className="h-3 w-3" />
                          AI
                        </span>
                      )}
                      {advice.priority && (
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded ${
                            advice.priority === "HIGH"
                              ? "bg-red-100 text-red-700"
                              : advice.priority === "MEDIUM"
                              ? "bg-orange-100 text-orange-700"
                              : advice.priority === "EXPANSION"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {advice.priority === "HIGH"
                            ? "🚨 HIGH"
                            : advice.priority === "MEDIUM"
                            ? "⚠️ MEDIUM"
                            : advice.priority === "EXPANSION"
                            ? "🚀 GROWTH"
                            : "📊 OPTIMIZE"}
                        </span>
                      )}
                    </div>
                    {advice.savings > 0 && (
                      <span className="bg-gradient-to-r from-green-100 to-green-200 px-3 py-1 rounded-full text-sm font-bold text-green-800 shadow-sm border border-green-200">
                        💰 Save Rs. {advice.savings.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-800 leading-relaxed font-medium mb-3">
                    {advice.message}
                  </p>

                  {/* Benchmark Data Display */}
                  {advice.benchmarkData && (
                    <div className="bg-gray-50 p-3 rounded-lg mb-3 border border-gray-200">
                      <h4 className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
                        <BarChart4 className="h-3 w-3" />
                        Performance Metrics
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Current:</span>
                          <span className="font-semibold ml-1 text-gray-800">
                            {advice.benchmarkData.current}
                          </span>
                        </div>
                        {advice.benchmarkData.industry && (
                          <div>
                            <span className="text-gray-500">Industry:</span>
                            <span className="font-semibold ml-1 text-gray-800">
                              {advice.benchmarkData.industry}%
                            </span>
                          </div>
                        )}
                        {advice.benchmarkData.gap && (
                          <div>
                            <span className="text-gray-500">Gap:</span>
                            <span
                              className={`font-semibold ml-1 ${
                                advice.benchmarkData.gap.startsWith("+")
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {advice.benchmarkData.gap} pts
                            </span>
                          </div>
                        )}
                        {advice.benchmarkData.target && (
                          <div>
                            <span className="text-gray-500">Target:</span>
                            <span className="font-semibold ml-1 text-blue-600">
                              {advice.benchmarkData.target}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Cost Breakdown Display */}
                  {advice.costBreakdown && (
                    <div className="bg-blue-50 p-3 rounded-lg mb-3 border border-blue-200">
                      <h4 className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        Cost Analysis
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {advice.costBreakdown.current && (
                          <div>
                            <span className="text-blue-600">Current:</span>
                            <span className="font-semibold ml-1 text-gray-800">
                              {advice.costBreakdown.current}
                            </span>
                          </div>
                        )}
                        {advice.costBreakdown.optimal && (
                          <div>
                            <span className="text-blue-600">Optimal:</span>
                            <span className="font-semibold ml-1 text-green-600">
                              {advice.costBreakdown.optimal}
                            </span>
                          </div>
                        )}
                        {advice.costBreakdown.monthlyCost && (
                          <div className="col-span-2">
                            <span className="text-blue-600">Monthly Cost:</span>
                            <span className="font-semibold ml-1 text-gray-800">
                              Rs.{" "}
                              {advice.costBreakdown.monthlyCost.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Market Data Display */}
                  {advice.marketData && (
                    <div className="bg-purple-50 p-3 rounded-lg mb-3 border border-purple-200">
                      <h4 className="text-xs font-semibold text-purple-700 mb-2 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {advice.marketData.monthName} Market Insights
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-purple-600">Demand Level:</span>
                          <span className="font-semibold ml-1 text-gray-800 capitalize">
                            {advice.marketData.demandLevel}
                          </span>
                        </div>
                        <div>
                          <span className="text-purple-600">
                            Growth Potential:
                          </span>
                          <span className="font-semibold ml-1 text-green-600">
                            {advice.marketData.potentialGrowth}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action priority indicator */}
                  <div className="mt-3 flex items-center justify-between">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        advice.type === "warning"
                          ? "bg-amber-200 text-amber-800"
                          : advice.type === "opportunity"
                          ? "bg-green-200 text-green-800"
                          : "bg-blue-200 text-blue-800"
                      }`}
                    >
                      {advice.type === "warning"
                        ? "⚠️ Action Required"
                        : advice.type === "opportunity"
                        ? "💡 Growth Opportunity"
                        : "📊 Strategic Insight"}
                    </span>

                    {advice.savings > 0 && (
                      <div className="text-xs text-gray-600 flex items-center gap-1">
                        <TrendingDown className="h-3 w-3" />
                        Monthly Impact
                      </div>
                    )}
                  </div>
>>>>>>> 500a4d91d141af37116544db5e5c36a84865d7b5
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
