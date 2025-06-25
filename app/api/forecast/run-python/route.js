import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request) {
    try {
        // Get the ingredient from query parameters (default to flour)
        const url = new URL(request.url);
        const ingredient = url.searchParams.get('ingredient') || 'Flour';

        console.log(`Generating forecast for ingredient: ${ingredient}`);

        // Execute the Python script
        const scriptsDir = path.join(process.cwd(), 'scripts');

        // Use the more flexible script for any ingredient
        const scriptPath = path.join(scriptsDir, 'forecast_sugar_price.py');
        const scriptExists = await fs.stat(scriptPath).catch(() => null);

        if (!scriptExists) {
            throw new Error(`Python script not found at ${scriptPath}`);
        }

        // Use a promise to handle the exec callback with improved error handling
        const runScript = new Promise((resolve, reject) => {
            exec(`python "${scriptPath}" "${ingredient}"`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error executing script: ${error.message}`);
                    return reject(new Error(`Failed to execute Python script: ${error.message}`));
                }
                if (stderr && stderr.trim() !== '') {
                    console.warn(`Script warnings: ${stderr}`);
                }
                resolve(stdout);
            });
        });

        const output = await runScript;        // Check if the forecast JSON file exists (using lowercase ingredient name)
        const ingredientLower = ingredient.toLowerCase();
        const forecastDataPath = path.join(process.cwd(), 'public', `${ingredientLower}_price_forecast_data.json`);
        const insightsPath = path.join(process.cwd(), 'public', `${ingredientLower}_price_insights.json`);
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
            message: `${ingredient} price forecast generated successfully`,
            output: output,
            forecastData: forecastData,
            insights: insights,
            ingredient: ingredient,
            forecastImageUrl: `/${ingredientLower}_price_forecast.png`,
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
