import { escapeHtml } from "@/lib/utils"

export interface ContractData {
  contractNumber: string
  date: string
  title: string
  type: string
  partyA: { name: string; address: string; phone: string; position: string }
  partyB: { name: string; address: string; phone: string; position: string }
  subject: string
  duration: { startDate: string; endDate: string; description: string }
  value: number
  clauses: Array<{ number: number; title: string; content: string }>
  signatures: { partyA: { name: string; position: string }; partyB: { name: string; position: string } }
  notes: string
}

export function renderContractHTML(data: ContractData, logoUrl?: string): string {
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
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1a1a; background: #fff; line-height: 1.8; }
    .page { max-width: 800px; margin: 0 auto; padding: 40px; }
    .header { text-align: center; padding-bottom: 32px; border-bottom: 3px solid #334155; margin-bottom: 32px; }
    .logo { max-height: 70px; margin-bottom: 16px; }
    .doc-type { font-size: 13px; text-transform: uppercase; letter-spacing: 3px; color: #64748b; font-weight: 600; }
    .doc-title { font-size: 28px; font-weight: 800; color: #111827; margin: 8px 0; }
    .doc-number { font-size: 13px; color: #6b7280; }
    .meta-info { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; padding: 20px; background: #f8fafc; border-radius: 8px; }
    .meta-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 600; }
    .meta-value { font-size: 14px; color: #111827; font-weight: 600; margin-top: 4px; }
    .subject { background: #f1f5f9; border-left: 4px solid #334155; padding: 16px 20px; margin-bottom: 32px; border-radius: 0 8px 8px 0; }
    .subject-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 600; margin-bottom: 4px; }
    .subject-text { font-size: 14px; color: #111827; }
    .section { margin-bottom: 28px; }
    .clause { margin-bottom: 20px; }
    .clause-number { display: inline-block; background: #334155; color: #fff; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-size: 13px; font-weight: 700; margin-right: 8px; }
    .clause-title { display: inline; font-size: 15px; font-weight: 700; color: #111827; }
    .clause-content { margin-top: 8px; font-size: 14px; color: #374151; line-height: 1.8; padding-left: 36px; }
    .value-box { text-align: center; padding: 20px; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; margin: 24px 0; }
    .value-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; }
    .value-amount { font-size: 28px; font-weight: 800; color: #334155; margin-top: 4px; }
    .duration-box { display: flex; gap: 24px; padding: 16px; background: #f8fafc; border-radius: 8px; margin-bottom: 28px; }
    .duration-item { flex: 1; text-align: center; }
    .duration-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; }
    .duration-value { font-size: 14px; font-weight: 600; color: #111827; margin-top: 4px; }
    .signatures { display: flex; justify-content: space-between; margin-top: 60px; padding-top: 40px; }
    .sig-block { width: 45%; text-align: center; }
    .sig-line { border-top: 1px solid #334155; margin-top: 80px; padding-top: 8px; }
    .sig-name { font-size: 14px; font-weight: 700; color: #111827; }
    .sig-position { font-size: 12px; color: #6b7280; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #6b7280; }
    @media print { .page { padding: 20px; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      ${logoUrl ? `<img src="${escapeHtml(logoUrl)}" class="logo" alt="Logo">` : ""}
      <div class="doc-type">${e(data.type)}</div>
      <div class="doc-title">${e(data.title)}</div>
      <div class="doc-number">${e(data.contractNumber)}</div>
    </div>

    <div class="meta-info">
      <div><div class="meta-label">Tanggal</div><div class="meta-value">${e(data.date)}</div></div>
      <div><div class="meta-label">Jenis</div><div class="meta-value">${e(data.type)}</div></div>
      <div><div class="meta-label">PIHAK PERTAMA</div><div class="meta-value">${e(data.partyA.name)}<br><span style="font-size:12px;color:#6b7280;font-weight:400">${e(data.partyA.position)}</span></div></div>
      <div><div class="meta-label">PIHAK KEDUA</div><div class="meta-value">${e(data.partyB.name)}<br><span style="font-size:12px;color:#6b7280;font-weight:400">${e(data.partyB.position)}</span></div></div>
    </div>

    <div class="subject">
      <div class="subject-label">Materi Perjanjian</div>
      <div class="subject-text">${e(data.subject)}</div>
    </div>

    <div class="duration-box">
      <div class="duration-item"><div class="duration-label">Tanggal Mulai</div><div class="duration-value">${e(data.duration.startDate)}</div></div>
      <div class="duration-item"><div class="duration-label">Tanggal Berakhir</div><div class="duration-value">${e(data.duration.endDate)}</div></div>
      <div class="duration-item"><div class="duration-label">Durasi</div><div class="duration-value">${e(data.duration.description)}</div></div>
    </div>

    ${data.value > 0 ? `
    <div class="value-box">
      <div class="value-label">Nilai Kontrak</div>
      <div class="value-amount">${fmt(data.value)}</div>
    </div>` : ""}

    <div class="section">
      ${data.clauses.map(c => `
      <div class="clause">
        <span class="clause-number">${c.number}</span>
        <span class="clause-title">${e(c.title)}</span>
        <div class="clause-content">${e(c.content)}</div>
      </div>`).join("")}
    </div>

    <div class="signatures">
      <div class="sig-block">
        <div class="sig-line">
          <div class="sig-name">${e(data.signatures.partyA.name)}</div>
          <div class="sig-position">${e(data.signatures.partyA.position)}</div>
        </div>
      </div>
      <div class="sig-block">
        <div class="sig-line">
          <div class="sig-name">${e(data.signatures.partyB.name)}</div>
          <div class="sig-position">${e(data.signatures.partyB.position)}</div>
        </div>
      </div>
    </div>

    ${data.notes ? `<div class="footer"><strong>Catatan:</strong> ${e(data.notes)}</div>` : ""}
  </div>
</body>
</html>`
}
