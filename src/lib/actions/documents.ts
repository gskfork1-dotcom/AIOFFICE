"use server"

import { auth, clerkClient } from "@clerk/nextjs/server"
import { generateInvoice } from "@/lib/ai/engine"
import { generateQuotation } from "@/lib/ai/engine"
import { generateProposal } from "@/lib/ai/engine"
import { generateContract } from "@/lib/ai/engine"
import { generateSOP } from "@/lib/ai/engine"
import { generateReceipt } from "@/lib/ai/engine"
import { generateDelivery } from "@/lib/ai/engine"
import { generateLetter } from "@/lib/ai/engine"
import { generatePayslip } from "@/lib/ai/engine"
import { generatePurchaseOrder } from "@/lib/ai/engine"
import { generateMemo } from "@/lib/ai/engine"
import { generateNotulen } from "@/lib/ai/engine"
import { generateBeritaAcara } from "@/lib/ai/engine"
import { generateAbsensi } from "@/lib/ai/engine"
import { generateSuratPengangkatan } from "@/lib/ai/engine"
import { generateSuratPHK } from "@/lib/ai/engine"
import { getTierFromRole } from "@/lib/ai/model-config"
import { db } from "@/lib/db"

async function ensureUserExists(userId: string) {
  const existing = await db.user.findUnique({ where: { id: userId } })
  if (existing) return existing

  let email = `${userId}@placeholder.com`
  let name: string | null = null
  let image: string | null = null

  try {
    const client = await clerkClient()
    const clerkUser = await client.users.getUser(userId)
    email = clerkUser.emailAddresses?.[0]?.emailAddress ?? email
    name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null
    image = clerkUser.imageUrl ?? null
  } catch (err) {
    console.warn("[Auth] Failed to fetch Clerk user:", (err as Error).message)
  }

  return db.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId, email, name, image },
  })
}

const FREE_GENERATION_LIMIT = 5

async function checkGenerationLimit(userId: string) {
  const user = await ensureUserExists(userId)
  const tier = user.role ?? "FREE"
  if (tier !== "FREE") return

  const count = await db.aIGeneration.count({ where: { userId } })
  if (count >= FREE_GENERATION_LIMIT) {
    throw new Error(`Batas gratis tercapai (${FREE_GENERATION_LIMIT}x). Upgrade ke paket Starter untuk melanjutkan.`)
  }
}

export async function createInvoiceAction(formData: {
  customerName: string
  customerAddress?: string
  customerPhone?: string
  items: Array<{ name: string; quantity: number; unitPrice: number }>
  notes?: string
  from?: { name: string; address: string; phone: string; email: string }
}) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  await checkGenerationLimit(userId)
  const user = await ensureUserExists(userId)
  const tier = getTierFromRole(user.role ?? "FREE")

  if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === "sk-or-v1-...") {
    throw new Error("API key OpenRouter belum dikonfigurasi. Silakan isi OPENROUTER_API_KEY di file .env")
  }

  const result = await generateInvoice({
    userId,
    tier,
    customerName: formData.customerName,
    customerAddress: formData.customerAddress,
    customerPhone: formData.customerPhone,
    items: formData.items,
    notes: formData.notes,
    from: formData.from,
  })

  return { documentId: result.document.id, html: result.html }
}

export async function createQuotationAction(formData: {
  customerName: string
  customerAddress?: string
  customerPhone?: string
  items: Array<{ name: string; description?: string; quantity: number; unitPrice: number }>
  discount?: number
  notes?: string
  validUntil?: string
  from?: { name: string; address: string; phone: string; email: string }
}) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  await checkGenerationLimit(userId)
  const user = await ensureUserExists(userId)
  const tier = getTierFromRole(user.role ?? "FREE")

  if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === "sk-or-v1-...") {
    throw new Error("API key OpenRouter belum dikonfigurasi. Silakan isi OPENROUTER_API_KEY di file .env")
  }

  const result = await generateQuotation({
    userId,
    tier,
    customerName: formData.customerName,
    customerAddress: formData.customerAddress,
    customerPhone: formData.customerPhone,
    items: formData.items,
    discount: formData.discount,
    notes: formData.notes,
    validUntil: formData.validUntil,
    logoUrl: undefined,
  })

  return { documentId: result.document.id, html: result.html }
}

