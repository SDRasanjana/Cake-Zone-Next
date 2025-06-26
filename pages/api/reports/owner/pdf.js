import { NextApiRequest, NextApiResponse } from 'next';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export default async function handler(req, res) {
  const { type } = req.query;

  // Dummy data for demonstration
  let title = '';
  let summary = '';
  if (type === 'orders') {
    title = 'Order Report';
    summary = 'Order Summary\nTotal Orders: 12\nTotal Amount: Rs. 10,000';
  } else if (type === 'expenses') {
    title = 'Expenses Report';
    summary = 'Expenses Summary\nTotal Expenses: Rs. 4,500';
  } else {
    res.status(400).send('Invalid report type');
    return;
  }

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  page.drawText(title, { x: 50, y: 350, size: 24, font, color: rgb(0.2,0.2,0.2) });
  page.drawText(summary, { x: 50, y: 300, size: 16, font, color: rgb(0,0,0) });

  const pdfBytes = await pdfDoc.save();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${type}-report.pdf"`);
  res.send(Buffer.from(pdfBytes));
}
