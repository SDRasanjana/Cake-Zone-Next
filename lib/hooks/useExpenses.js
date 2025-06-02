import { useState } from 'react';

export function useExpenses() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch expenses
    const fetchExpenses = async (month, year) => {
        try {
            setLoading(true);
            setError(null);

            let url = '/api/expenses';
            if (month && year) {
                url += `?month=${month}&year=${year}`;
            }

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Failed to fetch expenses');
            }

            const data = await response.json();
            setExpenses(data);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching expenses:', err);
        } finally {
            setLoading(false);
        }
    };

    // Add new expense
    const addExpense = async (expenseData) => {
        try {
            const response = await fetch('/api/expenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(expenseData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add expense');
            }

            const newExpense = await response.json();
            setExpenses(prev => [newExpense, ...prev]);
            return newExpense;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Delete expense
    const deleteExpense = async (expenseId) => {
        try {
            const response = await fetch(`/api/expenses/${expenseId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete expense');
            }

            setExpenses(prev => prev.filter(expense => expense._id !== expenseId));
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Update expense
    const updateExpense = async (expenseId, expenseData) => {
        try {
            const response = await fetch(`/api/expenses/${expenseId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(expenseData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update expense');
            }

            const updatedExpense = await response.json();
            setExpenses(prev =>
                prev.map(expense =>
                    expense._id === expenseId ? updatedExpense : expense
                )
            );
            return updatedExpense;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Helper functions for data processing
    const getExpensesByMonth = (month, year) => {
        return expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === month - 1 && expenseDate.getFullYear() === year;
        });
    };

    const getExpensesByCategory = (category, month, year) => {
        const filteredExpenses = month && year
            ? getExpensesByMonth(month, year)
            : expenses;

        return filteredExpenses.filter(expense => expense.category === category);
    };

    const getTotalByCategory = (category, month, year) => {
        const categoryExpenses = getExpensesByCategory(category, month, year);
        return categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    };

    const getTotalExpenses = (month, year) => {
        const filteredExpenses = month && year
            ? getExpensesByMonth(month, year)
            : expenses;

        return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    };

    return {
        expenses,
        loading,
        error,
        fetchExpenses,
        addExpense,
        deleteExpense,
        updateExpense,
        getExpensesByMonth,
        getExpensesByCategory,
        getTotalByCategory,
        getTotalExpenses,
    };
}