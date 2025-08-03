import pandas as pd
import json
from prophet import Prophet
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import os
import sys
from datetime import datetime, timedelta
import argparse

# Parse command line arguments
parser = argparse.ArgumentParser(description='Dynamic Flour Price Forecasting')
parser.add_argument('--start-date', type=str, help='Start date for forecasting (YYYY-MM-DD)', default=None)
parser.add_argument('--days', type=int, help='Number of days to forecast', default=7)
args = parser.parse_args()

# Get the absolute path for resources
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
data_path = os.path.join(base_dir, 'data', 'cake_ingredient_prices_june2025.csv')
public_path = os.path.join(base_dir, 'public')

# Get current date for dynamic forecasting
if args.start_date:
    current_date = datetime.strptime(args.start_date, '%Y-%m-%d').date()
else:
    current_date = datetime.now().date()

forecast_days = args.days

print(f"Current date: {current_date}")
print(f"Generating forecast for next {forecast_days} days starting from: {current_date + timedelta(days=1)}")

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

# Filter for 'Flour' and prepare data
flour_df = df[df['Ingredient'] == 'Flour'][['Date', 'Price_LKR']].copy()

# Rename columns to Prophet format
flour_df.rename(columns={'Date': 'ds', 'Price_LKR': 'y'}, inplace=True)

# Ensure ds is datetime
flour_df['ds'] = pd.to_datetime(flour_df['ds'])

# Sort by date
flour_df = flour_df.sort_values('ds').reset_index(drop=True)

print(f"Prepared {len(flour_df)} data points for forecasting")
print(f"Data date range: {flour_df['ds'].min()} to {flour_df['ds'].max()}")

# Create and train the model
print("Training Prophet model...")
model = Prophet(
    daily_seasonality=False,
    weekly_seasonality=True,
    yearly_seasonality=False,
    interval_width=0.95  # 95% confidence interval
)
model.fit(flour_df)

# Create future dataframe for the specified days from current date
print(f"Generating forecast for {forecast_days} days...")
current_date_pd = pd.to_datetime(current_date)
future_dates = pd.date_range(
    start=current_date_pd + timedelta(days=1),
    periods=forecast_days,
    freq='D'
)

# Create future dataframe with historical + forecast dates
future = model.make_future_dataframe(periods=forecast_days)
forecast = model.predict(future)

print(f"Last historical date in data: {flour_df['ds'].max()}")
print(f"Starting forecast from user-specified date: {current_date_pd + timedelta(days=1)}")

# Create forecast dates based on user-specified start date
user_forecast_dates = pd.date_range(
    start=current_date_pd + timedelta(days=1),
    periods=forecast_days,
    freq='D'
)

# Get forecast values for the user-specified dates by interpolating
forecast_future = []
for target_date in user_forecast_dates:
    # Find the closest forecast date
    closest_idx = (forecast['ds'] - target_date).abs().idxmin()
    forecast_row = forecast.iloc[closest_idx].copy()
    forecast_row['ds'] = target_date
    forecast_future.append(forecast_row)

forecast_future = pd.DataFrame(forecast_future)

print(f"Forecast generated for {len(forecast_future)} days")

# Create enhanced plot
fig, ax = plt.subplots(figsize=(12, 8))

# Plot historical data (last 30 days)
recent_historical = flour_df[flour_df['ds'] > (current_date_pd - timedelta(days=30))]
recent_historical = recent_historical[recent_historical['ds'] <= current_date_pd]

if not recent_historical.empty:
    ax.plot(recent_historical['ds'], recent_historical['y'], 
           'ko-', markersize=4, linewidth=2, label='Historical Prices', alpha=0.7)

# Plot forecast
ax.plot(forecast_future['ds'], forecast_future['yhat'], 
       'r-', linewidth=3, label='Predicted Prices', marker='o', markersize=6)

# Plot confidence intervals
ax.fill_between(forecast_future['ds'], 
               forecast_future['yhat_lower'], 
               forecast_future['yhat_upper'],
               alpha=0.3, color='red', label='95% Confidence Interval')

# Customize the plot
ax.set_title(f"Flour Price Forecast - Next {forecast_days} Days\nFrom {current_date + timedelta(days=1)} to {current_date + timedelta(days=forecast_days)}", 
            fontsize=16, fontweight='bold', pad=20)
ax.set_xlabel("Date", fontsize=12, fontweight='bold')
ax.set_ylabel("Price (LKR per kg)", fontsize=12, fontweight='bold')

# Format x-axis dates
ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
if forecast_days <= 7:
    ax.xaxis.set_major_locator(mdates.DayLocator(interval=1))
else:
    ax.xaxis.set_major_locator(mdates.DayLocator(interval=2))
plt.xticks(rotation=45)

