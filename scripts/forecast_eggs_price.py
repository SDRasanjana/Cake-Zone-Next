#!/usr/bin/env python3

import os
import sys
import pandas as pd
from prophet import Prophet
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import json
import argparse
from datetime import datetime, timedelta

# Parse command line arguments
parser = argparse.ArgumentParser(description='Generate eggs price forecast')
parser.add_argument('--days', type=int, default=7, help='Number of days to forecast (default: 7)')
parser.add_argument('--start-date', type=str, help='Start date for forecast (YYYY-MM-DD format)')
args = parser.parse_args()

forecast_days = max(1, min(args.days, 30))  # Limit between 1-30 days

# Parse start date or use current date
if args.start_date:
    current_date = datetime.strptime(args.start_date, '%Y-%m-%d').date()
else:
    current_date = datetime.now().date()

# Print current configuration
print(f"Current date: {current_date}")
print(f"Generating forecast for next {forecast_days} days starting from: {current_date + timedelta(days=1)}")

# Get script and frontend directories
script_dir = os.path.dirname(os.path.abspath(__file__))
frontend_dir = os.path.dirname(script_dir)

print(f"Script directory: {script_dir}")
print(f"Base directory: {frontend_dir}")

# Construct path to CSV data
csv_path = os.path.join(frontend_dir, 'data', 'cake_ingredient_prices_june2025.csv')
print(f"Looking for CSV at: {csv_path}")

# Load and prepare data
try:
    df = pd.read_csv(csv_path)
    print(f"Successfully loaded CSV with {len(df)} rows")
    
    # Filter for eggs data and prepare for Prophet
    eggs_df = df[df['Ingredient'] == 'Eggs'][['Date', 'Price_LKR']].copy()
    eggs_df.rename(columns={'Date': 'ds', 'Price_LKR': 'y'}, inplace=True)
    eggs_df['ds'] = pd.to_datetime(eggs_df['ds'])
    
    print(f"Date range in data: {eggs_df['ds'].min()} to {eggs_df['ds'].max()}")
    print(f"Prepared {len(eggs_df)} data points for forecasting")
    print(f"Data date range: {eggs_df['ds'].min()} to {eggs_df['ds'].max()}")
    
except Exception as e:
    print(f"Error loading data: {e}")
    sys.exit(1)

# Create and train Prophet model
print("Training Prophet model...")
model = Prophet(
    interval_width=0.95  # 95% confidence interval
)
model.fit(eggs_df)

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

print(f"Last historical date in data: {eggs_df['ds'].max()}")
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

# Create enhanced multi-panel plot for better analysis
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(14, 10))

# Plot historical data (last 30 days)
recent_historical = eggs_df[eggs_df['ds'] > (current_date_pd - timedelta(days=30))]
recent_historical = recent_historical[recent_historical['ds'] <= current_date_pd]

