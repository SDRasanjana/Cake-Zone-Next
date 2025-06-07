# Python script to help debug and test forecasting algorithms
# This can be used to validate the mathematical calculations
import json
import requests
from datetime import datetime, timedelta
import statistics

def test_forecast_math():
    """Test the mathematical accuracy of our forecasting algorithm"""
    print("🔍 Testing Forecast Mathematical Calculations...")
    
    # Sample data similar to what we have in the database
    sample_data = [
        {"price": 40, "date": "2024-11-01"},
        {"price": 42, "date": "2024-11-05"}, 
        {"price": 41, "date": "2024-11-10"},
        {"price": 43, "date": "2024-11-15"},
        {"price": 44, "date": "2024-11-20"},
        {"price": 45, "date": "2024-11-25"},
    ]
    
    # Calculate linear regression manually to verify
    prices = [d["price"] for d in sample_data]
    x_values = list(range(len(prices)))
    
    # Manual linear regression calculation
    n = len(prices)
    sum_x = sum(x_values)
    sum_y = sum(prices)
    sum_xy = sum(x * y for x, y in zip(x_values, prices))
    sum_x2 = sum(x * x for x in x_values)
    
    # Calculate slope (m) and intercept (b) for y = mx + b
    slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x * sum_x)
    intercept = (sum_y - slope * sum_x) / n
    
    print(f"📊 Linear Regression Results:")
    print(f"   Slope: {slope:.4f}")
    print(f"   Intercept: {intercept:.4f}")
    print(f"   Current trend: {'increasing' if slope > 0 else 'decreasing'}")
    
    # Generate predictions for next 7 days
    print(f"\n🔮 7-Day Price Predictions:")
    for i in range(7):
        future_x = len(prices) + i
        predicted_price = slope * future_x + intercept
        future_date = datetime.strptime("2024-11-25", "%Y-%m-%d") + timedelta(days=i+1)
        print(f"   {future_date.strftime('%Y-%m-%d')}: ${predicted_price:.2f}")
    
    # Calculate statistics
    avg_price = statistics.mean(prices)
    trend_percentage = ((prices[-1] - prices[0]) / prices[0]) * 100
    
    print(f"\n📈 Statistics:")
    print(f"   Average Price: ${avg_price:.2f}")
    print(f"   Price Change: {trend_percentage:.1f}%")
    print(f"   Data Points: {len(prices)}")
    
    return True

def test_api_connectivity():
    """Test if the Next.js API is accessible"""
    print("\n🌐 Testing API Connectivity...")
    
    base_url = "http://localhost:3000"
    endpoints = [
        "/api/ingredients",
        "/api/ingredients/forecast"
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}", timeout=5)
            if response.status_code == 200:
                print(f"✅ {endpoint} - OK")
                data = response.json()
                if 'success' in data and data['success']:
                    print(f"   Response: Success with {len(data.get('data', {})) if isinstance(data.get('data'), dict) else len(data.get('data', []))} items")
                else:
                    print(f"   Response: {data.get('error', 'Unknown error')}")
            else:
                print(f"❌ {endpoint} - HTTP {response.status_code}")
        except requests.exceptions.ConnectionError:
            print(f"❌ {endpoint} - Connection refused (server not running?)")
        except requests.exceptions.Timeout:
            print(f"❌ {endpoint} - Timeout")
        except Exception as e:
            print(f"❌ {endpoint} - Error: {e}")

def generate_test_data():
    """Generate more comprehensive test data"""
    print("\n📊 Generating Extended Test Data...")
    
    ingredients = {
        "All-Purpose Flour": {
            "base_price": 45,
            "volatility": 0.1,
            "trend": 0.02
        },
        "Granulated Sugar": {
            "base_price": 55, 
            "volatility": 0.15,
            "trend": -0.01
        },
        "Unsalted Butter": {
            "base_price": 320,
            "volatility": 0.05,
            "trend": 0.03
        }
    }
    
    import random
    from datetime import datetime, timedelta
    
    for name, config in ingredients.items():
        print(f"\n🧮 {name} Price Simulation:")
        current_price = config["base_price"]
        start_date = datetime(2024, 10, 1)
        
        for i in range(30):  # 30 days of data
            # Add trend and random volatility
            daily_change = config["trend"] + random.uniform(-config["volatility"], config["volatility"])
            current_price *= (1 + daily_change)
            
            date = start_date + timedelta(days=i)
            if i % 5 == 0:  # Show every 5th day
                print(f"   {date.strftime('%Y-%m-%d')}: ${current_price:.2f}")

if __name__ == "__main__":
    print("🐍 Python Forecast Testing & Debugging Tool")
    print("=" * 50)
    
    # Test mathematical calculations
    test_forecast_math()
    
    # Test API connectivity
    test_api_connectivity() 
    
    # Generate extended test data
    generate_test_data()
    
    print("\n" + "=" * 50)
    print("🎯 Debugging Tips:")
    print("1. Ensure Next.js server is running (npm run dev)")
    print("2. Check browser console for JavaScript errors")
    print("3. Verify MongoDB is running and accessible")
    print("4. Check if ingredients have sufficient price history data")
    print("5. Inspect Network tab for failed API calls")
