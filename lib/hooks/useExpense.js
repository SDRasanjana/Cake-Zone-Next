import { useState, useEffect, useCallback } from 'react';

export function useExpense() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all expenses
    const fetchExpenses = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('🔄 Fetching expenses from CakeZone database...');
            const res = await fetch('/api/expenses');

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }

            const result = await res.json();
            console.log('📊 Fetch result:', {
                success: result.success,
                count: result.data?.length || 0,
                message: result.message
            });

            if (result.success) {
                setExpenses(result.data || []);
                setError(null);
                console.log('✅ Expenses loaded successfully');
            } else {
                const errorMsg = result.error || 'Failed to fetch expenses';
                setError(errorMsg);
                console.error('❌ API returned error:', errorMsg);
            }
        } catch (err) {
            console.error('❌ Fetch error:', err);
            const errorMsg = `Failed to fetch expenses: ${err.message}`;
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    }, []);    // Create new expense
    const addExpense = useCallback(async (expense) => {
        try {
            console.log('📝 Adding expense to CakeZone database:', expense);

            const res = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(expense),
            });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }

            const result = await res.json();
            console.log('📊 Add expense result:', {
                success: result.success,
                message: result.message,
                hasData: !!result.data
            });

            if (result.success && result.data) {
                // Add the new expense to the beginning of the array (newest first)
                setExpenses((prev) => [result.data, ...prev]);
                setError(null);
                console.log('✅ Expense added successfully to state');
                return result.data;
            } else {
                const errorMsg = result.error || 'Failed to add expense';
                console.error('❌ API returned error:', errorMsg);
                setError(errorMsg);
                throw new Error(errorMsg);
            }
        } catch (err) {
            console.error('❌ Add expense error:', err);
            const errorMsg = `Failed to add expense: ${err.message}`;
            setError(errorMsg);
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
            console.log('🗑️ Deleting expense from CakeZone database:', id);

            // Validate ID format
            if (!id || typeof id !== 'string') {
                throw new Error('Invalid expense ID provided');
            }

            const res = await fetch(`/api/expenses/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }

            const result = await res.json();
            console.log('📊 Delete expense result:', {
                success: result.success,
                message: result.message,
                deletedCount: result.deletedCount
            });

            if (result.success) {
                // Remove the expense from local state
                setExpenses((prev) => prev.filter((expense) => expense._id !== id));
                setError(null);
                console.log('✅ Expense deleted successfully from state');
                return result;
            } else {
                const errorMsg = result.error || 'Failed to delete expense';
                console.error('❌ API returned error:', errorMsg);
                setError(errorMsg);
                throw new Error(errorMsg);
            }
        } catch (err) {
            console.error('❌ Delete expense error:', err);
            const errorMsg = `Failed to delete expense: ${err.message}`;
            setError(errorMsg);
            throw err;
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
    }, [expenses]); useEffect(() => {
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
