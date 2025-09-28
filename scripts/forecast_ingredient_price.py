"""
Generic Ingredient Price Forecasting Script
Uses Facebook Prophet to predict ingredient prices for cake shop
Supports any ingredient type and outputs JSON for API consumption
"""

import argparse
import json
import sys
import os
import pandas as pd
import numpy as np
from prophet import Prophet
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

def get_base_price(ingredient_name):
    """Get base price for different ingredients (LKR per kg unless specified)"""
    base_prices = {
        # Dairy products
        'butter': 420,
        'milk': 180,
        'cream': 350,
        'cheese': 800,
        
        # Baking basics
        'flour': 120,
        'sugar': 150,
        'brown_sugar': 180,
        'baking_powder': 400,
        'baking_soda': 250,
        
        # Proteins
        'eggs': 25,  # per piece
        
        # Flavorings
        'vanilla': 800,
        'cocoa': 600,
        'chocolate': 900,
        
        # Oils and fats
        'vegetable_oil': 320,
        'coconut_oil': 450,
        
        # Fruits and nuts
        'almonds': 1200,
        'walnuts': 1400,
        'raisins': 600,
        
        # Decorating supplies
        'food_coloring': 150,
        'sprinkles': 300,
        'fondant': 450,
        
        # Default for unknown ingredients
        'default': 200
    }
    
    # Clean ingredient name (lowercase, replace spaces with underscores)
    clean_name = ingredient_name.lower().replace(' ', '_').replace('-', '_')
    return base_prices.get(clean_name, base_prices['default'])

def generate_historical_data(ingredient_name, days=60):
    """Generate realistic historical price data for an ingredient"""
    np.random.seed(hash(ingredient_name) % 2**32)  # Consistent seed per ingredient
    
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=days)
    dates = [start_date + timedelta(days=i) for i in range(days)]
    
    base_price = get_base_price(ingredient_name)
    
    # Generate trend component (slight upward trend due to inflation)
    trend_factor = np.random.uniform(0.05, 0.15)  # 5-15% increase over period
    trend = np.linspace(0, base_price * trend_factor, days)
    
    # Generate seasonal component
    seasonal_periods = np.random.uniform(2, 4)  # 2-4 seasonal cycles
    seasonal_amplitude = base_price * np.random.uniform(0.03, 0.08)  # 3-8% variation
    seasonal = seasonal_amplitude * np.sin(np.linspace(0, seasonal_periods * 2 * np.pi, days))
    
    # Generate weekly pattern (some ingredients cheaper on certain days)
    weekly_pattern = []
    for i, date in enumerate(dates):
        day_of_week = date.weekday()
        # Monday=0, Sunday=6
        if day_of_week in [0, 1]:  # Monday, Tuesday - often cheaper
            weekly_factor = np.random.uniform(0.95, 1.0)
        elif day_of_week in [4, 5]:  # Friday, Saturday - often more expensive
            weekly_factor = np.random.uniform(1.0, 1.05)
        else:
            weekly_factor = 1.0
        weekly_pattern.append(base_price * (weekly_factor - 1))
    
    weekly_pattern = np.array(weekly_pattern)
    
    # Generate random noise
    noise_level = base_price * np.random.uniform(0.01, 0.03)  # 1-3% noise
    noise = np.random.normal(0, noise_level, days)
    
    # Combine all components
    prices = base_price + trend + seasonal + weekly_pattern + noise
    
    # Ensure prices are positive and reasonable
    prices = np.maximum(prices, base_price * 0.7)  # Never below 70% of base price
    prices = np.minimum(prices, base_price * 1.5)  # Never above 150% of base price
    
    return pd.DataFrame({
        'ds': dates,
        'y': prices
    })

