import { useState, useEffect, useCallback } from 'react';

export const useExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all expenses
  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/expenses');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch expenses');
      }
      
      // Transform the data to match your frontend expectations
      const transformedExpenses = result.data.map(expense => ({
        ...expense,
        id: expense._id || expense.id,
        date: new Date(expense.date)
      }));
      
      setExpenses(transformedExpenses);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add new expense
  const addExpense = useCallback(async (expenseData) => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to add expense');
      }
      
      // Refresh expenses after adding
      await fetchExpenses();
      
      return result.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchExpenses]);

  // Delete expense
  const deleteExpense = useCallback(async (expenseId) => {
    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete expense');
      }
      
      // Refresh expenses after deletion
      await fetchExpenses();
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchExpenses]);

  // Get expenses by month and year
  const getExpensesByMonth = useCallback((month, year) => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() + 1 === month && expenseDate.getFullYear() === year;
    });
  }, [expenses]);

  // Get total by category for specific month/year
  const getTotalByCategory = useCallback((category, month, year) => {
    const monthlyExpenses = getExpensesByMonth(month, year);
    return monthlyExpenses
      .filter(expense => expense.category === category)
      .reduce((total, expense) => total + expense.amount, 0);
  }, [getExpensesByMonth]);

  // Get total expenses for specific month/year
  const getTotalExpenses = useCallback((month, year) => {
    const monthlyExpenses = getExpensesByMonth(month, year);
    return monthlyExpenses.reduce((total, expense) => total + expense.amount, 0);
  }, [getExpensesByMonth]);

  return {
    expenses,
    loading,
    error,
    fetchExpenses,
    addExpense,
    deleteExpense,
    getExpensesByMonth,
    getTotalByCategory,
    getTotalExpenses,
  };
};