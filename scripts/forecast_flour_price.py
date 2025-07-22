import pandas as pd
import json
from prophet import Prophet
import matplotlib.pyplot as plt
import os
import sys

# Get the absolute path for resources
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
data_path = os.path.join(base_dir, 'data', 'cake_ingredient_prices_june2025.csv')
public_path = os.path.join(base_dir, 'public')

# Print paths for debugging
print(f"Script directory: {os.path.dirname(os.path.abspath(__file__))}")
print(f"Base directory: {base_dir}")
print(f"Looking for CSV at: {data_path}")

# Load CSV file
try:
    df = pd.read_csv(data_path)
    print(f"Successfully loaded CSV with {len(df)} rows")
except FileNotFoundError:
    print(f"ERROR: File not found at {data_path}")
    # Create sample data for testing if file not found
    print("Creating sample data for testing...")
    # Create a dataframe with sample data from June 2025
    import numpy as np
    from datetime import datetime, timedelta
    
    # Create 30 days of sample data
    dates = [(datetime(2025, 6, 1) + timedelta(days=i)).strftime('%Y-%m-%d') for i in range(30)]
    # Generate sample prices with a slight upward trend and some noise
    base_price = 250  # Base price in LKR
    prices = [base_price + i*2 + np.random.normal(0, 5) for i in range(30)]
    
    df = pd.DataFrame({
        'Date': dates,
        'Ingredient': 'Flour',
        'Price_LKR': prices,
        'Source': 'Sample'
    })
    print(f"Created sample data with {len(df)} rows")

# Filter for 'Flour'
flour_df = df[df['Ingredient'] == 'Flour'][['Date', 'Price_LKR']]

# Rename columns to Prophet format
flour_df.rename(columns={'Date': 'ds', 'Price_LKR': 'y'}, inplace=True)

# Create and train the model
model = Prophet()
model.fit(flour_df)

# Create a DataFrame for 7 days into the future
future = model.make_future_dataframe(periods=7)
forecast = model.predict(future)

# Plot forecast
fig = model.plot(forecast)
plt.title("Flour Price Forecast - Next 7 Days")
plt.xlabel("Date")
plt.ylabel("Price (LKR)")
plt.tight_layout()

# Save the figure to an image file that can be used by the frontend
forecast_image_path = os.path.join(public_path, 'flour_price_forecast.png')
plt.savefig(forecast_image_path, dpi=300, bbox_inches='tight')
print(f"Saved forecast image to: {forecast_image_path}")

# Also save the forecast data as JSON for frontend use
forecast_data = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(8).to_json(orient='records')
forecast_data_path = os.path.join(public_path, 'flour_price_forecast_data.json')
with open(forecast_data_path, 'w') as f:
    f.write(forecast_data)
print(f"Saved forecast data to: {forecast_data_path}")

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

insights_path = os.path.join(public_path, 'flour_price_insights.json')
with open(insights_path, 'w') as f:
    json.dump(insights, f)
print(f"Saved insights to: {insights_path}")

print("Forecast saved to public folder. Last 7 days forecast:")
print(last_7_days)
print(f"\nTrend: {insights['trend']} by {insights['percentage_change']}%")
