import { escapeHtml } from "@/lib/utils";

export interface MemoData {
  memoNumber: string;
  date: string;
  from: { name: string; position: string };
  to: { name: string; position: string };
  subject: string;
  content: string;
  signer: { name: string; position: string };
}

export function renderMemoHTML(data: MemoData, logoUrl?: string): string {
  const e = escapeHtml;
  const paragraphs = data.content.split("\n").filter(p => p.trim()).map(p =>
    `<p style="margin:0 0 12px 0;line-height:1.7;">${e(p)}</p>`
  ).join("");
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>Memo Internal</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Inter',sans-serif;background:#f1f5f9;padding:40px;color:#1e293b}
    .page{max-width:800px;margin:0 auto;background:#fff;padding:48px 56px;box-shadow:0 1px 3px rgba(0,0,0,.08)}
    .header{display:flex;align-items:center;gap:16px;padding-bottom:16px;border-bottom:3px solid #475569;margin-bottom:24px}
    .logo{width:56px;height:56px;object-fit:contain}
    .title{font-size:22px;font-weight:700;color:#475569}
    .subtitle{font-size:11px;color:#94a3b8;letter-spacing:1px}
    .memo-label{text-align:center;font-size:28px;font-weight:700;color:#475569;letter-spacing:6px;margin:24px 0;text-transform:uppercase;border-bottom:2px solid #475569;padding-bottom:8px}
    .meta-table{width:100%;margin:20px 0;font-size:14px}
    .meta-table td{padding:8px 0;vertical-align:top}
    .meta-label{width:120px;font-weight:600;color:#475569}
    .divider{border:none;border-top:1px solid #e2e8f0;margin:20px 0}
    .content-body{font-size:14px;line-height:1.8;color:#1e293b;margin-top:24px}
    .signature{display:flex;justify-content:flex-end;margin-top:40px}
    .sig-box{text-align:center;width:200px}
    .sig-name{font-weight:700;text-decoration:underline;margin-top:40px}
    .sig-pos{font-size:12px;color:#64748b;margin-top:2px}
    .footer{margin-top:32px;padding-top:12px;border-top:2px solid #475569;text-align:center;font-size:10px;color:#94a3b8}
    @media print{body{background:#fff;padding:0}.page{box-shadow:none;padding:0;max-width:none}}
    @page{size:A4;margin:20mm}
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      ${logoUrl ? `<img src="${e(logoUrl)}" alt="Logo" class="logo" />` : ""}
      <div>
        <div class="title">Memo Internal</div>
        <div class="subtitle">${e(data.memoNumber)}</div>
      </div>
    </div>

    <div class="memo-label">MEMO</div>

    <table class="meta-table">
      <tr><td class="meta-label">Kepada</td><td><strong>${e(data.to.name)}</strong>, ${e(data.to.position)}</td></tr>
      <tr><td class="meta-label">Dari</td><td><strong>${e(data.from.name)}</strong>, ${e(data.from.position)}</td></tr>
      <tr><td class="meta-label">Tanggal</td><td>${e(data.date)}</td></tr>
      <tr><td class="meta-label">Perihal</td><td><strong>${e(data.subject)}</strong></td></tr>
    </table>

    <hr class="divider" />

    <div class="content-body">${paragraphs}</div>

    <div class="signature">
      <div class="sig-box">
        <p class="sig-name">${e(data.signer.name)}</p>
        <p class="sig-pos">${e(data.signer.position)}</p>
      </div>
    </div>

    <div class="footer">Memo Internal — Dokumen Rahasia Perusahaan</div>
  </div>
</body>
</html>`;
}
