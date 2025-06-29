
import os
import pandas as pd
from prophet import Prophet
import matplotlib.pyplot as plt
import json

# Get the directory where this script is located
script_dir = os.path.dirname(os.path.abspath(__file__))
# Get the parent directory (frontend)
frontend_dir = os.path.dirname(script_dir)
# Construct the path to the data file
csv_path = os.path.join(frontend_dir, 'data', 'cake_ingredient_prices_june2025.csv')

# Load CSV file
df = pd.read_csv(csv_path)

# Filter for 'Sugar'
data_df = df[df['Ingredient'] == 'Sugar'][['Date', 'Price_LKR']]

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
plt.title("Sugar Price Forecast - Next 7 Days")
plt.xlabel("Date")
plt.ylabel("Price (LKR)")
plt.tight_layout()

# Save the plot to public directory
public_dir = os.path.join(frontend_dir, 'public')
plt.savefig(os.path.join(public_dir, 'sugar_price_forecast.png'), dpi=300, bbox_inches='tight')
plt.close()

# Prepare forecast data for JSON export
forecast_json = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(7).to_dict('records')
for item in forecast_json:
    item['ds'] = item['ds'].strftime('%Y-%m-%d')

# Save forecast data as JSON
with open(os.path.join(public_dir, 'sugar_price_forecast_data.json'), 'w') as f:
    json.dump(forecast_json, f)

# Generate insights
latest_price = data_df['y'].iloc[-1]
forecasted_price = forecast['yhat'].iloc[-1]
price_change = forecasted_price - latest_price
price_change_percent = (price_change / latest_price) * 100

# Calculate additional insights for the component
average_price = forecast['yhat'].tail(7).mean()
highest_price = forecast['yhat'].tail(7).max()
lowest_price = forecast['yhat'].tail(7).min()

insights = {
    "trend": "increasing" if price_change > 0 else "decreasing" if price_change < 0 else "stable",
    "percentage_change": round(price_change_percent, 2),
    "highest_price": round(highest_price, 2),
    "lowest_price": round(lowest_price, 2),
    "average_price": round(average_price, 2),
    "forecast_date": forecast['ds'].iloc[-1].strftime('%Y-%m-%d'),
    "current_price": round(latest_price, 2),
    "forecasted_price": round(forecasted_price, 2),
    "price_change": round(price_change, 2),
    "ingredient": "Sugar"
}

# Save insights as JSON
with open(os.path.join(public_dir, 'sugar_price_insights.json'), 'w') as f:
    json.dump(insights, f)

print(f"Sugar price forecast completed successfully")
print(f"Current price: LKR {latest_price:.2f}")
print(f"Forecasted price: LKR {forecasted_price:.2f}")
print(f"Price change: {price_change_percent:.2f}%")
