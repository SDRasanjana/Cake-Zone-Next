// API Route: /api/dashboard/stats
// Provides real-time dashboard statistics including sales, orders, and chart data

export const runtime = 'nodejs';

import clientPromise from "@/lib/mongodb";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'current'; // 'current' or 'last'

        const client = await clientPromise;
        const db = client.db("cakezone");

        // Get current date and calculate date ranges
        const now = new Date();
        let currentMonth, lastMonth, lastMonthEnd;

        if (period === 'last') {
            // For last month view
            currentMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            lastMonth = new Date(now.getFullYear(), now.getMonth() - 2, 1);
            lastMonthEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0);
        } else {
            // For current month view (default)
            currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        }

        // Fetch current month orders
        const currentMonthOrders = await db.collection("orders").find({
            createdAt: { $gte: currentMonth }
        }).toArray();

        // Fetch last month orders for comparison
        const lastMonthOrders = await db.collection("orders").find({
            createdAt: { $gte: lastMonth, $lte: lastMonthEnd }
        }).toArray();

        // Calculate total sales and percentage change
        const currentMonthSales = currentMonthOrders.reduce((total, order) => total + (order.total || 0), 0);
        const lastMonthSales = lastMonthOrders.reduce((total, order) => total + (order.total || 0), 0);
        const salesChangePercentage = lastMonthSales > 0 ? ((currentMonthSales - lastMonthSales) / lastMonthSales * 100) : 0;

        // Calculate order count and percentage change
        const currentMonthOrderCount = currentMonthOrders.length;
        const lastMonthOrderCount = lastMonthOrders.length;
        const orderChangePercentage = lastMonthOrderCount > 0 ? ((currentMonthOrderCount - lastMonthOrderCount) / lastMonthOrderCount * 100) : 0;

        // Generate weekly data for chart (last 4 weeks from the selected period)
        const weeklyData = [];
        const baseDate = period === 'last' ? new Date(now.getFullYear(), now.getMonth() - 1, 1) : now;

        for (let i = 3; i >= 0; i--) {
            const weekStart = new Date(baseDate);
            if (period === 'last') {
                // For last month, calculate weeks within that month
                weekStart.setDate(1 + (i * 7));
            } else {
                // For current month, calculate from current date
                weekStart.setDate(baseDate.getDate() - (i * 7) - (baseDate.getDay()));
            }
            weekStart.setHours(0, 0, 0, 0);

            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);

            try {
                const weekOrders = await db.collection("orders").find({
                    createdAt: { $gte: weekStart, $lte: weekEnd }
                }).toArray();

                const weekSales = weekOrders.reduce((total, order) => total + (order.total || 0), 0);
                const weekNumber = 4 - i;

                weeklyData.push({
                    name: `Week ${weekNumber}`,
                    sales: weekSales,
                    orders: weekOrders.length,
                    change: i === 3 ? 0 : weeklyData[weeklyData.length - 1] ?
                        ((weekSales - (weeklyData[weeklyData.length - 1]?.sales || 0)) / (weeklyData[weeklyData.length - 1]?.sales || 1) * 100) : 0
                });
            } catch (weekError) {
                console.error(`Error fetching week ${4 - i} data:`, weekError);
                // Add fallback week data
                weeklyData.push({
                    name: `Week ${4 - i}`,
                    sales: 0,
                    orders: 0,
                    change: 0
                });
            }
        }

        // Calculate average daily sales
        const totalDays = Math.ceil((now - currentMonth) / (1000 * 60 * 60 * 24)) || 1;
        const avgDailySales = currentMonthSales / totalDays;

        // Find highest sales day
        const dailySales = {};
        currentMonthOrders.forEach(order => {
            const day = new Date(order.createdAt).toLocaleDateString();
            dailySales[day] = (dailySales[day] || 0) + order.total;
        });

        const highestSalesDay = Object.entries(dailySales).reduce((max, [day, sales]) =>
            sales > max.sales ? { day, sales } : max, { day: 'No data', sales: 0 }
        );

        // Recent orders for activity feed (limit to 3)
        let recentActivity = [];
        try {
            const recentOrders = await db.collection("orders")
                .find({})
                .sort({ createdAt: -1 })
                .limit(3) // Changed from 5 to 3
                .toArray();

            recentActivity = recentOrders.map(order => ({
                id: order._id.toString(),
                customerName: order.shipping?.fullName || 'Unknown Customer',
                amount: order.total || 0,
                status: order.paymentStatus || order.status || 'pending',
                time: order.createdAt
            }));
        } catch (activityError) {
            console.error('Error fetching recent activity:', activityError);
            recentActivity = [];
        }

        return Response.json({
            success: true,
            data: {
                period,
                totalSales: Math.round(currentMonthSales),
                salesChange: Math.round(salesChangePercentage * 10) / 10,
                totalOrders: currentMonthOrderCount,
                orderChange: Math.round(orderChangePercentage * 10) / 10,
                weeklyData: weeklyData.map(week => ({
                    ...week,
                    sales: Math.round(week.sales),
                    change: `${week.change >= 0 ? '+' : ''}${Math.round(week.change * 10) / 10}%`
                })),
                avgDailySales: Math.round(avgDailySales),
                highestSalesDay: {
                    day: highestSalesDay.day,
                    amount: Math.round(highestSalesDay.sales)
                },
                recentActivity
            }
        });

    } catch (error) {
        console.error("Dashboard Stats API Error:", error);

        // Return fallback data if database fails
        return Response.json({
            success: false,
            error: error.message,
            data: {
                period,
                totalSales: period === 'last' ? 38000 : 45000,
                salesChange: period === 'last' ? 8.3 : 12.5,
                totalOrders: period === 'last' ? 23 : 28,
                orderChange: period === 'last' ? 5.1 : 8.2,
                weeklyData: period === 'last' ? [
                    { name: "Week 1", sales: 7800, orders: 5, change: "+3.2%" },
                    { name: "Week 2", sales: 9200, orders: 6, change: "+8.1%" },
                    { name: "Week 3", sales: 10100, orders: 7, change: "+9.8%" },
                    { name: "Week 4", sales: 10900, orders: 5, change: "+7.9%" }
                ] : [
                    { name: "Week 1", sales: 9250, orders: 7, change: "+5.2%" },
                    { name: "Week 2", sales: 10800, orders: 8, change: "+12.3%" },
                    { name: "Week 3", sales: 11500, orders: 6, change: "+6.5%" },
                    { name: "Week 4", sales: 13450, orders: 7, change: "+16.2%" }
                ],
                avgDailySales: period === 'last' ? 3800 : 4350,
                highestSalesDay: {
                    day: period === 'last' ? 'Last Month Peak' : 'June 24',
                    amount: period === 'last' ? 5200 : 6250
                },
                recentActivity: []
            }
        }, { status: 500 });
    }
}
