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
    const page = pdfDoc.addPage([400, 300]);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontSize = 18;
    let text = "";
    if (type === "orders") {
      text = "Order Summary\nTotal Orders: 12\nTotal Amount: Rs. 10,000";
    } else {
      text = "Expenses Summary\nTotal Expenses: Rs. 4,500";
    }
    const lines = text.split("\n");
    lines.forEach((line, i) => {
      page.drawText(line, {
        x: 40,
        y: 250 - i * 40,
        size: fontSize,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
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
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <span className="font-bold text-lg text-gray-800">PDF Report</span>
              <button onClick={closeModal} className="text-gray-500 hover:text-red-600 text-2xl">&times;</button>
            </div>
            <div className="flex-1 overflow-hidden flex items-center justify-center">
              {loadingPdf || !Viewer || !Worker || !defaultLayout ? (
                <div className="w-full h-full flex items-center justify-center text-gray-600 text-lg">Loading PDF Viewer...</div>
              ) : (
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                  <Viewer fileUrl={pdfUrl} plugins={[defaultLayout]} />
                </Worker>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
