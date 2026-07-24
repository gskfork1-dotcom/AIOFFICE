import { escapeHtml } from "@/lib/utils";

export interface POData {
  poNumber: string;
  date: string;
  deliveryDate: string;
  from: { name: string; address: string; phone: string };
  vendor: { name: string; address: string; phone: string };
  items: Array<{ name: string; quantity: number; unit: string; unitPrice: number; total: number }>;
  subtotal: number;
  tax: number;
  grandTotal: number;
  paymentTerms: string;
  deliveryTerms: string;
  notes: string;
  approver: { name: string; position: string };
}

function fmt(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

export function renderPurchaseOrderHTML(data: POData, logoUrl?: string): string {
  const e = escapeHtml;
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>Purchase Order</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Inter',sans-serif;background:#f1f5f9;padding:40px;color:#1e293b}
    .page{max-width:800px;margin:0 auto;background:#fff;padding:48px 56px;box-shadow:0 1px 3px rgba(0,0,0,.08)}
    .header{display:flex;align-items:center;gap:16px;padding-bottom:16px;border-bottom:3px solid #2563eb;margin-bottom:24px}
    .logo{width:56px;height:56px;object-fit:contain}
    .title{font-size:22px;font-weight:700;color:#2563eb}
    .subtitle{font-size:11px;color:#94a3b8;letter-spacing:1px}
    .meta{display:flex;justify-content:space-between;margin-bottom:24px;font-size:13px;color:#475569}
    .meta strong{color:#1e293b}
    .addresses{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px}
    .addr-label{font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px}
    .addr-content{font-size:13px;line-height:1.6}
    .addr-content strong{color:#1e293b}
    table{width:100%;border-collapse:collapse;margin:16px 0;font-size:13px}
    thead{background:#f1f5f9}
    th{padding:10px 12px;text-align:left;font-weight:600;color:#475569;border-bottom:2px solid #e2e8f0}
    td{padding:10px 12px;border-bottom:1px solid #f1f5f9}
    .text-right{text-align:right}
    .totals{display:flex;justify-content:flex-end;margin-top:16px}
    .totals-box{width:280px;font-size:13px}
    .totals-row{display:flex;justify-content:space-between;padding:6px 0;color:#475569}
    .totals-row.total{border-top:2px solid #2563eb;font-weight:700;font-size:15px;color:#2563eb;padding-top:8px}
    .section{margin-top:20px;font-size:13px}
    .section-title{font-weight:600;color:#475569;margin-bottom:6px}
    .section p{color:#334155;line-height:1.6}
    .signature{display:flex;justify-content:flex-end;margin-top:40px}
    .sig-box{text-align:center;width:200px}
    .sig-name{font-weight:700;text-decoration:underline;margin-top:40px}
    .sig-pos{font-size:12px;color:#64748b;margin-top:2px}
    .footer{margin-top:32px;padding-top:12px;border-top:2px solid #2563eb;text-align:center;font-size:10px;color:#94a3b8}
    @media print{body{background:#fff;padding:0}.page{box-shadow:none;padding:0;max-width:none}}
    @page{size:A4;margin:20mm}
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      ${logoUrl ? `<img src="${e(logoUrl)}" alt="Logo" class="logo" />` : ""}
      <div>
        <div class="title">Purchase Order</div>
        <div class="subtitle">ORDER CONFIRMATION</div>
      </div>
    </div>

    <div class="meta">
      <div><strong>No:</strong> ${e(data.poNumber)}</div>
      <div><strong>Tanggal:</strong> ${e(data.date)}</div>
      <div><strong>Pengiriman:</strong> ${e(data.deliveryDate)}</div>
    </div>

    <div class="addresses">
      <div>
        <div class="addr-label">Dari</div>
        <div class="addr-content">
          <strong>${e(data.from.name)}</strong><br/>
          ${e(data.from.address)}<br/>
          ${e(data.from.phone)}
        </div>
      </div>
      <div>
        <div class="addr-label">Vendor</div>
        <div class="addr-content">
          <strong>${e(data.vendor.name)}</strong><br/>
          ${e(data.vendor.address)}<br/>
          ${e(data.vendor.phone)}
        </div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>No</th>
          <th>Item</th>
          <th class="text-right">Qty</th>
          <th>Satuan</th>
          <th class="text-right">Harga</th>
          <th class="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${data.items.map((item, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${e(item.name)}</td>
          <td class="text-right">${item.quantity}</td>
          <td>${e(item.unit || "pcs")}</td>
          <td class="text-right">${fmt(item.unitPrice)}</td>
          <td class="text-right">${fmt(item.total)}</td>
        </tr>`).join("")}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-box">
        <div class="totals-row"><span>Subtotal</span><span>${fmt(data.subtotal)}</span></div>
        <div class="totals-row"><span>Pajak</span><span>${fmt(data.tax)}</span></div>
        <div class="totals-row total"><span>Grand Total</span><span>${fmt(data.grandTotal)}</span></div>
      </div>
    </div>

    <div class="section"><div class="section-title">Syarat Pembayaran</div><p>${e(data.paymentTerms)}</p></div>
    <div class="section"><div class="section-title">Syarat Pengiriman</div><p>${e(data.deliveryTerms)}</p></div>
    ${data.notes ? `<div class="section"><div class="section-title">Catatan</div><p>${e(data.notes)}</p></div>` : ""}

    <div class="signature">
      <div class="sig-box">
        <p class="sig-name">${e(data.approver.name)}</p>
        <p class="sig-pos">${e(data.approver.position)}</p>
      </div>
    </div>

    <div class="footer">Dokumen ini merupakan purchase order yang sah</div>
  </div>
</body>
</html>`;
}