export async function getDocuments(folderId?: string | null) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const where: Record<string, unknown> = { userId, deletedAt: null }
  if (folderId !== undefined && folderId !== null) {
    where.folderId = folderId
  }

  const documents = await db.document.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { folder: true },
  })

  return documents
}

export async function getDocument(id: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const document = await db.document.findFirst({
    where: { id, userId },
  })

  return document
}

export async function deleteDocument(id: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  await db.document.updateMany({
    where: { id, userId },
    data: { deletedAt: new Date() },
  })

  return { success: true }
}

export async function toggleFavorite(id: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const doc = await db.document.findFirst({ where: { id, userId } })
  if (!doc) throw new Error("Dokumen tidak ditemukan")

  await db.document.update({
    where: { id },
    data: { isFavorite: !doc.isFavorite },
  })

  return { isFavorite: !doc.isFavorite }
}

export async function getTrashedDocuments() {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const documents = await db.document.findMany({
    where: { userId, deletedAt: { not: null } },
    orderBy: { deletedAt: "desc" },
  })

  return documents
}

export async function restoreDocument(id: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  await db.document.updateMany({
    where: { id, userId, deletedAt: { not: null } },
    data: { deletedAt: null },
  })

  return { success: true }
}

export async function permanentDeleteDocument(id: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  await db.document.deleteMany({
    where: { id, userId, deletedAt: { not: null } },
  })

  return { success: true }
}

export async function getFolders() {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const folders = await db.folder.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { documents: true } } },
  })

  return folders
}

export async function createFolder(name: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  await ensureUserExists(userId)

  const folder = await db.folder.create({
    data: { name, userId },
  })

  return folder
}

export async function deleteFolder(id: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  await db.folder.deleteMany({
    where: { id, userId },
  })

  return { success: true }
}

export async function getDashboardStats() {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  await ensureUserExists(userId)

  const [documentCount, generationCount, user] = await Promise.all([
    db.document.count({ where: { userId } }),
    db.aIGeneration.count({ where: { userId } }),
    db.user.findUnique({ where: { id: userId }, include: { subscription: true } }),
  ])

  return {
    documentCount,
    generationCount,
    tier: user?.subscription?.tier ?? user?.role ?? "FREE",
  }
}

export async function getCompanyProfile() {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const profile = await db.companyProfile.findUnique({ where: { userId } })
  return profile
}

export async function saveCompanyProfile(data: {
  name: string
  address?: string
  phone?: string
  email?: string
}) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  await ensureUserExists(userId)

  const profile = await db.companyProfile.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  })

  return profile
}

export async function createProposalAction(formData: {
  title: string
  type: string
  clientName: string
  clientAddress?: string
  clientPhone?: string
  businessSummary: string
  targetBudget?: number
  duration?: string
  notes?: string
  from?: { name: string; address: string; phone: string; email: string }
}) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  await checkGenerationLimit(userId)
  const user = await ensureUserExists(userId)
  const tier = getTierFromRole(user.role ?? "FREE")

  if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === "sk-or-v1-...") {
    throw new Error("API key OpenRouter belum dikonfigurasi. Silakan isi OPENROUTER_API_KEY di file .env")
  }

  const result = await generateProposal({
    userId,
    tier,
    title: formData.title,
    type: formData.type,
    clientName: formData.clientName,
    clientAddress: formData.clientAddress,
    clientPhone: formData.clientPhone,
    businessSummary: formData.businessSummary,
    targetBudget: formData.targetBudget,
    duration: formData.duration,
    notes: formData.notes,
    from: formData.from,
  })

  return { documentId: result.document.id, html: result.html }
}

