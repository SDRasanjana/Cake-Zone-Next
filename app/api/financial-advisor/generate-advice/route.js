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
                "End-of-vacation family gatherings"
            ],
            recommendations: "Focus on colorful, fun cake designs for school celebrations and birthday parties",
            savingsMultiplier: 0.18
        },
        8: { // September
            opportunities: ["Autumn weddings", "Harvest festivals", "Corporate events"],
            recommendations: "Promote autumn-themed wedding cakes and corporate catering packages",
            savingsMultiplier: 0.15
        },
        // Add more months as needed
    };

    const monthData = seasonalStrategies[currentMonth] || {
        opportunities: ["General seasonal promotions"],
        recommendations: "Adapt offerings to current seasonal trends",
        savingsMultiplier: 0.12
    };

    return {
        category: "Seasonal",
        type: "opportunity",
        message: `August presents excellent opportunities for ${monthData.opportunities.join(', ')}. ${monthData.recommendations}. Current seasonal factor of ${businessMetrics.seasonalData.factor} indicates strong potential for revenue growth.`,
        savings: Math.round(businessMetrics.revenue * monthData.savingsMultiplier),
        source: 'Expert Analysis'
    };
}

// Generate profitability-focused advice
function generateProfitabilityAdvice(businessMetrics) {
    const profitMargin = businessMetrics.profitMargin;

    if (profitMargin < 10) {
        return {
            category: "Profitability",
            type: "warning",
            message: `Critical: Your profit margin of ${profitMargin.toFixed(1)}% is significantly below industry standards (15-25%). Immediate action required: review pricing strategy, reduce high-cost ingredients, and optimize portion sizes. Consider premium product lines with higher margins.`,
            savings: Math.round(businessMetrics.revenue * 0.12),
            source: 'Expert Analysis'
        };
    } else if (profitMargin < 15) {
        return {
            category: "Profitability",
            type: "warning",
            message: `Your profit margin of ${profitMargin.toFixed(1)}% is below optimal levels. Implement menu engineering: promote high-margin items, review supplier contracts, and consider strategic price increases on premium products. Focus on value-added services.`,
            savings: Math.round(businessMetrics.revenue * 0.08),
            source: 'Expert Analysis'
        };
    } else if (profitMargin > 25) {
        return {
            category: "Growth",
            type: "opportunity",
            message: `Excellent profit margin of ${profitMargin.toFixed(1)}%! You're outperforming industry standards. Consider strategic reinvestment: expand product lines, upgrade equipment, or invest in marketing to capture more market share while maintaining profitability.`,
            savings: 0,
            source: 'Expert Analysis'
        };
    } else {
        return {
            category: "Profitability",
            type: "insight",
            message: `Healthy profit margin of ${profitMargin.toFixed(1)}%. Maintain current pricing strategy while exploring opportunities for premium offerings. Consider customer loyalty programs to increase repeat business and average order value.`,
            savings: Math.round(businessMetrics.revenue * 0.05),
            source: 'Expert Analysis'
        };
    }
}

// Generate cost structure advice
function generateCostStructureAdvice(businessMetrics) {
    const { labour, inventory, utilities } = businessMetrics.expenseRatio;

    // Identify the highest concern area
    if (labour > 40) {
        return {
            category: "Labour",
            type: "warning",
            message: `Labor costs at ${labour.toFixed(1)}% of expenses are critically high (industry standard: 25-35%). Implement efficiency measures: cross-train staff, optimize scheduling during peak/off-peak hours, consider automation for repetitive tasks, and review productivity metrics.`,
            savings: Math.round(businessMetrics.totalExpenses * 0.15),
            source: 'Expert Analysis'
        };
    } else if (inventory > 45) {
        return {
            category: "Inventory",
            type: "warning",
            message: `Inventory costs at ${inventory.toFixed(1)}% are excessive (industry standard: 30-40%). Implement just-in-time ordering, reduce waste through better demand forecasting, negotiate bulk purchase discounts, and review supplier relationships for better terms.`,
            savings: Math.round(businessMetrics.totalExpenses * 0.12),
            source: 'Expert Analysis'
        };
    } else if (utilities > 15) {
        return {
            category: "Utilities",
            type: "opportunity",
            message: `Utilities at ${utilities.toFixed(1)}% offer optimization potential (target: under 12%). Install energy-efficient equipment, implement programmable thermostats, optimize baking schedules to avoid peak electricity rates, and consider LED lighting upgrades.`,
            savings: Math.round(businessMetrics.totalExpenses * 0.08),
            source: 'Expert Analysis'
        };
    } else {
        return {
            category: "Operations",
            type: "insight",
            message: `Your cost structure is well-balanced with room for strategic improvements. Focus on incremental optimizations: staff productivity training (${labour.toFixed(1)}% labor), inventory turnover improvement (${inventory.toFixed(1)}% inventory), and preventive maintenance to avoid unexpected costs.`,
            savings: Math.round(businessMetrics.totalExpenses * 0.06),
            source: 'Expert Analysis'
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
