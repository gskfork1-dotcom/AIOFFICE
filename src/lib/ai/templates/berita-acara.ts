import { escapeHtml } from "@/lib/utils";

export interface BeritaAcaraData {
  baNumber: string;
  date: string;
  eventTitle: string;
  eventDescription: string;
  location: string;
  from: { name: string; position: string };
  participants: Array<{ name: string; position: string; organization: string }>;
  details: string;
  notes: string;
  signer1: { name: string; position: string };
  signer2: { name: string; position: string };
}

export function renderBeritaAcaraHTML(data: BeritaAcaraData, logoUrl?: string): string {
  const e = escapeHtml;
  const detailParagraphs = data.details.split("\n").filter(p => p.trim()).map(p =>
    `<p style="margin:0 0 10px 0;line-height:1.7;">${e(p)}</p>`
  ).join("");
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>Berita Acara</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Inter',sans-serif;background:#f1f5f9;padding:40px;color:#1e293b}
    .page{max-width:800px;margin:0 auto;background:#fff;padding:48px 56px;box-shadow:0 1px 3px rgba(0,0,0,.08)}
    .header{display:flex;align-items:center;gap:16px;padding-bottom:16px;border-bottom:3px solid #6366f1;margin-bottom:24px}
    .logo{width:56px;height:56px;object-fit:contain}
    .title{font-size:22px;font-weight:700;color:#6366f1}
    .subtitle{font-size:11px;color:#94a3b8;letter-spacing:1px}
    .ba-title{text-align:center;font-size:20px;font-weight:700;color:#1e293b;margin:24px 0;text-transform:uppercase;letter-spacing:2px}
    .meta-grid{display:grid;grid-template-columns:120px 1fr;gap:8px 16px;font-size:13px;margin-bottom:20px}
    .meta-grid .label{font-weight:600;color:#475569}
    .meta-grid .value{color:#1e293b}
    .section-title{font-size:14px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:1px;margin:20px 0 10px;padding-bottom:6px;border-bottom:2px solid #e2e8f0}
    .content-body{font-size:14px;line-height:1.8;color:#1e293b}
    table.participants{width:100%;border-collapse:collapse;font-size:13px;margin-top:8px}
    table.participants th{background:#f1f5f9;padding:8px 12px;text-align:left;font-weight:600;color:#475569;border-bottom:2px solid #e2e8f0}
    table.participants td{padding:8px 12px;border-bottom:1px solid #f1f5f9}
    .notes-box{background:#f8fafc;border-left:4px solid #6366f1;padding:12px 16px;margin-top:16px;font-size:13px;color:#475569;border-radius:0 6px 6px 0}
    .signatures{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:48px}
    .sig-box{text-align:center}
    .sig-name{font-weight:700;text-decoration:underline;margin-top:40px}
    .sig-pos{font-size:12px;color:#64748b;margin-top:2px}
    .footer{margin-top:32px;padding-top:12px;border-top:2px solid #6366f1;text-align:center;font-size:10px;color:#94a3b8}
    @media print{body{background:#fff;padding:0}.page{box-shadow:none;padding:0;max-width:none}}
    @page{size:A4;margin:20mm}
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      ${logoUrl ? `<img src="${e(logoUrl)}" alt="Logo" class="logo" />` : ""}
      <div>
        <div class="title">Berita Acara</div>
        <div class="subtitle">${e(data.baNumber)}</div>
      </div>
    </div>

    <div class="ba-title">Berita Acara</div>

    <div class="meta-grid">
      <div class="label">Nomor</div><div class="value">${e(data.baNumber)}</div>
      <div class="label">Tanggal</div><div class="value">${e(data.date)}</div>
      <div class="label">Peristiwa</div><div class="value"><strong>${e(data.eventTitle)}</strong></div>
      <div class="label">Lokasi</div><div class="value">${e(data.location)}</div>
      <div class="label">Deskripsi</div><div class="value">${e(data.eventDescription)}</div>
      <div class="label">Pelapor</div><div class="value"><strong>${e(data.from.name)}</strong>, ${e(data.from.position)}</div>
    </div>

    <div class="section-title">Peserta</div>
    <table class="participants">
      <thead><tr><th>No</th><th>Nama</th><th>Jabatan</th><th>Instansi</th></tr></thead>
      <tbody>${data.participants.map((p, i) => `<tr><td>${i + 1}</td><td><strong>${e(p.name)}</strong></td><td>${e(p.position)}</td><td>${e(p.organization)}</td></tr>`).join("")}</tbody>
    </table>

    <div class="section-title">Uraian Kejadian</div>
    <div class="content-body">${detailParagraphs}</div>

    ${data.notes ? `<div class="notes-box"><strong>Catatan:</strong> ${e(data.notes)}</div>` : ""}

    <div class="section-title">Penandatangan</div>
    <div class="signatures">
      <div class="sig-box">
        <p class="sig-name">${e(data.signer1.name)}</p>
        <p class="sig-pos">${e(data.signer1.position)}</p>
      </div>
      <div class="sig-box">
        <p class="sig-name">${e(data.signer2.name)}</p>
        <p class="sig-pos">${e(data.signer2.position)}</p>
      </div>
    </div>

    <div class="footer">Berita Acara — Dokumen Resmi</div>
  </div>
</body>
</html>`;
}
