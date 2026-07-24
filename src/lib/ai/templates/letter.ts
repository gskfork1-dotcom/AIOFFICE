import { escapeHtml } from "@/lib/utils";

export interface LetterData {
  letterNumber: string;
  date: string;
  from: {
    name: string;
    address: string;
    phone: string;
  };
  to: {
    name: string;
    position: string;
    organization: string;
    address: string;
  };
  subject: string;
  content: string;
  attachments?: string[];
  closing: string;
  signer: {
    name: string;
    position: string;
  };
}

export function renderLetterHTML(data: LetterData, logoUrl?: string): string {
  const e = escapeHtml;

  const paragraphs = data.content
    .split("\n")
    .filter((p) => p.trim() !== "")
    .map((p) => `<p style="margin:0 0 12px 0;line-height:1.7;">${e(p)}</p>`)
    .join("");

  const attachmentsList =
    data.attachments && data.attachments.length > 0
      ? `
        <div style="margin-top:24px;">
          <p style="margin:0 0 8px 0;font-weight:600;color:#475569;">Lampiran:</p>
          <ol style="margin:0;padding-left:20px;">
            ${data.attachments.map((a) => `<li style="margin-bottom:4px;">${e(a)}</li>`).join("\n            ")}
          </ol>
        </div>`
      : "";

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Surat Resmi</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Inter:wght@400;500;600&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', 'Times New Roman', serif;
      background: #f1f5f9;
      padding: 40px;
      color: #1e293b;
    }

    .letter-page {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      padding: 64px 72px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }

    .header-bar {
      display: flex;
      align-items: center;
      gap: 16px;
      padding-bottom: 16px;
      border-bottom: 3px solid #475569;
      margin-bottom: 8px;
    }

    .logo {
      width: 64px;
      height: 64px;
      object-fit: contain;
    }

    .header-title {
      font-family: 'Libre Baskerville', 'Times New Roman', serif;
      font-size: 18px;
      font-weight: 700;
      color: #475569;
      letter-spacing: 3px;
      text-transform: uppercase;
    }

    .header-subtitle {
      font-size: 11px;
      color: #94a3b8;
      letter-spacing: 1px;
      margin-top: 2px;
    }

    .letter-meta {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-top: 28px;
      margin-bottom: 28px;
    }

    .letter-number {
      font-size: 14px;
      font-weight: 600;
      color: #475569;
    }

    .letter-date {
      font-size: 14px;
      color: #64748b;
      text-align: right;
    }

    .address-block {
      margin-bottom: 28px;
    }

    .address-label {
      font-size: 11px;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 6px;
    }

    .address-content {
      font-size: 14px;
      line-height: 1.6;
      color: #334155;
    }

    .address-content strong {
      color: #1e293b;
    }

    .divider {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 20px 0;
    }

    .subject-line {
      background: #f8fafc;
      border-left: 4px solid #475569;
      padding: 12px 16px;
      margin-bottom: 28px;
      font-size: 14px;
      font-weight: 600;
      color: #475569;
    }

    .subject-line span {
      color: #94a3b8;
      font-weight: 400;
      margin-right: 8px;
    }

    .content-body {
      font-size: 14px;
      line-height: 1.7;
      color: #1e293b;
    }

    .closing-section {
      margin-top: 32px;
    }

    .closing-greeting {
      font-size: 14px;
      color: #1e293b;
      margin-bottom: 48px;
    }

    .signature-block {
      text-align: right;
    }

    .signer-name {
      font-size: 14px;
      font-weight: 700;
      color: #1e293b;
      text-decoration: underline;
      text-underline-offset: 4px;
    }

    .signer-position {
      font-size: 13px;
      color: #64748b;
      margin-top: 2px;
    }

    .footer-bar {
      margin-top: 40px;
      padding-top: 12px;
      border-top: 2px solid #475569;
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
      letter-spacing: 0.5px;
    }

    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }

      .letter-page {
        box-shadow: none;
        padding: 0;
        max-width: none;
      }

      .header-bar {
        border-bottom-color: #475569 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .subject-line {
        background-color: #f8fafc !important;
        border-left-color: #475569 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .footer-bar {
        border-top-color: #475569 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .signer-name {
        text-decoration: underline;
      }
    }

    @page {
      size: A4;
      margin: 20mm;
    }
  </style>
</head>
<body>
  <div class="letter-page">
    <div class="header-bar">
      ${logoUrl ? `<img src="${e(logoUrl)}" alt="Logo" class="logo" />` : ""}
      <div>
        <div class="header-title">Surat Resmi</div>
        <div class="header-subtitle">FORMAL LETTER</div>
      </div>
    </div>

    <div class="letter-meta">
      <div class="letter-number">${e(data.letterNumber)}</div>
      <div class="letter-date">${e(data.date)}</div>
    </div>

    <div class="address-block">
      <div class="address-label">Kepada Yth.</div>
      <div class="address-content">
        <strong>${e(data.to.name)}</strong><br />
        ${data.to.position ? `${e(data.to.position)}<br />` : ""}
        ${data.to.organization ? `${e(data.to.organization)}<br />` : ""}
        ${e(data.to.address)}
      </div>
    </div>

    <hr class="divider" />

    <div class="address-block">
      <div class="address-label">Dari</div>
      <div class="address-content">
        <strong>${e(data.from.name)}</strong><br />
        ${e(data.from.address)}<br />
        ${e(data.from.phone)}
      </div>
    </div>

    <div class="subject-line">
      <span>Perihal :</span> ${e(data.subject)}
    </div>

    <div class="content-body">
      ${paragraphs}
    </div>

    ${attachmentsList}

    <div class="closing-section">
      <p class="closing-greeting">${e(data.closing)}</p>

      <div class="signature-block">
        <p class="signer-name">${e(data.signer.name)}</p>
        <p class="signer-position">${e(data.signer.position)}</p>
      </div>
    </div>

    <div class="footer-bar">
      Dokumen ini merupakan surat resmi yang sah
    </div>
  </div>
</body>
</html>`;
}