# Add grid and legend
ax.grid(True, alpha=0.3)
ax.legend(loc='upper left', fontsize=10)

# Add current date line
ax.axvline(x=current_date, color='blue', linestyle='--', alpha=0.7, 
          label=f'Current Date ({current_date})')

# Tight layout
plt.tight_layout()

# Save the figure
forecast_image_path = os.path.join(public_path, 'flour_price_forecast.png')
plt.savefig(forecast_image_path, dpi=300, bbox_inches='tight', facecolor='white')
print(f"Saved forecast image to: {forecast_image_path}")

# Close the plot to free memory
plt.close()

# Prepare forecast data for JSON output
forecast_output = []
for _, row in forecast_future.iterrows():
    forecast_output.append({
        'ds': row['ds'].strftime('%Y-%m-%d'),
        'yhat': float(row['yhat']),
        'yhat_lower': float(row['yhat_lower']),
        'yhat_upper': float(row['yhat_upper']),
        'date_formatted': row['ds'].strftime('%A, %B %d, %Y'),
        'days_from_now': (row['ds'].date() - current_date).days
    })

# Save forecast data as JSON
forecast_data_path = os.path.join(public_path, 'flour_price_forecast_data.json')
with open(forecast_data_path, 'w') as f:
    json.dump(forecast_output, f, indent=2)
print(f"Saved forecast data to: {forecast_data_path}")

# Calculate enhanced insights
first_price = forecast_future.iloc[0]['yhat'] 
last_price = forecast_future.iloc[-1]['yhat']
price_change = last_price - first_price
percentage_change = (price_change / first_price) * 100

highest_price = float(forecast_future['yhat'].max())
lowest_price = float(forecast_future['yhat'].min())
average_price = float(forecast_future['yhat'].mean())

# Determine trend strength
if abs(percentage_change) < 2:
    trend_strength = 'stable'
elif abs(percentage_change) < 5:
    trend_strength = 'moderate'
else:
    trend_strength = 'significant'

# Calculate volatility
volatility = float(forecast_future['yhat'].std())

# Save enhanced insights summary
insights = {
    'forecast_period': {
        'start_date': forecast_future.iloc[0]['ds'].strftime('%Y-%m-%d'),
        'end_date': forecast_future.iloc[-1]['ds'].strftime('%Y-%m-%d'),
        'days': len(forecast_future)
    },
    'price_analysis': {
        'current_trend': 'increasing' if price_change > 0 else 'decreasing' if price_change < 0 else 'stable',
        'trend_strength': trend_strength,
        'price_change_lkr': round(price_change, 2),
        'percentage_change': round(percentage_change, 2),
        'highest_price': round(highest_price, 2),
        'lowest_price': round(lowest_price, 2),
        'average_price': round(average_price, 2),
        'volatility': round(volatility, 2)
    },
    'recommendations': {
        'buy_timing': 'early' if percentage_change > 2 else 'any_time' if abs(percentage_change) <= 2 else 'immediate',
        'price_stability': 'high' if volatility < 5 else 'medium' if volatility < 10 else 'low',
        'confidence_level': 'high'
    },
    'metadata': {
        'generated_at': datetime.now().isoformat(),
        'forecast_date': current_date.isoformat(),
        'model_type': 'Facebook Prophet',
        'confidence_interval': '95%',
        'ingredient': 'Flour'
    }
}

insights_path = os.path.join(public_path, 'flour_price_insights.json')
with open(insights_path, 'w') as f:
    json.dump(insights, f, indent=2)
print(f"Saved insights to: {insights_path}")

# Print summary
print("\n" + "="*60)
print("FLOUR PRICE FORECAST SUMMARY")
print("="*60)
print(f"Forecast Period: {insights['forecast_period']['start_date']} to {insights['forecast_period']['end_date']}")
print(f"Price Trend: {insights['price_analysis']['current_trend']} ({insights['price_analysis']['trend_strength']})")
print(f"Price Change: {insights['price_analysis']['price_change_lkr']} LKR ({insights['price_analysis']['percentage_change']:.1f}%)")
print(f"Price Range: {insights['price_analysis']['lowest_price']} - {insights['price_analysis']['highest_price']} LKR")
print(f"Average Price: {insights['price_analysis']['average_price']} LKR")
print(f"Volatility: {insights['price_analysis']['volatility']:.2f} LKR")
print(f"Buy Recommendation: {insights['recommendations']['buy_timing'].replace('_', ' ').title()}")
print("="*60)

print(f"\nDetailed {forecast_days}-day forecast:")
for item in forecast_output:
    print(f"Day +{item['days_from_now']} ({item['date_formatted']}): {item['yhat']:.2f} LKR (±{(item['yhat_upper']-item['yhat_lower'])/2:.2f})")
