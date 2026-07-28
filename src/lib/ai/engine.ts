import { generate } from "./openrouter"
import { INVOICE_SYSTEM_PROMPT, buildInvoiceUserPrompt, type InvoiceInput } from "./prompts/invoice"
import { renderInvoiceHTML, type InvoiceData } from "./templates/invoice"
import { QUOTATION_SYSTEM_PROMPT, type QuotationInput } from "./prompts/quotation"
import { renderQuotationHTML, type QuotationData } from "./templates/quotation"
import { PROPOSAL_SYSTEM_PROMPT, buildProposalUserPrompt, type ProposalInput } from "./prompts/proposal"
import { renderProposalHTML, type ProposalData } from "./templates/proposal"
import { CONTRACT_SYSTEM_PROMPT, buildContractUserPrompt, type ContractInput } from "./prompts/contract"
import { renderContractHTML, type ContractData } from "./templates/contract"
import { SOP_SYSTEM_PROMPT, buildSOPUserPrompt, type SOPInput } from "./prompts/sop"
import { renderSOPHTML, type SOPData } from "./templates/sop"
import { RECEIPT_SYSTEM_PROMPT, type ReceiptInput } from "./prompts/receipt"
import { renderReceiptHTML, type ReceiptData } from "./templates/receipt"
import { DELIVERY_SYSTEM_PROMPT, type DeliveryInput } from "./prompts/delivery"
import { renderDeliveryHTML, type DeliveryData } from "./templates/delivery"
import { LETTER_SYSTEM_PROMPT, type LetterInput } from "./prompts/letter"
import { renderLetterHTML, type LetterData } from "./templates/letter"
import { PAYSLIP_SYSTEM_PROMPT, type PayslipInput } from "./prompts/payslip"
import { renderPayslipHTML, type PayslipData } from "./templates/payslip"
import { PO_SYSTEM_PROMPT, type POInput } from "./prompts/purchase-order"
import { renderPurchaseOrderHTML, type POData } from "./templates/purchase-order"
import { MEMO_SYSTEM_PROMPT, type MemoInput } from "./prompts/memo"
import { renderMemoHTML, type MemoData } from "./templates/memo"
import { NOTULEN_SYSTEM_PROMPT, type NotulenInput } from "./prompts/notulen"
import { renderNotulenHTML, type NotulenData } from "./templates/notulen"
import { BERITA_ACARA_SYSTEM_PROMPT, type BeritaAcaraInput } from "./prompts/berita-acara"
import { renderBeritaAcaraHTML, type BeritaAcaraData } from "./templates/berita-acara"
import { ABSENSI_SYSTEM_PROMPT, type AbsensiInput } from "./prompts/absensi"
import { renderAbsensiHTML, type AbsensiData } from "./templates/absensi"
import { SURAT_PENGANGKATAN_SYSTEM_PROMPT, type SuratPengangkatanInput } from "./prompts/surat-pengangkatan"
import { renderSuratPengangkatanHTML, type SuratPengangkatanData } from "./templates/surat-pengangkatan"
import { SURAT_PHK_SYSTEM_PROMPT, type SuratPHKInput } from "./prompts/surat-phk"
import { renderSuratPHKHTML, type SuratPHKData } from "./templates/surat-phk"
import { type ModelTier } from "./model-config"
import { db } from "@/lib/db"

interface GenerateInvoiceInput extends InvoiceInput {
  userId: string
  tier: ModelTier
  logoUrl?: string
}

