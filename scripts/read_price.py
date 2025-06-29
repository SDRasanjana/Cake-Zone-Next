import pandas as pd

# Read CSV from data folder
df = pd.read_csv('E:/3y Project/Cake Shop/frontend/data/cake_ingredient_prices_june2025.csv')

# Show the first 5 rows
print(df.head())

# Show basic stats
print("\n--- Summary Statistics ---")
print(df.describe())
