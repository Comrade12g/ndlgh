import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

type InvoicePdfPackage = {
  trackingCode: string;
  externalTracking: string | null;
  description: string | null;
  weightKg: number | null;
  cbm: number | null;
  pieces: number | null;
  notes: string | null;
};

type InvoicePdfData = {
  number: string;
  currency: string;
  subtotal: number;
  tax: number;
  total: number;
  amountPaid: number;
  status: string;
  issueDate: string;
  dueDate: string | null;
  notes: string | null;
  customer: { fullName: string | null; phone: string | null; shippingMark: string | null };
  items: {
    description: string;
    qty: number;
    unitPrice: number;
    amount: number;
    package?: InvoicePdfPackage | null;
  }[];
  payments: { date: string; method: string; amount: number; reference: string | null }[];
};


const BRAND_NAVY = "#1A1A2E";
const BRAND_ORANGE = "#F97316";

/** Builds the invoice PDF and triggers a browser download. Returns the generated filename. */
export function downloadInvoicePdf(data: InvoicePdfData): string {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(BRAND_NAVY);
  doc.setFont("helvetica", "bold");
  doc.text("NDL Global Shipping", margin, 50);

  doc.setFontSize(11);
  doc.setTextColor(BRAND_ORANGE);
  doc.text("INVOICE", pageWidth - margin, 50, { align: "right" });
  doc.setTextColor("#666666");
  doc.setFont("helvetica", "normal");
  doc.text(data.number, pageWidth - margin, 66, { align: "right" });

  // Customer + dates block
  doc.setFontSize(10);
  doc.setTextColor(BRAND_NAVY);
  doc.setFont("helvetica", "bold");
  doc.text("Billed to", margin, 100);
  doc.setFont("helvetica", "normal");
  doc.setTextColor("#333333");
  doc.text(data.customer.fullName ?? "Customer", margin, 116);
  if (data.customer.shippingMark)
    doc.text(`Shipping mark: ${data.customer.shippingMark}`, margin, 130);
  if (data.customer.phone)
    doc.text(data.customer.phone, margin, data.customer.shippingMark ? 144 : 130);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(BRAND_NAVY);
  doc.text("Issued", pageWidth - margin - 120, 100);
  doc.setFont("helvetica", "normal");
  doc.setTextColor("#333333");
  doc.text(data.issueDate, pageWidth - margin - 120, 116);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(BRAND_NAVY);
  doc.text("Due", pageWidth - margin - 120, 132);
  doc.setFont("helvetica", "normal");
  doc.setTextColor("#333333");
  doc.text(data.dueDate ?? "—", pageWidth - margin - 120, 148);

  // Line items table
  autoTable(doc, {
    startY: 170,
    margin: { left: margin, right: margin },
    head: [["Description", "Qty", "Unit price", "Amount"]],
    body: data.items.map((i) => [
      i.description,
      i.qty.toString(),
      `${data.currency} ${i.unitPrice.toFixed(2)}`,
      `${data.currency} ${i.amount.toFixed(2)}`,
    ]),
    headStyles: { fillColor: [26, 26, 46], textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 6 },
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" } },
  });

  // Totals block
  const afterTable =
    (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20;
  const totalsX = pageWidth - margin - 180;
  doc.setFontSize(10);
  doc.setTextColor("#333333");
  doc.text("Subtotal", totalsX, afterTable);
  doc.text(`${data.currency} ${data.subtotal.toFixed(2)}`, pageWidth - margin, afterTable, {
    align: "right",
  });
  doc.text("Tax", totalsX, afterTable + 16);
  doc.text(`${data.currency} ${data.tax.toFixed(2)}`, pageWidth - margin, afterTable + 16, {
    align: "right",
  });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(BRAND_NAVY);
  doc.text("Total", totalsX, afterTable + 36);
  doc.text(`${data.currency} ${data.total.toFixed(2)}`, pageWidth - margin, afterTable + 36, {
    align: "right",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor("#059669");
  doc.text("Paid", totalsX, afterTable + 54);
  doc.text(`${data.currency} ${data.amountPaid.toFixed(2)}`, pageWidth - margin, afterTable + 54, {
    align: "right",
  });
  const outstanding = data.total - data.amountPaid;
  doc.setTextColor(outstanding > 0 ? BRAND_ORANGE : "#059669");
  doc.setFont("helvetica", "bold");
  doc.text("Balance due", totalsX, afterTable + 70);
  doc.text(`${data.currency} ${outstanding.toFixed(2)}`, pageWidth - margin, afterTable + 70, {
    align: "right",
  });

  let cursorY = afterTable + 100;

  // Payment history
  if (data.payments.length) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(BRAND_NAVY);
    doc.text("Payment history", margin, cursorY);
    autoTable(doc, {
      startY: cursorY + 10,
      margin: { left: margin, right: margin },
      head: [["Date", "Method", "Reference", "Amount"]],
      body: data.payments.map((p) => [
        p.date,
        p.method.replace("_", " "),
        p.reference ?? "—",
        `${data.currency} ${p.amount.toFixed(2)}`,
      ]),
      headStyles: { fillColor: [240, 240, 240], textColor: [26, 26, 46], fontStyle: "bold" },
      styles: { fontSize: 9, cellPadding: 5 },
      columnStyles: { 3: { halign: "right" } },
    });
    cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24;
  }

  if (data.notes) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(BRAND_NAVY);
    doc.text("Notes", margin, cursorY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor("#333333");
    const wrapped = doc.splitTextToSize(data.notes, pageWidth - margin * 2);
    doc.text(wrapped, margin, cursorY + 16);
  }

  const filename = `${data.number}.pdf`;
  doc.save(filename);
  return filename;
}