export async function generateInvoice(input: GenerateInvoiceInput) {
  const { userId, tier, logoUrl, ...invoiceInput } = input

  const userPrompt = buildInvoiceUserPrompt(invoiceInput)

  let result
  try {
    result = await generate({
      tier,
      systemPrompt: INVOICE_SYSTEM_PROMPT,
      userPrompt,
      temperature: 0.3,
    })
  } catch (err) {
    console.error("[AI] Invoice generation failed:", (err as Error).message)
    throw new Error("Gagal menghubungi AI. Silakan coba lagi dalam beberapa saat.")
  }

  let invoiceData: InvoiceData
  try {
    invoiceData = JSON.parse(result.content)
  } catch {
    console.error("[AI] Invoice JSON parse failed, content:", result.content.slice(0, 200))
    throw new Error("AI mengembalikan format yang tidak valid. Silakan coba lagi.")
  }

  let html: string
  try {
    html = renderInvoiceHTML(invoiceData, logoUrl)
  } catch (err) {
    console.error("[AI] Invoice HTML render failed:", (err as Error).message)
    throw new Error("Gagal membuat tampilan invoice. Silakan coba lagi.")
  }

  const doc = await db.document.create({
    data: {
      title: `Invoice ${invoiceData.invoiceNumber}`,
      type: "INVOICE",
      content: JSON.stringify(invoiceData),
      html,
      userId,
    },
  })

  await db.aIGeneration.create({
    data: {
      userId,
      model: result.model,
      prompt: userPrompt,
      tokensIn: result.tokensIn,
      tokensOut: result.tokensOut,
      cost: 0,
      documentId: doc.id,
    },
  })

  return { document: doc, invoiceData, html }
}

interface GenerateQuotationInput extends QuotationInput {
  userId: string
  tier: ModelTier
  logoUrl?: string
}

export async function generateQuotation(input: GenerateQuotationInput) {
  const { userId, tier, logoUrl, ...quotationInput } = input

  const userPrompt = JSON.stringify(quotationInput, null, 2)

  const result = await generate({
    tier,
    systemPrompt: QUOTATION_SYSTEM_PROMPT,
    userPrompt,
    temperature: 0.3,
  })

  let quotationData: QuotationData
  try {
    quotationData = JSON.parse(result.content)
  } catch {
    throw new Error("AI mengembalikan format yang tidak valid. Silakan coba lagi.")
  }

  const html = renderQuotationHTML(quotationData, logoUrl)

  const doc = await db.document.create({
    data: {
      title: `Quotation ${quotationData.quotationNumber}`,
      type: "QUOTATION",
      content: JSON.stringify(quotationData),
      html,
      userId,
    },
  })

  await db.aIGeneration.create({
    data: {
      userId,
      model: result.model,
      prompt: userPrompt,
      tokensIn: result.tokensIn,
      tokensOut: result.tokensOut,
      cost: 0,
      documentId: doc.id,
    },
  })

  return { document: doc, quotationData, html }
}

// --- Proposal Generator ---

interface GenerateProposalInput extends ProposalInput {
  userId: string
  tier: ModelTier
  logoUrl?: string
}

export async function generateProposal(input: GenerateProposalInput) {
  const { userId, tier, logoUrl, ...proposalInput } = input

  const userPrompt = buildProposalUserPrompt(proposalInput)

  const result = await generate({
    tier,
    systemPrompt: PROPOSAL_SYSTEM_PROMPT,
    userPrompt,
    temperature: 0.3,
  })

  let proposalData: ProposalData
  try {
    proposalData = JSON.parse(result.content)
  } catch {
    throw new Error("AI mengembalikan format yang tidak valid. Silakan coba lagi.")
  }

  const html = renderProposalHTML(proposalData, logoUrl)

  const doc = await db.document.create({
    data: {
      title: `Proposal ${proposalData.proposalNumber}`,
      type: "PROPOSAL",
      content: JSON.stringify(proposalData),
      html,
      userId,
    },
  })

  await db.aIGeneration.create({
    data: {
      userId,
      model: result.model,
      prompt: userPrompt,
      tokensIn: result.tokensIn,
      tokensOut: result.tokensOut,
      cost: 0,
      documentId: doc.id,
    },
  })

  return { document: doc, proposalData, html }
}

// --- Contract Generator ---

interface GenerateContractInput extends ContractInput {
  userId: string
  tier: ModelTier
  logoUrl?: string
}

