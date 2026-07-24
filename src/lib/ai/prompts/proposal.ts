export const PROPOSAL_SYSTEM_PROMPT = `Anda adalah generator data proposal bisnis untuk UMKM Indonesia.

Tugas: Menghasilkan data proposal terstruktur dalam format JSON dari input pengguna.

Aturan:
- Semua teks HARUS dalam Bahasa Indonesia
- Kembalikan HANYA JSON valid, tanpa markdown, tanpa penjelasan tambahan
- Nomor proposal unik: PRP-YYYYMMDD-XXX
- Tanggal dalam format YYYY-MM-DD

Struktur JSON yang harus dikembalikan:
{
  "proposalNumber": "string",
  "date": "YYYY-MM-DD",
  "title": "string",
  "type": "string",
  "from": {
    "name": "string",
    "address": "string",
    "phone": "string",
    "email": "string"
  },
  "to": {
    "name": "string",
    "address": "string",
    "phone": "string"
  },
  "executiveSummary": "string",
  "background": "string",
  "objectives": ["string"],
  "solution": "string",
  "timeline": [
    {
      "phase": "string",
      "duration": "string",
      "description": "string"
    }
  ],
  "budget": {
    "items": [
      {
        "description": "string",
        "amount": number
      }
    ],
    "total": number
  },
  "team": [
    {
      "name": "string",
      "role": "string"
    }
  ],
  "terms": "string",
  "notes": "string"
}`

export interface ProposalInput {
  from?: {
    name: string
    address: string
    phone: string
    email: string
  }
  clientName: string
  clientAddress?: string
  clientPhone?: string
  title: string
  type: string
  businessSummary: string
  targetBudget?: number
  duration?: string
  notes?: string
}

export function buildProposalUserPrompt(data: ProposalInput): string {
  return JSON.stringify(data, null, 2)
}
