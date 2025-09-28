// Test script for Financial Advisor API
// Run with: node test-financial-advisor.js

const testFinancialAdvisorAPI = async () => {
    const apiUrl = 'http://localhost:3000/api/financial-advisor/generate-advice';

    // Sample expense data for testing
    const testData = {
        expenseData: {
            currentMonth: {
                total: 45000,
                labour: 15000,
                inventory: 18000,
                utilities: 5000,
                others: 7000
            },
            previousMonth: {
                total: 42000,
                labour: 14000,
                inventory: 16000,
                utilities: 4500,
                others: 7500
            },
            twoMonthsAgo: {
                total: 38000
            }
        }
    };

    try {
        console.log('🧪 Testing Financial Advisor API...');
        console.log('📊 Test Data:', JSON.stringify(testData, null, 2));

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        console.log('\n✅ API Response Received');
        console.log('📈 Success:', result.success);

        if (result.advice) {
            console.log(`\n💡 Generated ${result.advice.length} insights:`);
            result.advice.forEach((advice, index) => {
                console.log(`\n${index + 1}. ${advice.category} - ${advice.type.toUpperCase()}`);
                console.log(`   💰 Savings: Rs. ${advice.savings}`);
                console.log(`   📝 Message: ${advice.message}`);
                console.log(`   🔍 Source: ${advice.source || 'Traditional'}`);
            });
        }

        if (result.businessMetrics) {
            console.log('\n📊 Business Metrics:');
            console.log(`   💵 Revenue: Rs. ${result.businessMetrics.revenue}`);
            console.log(`   📈 Profit Margin: ${result.businessMetrics.profitMargin}%`);
            console.log(`   🏥 Business Health: ${result.businessMetrics.businessHealth}`);
            console.log(`   🌱 Season: ${result.businessMetrics.seasonalData?.season}`);
        }

        // Calculate total potential savings
        const totalSavings = result.advice?.reduce((sum, advice) => sum + (advice.savings || 0), 0) || 0;
        console.log(`\n💰 Total Potential Monthly Savings: Rs. ${totalSavings.toLocaleString()}`);

        return result;

    } catch (error) {
        console.error('❌ Error testing Financial Advisor API:', error.message);
        return null;
    }
};

// Test function for browser console (if needed)
const testInBrowser = () => {
    const testData = {
        expenseData: {
            currentMonth: {
                total: 45000,
                labour: 15000,
                inventory: 18000,
                utilities: 5000,
                others: 7000
            },
            previousMonth: {
                total: 42000,
                labour: 14000,
                inventory: 16000,
                utilities: 4500,
                others: 7500
            },
            twoMonthsAgo: {
                total: 38000
            }
        }
    };

    fetch('/api/financial-advisor/generate-advice', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
    })
        .then(response => response.json())
        .then(data => {
            console.log('Financial Advisor Test Results:', data);
            if (data.advice) {
                console.table(data.advice.map(advice => ({
                    Category: advice.category,
                    Type: advice.type,
                    Savings: `Rs. ${advice.savings}`,
                    Source: advice.source || 'Traditional'
                })));
            }
        })
        .catch(error => console.error('Test failed:', error));
};

// For Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { testFinancialAdvisorAPI };
}

// For browser environment
if (typeof window !== 'undefined') {
    window.testFinancialAdvisor = testInBrowser;
}

// Auto-run if this script is executed directly
if (typeof require !== 'undefined' && require.main === module) {
    testFinancialAdvisorAPI();
}

console.log(`
🎂 Cake Shop Financial Advisor - Test Ready!

📋 Test Instructions:
1. Ensure your development server is running (npm run dev)
2. Make sure OpenAI API key is set in .env.local
3. Run this test in browser console: testFinancialAdvisor()
4. Or run with Node.js: node test-financial-advisor.js

🔧 Configuration Check:
- API Endpoint: /api/financial-advisor/generate-advice
- Required: OPENAI_API_KEY in environment
- Database: MongoDB connection required
- Expected Response: Array of financial insights

💡 Understanding Results:
- Warnings (🚨): Issues requiring immediate attention
- Opportunities (💡): Growth and optimization chances
- Insights (📊): Strategic business advice
- AI Source: Generated by OpenAI analysis
- Traditional: Rule-based analysis

Ready to test your AI-powered financial advisor! 🚀
`);
