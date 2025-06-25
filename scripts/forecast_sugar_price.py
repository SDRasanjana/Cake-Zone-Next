
import pandas as pd
import json
import sys
import numpy as np
from prophet import Prophet
import matplotlib.pyplot as plt
import os
from datetime import datetime, timedelta

# Get the ingredient type from command line arguments (default to 'Sugar')
ingredient_type = 'Sugar'
if len(sys.argv) > 1:
    ingredient_type = sys.argv[1]

# Get the absolute path for resources
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
data_path = os.path.join(base_dir, 'data', 'cake_ingredient_prices_june2025.csv')
public_path = os.path.join(base_dir, 'public')

# Print paths for debugging
print(f"Script directory: {os.path.dirname(os.path.abspath(__file__))}")
print(f"Base directory: {base_dir}")
print(f"Looking for CSV at: {data_path}")
print(f"Forecasting for ingredient: {ingredient_type}")

# Load CSV file
try:
    df = pd.read_csv(data_path)
    print(f"Successfully loaded CSV with {len(df)} rows")
except FileNotFoundError:
    print(f"ERROR: File not found at {data_path}")
    # Create sample data for testing if file not found
    print("Creating sample data for testing...")
    
    # Create 30 days of sample data
    dates = [(datetime(2025, 6, 1) + timedelta(days=i)).strftime('%Y-%m-%d') for i in range(30)]
    
    # Different base prices and trends for different ingredients
    ingredients = ['Flour', 'Sugar', 'Eggs', 'Butter']
    base_prices = {
        'Flour': 250,
        'Sugar': 180,
        'Eggs': 320,
        'Butter': 450
    }
    trends = {
        'Flour': 2.0,
        'Sugar': 1.5,
        'Eggs': 0.8,
        'Butter': 3.0
    }
    
    # Create sample data for all ingredients
    all_data = []
    for ing in ingredients:
        base = base_prices.get(ing, 200)
        trend = trends.get(ing, 1.0)
        prices = [base + i*trend + np.random.normal(0, base*0.02) for i in range(30)]
        for i, date in enumerate(dates):
            all_data.append({
                'Date': date,
                'Ingredient': ing,
                'Price_LKR': prices[i],
                'Source': 'Sample'
            })
    
    df = pd.DataFrame(all_data)
    print(f"Created sample data with {len(df)} rows")

# Filter for the specified ingredient
data_df = df[df['Ingredient'] == ingredient_type][['Date', 'Price_LKR']]

if len(data_df) == 0:
    print(f"No data found for ingredient: {ingredient_type}")
    print(f"Available ingredients: {df['Ingredient'].unique()}")
    sys.exit(1)

# Rename columns to Prophet format
data_df.rename(columns={'Date': 'ds', 'Price_LKR': 'y'}, inplace=True)

# Create and train the model
model = Prophet()
model.fit(data_df)

# Create a DataFrame for 7 days into the future
future = model.make_future_dataframe(periods=7)
forecast = model.predict(future)

# Plot forecast
fig = model.plot(forecast)
plt.title(f"{ingredient_type} Price Forecast - Next 7 Days")
plt.xlabel("Date")
plt.ylabel("Price (LKR)")
plt.tight_layout()

# Save the figure to an image file that can be used by the frontend
output_image = os.path.join(public_path, f'{ingredient_type.lower()}_price_forecast.png')
plt.savefig(output_image, dpi=300, bbox_inches='tight')
print(f"Saved forecast image to {output_image}")

# Also save the forecast data as JSON for frontend use
# Convert Pandas timestamps to string format to avoid JSON serialization issues
forecast_tail = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(8).copy()
forecast_tail['ds'] = forecast_tail['ds'].dt.strftime('%Y-%m-%d')
forecast_data = forecast_tail.to_dict(orient='records')

output_data = os.path.join(public_path, f'{ingredient_type.lower()}_price_forecast_data.json')
with open(output_data, 'w') as f:
    json.dump(forecast_data, f)
print(f"Saved forecast data to {output_data}")

# Calculate trend and percentage change for insights
last_7_days = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(7)
first_price = last_7_days.iloc[0]['yhat'] 
last_price = last_7_days.iloc[-1]['yhat']
price_change = ((last_price - first_price) / first_price) * 100

# Save insights summary
insights = {
    'trend': 'increasing' if last_price > first_price else 'decreasing',
    'percentage_change': round(price_change, 2),
    'highest_price': float(last_7_days['yhat'].max()),
    'lowest_price': float(last_7_days['yhat'].min()),
    'average_price': float(last_7_days['yhat'].mean()),
    'forecast_date': pd.Timestamp.now().strftime('%Y-%m-%d')
}

output_insights = os.path.join(public_path, f'{ingredient_type.lower()}_price_insights.json')
with open(output_insights, 'w') as f:
    json.dump(insights, f)
print(f"Saved insights to {output_insights}")

print(f"Forecast summary for {ingredient_type}:")
print(last_7_days)
print(f"Trend: {insights['trend']} by {insights['percentage_change']}%")
