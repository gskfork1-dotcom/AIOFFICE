import { escapeHtml } from "@/lib/utils";

export interface NotulenData {
  notulenNumber: string;
  date: string;
  meetingTitle: string;
  startTime: string;
  endTime: string;
  location: string;
  chairperson: string;
  attendees: string[];
  absentees: string[];
  agenda: Array<{ topic: string; discussion: string; decision: string }>;
  actionItems: Array<{ task: string; assignee: string; deadline: string }>;
  nextMeeting: string;
  signer: { name: string; position: string };
}

export function renderNotulenHTML(data: NotulenData, logoUrl?: string): string {
  const e = escapeHtml;
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>Notulen Rapat</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Inter',sans-serif;background:#f1f5f9;padding:40px;color:#1e293b}
    .page{max-width:800px;margin:0 auto;background:#fff;padding:48px 56px;box-shadow:0 1px 3px rgba(0,0,0,.08)}
    .header{display:flex;align-items:center;gap:16px;padding-bottom:16px;border-bottom:3px solid #64748b;margin-bottom:24px}
    .logo{width:56px;height:56px;object-fit:contain}
    .title{font-size:22px;font-weight:700;color:#64748b}
    .subtitle{font-size:11px;color:#94a3b8;letter-spacing:1px}
    .section-title{font-size:14px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:1px;margin:20px 0 10px;padding-bottom:6px;border-bottom:2px solid #e2e8f0}
    .meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;font-size:13px;margin-bottom:16px}
    .meta-grid .label{font-weight:600;color:#475569}
    .meta-grid .value{color:#1e293b}
    .people-list{font-size:13px;line-height:1.8}
    .people-list span{display:inline-block;background:#f1f5f9;padding:2px 10px;border-radius:4px;margin:2px 4px 2px 0;font-size:12px}
    .agenda-item{background:#f8fafc;border-left:4px solid #64748b;padding:16px;margin-bottom:12px;border-radius:0 6px 6px 0}
    .agenda-topic{font-weight:700;color:#1e293b;margin-bottom:6px;font-size:14px}
    .agenda-detail{font-size:13px;color:#475569;line-height:1.6;margin-bottom:4px}
    .agenda-detail strong{color:#64748b}
    table.actions{width:100%;border-collapse:collapse;font-size:13px;margin-top:8px}
    table.actions th{background:#f1f5f9;padding:8px 12px;text-align:left;font-weight:600;color:#475569;border-bottom:2px solid #e2e8f0}
    table.actions td{padding:8px 12px;border-bottom:1px solid #f1f5f9}
    .signature{display:flex;justify-content:flex-end;margin-top:40px}
    .sig-box{text-align:center;width:200px}
    .sig-name{font-weight:700;text-decoration:underline;margin-top:40px}
    .sig-pos{font-size:12px;color:#64748b;margin-top:2px}
    .footer{margin-top:32px;padding-top:12px;border-top:2px solid #64748b;text-align:center;font-size:10px;color:#94a3b8}
    @media print{body{background:#fff;padding:0}.page{box-shadow:none;padding:0;max-width:none}}
    @page{size:A4;margin:20mm}
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      ${logoUrl ? `<img src="${e(logoUrl)}" alt="Logo" class="logo" />` : ""}
      <div>
        <div class="title">Notulen Rapat</div>
        <div class="subtitle">${e(data.notulenNumber)}</div>
      </div>
    </div>

    <div class="section-title">Informasi Rapat</div>
    <div class="meta-grid">
      <div><span class="label">Judul:</span> <span class="value"><strong>${e(data.meetingTitle)}</strong></span></div>
      <div><span class="label">Tanggal:</span> <span class="value">${e(data.date)}</span></div>
      <div><span class="label">Waktu:</span> <span class="value">${e(data.startTime)} - ${e(data.endTime)}</span></div>
      <div><span class="label">Lokasi:</span> <span class="value">${e(data.location)}</span></div>
      <div><span class="label">Pimpinan:</span> <span class="value"><strong>${e(data.chairperson)}</strong></span></div>
    </div>

    <div class="section-title">Peserta Hadir</div>
    <div class="people-list">${data.attendees.map(a => `<span>${e(a)}</span>`).join("")}</div>

    ${data.absentees.length > 0 ? `
    <div class="section-title">Tidak Hadir</div>
    <div class="people-list">${data.absentees.map(a => `<span style="background:#fee2e2;">${e(a)}</span>`).join("")}</div>` : ""}

    <div class="section-title">Pembahasan</div>
    ${data.agenda.map((a, i) => `
    <div class="agenda-item">
      <div class="agenda-topic">${i + 1}. ${e(a.topic)}</div>
      <div class="agenda-detail"><strong>Pembahasan:</strong> ${e(a.discussion)}</div>
      <div class="agenda-detail"><strong>Keputusan:</strong> ${e(a.decision)}</div>
    </div>`).join("")}

    ${data.actionItems.length > 0 ? `
    <div class="section-title">Action Items</div>
    <table class="actions">
      <thead><tr><th>Tugas</th><th>Penanggung Jawab</th><th>Deadline</th></tr></thead>
      <tbody>${data.actionItems.map(a => `<tr><td>${e(a.task)}</td><td>${e(a.assignee)}</td><td>${e(a.deadline)}</td></tr>`).join("")}</tbody>
    </table>` : ""}

    ${data.nextMeeting ? `<div style="margin-top:16px;font-size:13px;color:#475569;"><strong>Rapat Berikutnya:</strong> ${e(data.nextMeeting)}</div>` : ""}

    <div class="signature">
      <div class="sig-box">
        <p class="sig-name">${e(data.signer.name)}</p>
        <p class="sig-pos">${e(data.signer.position)}</p>
      </div>
    </div>

    <div class="footer">Notulen Rapat — Dokumen Internal</div>
  </div>
</body>
</html>`;
}