export async function createContractAction(formData: {
  type: string
  partyAName: string
  partyAAddress?: string
  partyAPhone?: string
  partyAPosition?: string
  partyBName: string
  partyBAddress?: string
  partyBPhone?: string
  partyBPosition?: string
  subject: string
  startDate?: string
  endDate?: string
  contractValue?: number
  specialTerms?: string
  notes?: string
}) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  await checkGenerationLimit(userId)
  const user = await ensureUserExists(userId)
  const tier = getTierFromRole(user.role ?? "FREE")

  if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === "sk-or-v1-...") {
    throw new Error("API key OpenRouter belum dikonfigurasi. Silakan isi OPENROUTER_API_KEY di file .env")
  }

  const result = await generateContract({
    userId,
    tier,
    type: formData.type,
    partyAName: formData.partyAName,
    partyAAddress: formData.partyAAddress,
    partyAPhone: formData.partyAPhone,
    partyAPosition: formData.partyAPosition,
    partyBName: formData.partyBName,
    partyBAddress: formData.partyBAddress,
    partyBPhone: formData.partyBPhone,
    partyBPosition: formData.partyBPosition,
    subject: formData.subject,
    startDate: formData.startDate,
    endDate: formData.endDate,
    contractValue: formData.contractValue,
    specialTerms: formData.specialTerms,
    notes: formData.notes,
  })

  return { documentId: result.document.id, html: result.html }
}

export async function createSOPAction(formData: {
  title: string
  department?: string
  businessType: string
  purpose?: string
  steps?: string
  responsible?: string
  notes?: string
}) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  await checkGenerationLimit(userId)
  const user = await ensureUserExists(userId)
  const tier = getTierFromRole(user.role ?? "FREE")

  if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === "sk-or-v1-...") {
    throw new Error("API key OpenRouter belum dikonfigurasi. Silakan isi OPENROUTER_API_KEY di file .env")
  }

  const result = await generateSOP({
    userId,
    tier,
    title: formData.title,
    department: formData.department,
    businessType: formData.businessType,
    purpose: formData.purpose,
    steps: formData.steps,
    responsible: formData.responsible,
    notes: formData.notes,
  })

  return { documentId: result.document.id, html: result.html }
}

export async function createReceiptAction(formData: {
  customerName: string
  customerAddress?: string
  items: Array<{ name: string; quantity: number; unitPrice: number }>
  paymentMethod?: string
  notes?: string
  from?: { name: string; address: string; phone: string }
}) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  await checkGenerationLimit(userId)
  const user = await ensureUserExists(userId)
  const tier = getTierFromRole(user.role ?? "FREE")

  if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === "sk-or-v1-...") {
    throw new Error("API key OpenRouter belum dikonfigurasi. Silakan isi OPENROUTER_API_KEY di file .env")
  }

  const result = await generateReceipt({
    userId,
    tier,
    customerName: formData.customerName,
    customerAddress: formData.customerAddress,
    items: formData.items,
    paymentMethod: formData.paymentMethod,
    notes: formData.notes,
    from: formData.from,
  })

  return { documentId: result.document.id, html: result.html }
}

export async function createDeliveryAction(formData: {
  recipientName: string
  recipientAddress?: string
  recipientPhone?: string
  items: Array<{ name: string; quantity: number; unit?: string; description?: string }>
  vehicle?: string
  driver?: string
  notes?: string
  from?: { name: string; address: string; phone: string }
}) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  await checkGenerationLimit(userId)
  const user = await ensureUserExists(userId)
  const tier = getTierFromRole(user.role ?? "FREE")

  if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === "sk-or-v1-...") {
    throw new Error("API key OpenRouter belum dikonfigurasi. Silakan isi OPENROUTER_API_KEY di file .env")
  }

  const result = await generateDelivery({
    userId,
    tier,
    recipientName: formData.recipientName,
    recipientAddress: formData.recipientAddress,
    recipientPhone: formData.recipientPhone,
    items: formData.items,
    vehicle: formData.vehicle,
    driver: formData.driver,
    notes: formData.notes,
    from: formData.from,
  })

  return { documentId: result.document.id, html: result.html }
}

export async function createLetterAction(formData: {
  recipientName: string
  recipientPosition?: string
  recipientOrganization?: string
  recipientAddress?: string
  subject: string
  bodyDescription: string
  attachments?: string
  notes?: string
  from?: { name: string; address: string; phone: string }
}) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  await checkGenerationLimit(userId)
  const user = await ensureUserExists(userId)
  const tier = getTierFromRole(user.role ?? "FREE")

  if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === "sk-or-v1-...") {
    throw new Error("API key OpenRouter belum dikonfigurasi. Silakan isi OPENROUTER_API_KEY di file .env")
  }

  const result = await generateLetter({
    userId,
    tier,
    recipientName: formData.recipientName,
    recipientPosition: formData.recipientPosition,
    recipientOrganization: formData.recipientOrganization,
    recipientAddress: formData.recipientAddress,
    subject: formData.subject,
    bodyDescription: formData.bodyDescription,
    attachments: formData.attachments,
    notes: formData.notes,
    from: formData.from,
  })

  return { documentId: result.document.id, html: result.html }
}

