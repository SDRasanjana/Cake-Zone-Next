#!/usr/bin/env python3
"""
Enhanced Ingredient Price Forecasting Test Script
Tests the improved forecasting system for day-to-day price variations
"""

import os
import sys
import json
import subprocess
import pandas as pd
from datetime import datetime, timedelta

def test_forecast_variation():
    print("🧪 Testing Enhanced Price Forecasting System\n")
    
    # Test parameters
    ingredients = ['flour', 'sugar', 'eggs', 'butter']
    test_days = 7
    start_date = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
    
    results = {}
    
    for ingredient in ingredients:
        print(f"📊 Testing {ingredient.title()} Price Forecasting...")
        
        # Get script directory
        script_dir = os.path.dirname(os.path.abspath(__file__))
        script_path = os.path.join(script_dir, f'forecast_{ingredient}_price.py')
        
        if not os.path.exists(script_path):
            print(f"   ❌ Script not found: {script_path}")
            continue
            
        try:
            # Run the forecasting script
            cmd = [
                'python', script_path,
                '--days', str(test_days),
                '--start-date', start_date
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, cwd=script_dir)
            
            if result.returncode != 0:
                print(f"   ❌ Script execution failed: {result.stderr}")
                continue
                
            # Check if forecast data was generated
            base_dir = os.path.dirname(script_dir)
            public_dir = os.path.join(base_dir, 'public')
            forecast_file = os.path.join(public_dir, f'{ingredient}_price_forecast_data.json')
            insights_file = os.path.join(public_dir, f'{ingredient}_price_insights.json')
            
            if not os.path.exists(forecast_file):
                print(f"   ❌ Forecast data file not created: {forecast_file}")
                continue
                
            # Load and analyze forecast data
            with open(forecast_file, 'r') as f:
                forecast_data = json.load(f)
                
            if len(forecast_data) == 0:
                print(f"   ❌ No forecast data generated")
                continue
                
            # Analyze price variation
            prices = [item['yhat'] for item in forecast_data]
            price_range = max(prices) - min(prices)
            price_std = pd.Series(prices).std()
            avg_price = sum(prices) / len(prices)
            
            # Check for meaningful variation (should not be flat)
            variation_threshold = avg_price * 0.02  # At least 2% variation expected
            has_variation = price_range > variation_threshold
            
            results[ingredient] = {
                'success': True,
                'days_generated': len(forecast_data),
                'price_range': round(price_range, 2),
                'price_std': round(price_std, 2),
                'avg_price': round(avg_price, 2),
                'has_variation': has_variation,
                'variation_percentage': round((price_range / avg_price) * 100, 2),
                'sample_prices': [round(p, 2) for p in prices[:3]]  # First 3 days
            }
            
            # Print results
            status = "✅" if has_variation else "⚠️"
            print(f"   {status} Generated {len(forecast_data)} day forecast")
            print(f"   📈 Price Range: {price_range:.2f} LKR ({(price_range/avg_price)*100:.1f}% variation)")
            print(f"   📊 Standard Deviation: {price_std:.2f} LKR")
            print(f"   💰 Average Price: {avg_price:.2f} LKR")
            print(f"   🎯 Sample Prices: {', '.join([f'{p:.2f}' for p in prices[:3]])} LKR")
            
            if has_variation:
                print(f"   ✅ Day-to-day variation detected - prices change properly!")
            else:
                print(f"   ⚠️ Limited variation - prices might be too flat")
                
            # Load insights if available
            if os.path.exists(insights_file):
                with open(insights_file, 'r') as f:
                    insights = json.load(f)
                    trend = insights.get('price_analysis', {}).get('current_trend', 'unknown')
                    change_pct = insights.get('price_analysis', {}).get('percentage_change', 0)
                    print(f"   📈 Trend: {trend.title()} ({change_pct:+.1f}%)")
                    
        except Exception as e:
            print(f"   ❌ Error testing {ingredient}: {str(e)}")
            results[ingredient] = {'success': False, 'error': str(e)}
            
        print()  # Empty line for spacing
    
    # Summary
    print("="*60)
    print("📋 FORECASTING TEST SUMMARY")
    print("="*60)
    
    successful = sum(1 for r in results.values() if r.get('success', False))
    with_variation = sum(1 for r in results.values() if r.get('has_variation', False))
    
    print(f"✅ Successful forecasts: {successful}/{len(ingredients)}")
    print(f"📈 With proper variation: {with_variation}/{successful}")
    
    if with_variation == successful and successful > 0:
        print("🎉 All forecasts show proper day-to-day price variations!")
    elif with_variation > 0:
        print("⚠️ Some forecasts need more variation tuning")
    else:
        print("❌ Forecasts are too flat - need model improvements")
        
    print("\n📊 Detailed Results:")
    for ingredient, result in results.items():
        if result.get('success'):
            status = "✅ GOOD" if result.get('has_variation') else "⚠️ FLAT"
            print(f"   {ingredient.title()}: {status} (Variation: {result.get('variation_percentage', 0):.1f}%)")
        else:
            print(f"   {ingredient.title()}: ❌ FAILED")
    
    return results

def test_different_time_periods():
    print("\n🕐 Testing Different Time Periods...")
    
    # Test different forecast periods
    periods = [3, 7, 14, 21]
    ingredient = 'flour'  # Test with flour
    
    for days in periods:
        print(f"\n📅 Testing {days}-day forecast:")
        
        script_dir = os.path.dirname(os.path.abspath(__file__))
        script_path = os.path.join(script_dir, f'forecast_{ingredient}_price.py')
        start_date = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
        
        try:
            cmd = ['python', script_path, '--days', str(days), '--start-date', start_date]
            result = subprocess.run(cmd, capture_output=True, text=True, cwd=script_dir)
            
            if result.returncode == 0:
                # Load forecast data
                base_dir = os.path.dirname(script_dir)
                forecast_file = os.path.join(base_dir, 'public', f'{ingredient}_price_forecast_data.json')
                
                if os.path.exists(forecast_file):
                    with open(forecast_file, 'r') as f:
                        data = json.load(f)
                    
                    prices = [item['yhat'] for item in data]
                    variation = (max(prices) - min(prices)) / (sum(prices)/len(prices)) * 100
                    
                    print(f"   ✅ Generated {len(data)} days, Variation: {variation:.1f}%")
                    print(f"   📊 Price Range: {min(prices):.2f} - {max(prices):.2f} LKR")
                else:
                    print(f"   ❌ No data file generated")
            else:
                print(f"   ❌ Script failed: {result.stderr[:100]}")
                
        except Exception as e:
            print(f"   ❌ Error: {str(e)[:100]}")

if __name__ == "__main__":
    print("🚀 Enhanced Ingredient Price Forecasting Test Suite")
    print("="*60)
    
    # Test basic variation
    test_results = test_forecast_variation()
    
    # Test different time periods
    test_different_time_periods()
    
    print("\n🎯 Test Complete!")
    print("If variations are still too low, consider:")
    print("  • Increasing changepoint_prior_scale in Prophet model")
    print("  • Adding more noise factors in market_factor generation")
    print("  • Adjusting seasonality parameters")
    print("  • Using real historical data with more variation")