export async function generateContract(input: GenerateContractInput) {
  const { userId, tier, logoUrl, ...contractInput } = input

  const userPrompt = buildContractUserPrompt(contractInput)

  const result = await generate({
    tier,
    systemPrompt: CONTRACT_SYSTEM_PROMPT,
    userPrompt,
    temperature: 0.3,
  })

  let contractData: ContractData
  try {
    contractData = JSON.parse(result.content)
  } catch {
    throw new Error("AI mengembalikan format yang tidak valid. Silakan coba lagi.")
  }

  const html = renderContractHTML(contractData, logoUrl)

  const doc = await db.document.create({
    data: {
      title: `Kontrak ${contractData.contractNumber}`,
      type: "CONTRACT",
      content: JSON.stringify(contractData),
      html,
      userId,
    },
  })

  await db.aIGeneration.create({
    data: {
      userId,
      model: result.model,
      prompt: userPrompt,
      tokensIn: result.tokensIn,
      tokensOut: result.tokensOut,
      cost: 0,
      documentId: doc.id,
    },
  })

  return { document: doc, contractData, html }
}

// --- SOP Generator ---

interface GenerateSOPInput extends SOPInput {
  userId: string
  tier: ModelTier
  logoUrl?: string
}

export async function generateSOP(input: GenerateSOPInput) {
  const { userId, tier, logoUrl, ...sopInput } = input

  const userPrompt = buildSOPUserPrompt(sopInput)

  const result = await generate({
    tier,
    systemPrompt: SOP_SYSTEM_PROMPT,
    userPrompt,
    temperature: 0.3,
  })

  let sopData: SOPData
  try {
    sopData = JSON.parse(result.content)
  } catch {
    throw new Error("AI mengembalikan format yang tidak valid. Silakan coba lagi.")
  }

  const html = renderSOPHTML(sopData, logoUrl)

  const doc = await db.document.create({
    data: {
      title: `SOP ${sopData.sopNumber}`,
      type: "SOP",
      content: JSON.stringify(sopData),
      html,
      userId,
    },
  })

  await db.aIGeneration.create({
    data: {
      userId,
      model: result.model,
      prompt: userPrompt,
      tokensIn: result.tokensIn,
      tokensOut: result.tokensOut,
      cost: 0,
      documentId: doc.id,
    },
  })

  return { document: doc, sopData, html }
}

// --- Receipt (Kwitansi) Generator ---

interface GenerateReceiptInput extends ReceiptInput {
  userId: string
  tier: ModelTier
  logoUrl?: string
}

export async function generateReceipt(input: GenerateReceiptInput) {
  const { userId, tier, logoUrl, ...receiptInput } = input

  const userPrompt = JSON.stringify(receiptInput, null, 2)

  const result = await generate({
    tier,
    systemPrompt: RECEIPT_SYSTEM_PROMPT,
    userPrompt,
    temperature: 0.3,
  })

  let receiptData: ReceiptData
  try {
    receiptData = JSON.parse(result.content)
  } catch {
    throw new Error("AI mengembalikan format yang tidak valid. Silakan coba lagi.")
  }

  const html = renderReceiptHTML(receiptData, logoUrl)

  const doc = await db.document.create({
    data: {
      title: `Kwitansi ${receiptData.receiptNumber}`,
      type: "RECEIPT",
      content: JSON.stringify(receiptData),
      html,
      userId,
    },
  })

  await db.aIGeneration.create({
    data: {
      userId,
      model: result.model,
      prompt: userPrompt,
      tokensIn: result.tokensIn,
      tokensOut: result.tokensOut,
      cost: 0,
      documentId: doc.id,
    },
  })

  return { document: doc, receiptData, html }
}

// --- Delivery (Surat Jalan) Generator ---

interface GenerateDeliveryInput extends DeliveryInput {
  userId: string
  tier: ModelTier
  logoUrl?: string
}