def load_or_generate_data(ingredient_name, data_path=None):
    """Load data from CSV if available, otherwise generate synthetic data"""
    if data_path and os.path.exists(data_path):
        try:
            df = pd.read_csv(data_path)
            df['Date'] = pd.to_datetime(df['Date'], format='%m/%d/%Y')
            
            # Try to find the ingredient (case insensitive)
            ingredient_df = df[df['Ingredient'].str.lower() == ingredient_name.lower()][['Date', 'Price_LKR']].copy()
            
            if not ingredient_df.empty:
                ingredient_df.rename(columns={'Date': 'ds', 'Price_LKR': 'y'}, inplace=True)
                ingredient_df = ingredient_df.sort_values('ds').reset_index(drop=True)
                print(f"📊 Loaded {len(ingredient_df)} historical data points for {ingredient_name}", file=sys.stderr)
                return ingredient_df
            else:
                print(f"⚠️ No data found for {ingredient_name} in CSV, generating synthetic data", file=sys.stderr)
        except Exception as e:
            print(f"⚠️ Error loading CSV data: {e}, generating synthetic data", file=sys.stderr)
    
    # Generate synthetic data
    print(f"🎲 Generating synthetic historical data for {ingredient_name}", file=sys.stderr)
    return generate_historical_data(ingredient_name)

def train_prophet_model(data, ingredient_name):
    """Train Prophet model on the historical data"""
    print(f"🧠 Training Prophet model for {ingredient_name}...", file=sys.stderr)
    
    # Configure Prophet based on data characteristics
    model = Prophet(
        daily_seasonality=False,
        weekly_seasonality=True if len(data) >= 14 else False,
        yearly_seasonality=False if len(data) < 365 else True,
        interval_width=0.95,
        changepoint_prior_scale=0.05,  # More conservative changepoints
        seasonality_prior_scale=10.0,  # Allow for seasonal effects
        seasonality_mode='multiplicative'  # Seasonal effects scale with trend
    )
    
    # Fit the model
    model.fit(data)
    print(f"✅ Model training completed for {ingredient_name}", file=sys.stderr)
    
    return model

def generate_forecast(model, ingredient_name, forecast_days, start_date=None):
    """Generate price forecast using trained model"""
    if start_date:
        current_date = datetime.strptime(start_date, '%Y-%m-%d').date()
    else:
        current_date = datetime.now().date()
    
    print(f"🔮 Generating {forecast_days}-day forecast for {ingredient_name} from {current_date}", file=sys.stderr)
    
    # Create future dataframe
    future = model.make_future_dataframe(periods=forecast_days)
    forecast = model.predict(future)
    
    # Extract forecast for the requested period
    current_datetime = pd.to_datetime(current_date)
    forecast_future = forecast[forecast['ds'] > current_datetime].head(forecast_days)
    
    # Prepare forecast data
    forecast_data = []
    for i, (_, row) in enumerate(forecast_future.iterrows()):
        forecast_data.append({
            'date': row['ds'].strftime('%Y-%m-%d'),
            'predicted_price': round(float(row['yhat']), 2),
            'lower_bound': round(float(row['yhat_lower']), 2),
            'upper_bound': round(float(row['yhat_upper']), 2),
            'confidence_interval': f"±{round((float(row['yhat_upper']) - float(row['yhat_lower']))/2, 2)}",
            'days_from_now': i + 1
        })
    
    return forecast_data

def calculate_insights(forecast_data, ingredient_name):
    """Calculate insights and trends from forecast data"""
    if not forecast_data:
        return {}
    
    first_price = forecast_data[0]['predicted_price']
    last_price = forecast_data[-1]['predicted_price']
    prices = [item['predicted_price'] for item in forecast_data]
    
    # Price change analysis
    price_change = last_price - first_price
    percentage_change = (price_change / first_price) * 100
    
    # Statistical analysis
    avg_price = sum(prices) / len(prices)
    max_price = max(prices)
    min_price = min(prices)
    volatility = np.std(prices)
    
    # Trend classification
    if abs(percentage_change) < 1:
        trend_strength = 'stable'
        trend = 'stable'
    elif percentage_change > 0:
        trend = 'increasing'
        trend_strength = 'moderate' if percentage_change < 5 else 'significant'
    else:
        trend = 'decreasing'
        trend_strength = 'moderate' if abs(percentage_change) < 5 else 'significant'
    
    # Generate recommendation
    recommendation = generate_recommendation(percentage_change, volatility, trend_strength)
    
    return {
        'trend': trend,
        'trend_strength': trend_strength,
        'price_change_amount': round(price_change, 2),
        'price_change_percentage': round(percentage_change, 2),
        'average_price': round(avg_price, 2),
        'highest_price': round(max_price, 2),
        'lowest_price': round(min_price, 2),
        'price_volatility': round(volatility, 2),
        'recommendation': recommendation,
        'confidence_level': 'high' if volatility < 5 else 'medium' if volatility < 15 else 'low'
    }

