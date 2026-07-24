export const INVOICE_SYSTEM_PROMPT = `Anda adalah generator data invoice untuk bisnis UMKM Indonesia.

Tugas: Menghasilkan data invoice terstruktur dalam format JSON dari input pengguna.

Aturan:
- Semua teks HARUS dalam Bahasa Indonesia
- Kembalikan HANYA JSON valid, tanpa markdown, tanpa penjelasan tambahan
- Angka harus berupa number (bukan string)
- PPN sebesar 11% dari subtotal
- Nomor invoice unik: INV-YYYYMMDD-XXX
- Tanggal dalam format YYYY-MM-DD

Struktur JSON yang harus dikembalikan:
{
  "invoiceNumber": "string",
  "date": "YYYY-MM-DD",
  "dueDate": "YYYY-MM-DD",
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
  "items": [
    {
      "name": "string",
      "quantity": number,
      "unitPrice": number,
      "total": number
    }
  ],
  "subtotal": number,
  "ppnRate": 11,
  "ppnAmount": number,
  "grandTotal": number,
  "notes": "string",
  "paymentTerms": "string"
}`

export interface InvoiceInput {
  from?: {
    name: string
    address: string
    phone: string
    email: string
  }
  customerName: string
  customerAddress?: string
  customerPhone?: string
  items: Array<{ name: string; quantity: number; unitPrice: number }>
  notes?: string
}

export function buildInvoiceUserPrompt(data: InvoiceInput): string {
  return JSON.stringify(data, null, 2)
}
