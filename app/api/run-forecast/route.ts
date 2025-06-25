import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execPromise = promisify(exec);

export async function GET() {
  try {
    // Get the path to the Python script
    const scriptPath = path.join(
      process.cwd(),
      "scripts",
      "forecast_flour_price.py"
    );

    // Run the Python script
    const { stdout, stderr } = await execPromise(`python ${scriptPath}`);

    if (stderr) {
      console.error("Error running forecast script:", stderr);
      return NextResponse.json({ error: stderr }, { status: 500 });
    }

    return NextResponse.json({ success: true, output: stdout });
  } catch (error) {
    console.error("Error running forecast script:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