export async function createPayslipAction(formData: {
  employeeName: string
  employeeNip?: string
  employeePosition?: string
  employeeDepartment?: string
  period: string
  baseSalary: number
  allowances?: number
  allowanceDescription?: string
  deductions?: number
  deductionDescription?: string
  notes?: string
}) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  await checkGenerationLimit(userId)
  const user = await ensureUserExists(userId)
  const tier = getTierFromRole(user.role ?? "FREE")

  if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === "sk-or-v1-...") {
    throw new Error("API key OpenRouter belum dikonfigurasi. Silakan isi OPENROUTER_API_KEY di file .env")
  }

  const result = await generatePayslip({
    userId,
    tier,
    employeeName: formData.employeeName,
    employeeNip: formData.employeeNip,
    employeePosition: formData.employeePosition,
    employeeDepartment: formData.employeeDepartment,
    period: formData.period,
    baseSalary: formData.baseSalary,
    allowances: formData.allowances,
    allowanceDescription: formData.allowanceDescription,
    deductions: formData.deductions,
    deductionDescription: formData.deductionDescription,
    notes: formData.notes,
  })

  return { documentId: result.document.id, html: result.html }
}

export async function createPurchaseOrderAction(formData: {
  vendorName: string
  vendorAddress?: string
  vendorPhone?: string
  deliveryDate?: string
  items: Array<{ name: string; quantity: number; unit?: string; unitPrice: number }>
  paymentTerms?: string
  deliveryTerms?: string
  notes?: string
}) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")
  await checkGenerationLimit(userId)
  const user = await ensureUserExists(userId)
  const tier = getTierFromRole(user.role ?? "FREE")
  if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === "sk-or-v1-...") throw new Error("API key OpenRouter belum dikonfigurasi.")
  const profile = await db.companyProfile.findUnique({ where: { userId } })
  const result = await generatePurchaseOrder({
    userId, tier, logoUrl: undefined,
    from: profile ? { name: profile.name, address: profile.address ?? "", phone: profile.phone ?? "" } : undefined,
    vendorName: formData.vendorName, vendorAddress: formData.vendorAddress, vendorPhone: formData.vendorPhone,
    deliveryDate: formData.deliveryDate, items: formData.items,
    paymentTerms: formData.paymentTerms, deliveryTerms: formData.deliveryTerms, notes: formData.notes,
  })
  return { documentId: result.document.id, html: result.html }
}

export async function createMemoAction(formData: {
  recipientName: string
  recipientPosition?: string
  subject: string
  bodyDescription: string
  notes?: string
}) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")
  await checkGenerationLimit(userId)
  const user = await ensureUserExists(userId)
  const tier = getTierFromRole(user.role ?? "FREE")
  if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === "sk-or-v1-...") throw new Error("API key OpenRouter belum dikonfigurasi.")
  const profile = await db.companyProfile.findUnique({ where: { userId } })
  const result = await generateMemo({
    userId, tier, logoUrl: undefined,
    from: profile ? { name: profile.name, position: "Direktur" } : undefined,
    recipientName: formData.recipientName, recipientPosition: formData.recipientPosition,
    subject: formData.subject, bodyDescription: formData.bodyDescription, notes: formData.notes,
  })
  return { documentId: result.document.id, html: result.html }
}

export async function createNotulenAction(formData: {
  meetingTitle: string
  date?: string
  startTime?: string
  endTime?: string
  location?: string
  chairperson?: string
  attendees?: string
  absentees?: string
  agendaDescription: string
  nextMeeting?: string
  notes?: string
}) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")
  await checkGenerationLimit(userId)
  const user = await ensureUserExists(userId)
  const tier = getTierFromRole(user.role ?? "FREE")
  if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === "sk-or-v1-...") throw new Error("API key OpenRouter belum dikonfigurasi.")
  const result = await generateNotulen({
    userId, tier,
    meetingTitle: formData.meetingTitle, date: formData.date, startTime: formData.startTime,
    endTime: formData.endTime, location: formData.location, chairperson: formData.chairperson,
    attendees: formData.attendees, absentees: formData.absentees,
    agendaDescription: formData.agendaDescription, nextMeeting: formData.nextMeeting, notes: formData.notes,
  })
  return { documentId: result.document.id, html: result.html }
}