export async function generateDelivery(input: GenerateDeliveryInput) {
  const { userId, tier, logoUrl, ...deliveryInput } = input

  const userPrompt = JSON.stringify(deliveryInput, null, 2)

  const result = await generate({
    tier,
    systemPrompt: DELIVERY_SYSTEM_PROMPT,
    userPrompt,
    temperature: 0.3,
  })

  let deliveryData: DeliveryData
  try {
    deliveryData = JSON.parse(result.content)
  } catch {
    throw new Error("AI mengembalikan format yang tidak valid. Silakan coba lagi.")
  }

  const html = renderDeliveryHTML(deliveryData, logoUrl)

  const doc = await db.document.create({
    data: {
      title: `Surat Jalan ${deliveryData.deliveryNumber}`,
      type: "DELIVERY",
      content: JSON.stringify(deliveryData),
      html,
      userId,
    },
  })

  await db.aIGeneration.create({
    data: {
      userId,
      model: result.model,
      prompt: userPrompt,
      tokensIn: result.tokensIn,
      tokensOut: result.tokensOut,
      cost: 0,
      documentId: doc.id,
    },
  })

  return { document: doc, deliveryData, html }
}

// --- Letter (Surat Resmi) Generator ---

interface GenerateLetterInput extends LetterInput {
  userId: string
  tier: ModelTier
  logoUrl?: string
}

export async function generateLetter(input: GenerateLetterInput) {
  const { userId, tier, logoUrl, ...letterInput } = input

  const userPrompt = JSON.stringify(letterInput, null, 2)

  const result = await generate({
    tier,
    systemPrompt: LETTER_SYSTEM_PROMPT,
    userPrompt,
    temperature: 0.3,
  })

  let letterData: LetterData
  try {
    letterData = JSON.parse(result.content)
  } catch {
    throw new Error("AI mengembalikan format yang tidak valid. Silakan coba lagi.")
  }

  const html = renderLetterHTML(letterData, logoUrl)

  const doc = await db.document.create({
    data: {
      title: `Surat Resmi ${letterData.letterNumber}`,
      type: "LETTER",
      content: JSON.stringify(letterData),
      html,
      userId,
    },
  })

  await db.aIGeneration.create({
    data: {
      userId,
      model: result.model,
      prompt: userPrompt,
      tokensIn: result.tokensIn,
      tokensOut: result.tokensOut,
      cost: 0,
      documentId: doc.id,
    },
  })

  return { document: doc, letterData, html }
}

// --- Payslip (Slip Gaji) Generator ---

interface GeneratePayslipInput extends PayslipInput {
  userId: string
  tier: ModelTier
  logoUrl?: string
}

export async function generatePayslip(input: GeneratePayslipInput) {
  const { userId, tier, logoUrl, ...payslipInput } = input

  const userPrompt = JSON.stringify(payslipInput, null, 2)

  const result = await generate({
    tier,
    systemPrompt: PAYSLIP_SYSTEM_PROMPT,
    userPrompt,
    temperature: 0.3,
  })

  let payslipData: PayslipData
  try {
    payslipData = JSON.parse(result.content)
  } catch {
    throw new Error("AI mengembalikan format yang tidak valid. Silakan coba lagi.")
  }

  const html = renderPayslipHTML(payslipData, logoUrl)

  const doc = await db.document.create({
    data: {
      title: `Slip Gaji ${payslipData.employee.name}`,
      type: "PAYSLIP",
      content: JSON.stringify(payslipData),
      html,
      userId,
    },
  })

  await db.aIGeneration.create({
    data: {
      userId,
      model: result.model,
      prompt: userPrompt,
      tokensIn: result.tokensIn,
      tokensOut: result.tokensOut,
      cost: 0,
      documentId: doc.id,
    },
  })

  return { document: doc, payslipData, html }
}

// --- Purchase Order Generator ---

interface GeneratePOInput extends POInput {
  userId: string
  tier: ModelTier
  logoUrl?: string
}