if not recent_historical.empty:
    # First subplot: Main price forecast
    ax1.plot(recent_historical['ds'], recent_historical['y'],
             color='#FFD700', linewidth=2.5, label='Historical Prices', alpha=0.8)

    # Plot forecast with confidence intervals
    ax1.plot(forecast_future['ds'], forecast_future['yhat'],
             color='#FF8C00', linewidth=3, label='Forecast', linestyle='-')

    # Add confidence interval
    ax1.fill_between(forecast_future['ds'],
                    forecast_future['yhat_lower'],
                    forecast_future['yhat_upper'],
                    color='#FFD700', alpha=0.2, label='Confidence Interval')

    # Style the first subplot
    forecast_start_str = forecast_future.iloc[0]['ds'].strftime('%Y-%m-%d')
    forecast_end_str = forecast_future.iloc[-1]['ds'].strftime('%Y-%m-%d')
    
    ax1.set_title(f"Eggs Price Forecast - {forecast_days} Days\nFrom {forecast_start_str} to {forecast_end_str}",
                  fontsize=14, fontweight='bold', color='#FF8C00', pad=15)
    ax1.set_xlabel("Date", fontsize=12, fontweight='bold')
    ax1.set_ylabel("Price (LKR per dozen)", fontsize=12, fontweight='bold')

    # Format dates
    ax1.xaxis.set_major_formatter(mdates.DateFormatter('%m-%d'))
    if forecast_days <= 7:
        ax1.xaxis.set_major_locator(mdates.DayLocator(interval=1))
    elif forecast_days <= 14:
        ax1.xaxis.set_major_locator(mdates.DayLocator(interval=2))
    else:
        ax1.xaxis.set_major_locator(mdates.DayLocator(interval=3))

    plt.setp(ax1.xaxis.get_majorticklabels(), rotation=45, ha='right')

    ax1.grid(True, alpha=0.3)
    ax1.legend(loc='upper left', fontsize=10)

    # Add current date line if today is within the forecast range
    current_datetime = pd.to_datetime(datetime.now().strftime('%Y-%m-%d'))
    forecast_start = forecast_future.iloc[0]['ds']
    forecast_end = forecast_future.iloc[-1]['ds']
    if forecast_start <= current_datetime <= forecast_end:
        ax1.axvline(x=current_datetime, color='blue', linestyle='--', alpha=0.7,
                   linewidth=2, label=f'Today ({current_datetime.strftime("%Y-%m-%d")})')

    # Second subplot: Daily price changes
    daily_changes = forecast_future['yhat'].diff().fillna(0)
    colors = ['green' if change >= 0 else 'red' for change in daily_changes]

    ax2.bar(forecast_future['ds'], daily_changes, color=colors, alpha=0.7, width=0.8)
    ax2.set_title("Daily Price Changes (LKR)", fontsize=14, fontweight='bold', color='#FF8C00', pad=15)
    ax2.set_xlabel("Date", fontsize=12, fontweight='bold')
    ax2.set_ylabel("Price Change (LKR)", fontsize=12, fontweight='bold')
    ax2.axhline(y=0, color='black', linestyle='-', alpha=0.5)
    ax2.grid(True, alpha=0.3)

    # Format dates for second subplot
    ax2.xaxis.set_major_formatter(mdates.DateFormatter('%m-%d'))
    if forecast_days <= 7:
        ax2.xaxis.set_major_locator(mdates.DayLocator(interval=1))
    elif forecast_days <= 14:
        ax2.xaxis.set_major_locator(mdates.DayLocator(interval=2))
    else:
        ax2.xaxis.set_major_locator(mdates.DayLocator(interval=3))

    plt.setp(ax2.xaxis.get_majorticklabels(), rotation=45, ha='right')

# Adjust layout and save
plt.tight_layout()
public_dir = os.path.join(frontend_dir, 'public')
image_path = os.path.join(public_dir, 'eggs_price_forecast.png')
plt.savefig(image_path, dpi=300, bbox_inches='tight')
plt.close()

print(f"Saved forecast image to: {image_path}")

# Prepare forecast data for JSON export
forecast_json = []
for idx, row in forecast_future.iterrows():
    forecast_json.append({
        'ds': row['ds'].strftime('%Y-%m-%d'),
        'yhat': round(row['yhat'], 2),
        'yhat_lower': round(row['yhat_lower'], 2),
        'yhat_upper': round(row['yhat_upper'], 2)
    })

# Save forecast data as JSON
forecast_data_path = os.path.join(public_dir, 'eggs_price_forecast_data.json')
with open(forecast_data_path, 'w') as f:
    json.dump(forecast_json, f, indent=2)

print(f"Saved forecast data to: {forecast_data_path}")

