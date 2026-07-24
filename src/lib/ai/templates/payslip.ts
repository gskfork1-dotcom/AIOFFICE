import { escapeHtml } from "@/lib/utils";

export interface PayslipData {
  payslipNumber: string;
  period: string;
  employee: {
    name: string;
    nip: string;
    position: string;
    department: string;
  };
  earnings: {
    name: string;
    amount: number[];
  }[];
  deductions: {
    name: string;
    amount: number[];
  }[];
  totalEarnings: number;
  totalDeductions: number;
  netSalary: number;
  notes: string;
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function sumAmounts(amounts: number[]): number {
  return amounts.reduce((sum, a) => sum + a, 0);
}

export function renderPayslipHTML(
  data: PayslipData,
  logoUrl?: string
): string {
  const e = escapeHtml;
  const p = (n: number) => formatCurrency(n);

  const earningsRows = data.earnings
    .map((item) => {
      const total = sumAmounts(item.amount);
      return `
        <tr>
          <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#374151;">
            ${e(item.name)}
          </td>
          <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#059669;text-align:right;font-weight:500;white-space:nowrap;">
            ${p(total)}
          </td>
        </tr>`;
    })
    .join("");

  const deductionsRows = data.deductions
    .map((item) => {
      const total = sumAmounts(item.amount);
      return `
        <tr>
          <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#374151;">
            ${e(item.name)}
          </td>
          <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#dc2626;text-align:right;font-weight:500;white-space:nowrap;">
            ${p(total)}
          </td>
        </tr>`;
    })
    .join("");

  const logoHtml = logoUrl
    ? `<img src="${e(logoUrl)}" alt="Logo" style="height:56px;object-fit:contain;" />`
    : `<div style="width:56px;height:56px;background:#059669;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:22px;">P</div>`;

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Slip Gaji - ${e(data.payslipNumber)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f3f4f6;
      color: #111827;
      padding: 40px 20px;
    }
    .payslip-container {
      max-width: 780px;
      margin: 0 auto;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      color: #fff;
      padding: 32px 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }
    .header-left { display: flex; align-items: center; gap: 16px; }
    .header-title { font-size: 28px; font-weight: 700; letter-spacing: 2px; }
    .header-subtitle { font-size: 13px; opacity: 0.85; margin-top: 2px; }
    .header-right { text-align: right; }
    .header-payslip-no { font-size: 13px; opacity: 0.85; }
    .header-period { font-size: 18px; font-weight: 600; margin-top: 4px; }
    .body { padding: 32px 40px 40px; }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px 40px;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 10px;
      padding: 20px 24px;
      margin-bottom: 28px;
    }
    .info-item {}
    .info-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6b7280;
      margin-bottom: 2px;
    }
    .info-value {
      font-size: 15px;
      font-weight: 600;
      color: #111827;
    }
    .columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 28px;
    }
    .column-card {
      border-radius: 10px;
      border: 1px solid #e5e7eb;
      overflow: hidden;
    }
    .column-card.earnings { border-top: 3px solid #059669; }
    .column-card.deductions { border-top: 3px solid #dc2626; }
    .column-header {
      padding: 14px 20px;
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .column-card.earnings .column-header {
      background: #f0fdf4;
      color: #059669;
    }
    .column-card.deductions .column-header {
      background: #fef2f2;
      color: #dc2626;
    }
    .column-body table { width: 100%; border-collapse: collapse; }
    .column-empty {
      padding: 24px 16px;
      text-align: center;
      font-size: 13px;
      color: #9ca3af;
      font-style: italic;
    }
    .summary {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 24px 28px;
      margin-bottom: 28px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
    }
    .summary-row + .summary-row { border-top: 1px dashed #e5e7eb; }
    .summary-label {
      font-size: 14px;
      color: #6b7280;
      font-weight: 500;
    }
    .summary-value {
      font-size: 15px;
      font-weight: 600;
    }
    .summary-value.green { color: #059669; }
    .summary-value.red { color: #dc2626; }
    .net-salary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      color: #fff;
      padding: 18px 28px;
      border-radius: 10px;
      margin-bottom: 28px;
      box-shadow: 0 4px 12px rgba(5,150,105,0.25);
    }
    .net-salary-label {
      font-size: 16px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .net-salary-value {
      font-size: 24px;
      font-weight: 800;
    }
    .notes-section {
      border-top: 1px solid #e5e7eb;
      padding-top: 24px;
    }
    .notes-title {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6b7280;
      margin-bottom: 8px;
    }
    .notes-body {
      font-size: 14px;
      color: #374151;
      line-height: 1.6;
      white-space: pre-wrap;
    }
    .footer {
      border-top: 1px solid #e5e7eb;
      padding: 20px 40px;
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #9ca3af;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .payslip-container {
        box-shadow: none;
        border-radius: 0;
        max-width: 100%;
      }
      .header { padding: 24px 32px; }
      .body { padding: 24px 32px 32px; }
      .footer { padding: 16px 32px; }
      .net-salary-row { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="payslip-container">

    <div class="header">
      <div class="header-left">
        ${logoHtml}
        <div>
          <div class="header-title">SLIP GAJI</div>
          <div class="header-subtitle">Payslip / Slip Gaji Karyawan</div>
        </div>
      </div>
      <div class="header-right">
        <div class="header-payslip-no">No. ${e(data.payslipNumber)}</div>
        <div class="header-period">${e(data.period)}</div>
      </div>
    </div>

    <div class="body">

      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Nama Karyawan</div>
          <div class="info-value">${e(data.employee.name)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">NIP</div>
          <div class="info-value">${e(data.employee.nip)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Jabatan</div>
          <div class="info-value">${e(data.employee.position)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Departemen</div>
          <div class="info-value">${e(data.employee.department)}</div>
        </div>
      </div>

      <div class="columns">
        <div class="column-card earnings">
          <div class="column-header">Pendapatan</div>
          <div class="column-body">
            ${earningsRows
              ? `<table>${earningsRows}</table>`
              : `<div class="column-empty">Tidak ada pendapatan</div>`}
          </div>
        </div>
        <div class="column-card deductions">
          <div class="column-header">Potongan</div>
          <div class="column-body">
            ${deductionsRows
              ? `<table>${deductionsRows}</table>`
              : `<div class="column-empty">Tidak ada potongan</div>`}
          </div>
        </div>
      </div>

      <div class="summary">
        <div class="summary-row">
          <span class="summary-label">Total Pendapatan</span>
          <span class="summary-value green">${p(data.totalEarnings)}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Total Potongan</span>
          <span class="summary-value red">${p(data.totalDeductions)}</span>
        </div>
      </div>

      <div class="net-salary-row">
        <span class="net-salary-label">Gaji Bersih (Take Home Pay)</span>
        <span class="net-salary-value">${p(data.netSalary)}</span>
      </div>

      ${data.notes
        ? `<div class="notes-section">
        <div class="notes-title">Catatan</div>
        <div class="notes-body">${e(data.notes)}</div>
      </div>`
        : ""}

    </div>

    <div class="footer">
      <span>Dokumen ini digenerasi secara otomatis</span>
      <span>${e(data.payslipNumber)} &middot; ${e(data.period)}</span>
    </div>

  </div>
</body>
</html>`;
}
