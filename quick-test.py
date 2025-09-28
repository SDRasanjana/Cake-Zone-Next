#!/usr/bin/env python3
"""
Quick test script to verify forecasting improvements work
"""

import subprocess
import json
import os
from datetime import datetime, timedelta

def test_single_forecast(ingredient='flour', days=7):
    """Test a single ingredient forecast for variations"""
    print(f"🧪 Testing {ingredient} forecasting for {days} days...")
    
    # Get paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    script_path = os.path.join(script_dir, 'scripts', f'forecast_{ingredient}_price.py')
    
    if not os.path.exists(script_path):
        print(f"❌ Script not found: {script_path}")
        return False
    
    try:
        # Run forecast
        start_date = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
        cmd = ['python', script_path, '--days', str(days), '--start-date', start_date]
        
        result = subprocess.run(cmd, capture_output=True, text=True, cwd=script_dir)
        
        if result.returncode != 0:
            print(f"❌ Script failed: {result.stderr}")
            return False
        
        # Check output
        public_dir = os.path.join(script_dir, 'public')
        forecast_file = os.path.join(public_dir, f'{ingredient}_price_forecast_data.json')
        
        if not os.path.exists(forecast_file):
            print(f"❌ No forecast file generated")
            return False
        
        # Load and analyze data
        with open(forecast_file, 'r') as f:
            data = json.load(f)
        
        if len(data) < days:
            print(f"❌ Expected {days} days, got {len(data)}")
            return False
        
        # Check for price variation
        prices = [item['yhat'] for item in data]
        price_range = max(prices) - min(prices)
        avg_price = sum(prices) / len(prices)
        variation_pct = (price_range / avg_price) * 100
        
        print(f"✅ Generated {len(data)} forecasts")
        print(f"📊 Price range: {min(prices):.2f} - {max(prices):.2f} LKR")
        print(f"📈 Variation: {variation_pct:.1f}%")
        
        # Check if variation is meaningful (at least 1%)
        if variation_pct >= 1.0:
            print(f"🎉 Good variation detected - prices change day to day!")
            return True
        else:
            print(f"⚠️ Low variation - might need more tuning")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Quick Forecasting Test")
    print("="*40)
    
    # Test flour forecasting (enhanced)
    success = test_single_forecast('flour', 5)
    
    if success:
        print("\n🎯 Forecasting improvements appear to be working!")
        print("✨ Try running the full test suite with: python test-forecasting.py")
    else:
        print("\n⚠️ There might be issues with the forecasting system.")
        print("💡 Check the script output above for details.")