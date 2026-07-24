import { escapeHtml } from "@/lib/utils";

export interface AbsensiData {
  reportNumber: string;
  period: string;
  companyName: string;
  department: string;
  entries: Array<{
    name: string;
    position: string;
    hadir: number;
    sakit: number;
    izin: number;
    alpha: number;
    cuti: number;
    totalWorkDays: number;
    notes: string;
  }>;
  summary: {
    totalEmployees: number;
    averageAttendance: number;
    totalHadir: number;
    totalSakit: number;
    totalIzin: number;
    totalAlpha: number;
  };
  preparedBy: { name: string; position: string };
  approvedBy: { name: string; position: string };
}

export function renderAbsensiHTML(data: AbsensiData, logoUrl?: string): string {
  const e = escapeHtml;
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>Laporan Absensi</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Inter',sans-serif;background:#f1f5f9;padding:40px;color:#1e293b}
    .page{max-width:900px;margin:0 auto;background:#fff;padding:48px 56px;box-shadow:0 1px 3px rgba(0,0,0,.08)}
    .header{display:flex;align-items:center;gap:16px;padding-bottom:16px;border-bottom:3px solid #0891b2;margin-bottom:24px}
    .logo{width:56px;height:56px;object-fit:contain}
    .title{font-size:22px;font-weight:700;color:#0891b2}
    .subtitle{font-size:11px;color:#94a3b8;letter-spacing:1px}
    .meta{display:flex;justify-content:space-between;font-size:13px;color:#475569;margin-bottom:20px}
    table{width:100%;border-collapse:collapse;font-size:12px;margin-top:12px}
    thead{background:#f0fdfa}
    th{padding:10px 8px;text-align:center;font-weight:600;color:#475569;border-bottom:2px solid #e2e8f0}
    th:first-child,th:nth-child(2),th:nth-child(3){text-align:left}
    td{padding:8px;border-bottom:1px solid #f1f5f9;text-align:center}
    td:first-child,td:nth-child(2),td:nth-child(3){text-align:left}
    td:nth-child(3){font-weight:500}
    tr:hover{background:#f8fafc}
    .hadir{color:#16a34a;font-weight:600}
    .sakit{color:#d97706;font-weight:600}
    .izin{color:#2563eb;font-weight:600}
    .alpha{color:#dc2626;font-weight:600}
    .summary-cards{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin:20px 0}
    .summary-card{text-align:center;padding:16px 8px;border-radius:8px;background:#f8fafc;border:1px solid #e2e8f0}
    .summary-card .num{font-size:24px;font-weight:700}
    .summary-card .label{font-size:11px;color:#64748b;margin-top:4px}
    .signatures{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:40px}
    .sig-box{text-align:center}
    .sig-name{font-weight:700;text-decoration:underline;margin-top:40px}
    .sig-pos{font-size:12px;color:#64748b;margin-top:2px}
    .footer{margin-top:32px;padding-top:12px;border-top:2px solid #0891b2;text-align:center;font-size:10px;color:#94a3b8}
    @media print{body{background:#fff;padding:0}.page{box-shadow:none;padding:0;max-width:none}table{page-break-inside:avoid}}
    @page{size:A4 landscape;margin:15mm}
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      ${logoUrl ? `<img src="${e(logoUrl)}" alt="Logo" class="logo" />` : ""}
      <div>
        <div class="title">Laporan Absensi</div>
        <div class="subtitle">${e(data.reportNumber)}</div>
      </div>
    </div>

    <div class="meta">
      <div><strong>Periode:</strong> ${e(data.period)}</div>
      <div><strong>Perusahaan:</strong> ${e(data.companyName)}</div>
      <div><strong>Departemen:</strong> ${e(data.department)}</div>
    </div>

    <table>
      <thead>
        <tr>
          <th>No</th>
          <th>Nama</th>
          <th>Jabatan</th>
          <th>Hadir</th>
          <th>Sakit</th>
          <th>Izin</th>
          <th>Alpha</th>
          <th>Cuti</th>
          <th>Hari Kerja</th>
          <th>Keterangan</th>
        </tr>
      </thead>
      <tbody>
        ${data.entries.map((entry, i) => `
        <tr>
          <td>${i + 1}</td>
          <td><strong>${e(entry.name)}</strong></td>
          <td>${e(entry.position)}</td>
          <td class="hadir">${entry.hadir}</td>
          <td class="sakit">${entry.sakit}</td>
          <td class="izin">${entry.izin}</td>
          <td class="alpha">${entry.alpha}</td>
          <td>${entry.cuti}</td>
          <td>${entry.totalWorkDays}</td>
          <td>${e(entry.notes)}</td>
        </tr>`).join("")}
      </tbody>
    </table>

    <div class="summary-cards">
      <div class="summary-card"><div class="num" style="color:#475569;">${data.summary.totalEmployees}</div><div class="label">Total Karyawan</div></div>
      <div class="summary-card"><div class="num hadir">${data.summary.totalHadir}</div><div class="label">Total Hadir</div></div>
      <div class="summary-card"><div class="num sakit">${data.summary.totalSakit}</div><div class="label">Total Sakit</div></div>
      <div class="summary-card"><div class="num izin">${data.summary.totalIzin}</div><div class="label">Total Izin</div></div>
      <div class="summary-card"><div class="num alpha">${data.summary.totalAlpha}</div><div class="label">Total Alpha</div></div>
    </div>

    <div class="signatures">
      <div class="sig-box">
        <p style="font-size:13px;font-weight:600;color:#475569;margin-bottom:4px;">Disusun oleh</p>
        <p class="sig-name">${e(data.preparedBy.name)}</p>
        <p class="sig-pos">${e(data.preparedBy.position)}</p>
      </div>
      <div class="sig-box">
        <p style="font-size:13px;font-weight:600;color:#475569;margin-bottom:4px;">Disetujui oleh</p>
        <p class="sig-name">${e(data.approvedBy.name)}</p>
        <p class="sig-pos">${e(data.approvedBy.position)}</p>
      </div>
    </div>

    <div class="footer">Laporan Absensi Karyawan — Dokumen Internal</div>
  </div>
</body>
</html>`;
}
