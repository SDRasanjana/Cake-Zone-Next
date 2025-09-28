import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import OpenAI from 'openai';

// Initialize OpenAI with your API key
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
});

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

        // Get comprehensive business data for analysis
        const ingredientsCollection = db.collection("ingredients");
        const ordersCollection = db.collection("orders");
        const expensesCollection = db.collection("expenses");

        // Get ingredient pricing trends for forecasting
        const ingredientPrices = await ingredientsCollection.find({}).sort({ date: -1 }).limit(100).toArray();

        // Get order data for revenue and customer insights
        const recentOrders = await ordersCollection.find({}).sort({ orderDate: -1 }).limit(100).toArray();

        // Get historical expense data for trend analysis
        const historicalExpenses = await expensesCollection.find({}).sort({ date: -1 }).limit(200).toArray();

        // Calculate comprehensive business metrics
        const businessMetrics = calculateBusinessMetrics(expenseData, recentOrders, historicalExpenses, ingredientPrices);

        // Generate AI-powered insights
        const aiAdvice = await generateAIAdvice(businessMetrics);

        // Combine AI insights with traditional analysis
        const traditionalAdvice = generateSmartAdvice(expenseData, ingredientPrices, businessMetrics.revenue);

        // Merge and prioritize advice
        const combinedAdvice = [...aiAdvice, ...traditionalAdvice].slice(0, 8); // Limit to 8 most important insights

        return NextResponse.json({
            success: true,
            advice: combinedAdvice,
            businessMetrics
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

// Function to calculate comprehensive business metrics
function calculateBusinessMetrics(expenseData, recentOrders, historicalExpenses, ingredientPrices) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Revenue analysis
    const revenue = recentOrders.reduce((total, order) => total + (order.orderTotal || 0), 0);
    const monthlyRevenue = recentOrders.filter(order => {
        const orderDate = new Date(order.orderDate);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    }).reduce((total, order) => total + (order.orderTotal || 0), 0);

    // Customer insights
    const uniqueCustomers = new Set(recentOrders.map(order => order.customerId)).size;
    const avgOrderValue = recentOrders.length > 0 ? revenue / recentOrders.length : 0;

    // Popular products analysis
    const productSales = {};
    recentOrders.forEach(order => {
        if (order.items) {
            order.items.forEach(item => {
                productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
            });
        }
    });

    // Seasonal trends (based on current month)
    const seasonalFactors = {
        0: { season: 'Winter', factor: 0.8, events: ['New Year promotions', 'Winter special items'] },
        1: { season: 'Winter', factor: 0.85, events: ['Valentine\'s Day', 'Love-themed cakes'] },
        2: { season: 'Spring', factor: 0.9, events: ['Spring festivals', 'Mother\'s Day prep'] },
        3: { season: 'Spring', factor: 1.0, events: ['Easter', 'Spring celebrations'] },
        4: { season: 'Spring', factor: 1.1, events: ['Mother\'s Day', 'Graduation season'] },
        5: { season: 'Summer', factor: 1.3, events: ['Wedding season peak', 'Summer parties'] },
        6: { season: 'Summer', factor: 1.25, events: ['Wedding season', 'Summer events'] },
        7: { season: 'Summer', factor: 1.2, events: ['Summer holidays', 'Birthday parties'] },
        8: { season: 'Autumn', factor: 1.0, events: ['Back to school', 'Autumn festivals'] },
        9: { season: 'Autumn', factor: 1.1, events: ['Halloween', 'Festive preparations'] },
        10: { season: 'Autumn', factor: 1.15, events: ['Thanksgiving', 'Holiday prep'] },
        11: { season: 'Winter', factor: 1.4, events: ['Christmas', 'New Year', 'Holiday peak'] }
    };

    // Ingredient cost trends
    const ingredientTrends = {};
    ['Flour', 'Sugar', 'Butter', 'Eggs'].forEach(ingredient => {
        const prices = ingredientPrices.filter(item => item.name === ingredient).sort((a, b) => new Date(b.date) - new Date(a.date));
        if (prices.length >= 2) {
            const latestPrice = prices[0]?.pricePerUnit || 0;
            const previousPrice = prices[1]?.pricePerUnit || latestPrice;
            const trend = previousPrice > 0 ? ((latestPrice - previousPrice) / previousPrice) * 100 : 0;
            ingredientTrends[ingredient] = { current: latestPrice, trend, status: trend > 5 ? 'rising' : trend < -5 ? 'falling' : 'stable' };
        }
    });

    // Business efficiency metrics
    const totalExpenses = expenseData.currentMonth.total;
    const profitMargin = monthlyRevenue > 0 ? ((monthlyRevenue - totalExpenses) / monthlyRevenue) * 100 : 0;
    const expenseRatio = {
        labour: (expenseData.currentMonth.labour / totalExpenses) * 100,
        inventory: (expenseData.currentMonth.inventory / totalExpenses) * 100,
        utilities: (expenseData.currentMonth.utilities / totalExpenses) * 100,
        others: (expenseData.currentMonth.others / totalExpenses) * 100
    };

    return {
        revenue: monthlyRevenue,
        totalRevenue: revenue,
        uniqueCustomers,
        avgOrderValue,
        productSales,
        seasonalData: seasonalFactors[currentMonth],
        ingredientTrends,
        profitMargin,
        expenseRatio,
        totalExpenses,
        businessHealth: profitMargin > 15 ? 'healthy' : profitMargin > 5 ? 'moderate' : 'needs_attention'
    };
}

// Function to generate AI-powered advice using OpenAI or advanced fallback
async function generateAIAdvice(businessMetrics) {
    try {
        // Check if OpenAI is available and has quota
        if (!process.env.OPENAI_API_KEY) {
            console.log('OpenAI API key not available, using advanced fallback analysis');
            return generateAdvancedFallbackAdvice(businessMetrics);
        }

        const prompt = `
        As an expert financial advisor for a cake shop business, analyze the following data and provide specific, actionable advice:

        Business Metrics:
        - Monthly Revenue: Rs. ${businessMetrics.revenue}
        - Profit Margin: ${businessMetrics.profitMargin.toFixed(2)}%
        - Unique Customers: ${businessMetrics.uniqueCustomers}
        - Average Order Value: Rs. ${businessMetrics.avgOrderValue.toFixed(2)}
        - Current Season: ${businessMetrics.seasonalData.season}
        - Seasonal Factor: ${businessMetrics.seasonalData.factor}
        - Business Health: ${businessMetrics.businessHealth}

        Expense Breakdown:
        - Labour: ${businessMetrics.expenseRatio.labour.toFixed(1)}%
        - Inventory: ${businessMetrics.expenseRatio.inventory.toFixed(1)}%
        - Utilities: ${businessMetrics.expenseRatio.utilities.toFixed(1)}%
        - Others: ${businessMetrics.expenseRatio.others.toFixed(1)}%

        Ingredient Trends:
        ${Object.entries(businessMetrics.ingredientTrends).map(([ingredient, data]) =>
            `- ${ingredient}: ${data.status} (${data.trend > 0 ? '+' : ''}${data.trend.toFixed(1)}%)`
        ).join('\n')}

        Seasonal Opportunities: ${businessMetrics.seasonalData.events.join(', ')}

        Provide exactly 4 insights in this JSON format:
        [
            {
                "category": "category_name",
                "type": "warning|opportunity|insight",
                "message": "specific actionable advice",
                "savings": estimated_monthly_savings_amount
            }
        ]

        Focus on:
        1. Seasonal business opportunities and threats
        2. Cost optimization based on expense ratios
        3. Ingredient procurement strategy based on trends
        4. Revenue enhancement opportunities
        5. Business weaknesses and improvement areas

        Make recommendations specific to a cake shop business with current market conditions.
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are an expert financial advisor specializing in food and bakery businesses. Provide practical, data-driven advice that cake shop owners can implement immediately."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 1000,
            temperature: 0.7,
        });

        const response = completion.choices[0]?.message?.content;

        // Parse the JSON response
        const aiAdvice = JSON.parse(response);

        // Validate and format the advice
        return aiAdvice.map(advice => ({
            category: advice.category || 'General',
            type: advice.type || 'insight',
            message: advice.message || 'No specific advice available',
            savings: parseInt(advice.savings) || 0,
            source: 'AI'
        }));

    } catch (error) {
        console.error('Error generating AI advice:', error);

        // Check if it's a quota error and provide appropriate fallback
        if (error.status === 429 || error.code === 'insufficient_quota') {
            console.log('OpenAI quota exceeded, using advanced fallback analysis');
            return generateAdvancedFallbackAdvice(businessMetrics);
        }

        // For other errors, return basic fallback
        return generateBasicFallbackAdvice(businessMetrics);
    }
}

// Advanced fallback advice generation (comprehensive analysis without AI)
function generateAdvancedFallbackAdvice(businessMetrics) {
    const advice = [];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();

    // 1. Seasonal Analysis
    const seasonalAdvice = generateSeasonalAdvice(businessMetrics, currentMonth);
    advice.push(seasonalAdvice);

    // 2. Profitability Analysis
    const profitabilityAdvice = generateProfitabilityAdvice(businessMetrics);
    advice.push(profitabilityAdvice);

    // 3. Cost Structure Analysis
    const costAnalysisAdvice = generateCostStructureAdvice(businessMetrics);
    advice.push(costAnalysisAdvice);

    // 4. Ingredient Strategy Analysis
    const ingredientAdvice = generateIngredientStrategyAdvice(businessMetrics);
    advice.push(ingredientAdvice);

    return advice;
}

// Generate seasonal-specific advice
function generateSeasonalAdvice(businessMetrics, currentMonth) {
    const seasonalStrategies = {
        7: { // August
            opportunities: [
                "Back-to-school celebration cakes",
                "Late summer birthday parties",
                "End-of-vacation family gatherings",
                "Corporate summer events"
            ],
            recommendations: "Focus on colorful, fun cake designs for school celebrations and birthday parties",
            savingsMultiplier: 0.18,
            marketTrends: "August sees 25% increase in children's birthday cake orders"
        },
        8: { // September
            opportunities: ["Autumn weddings", "Harvest festivals", "Corporate events", "Teacher appreciation cakes"],
            recommendations: "Promote autumn-themed wedding cakes and corporate catering packages",
            savingsMultiplier: 0.15,
            marketTrends: "September is peak wedding month with 40% higher demand"
        },
        9: { // October
            opportunities: ["Halloween themed cakes", "Harvest celebrations", "Corporate quarterly events", "Thanksgiving pre-orders"],
            recommendations: "Launch Halloween collection and start Thanksgiving pre-order campaigns",
            savingsMultiplier: 0.20,
            marketTrends: "October sees 60% spike in themed cake requests"
        },
        // Add more months as needed
    };

    const monthData = seasonalStrategies[currentMonth] || {
        opportunities: ["General seasonal promotions"],
        recommendations: "Adapt offerings to current seasonal trends",
        savingsMultiplier: 0.12,
        marketTrends: "Standard seasonal patterns apply"
    };

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonthName = monthNames[currentMonth];

    // Dynamic revenue potential calculation
    const revenueBoost = businessMetrics.seasonalData.factor > 1.2 ? "high-demand" : businessMetrics.seasonalData.factor > 1.0 ? "moderate-demand" : "steady-demand";
    const potentialIncrease = Math.round((businessMetrics.seasonalData.factor - 1) * 100);

    return {
        category: "Seasonal",
        type: "opportunity",
        message: `${currentMonthName} presents excellent opportunities for ${monthData.opportunities.join(', ')}. ${monthData.recommendations}. Current seasonal factor of ${businessMetrics.seasonalData.factor} indicates ${revenueBoost} period with potential for ${potentialIncrease}% revenue growth. Market insight: ${monthData.marketTrends}.`,
        marketData: {
            seasonalFactor: businessMetrics.seasonalData.factor,
            demandLevel: revenueBoost,
            potentialGrowth: `${potentialIncrease}%`,
            monthName: currentMonthName
        },
        savings: Math.round(businessMetrics.revenue * monthData.savingsMultiplier),
        source: 'Expert Analysis'
    };
}

// Generate profitability-focused advice
function generateProfitabilityAdvice(businessMetrics) {
    const profitMargin = businessMetrics.profitMargin;
    const avgOrderValue = businessMetrics.avgOrderValue || 0;
    const uniqueCustomers = businessMetrics.uniqueCustomers || 0;
    const monthlyRevenue = businessMetrics.revenue || 0;

    // Calculate industry benchmark comparisons
    const industryAvgMargin = 18; // Bakery industry average
    const marginGap = profitMargin - industryAvgMargin;
    const revenuePerCustomer = uniqueCustomers > 0 ? monthlyRevenue / uniqueCustomers : 0;

    if (profitMargin < 10) {
        return {
            category: "Profitability",
            type: "warning",
            message: `🚨 Critical Alert: Your profit margin of ${profitMargin.toFixed(1)}% is ${Math.abs(marginGap).toFixed(1)} points below industry standard (${industryAvgMargin}%). With ${uniqueCustomers} customers averaging Rs. ${avgOrderValue.toFixed(0)} per order, you need immediate action: 1) Increase high-margin item prices by 8-12%, 2) Reduce ingredient waste by 15%, 3) Focus on premium cake categories. Target: Reach 15% margin within 2 months.`,
            savings: Math.round(businessMetrics.revenue * 0.15),
            source: 'Expert Analysis',
            priority: 'HIGH',
            benchmarkData: {
                current: profitMargin.toFixed(1),
                industry: industryAvgMargin,
                gap: marginGap.toFixed(1),
                target: '15%'
            }
        };
    } else if (profitMargin < 15) {
        return {
            category: "Profitability",
            type: "warning",
            message: `⚠️ Below Optimal: Your ${profitMargin.toFixed(1)}% margin is ${Math.abs(marginGap).toFixed(1)} points below industry average. With Rs. ${revenuePerCustomer.toFixed(0)} revenue per customer, implement: 1) Menu engineering - promote items with 25%+ margins, 2) Bundle high-margin items with popular ones, 3) Introduce 'Premium' tier pricing. Potential to reach ${industryAvgMargin}% margin.`,
            savings: Math.round(businessMetrics.revenue * 0.10),
            source: 'Expert Analysis',
            priority: 'MEDIUM',
            benchmarkData: {
                current: profitMargin.toFixed(1),
                industry: industryAvgMargin,
                gap: marginGap.toFixed(1),
                target: `${industryAvgMargin}%`
            }
        };
    } else if (profitMargin > 25) {
        return {
            category: "Growth",
            type: "opportunity",
            message: `🎉 Outstanding Performance: ${profitMargin.toFixed(1)}% margin exceeds industry standard by ${marginGap.toFixed(1)} points! Your ${uniqueCustomers} customers generate Rs. ${revenuePerCustomer.toFixed(0)} each. Strategic opportunities: 1) Expand premium product lines, 2) Invest in marketing to acquire 20% more customers, 3) Consider opening additional revenue streams (catering, workshops). Maintain excellence while scaling.`,
            savings: 0,
            source: 'Expert Analysis',
            priority: 'EXPANSION',
            benchmarkData: {
                current: profitMargin.toFixed(1),
                industry: industryAvgMargin,
                gap: `+${marginGap.toFixed(1)}`,
                performance: 'EXCEPTIONAL'
            }
        };
    } else {
        return {
            category: "Profitability",
            type: "insight",
            message: `✅ Healthy Performance: ${profitMargin.toFixed(1)}% margin is ${marginGap >= 0 ? 'above' : 'near'} industry standards. ${uniqueCustomers} loyal customers with Rs. ${avgOrderValue.toFixed(0)} average orders show solid foundation. Optimization opportunities: 1) Increase customer frequency with loyalty rewards, 2) Cross-sell complementary items, 3) Test premium pricing on signature items. Target: 22% margin within 6 months.`,
            savings: Math.round(businessMetrics.revenue * 0.06),
            source: 'Expert Analysis',
            priority: 'OPTIMIZE',
            benchmarkData: {
                current: profitMargin.toFixed(1),
                industry: industryAvgMargin,
                gap: marginGap.toFixed(1),
                target: '22%'
            }
        };
    }
}

// Generate cost structure advice
function generateCostStructureAdvice(businessMetrics) {
    const { labour, inventory, utilities, others } = businessMetrics.expenseRatio;
    const totalExpenses = businessMetrics.totalExpenses;

    // Industry benchmarks for bakeries
    const benchmarks = {
        labour: { min: 25, max: 35, optimal: 30 },
        inventory: { min: 28, max: 38, optimal: 32 },
        utilities: { min: 8, max: 12, optimal: 10 },
        others: { min: 10, max: 15, optimal: 12 }
    };

    // Identify the most critical area
    const deviations = {
        labour: { value: labour, deviation: labour - benchmarks.labour.optimal, severity: Math.abs(labour - benchmarks.labour.optimal) },
        inventory: { value: inventory, deviation: inventory - benchmarks.inventory.optimal, severity: Math.abs(inventory - benchmarks.inventory.optimal) },
        utilities: { value: utilities, deviation: utilities - benchmarks.utilities.optimal, severity: Math.abs(utilities - benchmarks.utilities.optimal) },
        others: { value: others, deviation: others - benchmarks.others.optimal, severity: Math.abs(others - benchmarks.others.optimal) }
    };

    // Find the category with highest deviation
    const mostCritical = Object.entries(deviations).reduce((max, [key, data]) =>
        data.severity > max.severity ? { category: key, ...data } : max,
        { category: 'labour', severity: 0 }
    );

    // Generate advice based on most critical area
    if (mostCritical.category === 'labour' && labour > benchmarks.labour.max) {
        return {
            category: "Labour",
            type: "warning",
            message: `🚨 Labour Alert: ${labour.toFixed(1)}% is ${(labour - benchmarks.labour.max).toFixed(1)} points above optimal range (${benchmarks.labour.min}-${benchmarks.labour.max}%). Monthly impact: Rs. ${Math.round(totalExpenses * (labour - benchmarks.labour.optimal) / 100)}. Action plan: 1) Optimize staff scheduling (save 15%), 2) Cross-train employees for flexibility, 3) Review productivity during slow hours. Target: Reduce to ${benchmarks.labour.optimal}% within 8 weeks.`,
            savings: Math.round(totalExpenses * (labour - benchmarks.labour.optimal) / 100 * 0.7),
            source: 'Expert Analysis',
            priority: 'HIGH',
            costBreakdown: {
                current: `${labour.toFixed(1)}%`,
                optimal: `${benchmarks.labour.optimal}%`,
                excess: `+${(labour - benchmarks.labour.optimal).toFixed(1)}%`,
                monthlyCost: Math.round(totalExpenses * labour / 100)
            }
        };
    } else if (mostCritical.category === 'inventory' && inventory > benchmarks.inventory.max) {
        return {
            category: "Inventory",
            type: "warning",
            message: `📦 Inventory Alert: ${inventory.toFixed(1)}% exceeds optimal range by ${(inventory - benchmarks.inventory.max).toFixed(1)} points (target: ${benchmarks.inventory.min}-${benchmarks.inventory.max}%). Monthly excess: Rs. ${Math.round(totalExpenses * (inventory - benchmarks.inventory.optimal) / 100)}. Solutions: 1) Implement just-in-time ordering, 2) Reduce waste by 20% through better forecasting, 3) Negotiate 10% bulk discounts. Target: ${benchmarks.inventory.optimal}% within 6 weeks.`,
            savings: Math.round(totalExpenses * (inventory - benchmarks.inventory.optimal) / 100 * 0.6),
            source: 'Expert Analysis',
            priority: 'HIGH',
            costBreakdown: {
                current: `${inventory.toFixed(1)}%`,
                optimal: `${benchmarks.inventory.optimal}%`,
                excess: `+${(inventory - benchmarks.inventory.optimal).toFixed(1)}%`,
                monthlyCost: Math.round(totalExpenses * inventory / 100)
            }
        };
    } else if (mostCritical.category === 'utilities' && utilities > benchmarks.utilities.max) {
        return {
            category: "Utilities",
            type: "opportunity",
            message: `⚡ Utilities Optimization: ${utilities.toFixed(1)}% offers significant savings potential (optimal: ${benchmarks.utilities.optimal}%). Monthly excess: Rs. ${Math.round(totalExpenses * (utilities - benchmarks.utilities.optimal) / 100)}. Energy-saving plan: 1) LED lighting upgrade (25% saving), 2) Optimize oven scheduling during off-peak hours, 3) Install smart thermostats. ROI: 8-12 months payback period.`,
            savings: Math.round(totalExpenses * (utilities - benchmarks.utilities.optimal) / 100 * 0.8),
            source: 'Expert Analysis',
            priority: 'MEDIUM',
            costBreakdown: {
                current: `${utilities.toFixed(1)}%`,
                optimal: `${benchmarks.utilities.optimal}%`,
                excess: `+${(utilities - benchmarks.utilities.optimal).toFixed(1)}%`,
                monthlyCost: Math.round(totalExpenses * utilities / 100)
            }
        };
    } else {
        return {
            category: "Operations",
            type: "insight",
            message: `✅ Balanced Structure: Your cost ratios are within optimal ranges - Labour: ${labour.toFixed(1)}% (target: ${benchmarks.labour.optimal}%), Inventory: ${inventory.toFixed(1)}% (target: ${benchmarks.inventory.optimal}%), Utilities: ${utilities.toFixed(1)}% (target: ${benchmarks.utilities.optimal}%). Fine-tuning opportunities: 1) Staff productivity workshops, 2) Inventory turnover analysis, 3) Preventive maintenance scheduling. Potential monthly optimization: Rs. ${Math.round(totalExpenses * 0.03)}.`,
            savings: Math.round(totalExpenses * 0.04),
            source: 'Expert Analysis',
            priority: 'OPTIMIZE',
            costBreakdown: {
                labour: `${labour.toFixed(1)}% (Good)`,
                inventory: `${inventory.toFixed(1)}% (Good)`,
                utilities: `${utilities.toFixed(1)}% (Good)`,
                status: 'BALANCED'
            }
        };
    }
}

// Generate ingredient strategy advice
function generateIngredientStrategyAdvice(businessMetrics) {
    const trends = businessMetrics.ingredientTrends;
    const risingIngredients = Object.entries(trends).filter(([, data]) => data.status === 'rising');
    const fallingIngredients = Object.entries(trends).filter(([, data]) => data.status === 'falling');

    if (risingIngredients.length > 0) {
        const ingredient = risingIngredients[0];
        return {
            category: "Inventory",
            type: "opportunity",
            message: `${ingredient[0]} prices are rising (${ingredient[1].trend > 0 ? '+' : ''}${ingredient[1].trend.toFixed(1)}%). Strategic action: negotiate fixed-price contracts with suppliers, consider bulk purchasing for 2-3 month supply if storage permits, or explore alternative suppliers. Monitor other rising ingredients: ${risingIngredients.map(([name]) => name).join(', ')}.`,
            savings: Math.round(businessMetrics.totalExpenses * 0.10),
            source: 'Expert Analysis'
        };
    } else if (fallingIngredients.length > 0) {
        const ingredient = fallingIngredients[0];
        return {
            category: "Inventory",
            type: "opportunity",
            message: `${ingredient[0]} prices are declining (${ingredient[1].trend.toFixed(1)}%). Excellent opportunity: increase inventory of falling-price ingredients within storage capacity, lock in current prices with forward contracts, and consider expanding menu items featuring these cost-effective ingredients.`,
            savings: Math.round(businessMetrics.totalExpenses * 0.08),
            source: 'Expert Analysis'
        };
    } else {
        return {
            category: "Inventory",
            type: "insight",
            message: `Ingredient prices are stable, providing predictable cost planning. Focus on supplier relationship management: negotiate annual contracts, explore volume discounts, establish backup suppliers for critical ingredients, and implement inventory rotation systems to minimize waste.`,
            savings: Math.round(businessMetrics.totalExpenses * 0.05),
            source: 'Expert Analysis'
        };
    }
}

// Basic fallback for critical errors
function generateBasicFallbackAdvice(businessMetrics) {
    return [
        {
            category: "General",
            type: "insight",
            message: "Focus on monitoring key performance indicators: profit margins, cost ratios, and seasonal trends to maintain business health.",
            savings: Math.round(businessMetrics.revenue * 0.05),
            source: 'Basic Analysis'
        },
        {
            category: "Seasonal",
            type: "opportunity",
            message: "August offers opportunities for back-to-school celebrations and summer event catering. Consider targeted promotions.",
            savings: Math.round(businessMetrics.revenue * 0.10),
            source: 'Basic Analysis'
        }
    ];
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
            savings: Math.round(currentMonth.total * 0.1),
            source: 'Analysis'
        });
    } else if (totalChangePercentage < -10) {
        advice.push({
            category: "General",
            type: "opportunity",
            message: `Great job! Your expenses have decreased by ${Math.abs(totalChangePercentage).toFixed(1)}% compared to last month. Continue implementing your cost-saving strategies.`,
            savings: 0,
            source: 'Analysis'
        });
    }

    // Labor cost analysis with industry benchmarks
    if (laborChangePercentage > 15) {
        advice.push({
            category: "Labour",
            type: "warning",
            message: `Labor costs have increased significantly by ${laborChangePercentage.toFixed(1)}%. Consider optimizing staff scheduling, implementing performance metrics, or reviewing recent wage adjustments.`,
            savings: Math.round(currentMonth.labour * 0.15),
            source: 'Analysis'
        });
    } else if (currentMonth.labour > (currentMonth.total * 0.4)) {
        advice.push({
            category: "Labour",
            type: "warning",
            message: "Labor costs represent over 40% of your total expenses. Industry standard is typically 25-35%. Implement productivity measures and optimize shift scheduling.",
            savings: Math.round(currentMonth.labour * 0.12),
            source: 'Analysis'
        });
    }

    // Enhanced inventory analysis with ingredient-specific recommendations
    if (inventoryChangePercentage > 25) {
        advice.push({
            category: "Inventory",
            type: "warning",
            message: `Inventory expenses have increased significantly by ${inventoryChangePercentage.toFixed(1)}%. Implement inventory tracking, reduce waste through better demand forecasting, and negotiate bulk purchase agreements.`,
            savings: Math.round(currentMonth.inventory * 0.18),
            source: 'Analysis'
        });
    }

    // Analyze specific ingredient pricing trends
    const flourPrices = ingredientPrices.filter(item => item.name === 'Flour').sort((a, b) => new Date(b.date) - new Date(a.date));
    const sugarPrices = ingredientPrices.filter(item => item.name === 'Sugar').sort((a, b) => new Date(b.date) - new Date(a.date));

    // Flour pricing strategy
    if (flourPrices.length >= 2) {
        const latestFlourPrice = flourPrices[0]?.pricePerUnit || 0;
        const previousFlourPrice = flourPrices[1]?.pricePerUnit || latestFlourPrice;
        const flourTrend = ((latestFlourPrice - previousFlourPrice) / previousFlourPrice) * 100;

        if (flourTrend > 10) {
            advice.push({
                category: "Inventory",
                type: "opportunity",
                message: `Flour prices have risen by ${flourTrend.toFixed(1)}% recently. Consider bulk purchasing immediately or exploring alternative suppliers. This trend may continue due to market volatility.`,
                savings: Math.round(latestFlourPrice * 50 * 0.12),
                source: 'Analysis'
            });
        } else if (flourTrend < -5) {
            advice.push({
                category: "Inventory",
                type: "opportunity",
                message: `Flour prices have decreased by ${Math.abs(flourTrend).toFixed(1)}%. Excellent time to stock up within your storage capabilities. Consider 2-3 month supply if storage permits.`,
                savings: Math.round(latestFlourPrice * 50 * 0.08),
                source: 'Analysis'
            });
        }
    }

    // Sugar market analysis
    if (sugarPrices.length >= 2) {
        const latestSugarPrice = sugarPrices[0]?.pricePerUnit || 0;
        const previousSugarPrice = sugarPrices[1]?.pricePerUnit || latestSugarPrice;
        const sugarTrend = ((latestSugarPrice - previousSugarPrice) / previousSugarPrice) * 100;

        if (sugarTrend > 8) {
            advice.push({
                category: "Inventory",
                type: "opportunity",
                message: `Sugar prices are trending upward (${sugarTrend.toFixed(1)}% increase). Consider forward contracts with suppliers or bulk purchasing. Sugar has longer shelf life making it ideal for stock building.`,
                savings: Math.round(latestSugarPrice * 40 * 0.1),
                source: 'Analysis'
            });
        }
    }

    // Utilities optimization with seasonal considerations
    if (utilitiesChangePercentage > 20) {
        advice.push({
            category: "Utilities",
            type: "warning",
            message: `Utilities expenses increased by ${utilitiesChangePercentage.toFixed(1)}%. Audit energy usage patterns, consider equipment maintenance, and implement energy-saving protocols during non-peak hours.`,
            savings: Math.round(currentMonth.utilities * 0.2),
            source: 'Analysis'
        });
    } else if (currentMonth.utilities > (currentMonth.total * 0.12)) {
        advice.push({
            category: "Utilities",
            type: "opportunity",
            message: "Utilities represent over 12% of expenses. Consider LED lighting upgrades, programmable thermostats, and equipment timers. Peak-hour usage optimization can reduce costs significantly.",
            savings: Math.round(currentMonth.utilities * 0.15),
            source: 'Analysis'
        });
    }

    // Comprehensive profit margin analysis
    const expenses = currentMonth.total;
    const estimatedProfit = revenue - expenses;
    const profitMargin = revenue > 0 ? (estimatedProfit / revenue) * 100 : 0;

    if (profitMargin < 15 && revenue > 0) {
        advice.push({
            category: "Profitability",
            type: "warning",
            message: `Your profit margin is ${profitMargin.toFixed(1)}%, below the bakery industry average of 15-25%. Consider menu engineering, portion control, and strategic price adjustments for high-margin items.`,
            savings: Math.round(revenue * 0.05),
            source: 'Analysis'
        });
    } else if (profitMargin >= 25 && revenue > 0) {
        advice.push({
            category: "Growth",
            type: "insight",
            message: `Excellent profit margin of ${profitMargin.toFixed(1)}%! Consider reinvesting in premium ingredients, equipment upgrades, or expanding your product line to maintain competitive advantage.`,
            savings: 0,
            source: 'Analysis'
        });
    }

    // Seasonal and market-specific advice for August 2025
    const currentMonth_actual = new Date().getMonth(); // August = 7
    if (currentMonth_actual === 7) { // August
        advice.push({
            category: "Seasonal",
            type: "opportunity",
            message: "August is prime birthday party season and back-to-school celebrations. Consider promoting birthday cake packages and offering school event catering to boost revenue during this peak period.",
            savings: Math.round(revenue * 0.12),
            source: 'Analysis'
        });
    }

    return advice.slice(0, 4); // Limit traditional advice to balance with AI advice
}
