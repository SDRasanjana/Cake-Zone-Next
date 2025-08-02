import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request) {
    try {
        // Get parameters from query string
        const { searchParams } = new URL(request.url);
        const ingredient = searchParams.get('ingredient') || 'flour';
        const startDate = searchParams.get('startDate'); // Optional: YYYY-MM-DD format
        const days = parseInt(searchParams.get('days') || '7'); // Default 7 days

        // Validate ingredient parameter
        const validIngredients = ['flour', 'sugar', 'eggs', 'butter'];
        if (!validIngredients.includes(ingredient)) {
            return NextResponse.json({
                success: false,
                error: `Invalid ingredient. Must be one of: ${validIngredients.join(', ')}`,
                timestamp: new Date().toISOString()
            }, { status: 400 });
        }

        // Validate days parameter
        if (days < 1 || days > 30) {
            return NextResponse.json({
                success: false,
                error: 'Days must be between 1 and 30',
                timestamp: new Date().toISOString()
            }, { status: 400 });
        }

        // Validate start date if provided
        if (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
            return NextResponse.json({
                success: false,
                error: 'Start date must be in YYYY-MM-DD format',
                timestamp: new Date().toISOString()
            }, { status: 400 });
        }

        // Execute the Python script for the specified ingredient
        const scriptsDir = path.join(process.cwd(), 'scripts');
        const scriptPath = path.join(scriptsDir, `forecast_${ingredient}_price.py`);
        const scriptExists = await fs.stat(scriptPath).catch(() => null);

        if (!scriptExists) {
            throw new Error(`Python script not found at ${scriptPath}`);
        }

        // Build command with optional parameters
        let command = `python "${scriptPath}" --days ${days}`;
        if (startDate) {
            command += ` --start-date ${startDate}`;
        }

        // Use a promise to handle the exec callback with improved error handling
        const runScript = new Promise((resolve, reject) => {
            // Set the working directory to the scripts directory
            const options = {
                cwd: scriptsDir
            };

            console.log(`Executing command: ${command}`);
            exec(command, options, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error executing script: ${error.message}`);
                    console.error(`Script path: ${scriptPath}`);
                    console.error(`Working directory: ${scriptsDir}`);
                    console.error(`Command: ${command}`);
                    return reject(new Error(`Failed to execute Python script: ${error.message}`));
                }
                if (stderr && stderr.trim() !== '') {
                    console.warn(`Script warnings: ${stderr}`);
                }
                resolve(stdout);
            });
        });

        const output = await runScript;

        // Check if the forecast JSON file exists for the specific ingredient
        const forecastDataPath = path.join(process.cwd(), 'public', `${ingredient}_price_forecast_data.json`);
        const insightsPath = path.join(process.cwd(), 'public', `${ingredient}_price_insights.json`);
        let forecastData = null;
        let insights = null;
        // Read forecast data and insights with improved error handling
        try {
            // Check if file exists before reading
            const forecastDataStats = await fs.stat(forecastDataPath).catch(() => null);
            if (forecastDataStats) {
                const rawData = await fs.readFile(forecastDataPath, 'utf8');
                try {
                    forecastData = JSON.parse(rawData);
                } catch (parseError) {
                    console.error(`Error parsing forecast JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
                }
            }

            // Try to read insights if available
            const insightsStats = await fs.stat(insightsPath).catch(() => null);
            if (insightsStats) {
                const insightsData = await fs.readFile(insightsPath, 'utf8');
                try {
                    insights = JSON.parse(insightsData);
                } catch (parseError) {
                    console.error(`Error parsing insights JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
                }
            }
        } catch (fileError) {
            console.error(`Error accessing forecast files: ${fileError instanceof Error ? fileError.message : 'Unknown error'}`);
        }        // Check if we have meaningful forecast data before claiming success
        if (!forecastData && !insights) {
            return NextResponse.json({
                success: false,
                message: 'Script executed but no forecast data was generated',
                output: output,
                timestamp: new Date().toISOString()
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: `${ingredient.charAt(0).toUpperCase() + ingredient.slice(1)} forecast generated successfully`,
            output: output,
            forecastData: forecastData,
            insights: insights,
            forecastImageUrl: `/${ingredient}_price_forecast.png`,
            ingredient: ingredient,
            parameters: {
                startDate: startDate || new Date().toISOString().split('T')[0],
                days: days,
                actualStartDate: insights?.forecast_period?.start_date || null,
                endDate: insights?.forecast_period?.end_date || null
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error in route handler: ${errorMessage}`);
        return NextResponse.json(
            {
                success: false,
                error: errorMessage,
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}
