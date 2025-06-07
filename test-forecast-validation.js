// Comprehensive forecast error checking and validation
export function validateForecastData(ingredient) {
    const errors = [];

    // Check if ingredient exists
    if (!ingredient) {
        errors.push('Ingredient data is missing');
        return { isValid: false, errors };
    }

    // Check required fields
    if (!ingredient.name) {
        errors.push('Ingredient name is required');
    }

    if (!ingredient.priceHistory) {
        errors.push('Price history is required for forecasting');
        return { isValid: false, errors };
    }

    // Check if priceHistory is an array
    if (!Array.isArray(ingredient.priceHistory)) {
        errors.push('Price history must be an array');
        return { isValid: false, errors };
    }

    // Check minimum data points
    if (ingredient.priceHistory.length < 3) {
        errors.push(`Insufficient data points: ${ingredient.priceHistory.length} (minimum 3 required)`);
        return { isValid: false, errors };
    }

    // Validate each price entry
    const invalidEntries = [];
    ingredient.priceHistory.forEach((entry, index) => {
        if (!entry.date) {
            invalidEntries.push(`Entry ${index}: Missing date`);
        }
        if (typeof entry.price !== 'number' || entry.price < 0) {
            invalidEntries.push(`Entry ${index}: Invalid price (${entry.price})`);
        }
        if (entry.date && isNaN(new Date(entry.date).getTime())) {
            invalidEntries.push(`Entry ${index}: Invalid date format (${entry.date})`);
        }
    });

    if (invalidEntries.length > 0) {
        errors.push(...invalidEntries);
    }

    return {
        isValid: errors.length === 0,
        errors,
        dataPoints: ingredient.priceHistory.length
    };
}

// Test validation function
export function testValidation() {
    console.log('🧪 Testing forecast validation...');

    // Test cases
    const testCases = [
        {
            name: 'Valid ingredient',
            data: {
                name: 'Test Flour',
                priceHistory: [
                    { price: 40, date: '2024-01-01' },
                    { price: 42, date: '2024-01-05' },
                    { price: 41, date: '2024-01-10' },
                    { price: 43, date: '2024-01-15' }
                ]
            },
            expectedValid: true
        },
        {
            name: 'Insufficient data points',
            data: {
                name: 'Test Sugar',
                priceHistory: [
                    { price: 50, date: '2024-01-01' },
                    { price: 52, date: '2024-01-05' }
                ]
            },
            expectedValid: false
        },
        {
            name: 'Missing price history',
            data: {
                name: 'Test Ingredient'
            },
            expectedValid: false
        },
        {
            name: 'Invalid price values',
            data: {
                name: 'Test Butter',
                priceHistory: [
                    { price: -10, date: '2024-01-01' },
                    { price: 'invalid', date: '2024-01-05' },
                    { price: 300, date: '2024-01-10' },
                    { price: 305, date: '2024-01-15' }
                ]
            },
            expectedValid: false
        }
    ];

    testCases.forEach(testCase => {
        const result = validateForecastData(testCase.data);
        const passed = result.isValid === testCase.expectedValid;

        console.log(`${passed ? '✅' : '❌'} ${testCase.name}: ${result.isValid ? 'Valid' : 'Invalid'}`);
        if (!result.isValid) {
            console.log(`   Errors: ${result.errors.join(', ')}`);
        }
    });
}

// Run tests if in browser
if (typeof window !== 'undefined') {
    window.testValidation = testValidation;
    window.validateForecastData = validateForecastData;
}