export async function generatePurchaseOrder(input: GeneratePOInput) {
  const { userId, tier, logoUrl, ...poInput } = input
  const userPrompt = JSON.stringify(poInput, null, 2)
  const result = await generate({ tier, systemPrompt: PO_SYSTEM_PROMPT, userPrompt, temperature: 0.3 })
  let poData: POData
  try { poData = JSON.parse(result.content) } catch { throw new Error("AI mengembalikan format yang tidak valid. Silakan coba lagi.") }
  const html = renderPurchaseOrderHTML(poData, logoUrl)
  const doc = await db.document.create({ data: { title: `Purchase Order ${poData.poNumber}`, type: "PURCHASE_ORDER", content: JSON.stringify(poData), html, userId } })
  await db.aIGeneration.create({ data: { userId, model: result.model, prompt: userPrompt, tokensIn: result.tokensIn, tokensOut: result.tokensOut, cost: 0, documentId: doc.id } })
  return { document: doc, poData, html }
}

// --- Memo Generator ---

interface GenerateMemoInput extends MemoInput {
  userId: string
  tier: ModelTier
  logoUrl?: string
}

export async function generateMemo(input: GenerateMemoInput) {
  const { userId, tier, logoUrl, ...memoInput } = input
  const userPrompt = JSON.stringify(memoInput, null, 2)
  const result = await generate({ tier, systemPrompt: MEMO_SYSTEM_PROMPT, userPrompt, temperature: 0.3 })
  let memoData: MemoData
  try { memoData = JSON.parse(result.content) } catch { throw new Error("AI mengembalikan format yang tidak valid. Silakan coba lagi.") }
  const html = renderMemoHTML(memoData, logoUrl)
  const doc = await db.document.create({ data: { title: `Memo ${memoData.memoNumber}`, type: "MEMO", content: JSON.stringify(memoData), html, userId } })
  await db.aIGeneration.create({ data: { userId, model: result.model, prompt: userPrompt, tokensIn: result.tokensIn, tokensOut: result.tokensOut, cost: 0, documentId: doc.id } })
  return { document: doc, memoData, html }
}

// --- Notulen Generator ---

interface GenerateNotulenInput extends NotulenInput {
  userId: string
  tier: ModelTier
  logoUrl?: string
}

export async function generateNotulen(input: GenerateNotulenInput) {
  const { userId, tier, logoUrl, ...notulenInput } = input
  const userPrompt = JSON.stringify(notulenInput, null, 2)
  const result = await generate({ tier, systemPrompt: NOTULEN_SYSTEM_PROMPT, userPrompt, temperature: 0.3 })
  let notulenData: NotulenData
  try { notulenData = JSON.parse(result.content) } catch { throw new Error("AI mengembalikan format yang tidak valid. Silakan coba lagi.") }
  const html = renderNotulenHTML(notulenData, logoUrl)
  const doc = await db.document.create({ data: { title: `Notulen ${notulenData.meetingTitle}`, type: "NOTULEN", content: JSON.stringify(notulenData), html, userId } })
  await db.aIGeneration.create({ data: { userId, model: result.model, prompt: userPrompt, tokensIn: result.tokensIn, tokensOut: result.tokensOut, cost: 0, documentId: doc.id } })
  return { document: doc, notulenData, html }
}

// --- Berita Acara Generator ---

interface GenerateBeritaAcaraInput extends BeritaAcaraInput {
  userId: string
  tier: ModelTier
  logoUrl?: string
}

export async function generateBeritaAcara(input: GenerateBeritaAcaraInput) {
  const { userId, tier, logoUrl, ...baInput } = input
  const userPrompt = JSON.stringify(baInput, null, 2)
  const result = await generate({ tier, systemPrompt: BERITA_ACARA_SYSTEM_PROMPT, userPrompt, temperature: 0.3 })
  let baData: BeritaAcaraData
  try { baData = JSON.parse(result.content) } catch { throw new Error("AI mengembalikan format yang tidak valid. Silakan coba lagi.") }
  const html = renderBeritaAcaraHTML(baData, logoUrl)
  const doc = await db.document.create({ data: { title: `Berita Acara ${baData.baNumber}`, type: "BERITA_ACARA", content: JSON.stringify(baData), html, userId } })
  await db.aIGeneration.create({ data: { userId, model: result.model, prompt: userPrompt, tokensIn: result.tokensIn, tokensOut: result.tokensOut, cost: 0, documentId: doc.id } })
  return { document: doc, baData, html }
}

