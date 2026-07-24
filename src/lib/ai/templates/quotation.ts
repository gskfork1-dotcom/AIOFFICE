import { escapeHtml } from "@/lib/utils"

export interface QuotationData {
  quotationNumber: string
  date: string
  validUntil: string
  from: { name: string; address: string; phone: string; email: string }
  to: { name: string; address: string; phone: string }
  items: Array<{ name: string; description?: string; quantity: number; unitPrice: number; total: number }>
  subtotal: number
  discountRate: number
  discountAmount: number
  totalAfterDiscount: number
  notes: string
  terms: string
}

export function renderQuotationHTML(data: QuotationData, logoUrl?: string): string {
  const fmt = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n)

  const e = escapeHtml

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Penawaran ${e(data.quotationNumber)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1a1a; background: #fff; }
    .page { max-width: 800px; margin: 0 auto; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #059669; padding-bottom: 24px; margin-bottom: 32px; }
    .doc-title { font-size: 36px; font-weight: 800; color: #059669; letter-spacing: -1px; }
    .doc-meta { margin-top: 8px; font-size: 13px; color: #6b7280; line-height: 1.8; }
    .doc-meta strong { color: #374151; }
    .parties { display: flex; gap: 40px; margin-bottom: 32px; }
    .party { flex: 1; }
    .party-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; font-weight: 600; margin-bottom: 8px; }
    .party-name { font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 4px; }
    .party-detail { font-size: 13px; color: #6b7280; line-height: 1.7; }
    table { width: 100%; border-collapse: collapse; margin: 24px 0; }
    thead th { background: #f0fdf4; text-align: left; padding: 12px 16px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #166534; font-weight: 600; border-bottom: 2px solid #bbf7d0; }
    thead th:nth-child(3), thead th:nth-child(4), thead th:nth-child(5) { text-align: right; }
    tbody td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    tbody td:nth-child(3), tbody td:nth-child(4), tbody td:nth-child(5) { text-align: right; font-variant-numeric: tabular-nums; }
    .desc { font-size: 12px; color: #94a3b8; margin-top: 2px; }
    .totals-section { display: flex; justify-content: flex-end; margin-top: 24px; }
    .totals { width: 320px; }
    .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #475569; }
    .totals-row.discount { color: #dc2626; }
    .totals-row.grand { border-top: 2px solid #059669; margin-top: 8px; padding-top: 12px; font-size: 18px; font-weight: 800; color: #059669; }
    .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #e2e8f0; }
    .footer-section { margin-bottom: 16px; }
    .footer-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; font-weight: 600; margin-bottom: 4px; }
    .footer-text { font-size: 13px; color: #475569; line-height: 1.6; }
    @media print { .page { padding: 20px; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div>${logoUrl ? `<img src="${escapeHtml(logoUrl)}" style="max-height:60px" alt="Logo">` : ""}</div>
      <div style="text-align:right">
        <div class="doc-title">PENAWARAN</div>
        <div class="doc-meta">
          <strong>${e(data.quotationNumber)}</strong><br>
          Tanggal: ${e(data.date)}<br>
          Berlaku hingga: ${e(data.validUntil)}
        </div>
      </div>
    </div>

    <div class="parties">
      <div class="party">
        <div class="party-label">Dari</div>
        <div class="party-name">${e(data.from.name)}</div>
        <div class="party-detail">${e(data.from.address)}<br>${e(data.from.phone)}<br>${e(data.from.email)}</div>
      </div>
      <div class="party">
        <div class="party-label">Kepada</div>
        <div class="party-name">${e(data.to.name)}</div>
        <div class="party-detail">${e(data.to.address || "-")}<br>${e(data.to.phone || "-")}</div>
      </div>
    </div>

    <table>
      <thead><tr><th>No</th><th>Item</th><th>Qty</th><th>Harga</th><th>Total</th></tr></thead>
      <tbody>
        ${data.items.map((item, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${e(item.name)}${item.description ? `<div class="desc">${e(item.description)}</div>` : ""}</td>
          <td>${item.quantity}</td>
          <td>${fmt(item.unitPrice)}</td>
          <td>${fmt(item.total)}</td>
        </tr>`).join("")}
      </tbody>
    </table>

    <div class="totals-section">
      <div class="totals">
        <div class="totals-row"><span>Subtotal</span><span>${fmt(data.subtotal)}</span></div>
        ${data.discountRate > 0 ? `<div class="totals-row discount"><span>Diskon (${data.discountRate}%)</span><span>-${fmt(data.discountAmount)}</span></div>` : ""}
        <div class="totals-row grand"><span>Total</span><span>${fmt(data.totalAfterDiscount)}</span></div>
      </div>
    </div>

    <div class="footer">
      ${data.notes ? `<div class="footer-section"><div class="footer-label">Catatan</div><div class="footer-text">${e(data.notes)}</div></div>` : ""}
      ${data.terms ? `<div class="footer-section"><div class="footer-label">Syarat & Ketentuan</div><div class="footer-text">${e(data.terms)}</div></div>` : ""}
    </div>
  </div>
</body>
</html>`
}
