import { escapeHtml } from "@/lib/utils";

export interface SuratPHKData {
  letterNumber: string;
  date: string;
  employeeName: string;
  employeeAddress: string;
  employeePosition: string;
  department: string;
  terminationDate: string;
  lastWorkingDate: string;
  reason: string;
  terminationType: string;
  severancePay: string;
  finalSettlement: string;
  outstandingLeave: string;
  companyAssets: string;
  additionalNotes: string;
  closingStatement: string;
  signerName: string;
  signerPosition: string;
}

export function renderSuratPHKHTML(data: SuratPHKData, logoUrl?: string): string {
  const e = escapeHtml;
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>Surat Pemutusan Hubungan Kerja</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Inter',sans-serif;background:#f1f5f9;padding:40px;color:#1e293b}
    .page{max-width:800px;margin:0 auto;background:#fff;padding:48px 56px;box-shadow:0 1px 3px rgba(0,0,0,.08)}
    .header{display:flex;align-items:center;gap:16px;padding-bottom:16px;border-bottom:3px solid #dc2626;margin-bottom:24px}
    .logo{width:56px;height:56px;object-fit:contain}
    .title{font-size:22px;font-weight:700;color:#dc2626}
    .subtitle{font-size:11px;color:#94a3b8;letter-spacing:1px}
    .letter-label{text-align:center;font-size:24px;font-weight:700;color:#dc2626;letter-spacing:4px;margin:24px 0 4px;text-transform:uppercase}
    .letter-sublabel{text-align:center;font-size:14px;color:#475569;margin-bottom:24px}
    .meta-line{font-size:13px;color:#475569;margin-bottom:6px}
    .divider{border:none;border-top:1px solid #e2e8f0;margin:20px 0}
    .section-title{font-size:14px;font-weight:700;color:#dc2626;margin:20px 0 8px;padding-bottom:4px;border-bottom:1px solid #fecaca}
    .info-table{width:100%;font-size:13px;margin:8px 0 16px}
    .info-table td{padding:5px 0;vertical-align:top}
    .info-label{width:180px;font-weight:600;color:#475569}
    .content-body{font-size:13px;line-height:1.8;color:#1e293b;margin:12px 0}
    .content-body p{margin:0 0 10px 0}
    .notice-box{background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:16px;margin:16px 0}
    .notice-box .label{font-size:12px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px}
    .notice-box ul{margin:0;padding-left:20px;font-size:13px;color:#475569;line-height:1.8}
    .closing{font-size:13px;line-height:1.8;color:#1e293b;margin-top:24px}
    .signature{display:flex;justify-content:flex-end;margin-top:40px}
    .sig-box{text-align:center;width:240px}
    .sig-name{font-weight:700;text-decoration:underline;margin-top:40px;font-size:14px}
    .sig-pos{font-size:12px;color:#64748b;margin-top:2px}
    .footer{margin-top:32px;padding-top:12px;border-top:2px solid #dc2626;text-align:center;font-size:10px;color:#94a3b8}
    @media print{body{background:#fff;padding:0}.page{box-shadow:none;padding:0;max-width:none}}
    @page{size:A4;margin:20mm}
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      ${logoUrl ? `<img src="${e(logoUrl)}" alt="Logo" class="logo" />` : ""}
      <div>
        <div class="title">Surat Pemutusan Hubungan Kerja</div>
        <div class="subtitle">${e(data.letterNumber)}</div>
      </div>
    </div>

    <div class="letter-label">SURAT PHK</div>
    <div class="letter-sublabel">Nomor: ${e(data.letterNumber)}</div>

    <div class="meta-line">Tanggal: <strong>${e(data.date)}</strong></div>

    <hr class="divider" />

    <div class="content-body">
      <p>Dengan hormat,</p>
      <p>Dengan surat ini, kami sampaikan bahwa hubungan kerja dengan karyawan berikut telah diputuskan:</p>
    </div>

    <div class="section-title">Data Karyawan</div>
    <table class="info-table">
      <tr><td class="info-label">Nama Lengkap</td><td><strong>${e(data.employeeName)}</strong></td></tr>
      <tr><td class="info-label">Alamat</td><td>${e(data.employeeAddress || "-")}</td></tr>
      <tr><td class="info-label">Jabatan</td><td>${e(data.employeePosition)}</td></tr>
      <tr><td class="info-label">Departemen</td><td>${e(data.department || "-")}</td></tr>
    </table>

    <div class="section-title">Detail Pemutusan Hubungan Kerja</div>
    <table class="info-table">
      <tr><td class="info-label">Jenis Pemutusan</td><td><strong>${e(data.terminationType)}</strong></td></tr>
      <tr><td class="info-label">Tanggal Efektif PHK</td><td>${e(data.terminationDate)}</td></tr>
      <tr><td class="info-label">Tanggal Hari Kerja Terakhir</td><td>${e(data.lastWorkingDate || "-")}</td></tr>
      <tr><td class="info-label">Alasan</td><td>${e(data.reason)}</td></tr>
    </table>

    <div class="section-title">Hak dan Kewajiban Karyawan</div>
    <table class="info-table">
      <tr><td class="info-label">Pesangon</td><td>${e(data.severancePay || "-")}</td></tr>
      <tr><td class="info-label">Pembayaran Terakhir</td><td>${e(data.finalSettlement || "-")}</td></tr>
      <tr><td class="info-label">Cuti Belum Diambil</td><td>${e(data.outstandingLeave || "-")}</td></tr>
      <tr><td class="info-label">Pengembalian Aset Perusahaan</td><td>${e(data.companyAssets || "-")}</td></tr>
    </table>

    ${data.additionalNotes ? `
    <div class="notice-box">
      <div class="label">Catatan Tambahan</div>
      <p style="font-size:13px;color:#475569;line-height:1.6;margin:0">${e(data.additionalNotes)}</p>
    </div>
    ` : ""}

    <div class="closing">
      <p>${e(data.closingStatement || "Demikian surat ini kami buat dengan sebenar-benarnya. Kami ucapkan terima kasih atas kontribusi dan kerja keras selama ini, serta mendoakan kesuksesan di masa mendatang.")}</p>
    </div>

    <div class="signature">
      <div class="sig-box">
        <p style="font-size:13px;font-weight:600;color:#475569;margin-bottom:4px;">Mengetahui,</p>
        <p class="sig-name">${e(data.signerName)}</p>
        <p class="sig-pos">${e(data.signerPosition)}</p>
      </div>
    </div>

    <div class="footer">Surat Pemutusan Hubungan Kerja — Dokumen Resmi Perusahaan</div>
  </div>
</body>
</html>`;
}