# Generate comprehensive insights
if len(forecast_future) > 0:
    first_price = forecast_future.iloc[0]['yhat']
    last_price = forecast_future.iloc[-1]['yhat']
    price_change = last_price - first_price
    percentage_change = (price_change / first_price) * 100 if first_price != 0 else 0
    
    average_price = forecast_future['yhat'].mean()
    highest_price = forecast_future['yhat'].max()
    lowest_price = forecast_future['yhat'].min()
    volatility = forecast_future['yhat'].std()
    
    # Determine trend strength
    if abs(percentage_change) < 1:
        trend_strength = "stable"
    elif abs(percentage_change) < 3:
        trend_strength = "moderate"
    else:
        trend_strength = "strong"
    
    # Determine trend direction
    if percentage_change > 0.5:
        trend_direction = "increasing"
    elif percentage_change < -0.5:
        trend_direction = "decreasing"
    else:
        trend_direction = "stable"
    
    # Buy recommendation
    if trend_direction == "increasing":
        buy_timing = "Early" if trend_strength in ["moderate", "strong"] else "Any Time"
    elif trend_direction == "decreasing":
        buy_timing = "Later" if trend_strength in ["moderate", "strong"] else "Any Time"
    else:
        buy_timing = "Any Time"
    
    # Enhanced insights structure
    insights = {
        "forecast_period": {
            "start_date": forecast_future.iloc[0]['ds'].strftime('%Y-%m-%d'),
            "end_date": forecast_future.iloc[-1]['ds'].strftime('%Y-%m-%d'),
            "days": len(forecast_future)
        },
        "price_analysis": {
            "current_trend": trend_direction,
            "trend_strength": trend_strength,
            "price_change_lkr": round(price_change, 2),
            "percentage_change": round(percentage_change, 1),
            "highest_price": round(highest_price, 2),
            "lowest_price": round(lowest_price, 2),
            "average_price": round(average_price, 2),
            "volatility": round(volatility, 2)
        },
        "recommendations": {
            "buy_timing": buy_timing,
            "price_stability": "High" if volatility < 5 else "Medium" if volatility < 15 else "Low",
            "confidence_level": "High"
        },
        "metadata": {
            "generated_at": datetime.now().isoformat(),
            "forecast_date": current_date.isoformat(),
            "model_type": "Prophet",
            "confidence_interval": "95%",
            "ingredient": "Eggs"
        },
        # Legacy properties for backward compatibility
        "trend": trend_direction,
        "percentage_change": round(percentage_change, 1),
        "highest_price": round(highest_price, 2),
        "lowest_price": round(lowest_price, 2),
        "average_price": round(average_price, 2),
        "forecast_date": forecast_future.iloc[-1]['ds'].strftime('%Y-%m-%d')
    }
    
    # Save insights as JSON
    insights_path = os.path.join(public_dir, 'eggs_price_insights.json')
    with open(insights_path, 'w') as f:
        json.dump(insights, f, indent=2)
    
    print(f"Saved insights to: {insights_path}")
    
    # Print summary
    print("=" * 60)
    print("EGGS PRICE FORECAST SUMMARY")
    print("=" * 60)
    print(f"Forecast Period: {insights['forecast_period']['start_date']} to {insights['forecast_period']['end_date']}")
    print(f"Price Trend: {trend_direction} ({trend_strength})")
    print(f"Price Change: {price_change:.2f} LKR ({percentage_change:.1f}%)")
    print(f"Price Range: {lowest_price:.2f} - {highest_price:.2f} LKR")
    print(f"Average Price: {average_price:.2f} LKR")
    print(f"Volatility: {volatility:.2f} LKR")
    print(f"Buy Recommendation: {buy_timing}")
    print("=" * 60)
    
    # Print detailed forecast
    print(f"Detailed {len(forecast_future)}-day forecast:")
    for i, (_, row) in enumerate(forecast_future.iterrows()):
        days_from_now = (row['ds'].date() - current_date).days
        day_name = row['ds'].strftime('%A')
        date_str = row['ds'].strftime('%B %d, %Y')
        confidence_range = row['yhat_upper'] - row['yhat_lower']
        print(f"Day {days_from_now:+d} ({day_name}, {date_str}): {row['yhat']:.2f} LKR (±{confidence_range/2:.2f})")

else:
    print("No forecast data generated")
