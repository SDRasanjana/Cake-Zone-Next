#!/usr/bin/env python3
"""
Test script to verify price forecasting setup
Run this to check if all dependencies are installed correctly
"""

import sys
import subprocess

def check_dependency(package_name, import_name=None):
    """Check if a Python package is installed and can be imported"""
    if import_name is None:
        import_name = package_name
    
    try:
        __import__(import_name)
        print(f"✅ {package_name} - OK")
        return True
    except ImportError:
        print(f"❌ {package_name} - MISSING")
        return False

def main():
    print("🔍 Checking Price Forecasting Dependencies...\n")
    
    dependencies = [
        ("pandas", "pandas"),
        ("numpy", "numpy"), 
        ("prophet", "prophet"),
        ("matplotlib", "matplotlib"),
        ("scikit-learn", "sklearn")
    ]
    
    all_good = True
    
    for package, import_name in dependencies:
        if not check_dependency(package, import_name):
            all_good = False
    
    print("\n" + "="*50)
    
    if all_good:
        print("🎉 All dependencies are installed correctly!")
        print("\n🧪 Testing price forecasting script...")
        
        try:
            # Test the forecasting script
            result = subprocess.run([
                sys.executable, 
                "forecast_ingredient_price.py", 
                "--ingredient", "butter", 
                "--days", "3",
                "--output-format", "json"
            ], capture_output=True, text=True, cwd="scripts")
            
            if result.returncode == 0:
                print("✅ Price forecasting script works correctly!")
                print("🎯 Your setup is ready for price forecasting!")
            else:
                print("❌ Price forecasting script failed:")
                print(f"Error: {result.stderr}")
                
        except Exception as e:
            print(f"❌ Error testing script: {e}")
            
    else:
        print("❌ Some dependencies are missing!")
        print("\n📦 To install missing dependencies, run:")
        print("pip install prophet pandas numpy matplotlib scikit-learn")
        print("\nOr using conda:")
        print("conda install -c conda-forge prophet pandas numpy matplotlib scikit-learn")

if __name__ == "__main__":
    main()