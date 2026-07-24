import { escapeHtml } from "@/lib/utils"

export interface ProposalData {
  proposalNumber: string
  date: string
  title: string
  type: string
  from: { name: string; address: string; phone: string; email: string }
  to: { name: string; address: string; phone: string }
  executiveSummary: string
  background: string
  objectives: string[]
  solution: string
  timeline: Array<{ phase: string; duration: string; description: string }>
  budget: { items: Array<{ description: string; amount: number }>; total: number }
  team: Array<{ name: string; role: string }>
  terms: string
  notes: string
}

export function renderProposalHTML(data: ProposalData, logoUrl?: string): string {
  const fmt = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n)

  const e = escapeHtml

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${e(data.title)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1a1a; background: #fff; line-height: 1.6; }
    .page { max-width: 800px; margin: 0 auto; padding: 40px; }
    .cover { text-align: center; padding: 60px 0 40px; border-bottom: 4px solid #7c3aed; margin-bottom: 40px; }
    .logo { max-height: 80px; margin-bottom: 24px; }
    .doc-type { font-size: 14px; text-transform: uppercase; letter-spacing: 3px; color: #7c3aed; font-weight: 600; margin-bottom: 12px; }
    .doc-title { font-size: 32px; font-weight: 800; color: #111827; margin-bottom: 8px; }
    .doc-number { font-size: 14px; color: #6b7280; }
    .meta-bar { display: flex; justify-content: space-between; padding: 16px 0; border-bottom: 1px solid #e5e7eb; margin-bottom: 32px; font-size: 13px; color: #6b7280; }
    .meta-bar strong { color: #374151; }
    .section { margin-bottom: 32px; }
    .section-title { font-size: 18px; font-weight: 700; color: #7c3aed; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #ede9fe; }
    .section-text { font-size: 14px; color: #374151; line-height: 1.8; }
    .objectives-list { list-style: none; padding: 0; }
    .objectives-list li { padding: 8px 0 8px 24px; position: relative; font-size: 14px; color: #374151; }
    .objectives-list li::before { content: "✓"; position: absolute; left: 0; color: #7c3aed; font-weight: 700; }
    .timeline-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    .timeline-table th { background: #f5f3ff; text-align: left; padding: 10px 16px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6d28d9; font-weight: 600; border-bottom: 2px solid #ddd6fe; }
    .timeline-table td { padding: 10px 16px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    .budget-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    .budget-table th { background: #f5f3ff; text-align: left; padding: 10px 16px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6d28d9; font-weight: 600; border-bottom: 2px solid #ddd6fe; }
    .budget-table td { padding: 10px 16px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    .budget-table td:last-child { text-align: right; font-variant-numeric: tabular-nums; }
    .budget-total { display: flex; justify-content: flex-end; margin-top: 12px; font-size: 18px; font-weight: 800; color: #7c3aed; }
    .team-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0; }
    .team-card { background: #f5f3ff; border-radius: 8px; padding: 12px 16px; }
    .team-name { font-size: 14px; font-weight: 600; color: #111827; }
    .team-role { font-size: 12px; color: #7c3aed; }
    .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #6b7280; }
    @media print { .page { padding: 20px; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="page">
    <div class="cover">
      ${logoUrl ? `<img src="${escapeHtml(logoUrl)}" class="logo" alt="Logo">` : ""}
      <div class="doc-type">${e(data.type)}</div>
      <div class="doc-title">${e(data.title)}</div>
      <div class="doc-number">${e(data.proposalNumber)}</div>
    </div>

    <div class="meta-bar">
      <div><strong>Tanggal:</strong> ${e(data.date)}</div>
      <div><strong>Dari:</strong> ${e(data.from.name)}</div>
      <div><strong>Kepada:</strong> ${e(data.to.name)}</div>
    </div>

    <div class="section">
      <div class="section-title">Ringkasan Eksekutif</div>
      <div class="section-text">${e(data.executiveSummary)}</div>
    </div>

    <div class="section">
      <div class="section-title">Latar Belakang</div>
      <div class="section-text">${e(data.background)}</div>
    </div>

    <div class="section">
      <div class="section-title">Tujuan</div>
      <ul class="objectives-list">
        ${data.objectives.map(o => `<li>${e(o)}</li>`).join("")}
      </ul>
    </div>

    <div class="section">
      <div class="section-title">Solusi & Pendekatan</div>
      <div class="section-text">${e(data.solution)}</div>
    </div>

    ${data.timeline.length > 0 ? `
    <div class="section">
      <div class="section-title">Timeline</div>
      <table class="timeline-table">
        <thead><tr><th>Fase</th><th>Durasi</th><th>Deskripsi</th></tr></thead>
        <tbody>
          ${data.timeline.map(t => `<tr><td><strong>${e(t.phase)}</strong></td><td>${e(t.duration)}</td><td>${e(t.description)}</td></tr>`).join("")}
        </tbody>
      </table>
    </div>` : ""}

    ${data.budget.items.length > 0 ? `
    <div class="section">
      <div class="section-title">Anggaran</div>
      <table class="budget-table">
        <thead><tr><th>Deskripsi</th><th style="text-align:right">Jumlah</th></tr></thead>
        <tbody>
          ${data.budget.items.map(b => `<tr><td>${e(b.description)}</td><td>${fmt(b.amount)}</td></tr>`).join("")}
        </tbody>
      </table>
      <div class="budget-total">Total: ${fmt(data.budget.total)}</div>
    </div>` : ""}

    ${data.team.length > 0 ? `
    <div class="section">
      <div class="section-title">Tim</div>
      <div class="team-grid">
        ${data.team.map(t => `<div class="team-card"><div class="team-name">${e(t.name)}</div><div class="team-role">${e(t.role)}</div></div>`).join("")}
      </div>
    </div>` : ""}

    <div class="footer">
      ${data.terms ? `<div style="margin-bottom:12px"><strong style="color:#374151">Syarat & Ketentuan:</strong> ${e(data.terms)}</div>` : ""}
      ${data.notes ? `<div><strong style="color:#374151">Catatan:</strong> ${e(data.notes)}</div>` : ""}
    </div>
  </div>
</body>
</html>`
}
