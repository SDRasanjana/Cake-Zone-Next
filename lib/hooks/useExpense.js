import { useState, useEffect, useCallback } from 'react';

export function useExpense() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Fetch all expenses
    const fetchExpenses = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/expenses');
            const result = await res.json();

            if (result.success) {
                setExpenses(result.data || []);
                setError(null);
            } else {
                setError(result.error || 'Failed to fetch expenses');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to fetch expenses');
        } finally {
            setLoading(false);
        }
    }, []);    // Create new expense
    const addExpense = useCallback(async (expense) => {
        try {
            console.log('Sending expense data:', expense);
            const res = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(expense),
            });
            
            const result = await res.json();
            console.log('API Response:', result);

            if (result.success) {
                setExpenses((prev) => [result.data, ...prev]);
                setError(null);
                return result.data;
            } else {
                console.error('API Error:', result.error);
                setError(result.error || 'Failed to add expense');
                throw new Error(result.error || 'Failed to add expense');
            }
        } catch (err) {
            console.error('Add error:', err);
            setError('Failed to add expense');
            throw err;
        }
    }, []);// Update expense
    const updateExpense = useCallback(async (id, updatedData) => {
        try {
            const res = await fetch(`/api/expenses/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });
            const result = await res.json();

            if (result.success) {
                setExpenses((prev) =>
                    prev.map((expense) => (expense._id === id ? result.data : expense))
                );
            } else {
                setError(result.error || 'Failed to update expense');
            }
        } catch (err) {
            console.error('Update error:', err);
            setError('Failed to update expense');
        }
    }, []);    // Delete expense
    const deleteExpense = useCallback(async (id) => {
        try {
            await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
            setExpenses((prev) => prev.filter((expense) => expense._id !== id));
        } catch (err) {
            console.error('Delete error:', err);
            setError('Failed to delete expense');
        }
    }, []);    // Get expenses by month
    const getExpensesByMonth = useCallback((month, year) => {
        return expenses.filter((expense) => {
            const expenseDate = new Date(expense.date);
            return (
                expenseDate.getMonth() === month &&
                expenseDate.getFullYear() === year
            );
        });
    }, [expenses]);

    // Get total expenses by category
    const getTotalByCategory = useCallback((category) => {
        return expenses
            .filter((expense) => expense.category === category)
            .reduce((total, expense) => total + expense.amount, 0);
    }, [expenses]);

    // Get total of all expenses
    const getTotalExpenses = useCallback(() => {
        return expenses.reduce((total, expense) => total + expense.amount, 0);
    }, [expenses]);useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    return {
        expenses,
        loading,
        error,
        fetchExpenses,
        addExpense,
        updateExpense,
        deleteExpense,
        getExpensesByMonth,
        getTotalByCategory,
        getTotalExpenses,
    };
}
