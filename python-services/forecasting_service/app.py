import pandas as pd
from flask import Flask, request, jsonify
from prophet import Prophet
import logging

# Configure basic logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = Flask(__name__)

@app.route('/forecast', methods=['POST'])
def forecast_price():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided in request."}), 400

        ingredient_name = data.get('ingredientName')
        historical_data = data.get('historicalData')
        periods = data.get('periods', 4)  # Default to 4 periods if not specified
        freq = data.get('frequency', 'W') # Default to weekly, 'D' for daily, 'MS' for monthly start

        if not ingredient_name:
            return jsonify({"error": "Missing 'ingredientName' in request."}), 400
        if not historical_data or not isinstance(historical_data, list):
            return jsonify({"error": "Missing or invalid 'historicalData'. Must be a list."}), 400
        if not isinstance(periods, int) or periods <= 0:
            return jsonify({"error": "'periods' must be a positive integer."}), 400
        if freq not in ['D', 'W', 'MS']:
            return jsonify({"error": "'frequency' must be one of 'D', 'W', 'MS'."}), 400


        if len(historical_data) < 2:
            return jsonify({"error": "Insufficient historical data. Prophet requires at least 2 data points."}), 400

        # Prepare DataFrame for Prophet
        try:
            df = pd.DataFrame(historical_data)
            if 'date' not in df.columns or 'price' not in df.columns:
                 return jsonify({"error": "Historical data points must contain 'date' and 'price' keys."}), 400

            df = df.rename(columns={'date': 'ds', 'price': 'y'})
            df['ds'] = pd.to_datetime(df['ds'])
            df = df[['ds', 'y']] # Ensure correct column order and no extra cols
        except Exception as e:
            logging.error(f"Error preparing DataFrame: {e}")
            return jsonify({"error": f"Error processing historical data: {str(e)}"}), 400

        # Initialize and fit Prophet model
        # Consider allowing more Prophet params to be passed if needed for tuning
        model = Prophet(
            weekly_seasonality=True if freq in ['D', 'W'] else False, # Enable if daily/weekly
            yearly_seasonality=True if freq in ['W', 'MS'] else False, # Enable if weekly/monthly (if enough data)
            daily_seasonality=False # Typically off unless specific daily patterns and sub-daily data
        )

        # Add monthly seasonality if frequency is daily or weekly and data spans more than a month
        if freq in ['D', 'W'] and (df['ds'].max() - df['ds'].min()).days > 60 : # data spans more than 2 months
             model.add_seasonality(name='monthly', period=30.5, fourier_order=5)


        try:
            model.fit(df)
        except Exception as e:
            logging.error(f"Error fitting Prophet model: {e}")
            # This can happen with very little data or certain data patterns
            return jsonify({"error": f"Error training forecasting model: {str(e)}"}), 500


        # Create future dates DataFrame
        future_df = model.make_future_dataframe(periods=periods, freq=freq)

        # Make predictions
        forecast_df = model.predict(future_df)

        # Extract relevant columns for the response (only future predictions)
        # The forecast_df contains historical data + future predictions.
        # We only want to return the future part.
        future_predictions_df = forecast_df[forecast_df['ds'] > df['ds'].max()]

        response_forecast = []
        for _, row in future_predictions_df.iterrows():
            response_forecast.append({
                "date": row['ds'].isoformat(),
                "predictedPrice": round(row['yhat'], 2),
                "predictedPriceLower": round(row['yhat_lower'], 2),
                "predictedPriceUpper": round(row['yhat_upper'], 2)
            })

        logging.info(f"Successfully generated forecast for {ingredient_name} with {periods} {freq} periods.")
        return jsonify({
            "ingredientName": ingredient_name,
            "forecast": response_forecast
        }), 200

    except Exception as e:
        logging.error(f"Unhandled error in /forecast endpoint: {e}", exc_info=True)
        return jsonify({"error": f"An unexpected server error occurred: {str(e)}"}), 500

if __name__ == '__main__':
    # Note: For production, use a WSGI server like Gunicorn or Waitress
    # For development: Flask's built-in server is fine.
    # Port 5001 is chosen to avoid conflict with Next.js default (3000) or other common services.
    app.run(host='0.0.0.0', port=5001, debug=True)
