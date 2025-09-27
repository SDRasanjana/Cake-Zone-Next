# Cake Shop Price Forecasting Requirements

## Python Dependencies Required

Run the following command to install the required Python packages:

```bash
pip install prophet pandas numpy matplotlib scikit-learn
```

Or if using conda:
```bash
conda install -c conda-forge prophet pandas numpy matplotlib scikit-learn
```

## Alternative Installation (if Prophet installation fails)

If you encounter issues installing Prophet, try:

```bash
# For Windows
pip install pystan==2.19.1.1
pip install prophet

# For macOS/Linux  
pip install prophet

# Using conda (recommended)
conda install -c conda-forge prophet
```

## Verify Installation

Test the installation by running:
```bash
python -c "import prophet; import pandas; import numpy; print('All dependencies installed successfully!')"
```

## Usage

Test the price forecasting script:
```bash
python scripts/forecast_ingredient_price.py --ingredient butter --days 7 --output-format json
```

## Troubleshooting

1. **Prophet installation issues**: Use conda instead of pip
2. **Permission errors**: Run terminal as administrator (Windows) or use sudo (macOS/Linux)
3. **Path issues**: Ensure you're running commands from the project root directory
4. **Python version**: Prophet requires Python 3.7+

## API Endpoints

- `GET /api/forecast/[ingredient]?days=7` - Single ingredient forecast
- `POST /api/forecast/recipe` - Complete recipe cost forecast

Example recipe request:
```json
{
  "recipeData": {
    "name": "Chocolate Cake",
    "ingredients": [
      {"name": "butter", "quantity": 0.25},
      {"name": "flour", "quantity": 0.3},
      {"name": "sugar", "quantity": 0.2},
      {"name": "cocoa", "quantity": 0.1}
    ]
  },
  "days": 7
}
```