def generate_recommendation(percentage_change, volatility, trend_strength):
    """Generate buying recommendation based on forecast"""
    if percentage_change > 8:
        return "🚨 Buy immediately - significant price increase expected"
    elif percentage_change > 3:
        return "⚡ Buy soon - moderate price increase expected"
    elif percentage_change < -8:
        return "⏳ Wait to buy - significant price decrease expected"
    elif percentage_change < -3:
        return "📉 Consider waiting - price decrease expected"
    elif volatility > 15:
        return "📊 Monitor closely - high price volatility detected"
    elif trend_strength == 'stable':
        return "✅ Normal buying conditions - stable prices expected"
    else:
        return "📈 Standard market conditions - proceed as planned"

def main():
    start_time = datetime.now()
    
    parser = argparse.ArgumentParser(description='Ingredient Price Forecasting with Prophet')
    parser.add_argument('--ingredient', type=str, required=True, help='Ingredient name to forecast')
    parser.add_argument('--days', type=int, default=7, help='Number of days to forecast (1-30)')
    parser.add_argument('--start-date', type=str, help='Start date for forecasting (YYYY-MM-DD)', default=None)
    parser.add_argument('--output-format', type=str, choices=['json', 'text'], default='json', help='Output format')
    parser.add_argument('--data-file', type=str, help='Path to CSV data file', default=None)
    
    args = parser.parse_args()
    
    try:
        # Validate parameters
        if args.days < 1 or args.days > 30:
            raise ValueError("Days parameter must be between 1 and 30")
        
        if args.start_date:
            try:
                datetime.strptime(args.start_date, '%Y-%m-%d')
            except ValueError:
                raise ValueError("Invalid date format. Use YYYY-MM-DD")
        
        # Determine data file path
        if not args.data_file:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            args.data_file = os.path.join(base_dir, 'data', 'cake_ingredient_prices_june2025.csv')
        
        print(f"🚀 Starting forecast for {args.ingredient}...", file=sys.stderr)
        
        # Load or generate data
        data = load_or_generate_data(args.ingredient, args.data_file)
        
        # Train model
        model = train_prophet_model(data, args.ingredient)
        
        # Generate forecast
        forecast_data = generate_forecast(model, args.ingredient, args.days, args.start_date)
        
        # Calculate insights
        insights = calculate_insights(forecast_data, args.ingredient)
        
        # Prepare result
        result = {
            'success': True,
            'data': {
                'ingredient': args.ingredient,
                'forecast_period': {
                    'start_date': args.start_date or datetime.now().strftime('%Y-%m-%d'),
                    'days': args.days,
                    'end_date': forecast_data[-1]['date'] if forecast_data else None
                },
                'forecast_data': forecast_data,
                'insights': insights,
                'metadata': {
                    'generated_at': datetime.now().isoformat(),
                    'model_type': 'Facebook Prophet',
                    'data_points_used': len(data),
                    'confidence_interval': '95%',
                    'processing_time_seconds': round((datetime.now() - start_time).total_seconds(), 2)
                }
            }
        }
        
        # Output result
        if args.output_format == 'json':
            print(json.dumps(result))
        else:
            print(f"Forecast for {args.ingredient}:")
            for item in forecast_data:
                print(f"  {item['date']}: Rs. {item['predicted_price']} ({item['confidence_interval']})")
            print(f"\nInsights: {insights['recommendation']}")
        
        print(f"✅ Forecast completed in {(datetime.now() - start_time).total_seconds():.2f}s", file=sys.stderr)
        
    except Exception as e:
        error_result = {
            'success': False,
            'error': str(e),
            'ingredient': args.ingredient,
            'timestamp': datetime.now().isoformat()
        }
        
        if args.output_format == 'json':
            print(json.dumps(error_result))
        else:
            print(f"Error: {e}")
        
        print(f"❌ Error occurred: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()