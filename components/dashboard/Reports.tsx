import { useState } from "react";
import dynamic from "next/dynamic";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export default function Reports() {
  const [activeCard, setActiveCard] = useState<"orders" | "expenses" | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [defaultLayout, setDefaultLayout] = useState<any>(null);
  const [Viewer, setViewer] = useState<any>(null);
  const [Worker, setWorker] = useState<any>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);

  // Dummy data for demonstration; replace with real API calls as needed
  const orderSummary = `Order Summary\nTotal Orders: 12\nTotal Amount: Rs. 10,000`;
  const expensesSummary = `Expenses Summary\nTotal Expenses: Rs. 4,500`;

  // Helper to generate dummy PDF as Blob
  const generateDummyPdfBlob = async (type: "orders" | "expenses") => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]); // Increased page height
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12; // Reduced font size
    let title = type === "orders" ? "Orders Report" : "Expenses Report";
    let headers, rows;
    
    if (type === "orders") {
      headers = ["Order ID", "Date", "Customer", "Amount (Rs.)"];
      rows = [
        ["ORD001", "2025-06-27", "John Doe", "2,000"],
        ["ORD002", "2025-06-27", "Jane Smith", "1,500"],
        ["ORD003", "2025-06-27", "Alice Lee", "1,200"],
        ["ORD004", "2025-06-26", "Bob Wilson", "2,300"],
        ["ORD005", "2025-06-26", "Carol Brown", "1,800"],
        ["ORD006", "2025-06-26", "David Clark", "900"],
      ];
    } else {
      headers = ["Expense ID", "Date", "Category", "Amount (Rs.)"];
      rows = [
        ["EXP001", "2025-06-27", "Ingredients", "500"],
        ["EXP002", "2025-06-27", "Utilities", "300"],
        ["EXP003", "2025-06-27", "Packaging", "700"],
        ["EXP004", "2025-06-26", "Equipment", "1,500"],
        ["EXP005", "2025-06-26", "Labor", "2,000"],
        ["EXP006", "2025-06-26", "Marketing", "800"],
      ];
    }

    // Document Title
    page.drawText(title, {
      x: 50,
      y: 750,
      size: 24,
      font,
      color: rgb(0.2, 0.2, 0.2)
    });

    // Date
    page.drawText(`Generated on: ${new Date().toLocaleDateString()}`, {
      x: 50,
      y: 720,
      size: 12,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.4)
    });

    // Table Constants
    const startY = 680;
    const rowHeight = 30;
    const colWidths = [120, 120, 160, 100];
    const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);
    const startX = 50;
    
    // Draw table border
    page.drawRectangle({
      x: startX,
      y: startY - (rows.length + 1) * rowHeight,
      width: tableWidth,
      height: (rows.length + 1) * rowHeight,
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 1,
    });

    // Draw header
    page.drawRectangle({
      x: startX,
      y: startY - rowHeight,
      width: tableWidth,
      height: rowHeight,
      color: rgb(0.95, 0.6, 0.2)
    });

    // Draw headers
    let currentX = startX + 10;
    headers.forEach((header, i) => {
      page.drawText(header, {
        x: currentX,
        y: startY - rowHeight/2,
        size: fontSize,
        font,
        color: rgb(1, 1, 1)
      });
      currentX += colWidths[i];
    });

    // Draw rows
    rows.forEach((row, rowIndex) => {
      const y = startY - (rowIndex + 2) * rowHeight;
      
      // Alternate row background
      if (rowIndex % 2 === 0) {
        page.drawRectangle({
          x: startX,
          y: y,
          width: tableWidth,
          height: rowHeight,
          color: rgb(0.98, 0.98, 0.98)
        });
      }

      // Draw vertical lines
      let lineX = startX;
      colWidths.forEach(width => {
        page.drawLine({
          start: { x: lineX, y: startY - rowHeight },
          end: { x: lineX, y: startY - (rows.length + 1) * rowHeight },
          thickness: 1,
          color: rgb(0.8, 0.8, 0.8)
        });
        lineX += width;
      });

      // Draw cell content
      let x = startX + 10;
      row.forEach((cell, colIndex) => {
        page.drawText(cell, {
          x,
          y: y + rowHeight/3,
          size: fontSize,
          font: fontRegular,
          color: rgb(0.2, 0.2, 0.2)
        });
        x += colWidths[colIndex];
      });
    });

    // Draw summary section
    const summaryY = startY - (rows.length + 2) * rowHeight;
    const totalAmount = rows.reduce((sum, row) => sum + parseInt(row[3].replace(/,/g, '')), 0);
    
    page.drawText("Summary", {
      x: startX,
      y: summaryY,
      size: 14,
      font,
      color: rgb(0.2, 0.2, 0.2)
    });

    page.drawText(`Total ${type === "orders" ? "Orders" : "Expenses"}: ${rows.length}`, {
      x: startX,
      y: summaryY - 25,
      size: 12,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2)
    });

    page.drawText(`Total Amount: Rs. ${totalAmount.toLocaleString()}`, {
      x: startX,
      y: summaryY - 45,
      size: 12,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2)
    });

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: "application/pdf" });
  };

  // Helper to generate dummy PDF as Blob URL (for viewing)
  const generateDummyPdfUrl = async (type: "orders" | "expenses") => {
    const blob = await generateDummyPdfBlob(type);
    return URL.createObjectURL(blob);
  };

  // Download handler using dummy PDF
  const handleOrderDownload = async () => {
    const blob = await generateDummyPdfBlob("orders");
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders-report.pdf";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };
  const handleExpensesDownload = async () => {
    const blob = await generateDummyPdfBlob("expenses");
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "expenses-report.pdf";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };
  const handleOrderView = async () => {
    const url = await generateDummyPdfUrl("orders");
    window.open(url, "_blank");
    // Optionally, you can revoke the URL after a delay
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };
  const handleExpensesView = async () => {
    const url = await generateDummyPdfUrl("expenses");
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const fetchAndShowPdf = async (type: "orders" | "expenses") => {
    setLoadingPdf(true);
    // Use dummy PDF generator instead of fetch
    const url = await generateDummyPdfUrl(type);
    // Dynamically import PDF viewer only on client
    let ViewerComp = null;
    let WorkerComp = null;
    let layoutPlugin = null;
    if (typeof window !== "undefined") {
      const mod = await import("@react-pdf-viewer/core");
      const layoutMod = await import("@react-pdf-viewer/default-layout");
      // @ts-ignore
      await import("@react-pdf-viewer/core/lib/styles/index.css");
      // @ts-ignore
      await import("@react-pdf-viewer/default-layout/lib/styles/index.css");
      ViewerComp = mod.Viewer;
      WorkerComp = mod.Worker;
      layoutPlugin = layoutMod.defaultLayoutPlugin();
    }
    setPdfUrl(url);
    setViewer(() => ViewerComp);
    setWorker(() => WorkerComp);
    setDefaultLayout(() => layoutPlugin);
    setShowModal(true);
    setLoadingPdf(false);
  };

  const closeModal = () => {
    setShowModal(false);
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
    setViewer(null);
    setWorker(null);
    setDefaultLayout(null);
  };

  return (
    <div className="space-y-6 font-sans">
      <h2 className="text-2xl font-extrabold text-gray-800">Reports</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div
          className={`bg-white border border-orange-200 rounded-lg shadow p-6 flex items-center space-x-4 transition cursor-pointer ${activeCard === "orders" ? "ring-2 ring-orange-500" : "hover:shadow-lg hover:border-orange-400"}`}
          onClick={() => setActiveCard("orders")}
        >
          <span className="bg-orange-100 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" /></svg>
          </span>
          <div>
            <div className="font-semibold text-gray-800 text-lg">Orders</div>
            <div className="text-sm text-gray-500">View and analyze all orders</div>
          </div>
        </div>
        <div
          className={`bg-white border border-orange-200 rounded-lg shadow p-6 flex items-center space-x-4 transition cursor-pointer ${activeCard === "expenses" ? "ring-2 ring-orange-500" : "hover:shadow-lg hover:border-orange-400"}`}
          onClick={() => setActiveCard("expenses")}
        >
          <span className="bg-orange-100 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 8v8" /></svg>
          </span>
          <div>
            <div className="font-semibold text-gray-800 text-lg">Expenses</div>
            <div className="text-sm text-gray-500">Track and manage expenses</div>
          </div>
        </div>
      </div>
      {/* Show summary and download/view for selected card */}
      {activeCard === "orders" && (
        <div className="bg-white rounded shadow p-4 mb-6">
          <h2 className="text-lg font-semibold mb-2 text-gray-800">Order Summary</h2>
          <pre className="whitespace-pre-wrap text-gray-700 mb-4 font-mono text-base">{orderSummary}</pre>
          <div className="flex gap-4">
            <button onClick={handleOrderDownload} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold shadow">Download Orders PDF</button>
            <button onClick={handleOrderView} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold shadow">View Orders PDF</button>
          </div>
        </div>
      )}
      {activeCard === "expenses" && (
        <div className="bg-white rounded shadow p-4 mb-6">
          <h2 className="text-lg font-semibold mb-2 text-gray-800">Expenses Summary</h2>
          <pre className="whitespace-pre-wrap text-gray-700 mb-4 font-mono text-base">{expensesSummary}</pre>
          <div className="flex gap-4">
            <button onClick={handleExpensesDownload} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold shadow">Download Expenses PDF</button>
            <button onClick={handleExpensesView} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold shadow">View Expenses PDF</button>
          </div>
        </div>
      )}
      {/* PDF Modal - only render on client and when Viewer/Worker loaded */}
      {showModal && pdfUrl && typeof window !== "undefined" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full h-full max-w-none max-h-none flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <span className="font-bold text-lg text-gray-800">PDF Report</span>
              <button onClick={closeModal} className="text-gray-500 hover:text-red-600 text-2xl">&times;</button>
            </div>
            <div className="flex-1 overflow-hidden flex items-center justify-center">
              {loadingPdf || !Viewer || !Worker || !defaultLayout ? (
                <div className="w-full h-full flex items-center justify-center text-gray-600 text-lg">Loading PDF Viewer...</div>
              ) : (
                <div className="w-full h-full">
                  <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                    <Viewer fileUrl={pdfUrl} plugins={[defaultLayout]} />
                  </Worker>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
