import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import clientPromise from '../../../../lib/mongodb';

// Helper function to get date range based on period
function getPeriodRange(period, baseDate) {
    const date = new Date(baseDate);
    let start, end;

    if (period === "daily") {
        start = new Date(date);
        end = new Date(date);
    } else if (period === "weekly") {
        const day = date.getDay();
        start = new Date(date);
        start.setDate(date.getDate() - day);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
    } else {
        start = new Date(date.getFullYear(), date.getMonth(), 1);
        end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
}

export async function GET(request) {
    console.log('PDF API called');

    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const period = searchParams.get('period') || 'daily';
        const selectedDate = searchParams.get('date');

        console.log('Parameters:', { type, period, selectedDate });

        const currentDate = selectedDate || new Date().toISOString().slice(0, 10);

        if (!type || (type !== 'orders' && type !== 'expenses')) {
            console.log('Invalid type parameter:', type);
            return new Response(JSON.stringify({ message: 'Invalid report type. Use "orders" or "expenses"' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log('Connecting to database...');
        const client = await clientPromise;
        const db = client.db('cakezone'); // Specify the database name
        console.log('Database connected successfully to cakezone');

        // Get date range for filtering
        const { start, end } = getPeriodRange(period, currentDate);
        console.log('Date range for filtering:');
        console.log('Start:', start);
        console.log('End:', end);
        console.log('Selected date:', currentDate);
        console.log('Period:', period);

        let data, title, headers, totalAmount;

        if (type === 'orders') {
            console.log('Fetching orders from database...');

            // First, let's check if there are any orders at all
            const allOrders = await db.collection("orders").find({}).limit(5).toArray();
            console.log('Sample orders in database:', allOrders.length > 0 ? allOrders[0] : 'No orders found');

            // Now fetch orders with date filter
            const orders = await db.collection("orders").find({
                createdAt: { $gte: start, $lte: end }
            }).sort({ createdAt: -1 }).toArray();

            console.log(`Found ${orders.length} orders in date range`);
            if (orders.length > 0) {
                console.log('First order:', orders[0]);
            }

            data = orders.map(order => [
                order._id.toString().slice(-8).toUpperCase(),
                new Date(order.createdAt).toLocaleDateString(),
                order.shipping?.fullName || 'N/A',
                `Rs. ${order.total.toLocaleString()}`
            ]);

            title = 'Orders Report';
            headers = ['Order ID', 'Date', 'Customer', 'Amount'];
            totalAmount = orders.reduce((sum, order) => sum + (order.total || 0), 0);

        } else {
            console.log('Fetching expenses from database...');

            // First, let's check if there are any expenses at all
            const expensesCollection = db.collection("expenses");
            const allExpenses = await expensesCollection.find({}).limit(5).toArray();
            console.log('Sample expenses in database:', allExpenses.length > 0 ? allExpenses[0] : 'No expenses found');

            // Now fetch expenses with date filter
            const expenses = await expensesCollection.find({
                $or: [
                    { date: { $gte: start, $lte: end } },
                    { createdAt: { $gte: start, $lte: end } }
                ]
            }).sort({ date: -1, createdAt: -1 }).toArray();

            console.log(`Found ${expenses.length} expenses in date range`);
            if (expenses.length > 0) {
                console.log('First expense:', expenses[0]);
            }

            data = expenses.map(expense => [
                expense._id.toString().slice(-8).toUpperCase(),
                new Date(expense.date || expense.createdAt).toLocaleDateString(),
                expense.category || expense.description || 'General',
                `Rs. ${expense.amount.toLocaleString()}`
            ]);

            title = 'Expenses Report';
            headers = ['Expense ID', 'Date', 'Category', 'Amount'];
            totalAmount = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
        }

        console.log('Starting PDF generation...');

        // Create PDF
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 800]);
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // Document Title
        page.drawText(title, {
            x: 50,
            y: 750,
            size: 24,
            font,
            color: rgb(0.2, 0.2, 0.2),
        });

        // Date and Period Info
        page.drawText(`Generated on: ${new Date().toLocaleDateString()}`, {
            x: 50,
            y: 720,
            size: 12,
            font: fontRegular,
            color: rgb(0.4, 0.4, 0.4),
        });

        page.drawText(`Period: ${period.charAt(0).toUpperCase() + period.slice(1)} (${currentDate})`, {
            x: 50,
            y: 700,
            size: 12,
            font: fontRegular,
            color: rgb(0.4, 0.4, 0.4),
        });

        // Table setup
        const startY = 680;
        const rowHeight = 25;
        const colWidths = [120, 120, 160, 100];
        const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);
        const startX = 50;

        if (data.length === 0) {
            // No data message
            page.drawText(`No ${type} found for the selected period.`, {
                x: startX,
                y: startY - 50,
                size: 16,
                font: fontRegular,
                color: rgb(0.5, 0.5, 0.5),
            });
        } else {
            // Draw table border
            page.drawRectangle({
                x: startX,
                y: startY - (data.length + 1) * rowHeight,
                width: tableWidth,
                height: (data.length + 1) * rowHeight,
                borderColor: rgb(0.8, 0.8, 0.8),
                borderWidth: 1,
            });

            // Draw header background
            page.drawRectangle({
                x: startX,
                y: startY - rowHeight,
                width: tableWidth,
                height: rowHeight,
                color: rgb(0.95, 0.6, 0.2),
            });

            // Draw headers
            let currentX = startX + 10;
            headers.forEach((header, i) => {
                page.drawText(header, {
                    x: currentX,
                    y: startY - rowHeight / 2 - 2,
                    size: 12,
                    font,
                    color: rgb(1, 1, 1),
                });
                currentX += colWidths[i];
            });

            // Draw data rows
            data.forEach((row, rowIndex) => {
                const y = startY - (rowIndex + 2) * rowHeight;

                // Alternate row background
                if (rowIndex % 2 === 0) {
                    page.drawRectangle({
                        x: startX,
                        y: y,
                        width: tableWidth,
                        height: rowHeight,
                        color: rgb(0.98, 0.98, 0.98),
                    });
                }

                // Draw vertical lines
                let lineX = startX;
                colWidths.forEach((width) => {
                    page.drawLine({
                        start: { x: lineX, y: startY - rowHeight },
                        end: { x: lineX, y: startY - (data.length + 1) * rowHeight },
                        thickness: 1,
                        color: rgb(0.8, 0.8, 0.8),
                    });
                    lineX += width;
                });

                // Draw cell content
                let x = startX + 10;
                row.forEach((cell, colIndex) => {
                    page.drawText(cell.toString(), {
                        x,
                        y: y + rowHeight / 3,
                        size: 10,
                        font: fontRegular,
                        color: rgb(0.2, 0.2, 0.2),
                    });
                    x += colWidths[colIndex];
                });
            });

            // Draw summary section
            const summaryY = startY - (data.length + 2) * rowHeight - 20;

            page.drawText("Summary", {
                x: startX,
                y: summaryY,
                size: 14,
                font,
                color: rgb(0.2, 0.2, 0.2),
            });

            page.drawText(`Total ${type === "orders" ? "Orders" : "Expenses"}: ${data.length}`, {
                x: startX,
                y: summaryY - 25,
                size: 12,
                font: fontRegular,
                color: rgb(0.2, 0.2, 0.2),
            });

            page.drawText(`Total Amount: Rs. ${totalAmount.toLocaleString()}`, {
                x: startX,
                y: summaryY - 45,
                size: 12,
                font: fontRegular,
                color: rgb(0.2, 0.2, 0.2),
            });
        }

        const pdfBytes = await pdfDoc.save();
        console.log('PDF generated successfully, size:', pdfBytes.length, 'bytes');

        console.log('Sending PDF response...');

        return new Response(pdfBytes, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${type}-report-${currentDate}.pdf"`,
                'Cache-Control': 'no-cache',
            },
        });

    } catch (error) {
        console.error('Error generating PDF:', error);
        console.error('Error stack:', error.stack);

        return new Response(JSON.stringify({
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
