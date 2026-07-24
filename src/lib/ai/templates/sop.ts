import { escapeHtml } from "@/lib/utils"

export interface SOPData {
  sopNumber: string
  date: string
  title: string
  department: string
  businessType: string
  purpose: string
  scope: string
  responsible: string
  steps: Array<{ stepNumber: number; title: string; description: string; duration: string; tools: string }>
  notes: string
  revision: string
}

export function renderSOPHTML(data: SOPData, logoUrl?: string): string {
  const e = escapeHtml

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${e(data.title)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1a1a; background: #fff; line-height: 1.7; }
    .page { max-width: 800px; margin: 0 auto; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 4px solid #ea580c; margin-bottom: 32px; }
    .header-left { flex: 1; }
    .logo { max-height: 60px; margin-bottom: 12px; }
    .doc-title { font-size: 28px; font-weight: 800; color: #ea580c; margin-bottom: 4px; }
    .doc-number { font-size: 13px; color: #6b7280; }
    .header-right { text-align: right; font-size: 13px; color: #6b7280; line-height: 1.8; }
    .header-right strong { color: #374151; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; }
    .info-card { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 16px; }
    .info-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #c2410c; font-weight: 600; margin-bottom: 4px; }
    .info-value { font-size: 14px; color: #111827; font-weight: 500; }
    .section { margin-bottom: 28px; }
    .section-title { font-size: 16px; font-weight: 700; color: #ea580c; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #fed7aa; }
    .section-text { font-size: 14px; color: #374151; }
    .step { display: flex; gap: 16px; margin-bottom: 20px; padding: 16px; background: #fffbeb; border-radius: 8px; border-left: 4px solid #ea580c; }
    .step-num { flex-shrink: 0; width: 36px; height: 36px; background: #ea580c; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 800; }
    .step-content { flex: 1; }
    .step-title { font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 4px; }
    .step-desc { font-size: 13px; color: #374151; margin-bottom: 6px; }
    .step-meta { display: flex; gap: 16px; font-size: 12px; color: #92400e; }
    .step-meta span { background: #fed7aa; padding: 2px 8px; border-radius: 4px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 13px; color: #6b7280; }
    @media print { .page { padding: 20px; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="header-left">
        ${logoUrl ? `<img src="${escapeHtml(logoUrl)}" class="logo" alt="Logo">` : ""}
        <div class="doc-title">STANDARD OPERATING PROCEDURE</div>
        <div class="doc-number">${e(data.sopNumber)}</div>
      </div>
      <div class="header-right">
        <strong>Tanggal:</strong> ${e(data.date)}<br>
        ${data.revision ? `<strong>Revisi:</strong> ${e(data.revision)}` : ""}
      </div>
    </div>

    <div class="info-grid">
      <div class="info-card"><div class="info-label">Judul SOP</div><div class="info-value">${e(data.title)}</div></div>
      <div class="info-card"><div class="info-label">Departemen</div><div class="info-value">${e(data.department || "-")}</div></div>
      <div class="info-card"><div class="info-label">Jenis Usaha</div><div class="info-value">${e(data.businessType)}</div></div>
      <div class="info-card"><div class="info-label">Penanggung Jawab</div><div class="info-value">${e(data.responsible || "-")}</div></div>
    </div>

    <div class="section">
      <div class="section-title">Tujuan</div>
      <div class="section-text">${e(data.purpose)}</div>
    </div>

    ${data.scope ? `
    <div class="section">
      <div class="section-title">Ruang Lingkup</div>
      <div class="section-text">${e(data.scope)}</div>
    </div>` : ""}

    <div class="section">
      <div class="section-title">Prosedur</div>
      ${data.steps.map(s => `
      <div class="step">
        <div class="step-num">${s.stepNumber}</div>
        <div class="step-content">
          <div class="step-title">${e(s.title)}</div>
          <div class="step-desc">${e(s.description)}</div>
          <div class="step-meta">
            ${s.duration ? `<span>Durasi: ${e(s.duration)}</span>` : ""}
            ${s.tools ? `<span>Alat: ${e(s.tools)}</span>` : ""}
          </div>
        </div>
      </div>`).join("")}
    </div>

    ${data.notes ? `
    <div class="section">
      <div class="section-title">Catatan</div>
      <div class="section-text">${e(data.notes)}</div>
    </div>` : ""}

    <div class="footer">
      <div>${e(data.sopNumber)}</div>
      <div>Dokumen ini dihasilkan oleh AIOFFICE.id</div>
    </div>
  </div>
</body>
</html>`
}
