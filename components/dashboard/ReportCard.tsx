import React from "react";

interface ReportCardProps {
  title: string;
  summary: string;
  onDownload: () => void;
  onView: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ title, summary, onDownload, onView }) => (
  <div className="bg-white rounded shadow p-4 mb-6">
    <h2 className="text-lg font-semibold mb-2 text-gray-800">{title}</h2>
    <pre className="whitespace-pre-wrap text-gray-700 mb-4 font-mono text-base">{summary}</pre>
    <div className="flex gap-4">
      <button onClick={onDownload} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold shadow">Download PDF</button>
      <button onClick={onView} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold shadow">View PDF</button>
    </div>
  </div>
);

export default ReportCard;