export async function createBeritaAcaraAction(formData: {
  eventTitle: string
  eventDescription: string
  location?: string
  participants?: string
  details?: string
  notes?: string
}) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")
  await checkGenerationLimit(userId)
  const user = await ensureUserExists(userId)
  const tier = getTierFromRole(user.role ?? "FREE")
  if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === "sk-or-v1-...") throw new Error("API key OpenRouter belum dikonfigurasi.")
  const profile = await db.companyProfile.findUnique({ where: { userId } })
  const result = await generateBeritaAcara({
    userId, tier, logoUrl: undefined,
    eventTitle: formData.eventTitle, eventDescription: formData.eventDescription,
    location: formData.location,
    from: profile ? { name: profile.name, position: "Direktur" } : undefined,
    participants: formData.participants, details: formData.details, notes: formData.notes,
  })
  return { documentId: result.document.id, html: result.html }
}

export async function createAbsensiAction(formData: {
  period?: string
  department?: string
  employees: Array<{ name: string; position?: string; hadir: number; sakit: number; izin: number; alpha: number; cuti?: number }>
  notes?: string
}) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")
  await checkGenerationLimit(userId)
  const user = await ensureUserExists(userId)
  const tier = getTierFromRole(user.role ?? "FREE")
  if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === "sk-or-v1-...") throw new Error("API key OpenRouter belum dikonfigurasi.")
  const profile = await db.companyProfile.findUnique({ where: { userId } })
  const result = await generateAbsensi({
    userId, tier, logoUrl: undefined,
    period: formData.period, department: formData.department,
    employees: formData.employees, notes: formData.notes,
  })
  return { documentId: result.document.id, html: result.html }
}

export async function createSuratPengangkatanAction(formData: {
  employeeName: string
  employeeAddress?: string
  employeePosition: string
  department?: string
  startDate: string
  probationPeriod?: string
  salary?: number
  workingHours?: string
  benefits?: string
  terms?: string
  notes?: string
}) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")
  await checkGenerationLimit(userId)
  const user = await ensureUserExists(userId)
  const tier = getTierFromRole(user.role ?? "FREE")
  if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === "sk-or-v1-...") throw new Error("API key OpenRouter belum dikonfigurasi.")
  const result = await generateSuratPengangkatan({
    userId, tier, logoUrl: undefined,
    employeeName: formData.employeeName, employeeAddress: formData.employeeAddress,
    employeePosition: formData.employeePosition, department: formData.department,
    startDate: formData.startDate, probationPeriod: formData.probationPeriod,
    salary: formData.salary, workingHours: formData.workingHours,
    benefits: formData.benefits, terms: formData.terms, notes: formData.notes,
  })
  return { documentId: result.document.id, html: result.html }
}

export async function createSuratPHKAction(formData: {
  employeeName: string
  employeeAddress?: string
  employeePosition: string
  department?: string
  terminationDate: string
  lastWorkingDate?: string
  reason: string
  terminationType?: string
  severancePay?: string
  finalSettlement?: string
  outstandingLeave?: string
  companyAssets?: string
  notes?: string
}) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")
  await checkGenerationLimit(userId)
  const user = await ensureUserExists(userId)
  const tier = getTierFromRole(user.role ?? "FREE")
  if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === "sk-or-v1-...") throw new Error("API key OpenRouter belum dikonfigurasi.")
  const result = await generateSuratPHK({
    userId, tier, logoUrl: undefined,
    employeeName: formData.employeeName, employeeAddress: formData.employeeAddress,
    employeePosition: formData.employeePosition, department: formData.department,
    terminationDate: formData.terminationDate, lastWorkingDate: formData.lastWorkingDate,
    reason: formData.reason, terminationType: formData.terminationType,
    severancePay: formData.severancePay, finalSettlement: formData.finalSettlement,
    outstandingLeave: formData.outstandingLeave, companyAssets: formData.companyAssets,
    notes: formData.notes,
  })
  return { documentId: result.document.id, html: result.html }
}
