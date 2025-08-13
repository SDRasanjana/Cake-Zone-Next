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
  Target,
  Brain,
  Calendar,
  ArrowUpRight,
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

// Define the enhanced advice type
interface FinancialAdvice {
  category: string;
  type: "warning" | "opportunity" | "insight";
  message: string;
  savings: number;
  source?: "AI" | "Analysis";
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
}

export default function Advisor() {
  const [financialAdvice, setFinancialAdvice] = useState<FinancialAdvice[]>([]);
  const [businessMetrics, setBusinessMetrics] =
    useState<BusinessMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get expense data using the hook
  const { loading: expensesLoading, getExpensesByMonth } = useExpense() as {
    expenses: Expense[];
    loading: boolean;
    error: string | null;
    getTotalByCategory: (category: string) => number;
    getExpensesByMonth: (month: number, year: number) => Expense[];
  };

  // Get ingredient data using the hook
  const { loading: ingredientsLoading } = useIngredients();

  // Get the current month and year for calculations
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Function to fetch financial advice from our API
  const fetchFinancialAdvice = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Collect current month expenses data to send to the AI
      const currentMonthExpenses = getExpensesByMonth(
        currentMonth,
        currentYear
      );

      // Let's gather data from previous months for comparison
      const previousMonthExpenses = getExpensesByMonth(
        currentMonth - 1,
        currentYear
      );
      const twoMonthsAgoExpenses = getExpensesByMonth(
        currentMonth - 2,
        currentYear
      );

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
        if (data.businessMetrics) {
          setBusinessMetrics(data.businessMetrics);
        }
      } else {
        throw new Error(data.error || "Failed to generate advice");
      }
    } catch (err) {
      console.error("Error fetching financial advice:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );

      // Provide enhanced fallback advice if API fails
      setFinancialAdvice([
        {
          category: "General",
          type: "warning",
          message:
            "Unable to connect to AI advisor. Based on current spending patterns, consider reviewing your monthly budget allocation and identifying areas for optimization.",
          savings: 0,
          source: "Analysis",
        },
        {
          category: "Inventory",
          type: "opportunity",
          message:
            "Seasonal ingredient price fluctuations are expected. Consider monitoring market trends and implementing strategic bulk purchasing for key ingredients like flour and sugar.",
          savings: 1250,
          source: "Analysis",
        },
        {
          category: "Labour",
          type: "insight",
          message:
            "Labor costs optimization can significantly impact profitability. Consider implementing performance metrics and optimizing staff scheduling during peak and non-peak hours.",
          savings: 3000,
          source: "Analysis",
        },
        {
          category: "Seasonal",
          type: "opportunity",
          message:
            "August presents opportunities for back-to-school celebrations and birthday parties. Consider targeted promotions to capitalize on seasonal demand patterns.",
          savings: 2500,
          source: "Analysis",
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

  // Get advice counts by type
  const adviceCounts = {
    warnings: financialAdvice.filter((advice) => advice.type === "warning")
      .length,
    opportunities: financialAdvice.filter(
      (advice) => advice.type === "opportunity"
    ).length,
    insights: financialAdvice.filter((advice) => advice.type === "insight")
      .length,
    aiGenerated: financialAdvice.filter((advice) => advice.source === "AI")
      .length,
  };

  // Get unique categories for filtering
  const uniqueCategories = [
    ...new Set(financialAdvice.map((advice) => advice.category)),
  ].sort();

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
            <span>{refreshing ? "Analyzing..." : "Refresh Analysis"}</span>
          </button>
        </div>
      </div>

      {/* Enhanced Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">
                Total Insights
              </p>
              <p className="text-2xl font-bold text-blue-800">
                {financialAdvice.length}
              </p>
            </div>
            <BarChart4 className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">
                Opportunities
              </p>
              <p className="text-2xl font-bold text-green-800">
                {adviceCounts.opportunities}
              </p>
            </div>
            <Lightbulb className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-600 font-medium">Warnings</p>
              <p className="text-2xl font-bold text-amber-800">
                {adviceCounts.warnings}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-amber-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">AI Insights</p>
              <p className="text-2xl font-bold text-purple-800">
                {adviceCounts.aiGenerated}
              </p>
            </div>
            <Brain className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Enhanced Category filter pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1 rounded-full text-sm transition-all ${
            selectedCategory === null
              ? "bg-purple-600 text-white shadow-md"
              : "bg-gray-100 hover:bg-gray-200 text-gray-800"
          }`}
        >
          All Insights ({financialAdvice.length})
        </button>
        {uniqueCategories.map((category) => {
          const categoryCount = financialAdvice.filter(
            (advice) => advice.category === category
          ).length;
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                selectedCategory === category
                  ? "bg-purple-600 text-white shadow-md"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
            >
              {category} ({categoryCount})
            </button>
          );
        })}
      </div>

      {/* Enhanced Summary card */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-lg border border-purple-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-purple-800 flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI-Powered Financial Analysis
            </h3>
            <p className="text-purple-600 mt-1">
              {financialAdvice.length} comprehensive insights identified for
              your business optimization
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-purple-700">
              <span>⚠️ {adviceCounts.warnings} Critical Areas</span>
              <span>💡 {adviceCounts.opportunities} Growth Opportunities</span>
              <span>📊 {adviceCounts.insights} Strategic Insights</span>
            </div>
          </div>
          <div className="bg-white py-3 px-6 rounded-lg border border-purple-200 shadow-sm">
            <p className="text-sm text-purple-700 font-medium">
              Potential Monthly Savings
            </p>
            <p className="text-2xl font-bold text-purple-900 flex items-center gap-1">
              Rs. {totalPotentialSavings.toLocaleString()}
              {totalPotentialSavings > 0 && (
                <ArrowUpRight className="h-5 w-5 text-green-600" />
              )}
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
          <p>Generating comprehensive financial insights...</p>
        </div>
      )}

      {/* Enhanced Financial advice cards */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAdvice.map((advice, index) => (
            <div
              key={index}
              className={`p-5 rounded-xl shadow-sm border-2 transition-all hover:shadow-md ${
                advice.type === "warning"
                  ? "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:border-amber-300"
                  : advice.type === "opportunity"
                  ? "bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:border-green-300"
                  : "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:border-blue-300"
              }`}
            >
              <div className="flex items-start">
                <div
                  className={`p-3 rounded-full mr-4 ${
                    advice.type === "warning"
                      ? "bg-amber-200 text-amber-700"
                      : advice.type === "opportunity"
                      ? "bg-green-200 text-green-700"
                      : "bg-blue-200 text-blue-700"
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
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-600 bg-white px-2 py-1 rounded">
                        {advice.category}
                      </span>
                      {advice.source === "AI" && (
                        <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded flex items-center gap-1">
                          <Brain className="h-3 w-3" />
                          AI
                        </span>
                      )}
                    </div>
                    {advice.savings > 0 && (
                      <span className="bg-white px-3 py-1 rounded-full text-sm font-bold text-green-700 shadow-sm border border-green-100">
                        Save Rs. {advice.savings.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-800 leading-relaxed font-medium">
                    {advice.message}
                  </p>

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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Action plan section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <Target className="h-6 w-6 text-purple-600" />
          Your Strategic Action Plan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
            <div className="bg-purple-200 p-2 rounded-full text-purple-700">
              <Clipboard className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">
                Inventory Optimization
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Implement AI recommendations for strategic ingredient
                procurement and waste reduction
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-100">
            <div className="bg-green-200 p-2 rounded-full text-green-700">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Revenue Enhancement</p>
              <p className="text-sm text-gray-600 mt-1">
                Capitalize on seasonal opportunities and optimize pricing
                strategies for growth
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="bg-blue-200 p-2 rounded-full text-blue-700">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Cost Optimization</p>
              <p className="text-sm text-gray-600 mt-1">
                Monitor expense trends and implement efficiency improvements
                across operations
              </p>
            </div>
          </div>
        </div>

        {businessMetrics && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Current Business Context
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Season:</span>
                <span className="ml-2 font-medium">
                  {businessMetrics.seasonalData?.season}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Business Health:</span>
                <span
                  className={`ml-2 font-medium ${
                    businessMetrics.businessHealth === "healthy"
                      ? "text-green-600"
                      : businessMetrics.businessHealth === "moderate"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {businessMetrics.businessHealth === "healthy"
                    ? "✅ Healthy"
                    : businessMetrics.businessHealth === "moderate"
                    ? "⚠️ Moderate"
                    : "🚨 Needs Attention"}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Profit Margin:</span>
                <span className="ml-2 font-medium">
                  {businessMetrics.profitMargin?.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
