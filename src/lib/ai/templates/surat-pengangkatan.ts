import { escapeHtml } from "@/lib/utils";

export interface SuratPengangkatanData {
  letterNumber: string;
  date: string;
  employeeName: string;
  employeeAddress: string;
  employeePosition: string;
  department: string;
  startDate: string;
  probationPeriod: string;
  salary: number;
  allowances: Array<{ name: string; amount: number }>;
  workingHours: string;
  benefits: string;
  terms: string;
  closingStatement: string;
  signerName: string;
  signerPosition: string;
}

export function renderSuratPengangkatanHTML(data: SuratPengangkatanData, logoUrl?: string): string {
  const e = escapeHtml;
  const fmtRp = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;
  const allowanceRows = (data.allowances && data.allowances.length > 0)
    ? data.allowances.map((a, i) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#374151;">${i + 1}. ${e(a.name)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;color:#059669;">${fmtRp(a.amount)}</td>
        </tr>`).join("")
    : "";

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>Surat Pengangkatan Karyawan</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Inter',sans-serif;background:#f1f5f9;padding:40px;color:#1e293b}
    .page{max-width:800px;margin:0 auto;background:#fff;padding:48px 56px;box-shadow:0 1px 3px rgba(0,0,0,.08)}
    .header{display:flex;align-items:center;gap:16px;padding-bottom:16px;border-bottom:3px solid #059669;margin-bottom:24px}
    .logo{width:56px;height:56px;object-fit:contain}
    .title{font-size:22px;font-weight:700;color:#059669}
    .subtitle{font-size:11px;color:#94a3b8;letter-spacing:1px}
    .meta{display:flex;justify-content:space-between;font-size:13px;color:#475569;margin-bottom:24px}
    .letter-title{text-align:center;font-size:18px;font-weight:700;color:#059669;text-transform:uppercase;letter-spacing:2px;margin:24px 0 20px;padding-bottom:8px;border-bottom:2px solid #059669}
    .body-text{font-size:13px;line-height:1.8;color:#1e293b;margin-bottom:12px;text-align:justify}
    .detail-table{width:100%;border-collapse:collapse;font-size:13px;margin:16px 0}
    .detail-table th{padding:8px 12px;text-align:left;background:#f0fdf4;font-weight:600;color:#047857;border-bottom:2px solid #059669;width:200px}
    .detail-table td{padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#374151}
    .allowance-table{width:100%;border-collapse:collapse;font-size:13px;margin:12px 0;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden}
    .allowance-header{background:#059669;color:#fff;font-weight:600}
    .allowance-header th{padding:10px 12px;text-align:left}
    .allowance-header th:last-child{text-align:right}
    .section-title{font-size:14px;font-weight:700;color:#047857;margin:20px 0 8px;padding-bottom:4px;border-bottom:1px solid #d1fae5}
    .terms-box{background:#f0fdf4;border:1px solid #d1fae5;border-radius:8px;padding:16px;margin:12px 0;font-size:13px;line-height:1.7;color:#374151}
    .salary-highlight{background:#ecfdf5;border:2px solid #059669;border-radius:8px;padding:16px;margin:16px 0;text-align:center}
    .salary-label{font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px}
    .salary-amount{font-size:24px;font-weight:700;color:#059669;margin-top:4px}
    .closing{font-size:13px;line-height:1.8;color:#1e293b;margin:20px 0;text-align:justify}
    .signature-section{display:flex;justify-content:flex-end;margin-top:40px}
    .sig-box{text-align:center;width:260px}
    .sig-label{font-size:12px;color:#6b7280;margin-bottom:4px}
    .materai-box{width:80px;height:80px;border:2px dashed #d1fae5;border-radius:8px;margin:8px auto;display:flex;align-items:center;justify-content:center;font-size:10px;color:#9ca3af}
    .sig-name{font-weight:700;text-decoration:underline;margin-top:40px;font-size:14px}
    .sig-pos{font-size:12px;color:#64748b;margin-top:2px}
    .footer{margin-top:32px;padding-top:12px;border-top:2px solid #059669;text-align:center;font-size:10px;color:#94a3b8}
    @media print{body{background:#fff;padding:0}.page{box-shadow:none;padding:0;max-width:none}}
    @page{size:A4 portrait;margin:20mm}
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      ${logoUrl ? `<img src="${e(logoUrl)}" alt="Logo" class="logo" />` : ""}
      <div>
        <div class="title">Surat Pengangkatan</div>
        <div class="subtitle">${e(data.letterNumber)}</div>
      </div>
    </div>

    <div class="meta">
      <div><strong>No. Surat:</strong> ${e(data.letterNumber)}</div>
      <div><strong>Tanggal:</strong> ${e(data.date)}</div>
    </div>

    <div class="letter-title">Surat Pengangkatan Karyawan</div>

    <p class="body-text">Yang bertanda tangan di bawah ini:</p>

    <table class="detail-table">
      <tr><th>Nama Penandatangan</th><td>${e(data.signerName)}</td></tr>
      <tr><th>Jabatan</th><td>${e(data.signerPosition)}</td></tr>
    </table>

    <p class="body-text" style="margin-top:16px">Dengan ini mengangkat / menunjuk:</p>

    <table class="detail-table">
      <tr><th>Nama Karyawan</th><td style="font-weight:600">${e(data.employeeName)}</td></tr>
      <tr><th>Alamat</th><td>${e(data.employeeAddress || "-")}</td></tr>
      <tr><th>Jabatan</th><td>${e(data.employeePosition)}</td></tr>
      <tr><th>Departemen</th><td>${e(data.department || "-")}</td></tr>
    </table>

    <p class="body-text">Untuk bekerja di perusahaan ini mulai tanggal <strong>${e(data.startDate)}</strong> dengan ketentuan sebagai berikut:</p>

    <div class="section-title">Detail Posisi & Gaji</div>
    <table class="detail-table">
      <tr><th>Tanggal Mulai</th><td>${e(data.startDate)}</td></tr>
      <tr><th>Masa Percobaan</th><td>${e(data.probationPeriod || "3 bulan")}</td></tr>
      <tr><th>Jam Kerja</th><td>${e(data.workingHours || "09:00 - 17:00")}</td></tr>
    </table>

    <div class="salary-highlight">
      <div class="salary-label">Gaji Pokok per Bulan</div>
      <div class="salary-amount">${fmtRp(data.salary)}</div>
    </div>

    ${allowanceRows ? `
    <div class="section-title">Tunjangan</div>
    <table class="allowance-table">
      <thead>
        <tr class="allowance-header">
          <th>Jenis Tunjangan</th>
          <th style="text-align:right">Jumlah</th>
        </tr>
      </thead>
      <tbody>
        ${allowanceRows}
      </tbody>
    </table>` : ""}

    ${data.benefits ? `
    <div class="section-title">Benefit Lainnya</div>
    <div class="terms-box">${e(data.benefits).replace(/\n/g, "<br>")}</div>` : ""}

    ${data.terms ? `
    <div class="section-title">Syarat & Ketentuan</div>
    <div class="terms-box">${e(data.terms).replace(/\n/g, "<br>")}</div>` : ""}

    <div class="closing">
      ${e(data.closingStatement || "Demikian surat pengangkatan ini dibuat dengan sebenar-benarnya dan dapat dipergunakan sebagaimana mestinya.")}
    </div>

    <div class="signature-section">
      <div class="sig-box">
        <div class="sig-label">Mengetahui,</div>
        <div class="materai-box">Materai</div>
        <div class="sig-name">${e(data.signerName)}</div>
        <div class="sig-pos">${e(data.signerPosition)}</div>
      </div>
    </div>

    <div class="footer">Surat Pengangkatan Karyawan — ${e(data.employeeName)}</div>
  </div>
</body>
</html>`;
}
