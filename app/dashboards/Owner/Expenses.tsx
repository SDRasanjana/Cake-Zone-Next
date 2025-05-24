import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,} from 'recharts';
import { Plus, TrendingUp, TrendingDown, DollarSign, Trash2 } from 'lucide-react';

export default function Expenses() {
  const [expenses, setExpenses] = useState([
    { id: 1, category: 'Labour', amount: 15000, date: '2025-05-15', month: 'current' },
    { id: 2, category: 'Inventory', amount: 25000, date: '2025-05-10', month: 'current' },
    { id: 3, category: 'Utilities', amount: 8000, date: '2025-05-05', month: 'current' },
    { id: 4, category: 'Others', amount: 5000, date: '2025-05-01', month: 'current' },
    // Previous month data for comparison
    { id: 5, category: 'Labour', amount: 12000, date: '2025-04-15', month: 'previous' },
    { id: 6, category: 'Inventory', amount: 30000, date: '2025-04-10', month: 'previous' },
    { id: 7, category: 'Utilities', amount: 7500, date: '2025-04-05', month: 'previous' },
    { id: 8, category: 'Others', amount: 3500, date: '2025-04-01', month: 'previous' },
  ]);

  const [newExpense, setNewExpense] = useState({
    category: 'Labour',
    amount: ''
  });

  const expenseCategories = ['Labour', 'Inventory', 'Utilities', 'Others'] as const;
  const categoryColors: Record<typeof expenseCategories[number], string> = {
    Labour: '#8b5cf6',
    Inventory: '#06b6d4',
    Utilities: '#10b981',
    Others: '#f59e0b'
  };

  const addExpense = () => {
    if (newExpense.amount && parseFloat(newExpense.amount) > 0) {
      const expense = {
        id: Date.now(),
        category: newExpense.category,
        amount: parseFloat(newExpense.amount),
        date: new Date().toISOString().split('T')[0],
        month: 'current'
      };
      setExpenses([...expenses, expense]);
      setNewExpense({ ...newExpense, amount: '' });
    }
  };

  const deleteExpense = (id: number) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  const currentMonthExpenses = expenses.filter(exp => exp.month === 'current');
  const previousMonthExpenses = expenses.filter(exp => exp.month === 'previous');

  // Calculate totals by category
  const getCurrentCategoryTotal = (category: string) => {
    return currentMonthExpenses
      .filter(exp => exp.category === category)
      .reduce((sum, exp) => sum + exp.amount, 0);
  };

  const getPreviousCategoryTotal = (category: string) => {
    return previousMonthExpenses
      .filter(exp => exp.category === category)
      .reduce((sum, exp) => sum + exp.amount, 0);
  };

  // Prepare data for charts
  const comparisonData = expenseCategories.map(category => ({
    category,
    current: getCurrentCategoryTotal(category),
    previous: getPreviousCategoryTotal(category),
    change: getCurrentCategoryTotal(category) - getPreviousCategoryTotal(category)
  }));

  const pieData = expenseCategories.map(category => ({
    name: category,
    value: getCurrentCategoryTotal(category),
    color: categoryColors[category]
  })).filter(item => item.value > 0);

  const totalCurrent = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalPrevious = previousMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalChange = totalCurrent - totalPrevious;
  const changePercentage = totalPrevious > 0 ? ((totalChange / totalPrevious) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Monthly Expenses</h1>
          <p className="text-purple-200">Track and compare your business expenses</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Current Month</p>
                <p className="text-2xl font-bold text-white">Rs. {totalCurrent.toLocaleString()}</p>
              </div>
              <DollarSign className="text-purple-400 w-8 h-8" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Previous Month</p>
                <p className="text-2xl font-bold text-white">Rs. {totalPrevious.toLocaleString()}</p>
              </div>
              <DollarSign className="text-purple-400 w-8 h-8" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Change</p>
                <p className={`text-2xl font-bold ${totalChange >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                  Rs. {Math.abs(totalChange).toLocaleString()}
                </p>
                <p className={`text-sm ${totalChange >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {totalChange >= 0 ? '+' : '-'}{Math.abs(Number(changePercentage))}%
                </p>
              </div>
              {totalChange >= 0 ? 
                <TrendingUp className="text-red-400 w-8 h-8" /> : 
                <TrendingDown className="text-green-400 w-8 h-8" />
              }
            </div>
          </div>
        </div>

        {/* Add Expense Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Add New Expense</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={newExpense.category}
              onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
              className="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {expenseCategories.map(category => (
                <option key={category} value={category} className="bg-slate-800 text-white">
                  {category}
                </option>
              ))}
            </select>
            
            <input
              type="number"
              placeholder="Enter amount"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
              className="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            
            <button
              onClick={addExpense}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center gap-2 font-semibold"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </button>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Comparison Chart */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">Monthly Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="category" tick={{ fill: 'white' }} />
                <YAxis tick={{ fill: 'white' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                  formatter={(value) => [`Rs. ${value.toLocaleString()}`, '']}
                />
                <Bar dataKey="previous" fill="#6366f1" name="Previous Month" />
                <Bar dataKey="current" fill="#8b5cf6" name="Current Month" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">Expense Distribution</h3>
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
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                  formatter={(value) => [`Rs. ${value.toLocaleString()}`, 'Amount']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {expenseCategories.map(category => {
            const currentAmount = getCurrentCategoryTotal(category);
            const previousAmount = getPreviousCategoryTotal(category);
            const change = currentAmount - previousAmount;
            const changePercent = previousAmount > 0 ? ((change / previousAmount) * 100).toFixed(1) : 0;
            
            return (
              <div key={category} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white">{category}</h4>
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: categoryColors[category] }}
                  ></div>
                </div>
                <p className="text-2xl font-bold text-white">Rs. {currentAmount.toLocaleString()}</p>
                <p className={`text-sm ${change >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {change >= 0 ? '+' : ''}{change.toLocaleString()} ({change >= 0 ? '+' : ''}{changePercent}%)
                </p>
              </div>
            );
          })}
        </div>

        {/* Recent Expenses List */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">Current Month Expenses</h3>
          <div className="space-y-3">
            {currentMonthExpenses.map(expense => (
              <div key={expense.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: categoryColors[expense.category as typeof expenseCategories[number]] }}
                  ></div>
                  <div>
                    <p className="font-medium text-white">{expense.category}</p>
                    <p className="text-sm text-purple-200">{expense.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-white">Rs. {expense.amount.toLocaleString()}</p>
                  <button
                    onClick={() => deleteExpense(expense.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}