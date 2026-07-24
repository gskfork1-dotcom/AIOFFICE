import { escapeHtml } from "@/lib/utils";

export interface DeliveryData {
  deliveryNumber: string;
  date: string;
  from: {
    name: string;
    address: string;
    phone: string;
  };
  to: {
    name: string;
    address: string;
    phone: string;
  };
  items: {
    name: string;
    quantity: string;
    unit: string;
    description: string;
  }[];
  vehicle: string;
  driver: string;
  notes: string;
}

export function renderDeliveryHTML(
  data: DeliveryData,
  logoUrl?: string
): string {
  const e = escapeHtml;

  const itemRows = data.items
    .map(
      (item, i) => `
        <tr>
          <td style="padding:10px 14px;border:1px solid #e2e8f0;text-align:center;color:#475569;font-size:13px;">${i + 1}</td>
          <td style="padding:10px 14px;border:1px solid #e2e8f0;color:#1e293b;font-size:13px;">${e(item.name)}</td>
          <td style="padding:10px 14px;border:1px solid #e2e8f0;text-align:center;color:#1e293b;font-weight:600;font-size:13px;">${e(item.quantity)}</td>
          <td style="padding:10px 14px;border:1px solid #e2e8f0;text-align:center;color:#475569;font-size:13px;">${e(item.unit)}</td>
          <td style="padding:10px 14px;border:1px solid #e2e8f0;color:#475569;font-size:13px;">${e(item.description)}</td>
        </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Surat Jalan - ${e(data.deliveryNumber)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      background: #f8fafc;
      color: #1e293b;
      line-height: 1.5;
    }

    .page {
      max-width: 800px;
      margin: 32px auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 4px 16px rgba(0, 0, 0, 0.04);
    }

    .header {
      background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
      color: #ffffff;
      padding: 32px 40px;
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .header-logo img {
      width: 64px;
      height: 64px;
      border-radius: 10px;
      object-fit: contain;
      background: #ffffff;
      padding: 4px;
    }

    .header-text {
      flex: 1;
    }

    .header-title {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 2px;
    }

    .header-subtitle {
      font-size: 13px;
      opacity: 0.85;
      font-weight: 400;
      letter-spacing: 0.5px;
    }

    .header-meta {
      text-align: right;
    }

    .header-meta p {
      font-size: 13px;
      opacity: 0.9;
      margin-bottom: 2px;
    }

    .header-meta strong {
      font-size: 15px;
      font-weight: 700;
    }

    .body {
      padding: 32px 40px;
    }

    .section-label {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #4f46e5;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 2px solid #eef2ff;
    }

    .parties {
      display: flex;
      gap: 32px;
      margin-bottom: 32px;
    }

    .party-card {
      flex: 1;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
    }

    .party-card-title {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #4f46e5;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 2px solid #eef2ff;
    }

    .party-name {
      font-size: 15px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 6px;
    }

    .party-detail {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 3px;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 32px;
      font-size: 13px;
    }

    .items-table thead th {
      background: #4f46e5;
      color: #ffffff;
      padding: 12px 14px;
      text-align: left;
      font-weight: 600;
      font-size: 12px;
      letter-spacing: 0.5px;
    }

    .items-table thead th:first-child {
      border-radius: 6px 0 0 0;
      text-align: center;
      width: 48px;
    }

    .items-table thead th:nth-child(3),
    .items-table thead th:nth-child(4) {
      text-align: center;
      width: 80px;
    }

    .items-table thead th:last-child {
      border-radius: 0 6px 0 0;
    }

    .items-table tbody tr:nth-child(even) {
      background: #f8fafc;
    }

    .items-table tbody tr:hover {
      background: #eef2ff;
    }

    .logistics {
      display: flex;
      gap: 32px;
      margin-bottom: 32px;
    }

    .logistics-card {
      flex: 1;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
    }

    .logistics-label {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #4f46e5;
      margin-bottom: 8px;
    }

    .logistics-value {
      font-size: 15px;
      font-weight: 600;
      color: #1e293b;
    }

    .notes-section {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-left: 4px solid #f59e0b;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 32px;
    }

    .notes-title {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #b45309;
      margin-bottom: 8px;
    }

    .notes-text {
      font-size: 13px;
      color: #92400e;
      line-height: 1.6;
      white-space: pre-wrap;
    }

    .footer {
      border-top: 1px solid #e2e8f0;
      padding: 20px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
    }

    .footer-text {
      font-size: 11px;
      color: #94a3b8;
    }

    .footer-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 600;
      color: #4f46e5;
      background: #eef2ff;
      padding: 4px 10px;
      border-radius: 20px;
    }

    .footer-badge-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #4f46e5;
    }

    @media print {
      body {
        background: #ffffff;
      }

      .page {
        margin: 0;
        border: none;
        border-radius: 0;
        box-shadow: none;
      }

      .header {
        background: #4f46e5 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .items-table thead th {
        background: #4f46e5 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .items-table tbody tr:nth-child(even) {
        background: #f8fafc !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .notes-section {
        background: #fffbeb !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .footer-badge {
        background: #eef2ff !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .footer-badge-dot {
        background: #4f46e5 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }

    @page {
      size: A4;
      margin: 16mm;
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      ${
        logoUrl
          ? `<div class="header-logo"><img src="${e(logoUrl)}" alt="Logo" /></div>`
          : ""
      }
      <div class="header-text">
        <div class="header-title">Surat Jalan</div>
        <div class="header-subtitle">Delivery Order</div>
      </div>
      <div class="header-meta">
        <p>No. <strong>${e(data.deliveryNumber)}</strong></p>
        <p>${e(data.date)}</p>
      </div>
    </div>

    <div class="body">
      <div class="parties">
        <div class="party-card">
          <div class="party-card-title">Pengirim</div>
          <div class="party-name">${e(data.from.name)}</div>
          <div class="party-detail">${e(data.from.address)}</div>
          <div class="party-detail">${e(data.from.phone)}</div>
        </div>
        <div class="party-card">
          <div class="party-card-title">Penerima</div>
          <div class="party-name">${e(data.to.name)}</div>
          <div class="party-detail">${e(data.to.address)}</div>
          <div class="party-detail">${e(data.to.phone)}</div>
        </div>
      </div>

      <div class="section-label">Daftar Barang</div>
      <table class="items-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Barang</th>
            <th>Qty</th>
            <th>Satuan</th>
            <th>Keterangan</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows || `<tr><td colspan="5" style="padding:20px;text-align:center;color:#94a3b8;font-size:13px;">Tidak ada barang</td></tr>`}
        </tbody>
      </table>

      <div class="logistics">
        <div class="logistics-card">
          <div class="logistics-label">Kendaraan</div>
          <div class="logistics-value">${e(data.vehicle)}</div>
        </div>
        <div class="logistics-card">
          <div class="logistics-label">Supir</div>
          <div class="logistics-value">${e(data.driver)}</div>
        </div>
      </div>

      ${
        data.notes
          ? `
      <div class="notes-section">
        <div class="notes-title">Catatan</div>
        <div class="notes-text">${e(data.notes)}</div>
      </div>`
          : ""
      }
    </div>

    <div class="footer">
      <div class="footer-text">Dokumen ini digunakan sebagai bukti pengiriman barang.</div>
      <div class="footer-badge">
        <span class="footer-badge-dot"></span>
        BizPilot AI
      </div>
    </div>
  </div>
</body>
</html>`;
}
