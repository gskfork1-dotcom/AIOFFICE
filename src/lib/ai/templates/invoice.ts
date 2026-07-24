import { escapeHtml } from "@/lib/utils"

export interface InvoiceData {
  invoiceNumber: string
  date: string
  dueDate: string
  from: { name: string; address: string; phone: string; email: string }
  to: { name: string; address: string; phone: string }
  items: Array<{ name: string; quantity: number; unitPrice: number; total: number }>
  subtotal: number
  ppnRate: number
  ppnAmount: number
  grandTotal: number
  notes: string
  paymentTerms: string
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function renderInvoiceHTML(data: InvoiceData, logoUrl?: string): string {
  const e = escapeHtml
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${e(data.invoiceNumber)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1a1a; background: #fff; }
    .page { max-width: 800px; margin: 0 auto; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #2563eb; padding-bottom: 24px; margin-bottom: 32px; }
    .logo { max-height: 60px; }
    .invoice-badge { text-align: right; }
    .invoice-title { font-size: 36px; font-weight: 800; color: #2563eb; letter-spacing: -1px; }
    .invoice-meta { margin-top: 8px; font-size: 13px; color: #6b7280; line-height: 1.8; }
    .invoice-meta strong { color: #374151; }
    .parties { display: flex; gap: 40px; margin-bottom: 32px; }
    .party { flex: 1; }
    .party-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; font-weight: 600; margin-bottom: 8px; }
    .party-name { font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 4px; }
    .party-detail { font-size: 13px; color: #6b7280; line-height: 1.7; }
    table { width: 100%; border-collapse: collapse; margin: 24px 0; }
    thead th { background: #f8fafc; text-align: left; padding: 12px 16px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 600; border-bottom: 2px solid #e2e8f0; }
    thead th:nth-child(3), thead th:nth-child(4), thead th:nth-child(5) { text-align: right; }
    tbody td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    tbody td:nth-child(3), tbody td:nth-child(4), tbody td:nth-child(5) { text-align: right; font-variant-numeric: tabular-nums; }
    .totals-section { display: flex; justify-content: flex-end; margin-top: 24px; }
    .totals { width: 320px; }
    .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #475569; }
    .totals-row.grand { border-top: 2px solid #2563eb; margin-top: 8px; padding-top: 12px; font-size: 18px; font-weight: 800; color: #2563eb; }
    .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #e2e8f0; }
    .footer-section { margin-bottom: 16px; }
    .footer-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; font-weight: 600; margin-bottom: 4px; }
    .footer-text { font-size: 13px; color: #475569; line-height: 1.6; }
    @media print {
      .page { padding: 20px; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div>
        ${logoUrl ? `<img src="${escapeHtml(logoUrl)}" class="logo" alt="Logo">` : ""}
      </div>
      <div class="invoice-badge">
        <div class="invoice-title">INVOICE</div>
        <div class="invoice-meta">
          <strong>${e(data.invoiceNumber)}</strong><br>
          Tanggal: ${e(data.date)}<br>
          Jatuh Tempo: ${e(data.dueDate)}
        </div>
      </div>
    </div>

    <div class="parties">
      <div class="party">
        <div class="party-label">Dari</div>
        <div class="party-name">${e(data.from.name)}</div>
        <div class="party-detail">
          ${e(data.from.address)}<br>
          ${e(data.from.phone)}<br>
          ${e(data.from.email)}
        </div>
      </div>
      <div class="party">
        <div class="party-label">Kepada</div>
        <div class="party-name">${e(data.to.name)}</div>
        <div class="party-detail">
          ${e(data.to.address || "-")}<br>
          ${e(data.to.phone || "-")}
        </div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>No</th>
          <th>Item</th>
          <th>Qty</th>
          <th>Harga Satuan</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${data.items
          .map(
            (item, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${e(item.name)}</td>
          <td>${item.quantity}</td>
          <td>${formatCurrency(item.unitPrice)}</td>
          <td>${formatCurrency(item.total)}</td>
        </tr>`
          )
          .join("")}
      </tbody>
    </table>

    <div class="totals-section">
      <div class="totals">
        <div class="totals-row">
          <span>Subtotal</span>
          <span>${formatCurrency(data.subtotal)}</span>
        </div>
        <div class="totals-row">
          <span>PPN (${data.ppnRate}%)</span>
          <span>${formatCurrency(data.ppnAmount)}</span>
        </div>
        <div class="totals-row grand">
          <span>Grand Total</span>
          <span>${formatCurrency(data.grandTotal)}</span>
        </div>
      </div>
    </div>

    <div class="footer">
      ${data.notes ? `
      <div class="footer-section">
        <div class="footer-label">Catatan</div>
        <div class="footer-text">${e(data.notes)}</div>
      </div>` : ""}
      ${data.paymentTerms ? `
      <div class="footer-section">
        <div class="footer-label">Syarat Pembayaran</div>
        <div class="footer-text">${e(data.paymentTerms)}</div>
      </div>` : ""}
    </div>
  </div>
</body>
</html>`
}
