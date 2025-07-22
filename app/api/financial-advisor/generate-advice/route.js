import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(req) {
    try {
        // Parse the request body
        const body = await req.json();
        const { expenseData } = body;

        if (!expenseData) {
            return NextResponse.json({
                success: false,
                error: 'Missing expense data'
            }, { status: 400 });
        }

        // Connect to MongoDB
        const client = await clientPromise;
        const db = client.db("cakezone");

        // Get additional data from database if needed
        // Let's get ingredient pricing trends for recommendations
        const ingredientsCollection = db.collection("ingredients");
        const ingredientPrices = await ingredientsCollection.find({}).sort({ date: -1 }).limit(50).toArray();

        // Get order data for revenue insights
        const ordersCollection = db.collection("orders");
        const recentOrders = await ordersCollection.find({}).sort({ orderDate: -1 }).limit(30).toArray();

        // Calculate revenue
        const revenue = recentOrders.reduce((total, order) => total + (order.orderTotal || 0), 0);

        // Generate insights based on the data
        const advice = generateSmartAdvice(expenseData, ingredientPrices, revenue);

        return NextResponse.json({
            success: true,
            advice
        });
    } catch (err) {
        console.error('Error generating financial advice:', err);
        return NextResponse.json({
            success: false,
            error: 'Failed to generate financial advice',
            message: err.message
        }, { status: 500 });
    }
}

