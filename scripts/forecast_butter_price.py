
import pandas as pd
from prophet import Prophet
import matplotlib.pyplot as plt

# Load CSV file
df = pd.read_csv('../data/cake_ingredient_prices_june2025.csv')

# Filter for 'Butter'
data_df = df[df['Ingredient'] == 'Butter'][['Date', 'Price_LKR']]

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
plt.title("Butter Price Forecast - Next 7 Days")
plt.xlabel("Date")
plt.ylabel("Price (LKR)")
plt.tight_layout()
plt.show()