// --- Absensi Generator ---

interface GenerateAbsensiInput extends AbsensiInput {
  userId: string
  tier: ModelTier
  logoUrl?: string
}

export async function generateAbsensi(input: GenerateAbsensiInput) {
  const { userId, tier, logoUrl, ...absensiInput } = input
  const userPrompt = JSON.stringify(absensiInput, null, 2)
  const result = await generate({ tier, systemPrompt: ABSENSI_SYSTEM_PROMPT, userPrompt, temperature: 0.3 })
  let absensiData: AbsensiData
  try { absensiData = JSON.parse(result.content) } catch { throw new Error("AI mengembalikan format yang tidak valid. Silakan coba lagi.") }
  const html = renderAbsensiHTML(absensiData, logoUrl)
  const doc = await db.document.create({ data: { title: `Absensi ${absensiData.period}`, type: "ABSENSI", content: JSON.stringify(absensiData), html, userId } })
  await db.aIGeneration.create({ data: { userId, model: result.model, prompt: userPrompt, tokensIn: result.tokensIn, tokensOut: result.tokensOut, cost: 0, documentId: doc.id } })
  return { document: doc, absensiData, html }
}

// --- Surat Pengangkatan Generator ---

interface GenerateSuratPengangkatanInput extends SuratPengangkatanInput {
  userId: string
  tier: ModelTier
  logoUrl?: string
}

export async function generateSuratPengangkatan(input: GenerateSuratPengangkatanInput) {
  const { userId, tier, logoUrl, ...spaInput } = input
  const userPrompt = JSON.stringify(spaInput, null, 2)
  const result = await generate({ tier, systemPrompt: SURAT_PENGANGKATAN_SYSTEM_PROMPT, userPrompt, temperature: 0.3 })
  let spaData: SuratPengangkatanData
  try { spaData = JSON.parse(result.content) } catch { throw new Error("AI mengembalikan format yang tidak valid. Silakan coba lagi.") }
  const html = renderSuratPengangkatanHTML(spaData, logoUrl)
  const doc = await db.document.create({ data: { title: `Surat Pengangkatan ${spaData.employeeName}`, type: "SURAT_PENGANGKATAN", content: JSON.stringify(spaData), html, userId } })
  await db.aIGeneration.create({ data: { userId, model: result.model, prompt: userPrompt, tokensIn: result.tokensIn, tokensOut: result.tokensOut, cost: 0, documentId: doc.id } })
  return { document: doc, spaData, html }
}

// --- Surat PHK Generator ---

interface GenerateSuratPHKInput extends SuratPHKInput {
  userId: string
  tier: ModelTier
  logoUrl?: string
}

export async function generateSuratPHK(input: GenerateSuratPHKInput) {
  const { userId, tier, logoUrl, ...phkInput } = input
  const userPrompt = JSON.stringify(phkInput, null, 2)
  const result = await generate({ tier, systemPrompt: SURAT_PHK_SYSTEM_PROMPT, userPrompt, temperature: 0.3 })
  let phkData: SuratPHKData
  try { phkData = JSON.parse(result.content) } catch { throw new Error("AI mengembalikan format yang tidak valid. Silakan coba lagi.") }
  const html = renderSuratPHKHTML(phkData, logoUrl)
  const doc = await db.document.create({ data: { title: `Surat PHK ${phkData.employeeName}`, type: "SURAT_PHK", content: JSON.stringify(phkData), html, userId } })
  await db.aIGeneration.create({ data: { userId, model: result.model, prompt: userPrompt, tokensIn: result.tokensIn, tokensOut: result.tokensOut, cost: 0, documentId: doc.id } })
  return { document: doc, phkData, html }
}