// Function to generate financial advice based on data analysis
function generateSmartAdvice(expenseData, ingredientPrices, revenue) {
    const advice = [];
    const currentMonth = expenseData.currentMonth;
    const previousMonth = expenseData.previousMonth;

    // Calculate expense trends
    const totalChangePercentage = previousMonth.total > 0
        ? ((currentMonth.total - previousMonth.total) / previousMonth.total) * 100
        : 0;

    const laborChangePercentage = previousMonth.labour > 0
        ? ((currentMonth.labour - previousMonth.labour) / previousMonth.labour) * 100
        : 0;

    const inventoryChangePercentage = previousMonth.inventory > 0
        ? ((currentMonth.inventory - previousMonth.inventory) / previousMonth.inventory) * 100
        : 0;

    const utilitiesChangePercentage = previousMonth.utilities > 0
        ? ((currentMonth.utilities - previousMonth.utilities) / previousMonth.utilities) * 100
        : 0;

    // Generate overall expense trend analysis
    if (totalChangePercentage > 20) {
        advice.push({
            category: "General",
            type: "warning",
            message: `Your overall expenses have increased by ${totalChangePercentage.toFixed(1)}% compared to last month. Consider reviewing your spending in all categories to identify potential savings opportunities.`,
            savings: Math.round(currentMonth.total * 0.1), // Estimate 10% potential savings
        });
    } else if (totalChangePercentage < -10) {
        advice.push({
            category: "General",
            type: "opportunity",
            message: `Great job! Your expenses have decreased by ${Math.abs(totalChangePercentage).toFixed(1)}% compared to last month. Continue implementing your cost-saving strategies.`,
            savings: 0,
        });
    } else {
        advice.push({
            category: "General",
            type: "insight",
            message: `Your monthly expenses are stable with a ${Math.abs(totalChangePercentage).toFixed(1)}% ${totalChangePercentage >= 0 ? 'increase' : 'decrease'} compared to last month. Try to maintain this consistency while looking for further optimization.`,
            savings: 0,
        });
    }

    // Labor cost analysis
    if (laborChangePercentage > 15) {
        advice.push({
            category: "Labour",
            type: "warning",
            message: `Labor costs have increased significantly by ${laborChangePercentage.toFixed(1)}%. Consider optimizing staff scheduling, especially during non-peak hours, or review recent wage adjustments.`,
            savings: Math.round(currentMonth.labour * 0.15), // Estimated savings from optimization
        });
    } else if (currentMonth.labour > (currentMonth.total * 0.4)) {
        advice.push({
            category: "Labour",
            type: "warning",
            message: "Labor costs represent over 40% of your total expenses. Industry standard is typically 30-35%. Consider reviewing staff productivity and scheduling optimization.",
            savings: Math.round(currentMonth.labour * 0.12), // Targeted reduction to reach industry standard
        });
    } else if (laborChangePercentage < -10) {
        advice.push({
            category: "Labour",
            type: "insight",
            message: `Your labor costs have decreased by ${Math.abs(laborChangePercentage).toFixed(1)}%. Monitor quality and service to ensure this reduction isn't affecting customer experience.`,
            savings: 0,
        });
    }

    // Inventory cost analysis
    if (inventoryChangePercentage > 25) {
        advice.push({
            category: "Inventory",
            type: "warning",
            message: `Inventory expenses have increased significantly by ${inventoryChangePercentage.toFixed(1)}%. Review purchasing practices, check for waste, and negotiate with suppliers for better rates.`,
            savings: Math.round(currentMonth.inventory * 0.18),
        });
    } else {
        // Analyze ingredient pricing trends
        const flourPrices = ingredientPrices
            .filter(item => item.name === 'Flour')
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        const sugarPrices = ingredientPrices
            .filter(item => item.name === 'Sugar')
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        if (flourPrices.length >= 2) {
            const latestFlourPrice = flourPrices[0]?.pricePerUnit || 0;
            const previousFlourPrice = flourPrices[1]?.pricePerUnit || latestFlourPrice;
            const flourTrend = ((latestFlourPrice - previousFlourPrice) / previousFlourPrice) * 100;

            if (flourTrend > 10) {
                advice.push({
                    category: "Inventory",
                    type: "opportunity",
                    message: `Flour prices have risen by ${flourTrend.toFixed(1)}% recently. Consider bulk purchasing before another increase or exploring alternative suppliers.`,
                    savings: Math.round(latestFlourPrice * 30 * 0.12), // 12% savings on monthly flour costs
                });
            } else if (flourTrend < -5) {
                advice.push({
                    category: "Inventory",
                    type: "opportunity",
                    message: `Flour prices have decreased by ${Math.abs(flourTrend).toFixed(1)}%. This is an ideal time to stock up on flour within your storage capabilities.`,
                    savings: Math.round(latestFlourPrice * 30 * 0.08), // 8% savings on monthly flour costs
                });
            }
        }

        if (sugarPrices.length >= 2) {
            const latestSugarPrice = sugarPrices[0]?.pricePerUnit || 0;
            const previousSugarPrice = sugarPrices[1]?.pricePerUnit || latestSugarPrice;
            const sugarTrend = ((latestSugarPrice - previousSugarPrice) / previousSugarPrice) * 100;

            if (sugarTrend > 8) {
                advice.push({
                    category: "Inventory",
                    type: "opportunity",
                    message: `Sugar prices are trending upward (${sugarTrend.toFixed(1)}% increase). Consider locking in current prices with bulk purchases or forward contracts with suppliers.`,
                    savings: Math.round(latestSugarPrice * 25 * 0.1), // 10% savings on monthly sugar costs
                });
            }
        }
    }

    // Utilities analysis
    if (utilitiesChangePercentage > 20) {
        advice.push({
            category: "Utilities",
            type: "warning",
            message: `Utilities expenses increased by ${utilitiesChangePercentage.toFixed(1)}%. Check for equipment inefficiencies, consider energy-saving appliances, and review usage patterns.`,
            savings: Math.round(currentMonth.utilities * 0.2),
        });
    } else if (currentMonth.utilities > (currentMonth.total * 0.15)) {
        advice.push({
            category: "Utilities",
            type: "opportunity",
            message: "Utilities represent over 15% of your total expenses, which is higher than industry average. Consider energy-efficient equipment upgrades and optimizing operating hours.",
            savings: Math.round(currentMonth.utilities * 0.15),
        });
    }

    // Profit margin analysis
    const expenses = currentMonth.total;
    const estimatedProfit = revenue - expenses;
    const profitMargin = revenue > 0 ? (estimatedProfit / revenue) * 100 : 0;

    if (profitMargin < 15 && revenue > 0) {
        advice.push({
            category: "General",
            type: "warning",
            message: `Your estimated profit margin is ${profitMargin.toFixed(1)}%, which is below the industry average of 15-20%. Consider reviewing your pricing strategy and cost structure.`,
            savings: Math.round(revenue * 0.05), // Potential increase in profit
        });
    } else if (profitMargin >= 25 && revenue > 0) {
        advice.push({
            category: "General",
            type: "insight",
            message: `Your profit margin is strong at ${profitMargin.toFixed(1)}%. Consider reinvesting in business growth or quality improvements to maintain your competitive advantage.`,
            savings: 0,
        });
    }

    // Add at least one other category insight
    if (!advice.some(item => item.category === "Others")) {
        advice.push({
            category: "Others",
            type: "insight",
            message: "Consider reviewing miscellaneous expenses to identify any non-essential spending that could be optimized or eliminated.",
            savings: Math.round(currentMonth.others * 0.1), // Estimated 10% savings
        });
    }

    // Seasonal advice - since it's June 2025
    advice.push({
        category: "General",
        type: "opportunity",
        message: "June is traditionally a strong month for cake sales due to wedding season. Consider offering special wedding cake promotions to increase revenue while maintaining your current expense structure.",
        savings: Math.round(revenue * 0.08), // Potential revenue increase
    });

    return advice;
}
