"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createProposalAction, getCompanyProfile, saveCompanyProfile } from "@/lib/actions/documents"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { FileDown, Loader2, ArrowLeft } from "lucide-react"
import { exportHtmlToPdf } from "@/lib/pdf-export"

const PROPOSAL_TYPES = ["Investor", "Bank", "Sponsor", "Kerjasama", "Penawaran Proyek", "Lainnya"]

export default function ProposalClient() {
  const router = useRouter()
  const previewRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [html, setHtml] = useState<string | null>(null)

  const [companyName, setCompanyName] = useState("")
  const [companyAddress, setCompanyAddress] = useState("")
  const [companyPhone, setCompanyPhone] = useState("")
  const [companyEmail, setCompanyEmail] = useState("")

  const [title, setTitle] = useState("")
  const [proposalType, setProposalType] = useState("Kerjasama")
  const [clientName, setClientName] = useState("")
  const [clientAddress, setClientAddress] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [businessSummary, setBusinessSummary] = useState("")
  const [targetBudget, setTargetBudget] = useState("")
  const [duration, setDuration] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    getCompanyProfile().then((profile) => {
      if (profile) {
        setCompanyName(profile.name)
        setCompanyAddress(profile.address ?? "")
        setCompanyPhone(profile.phone ?? "")
        setCompanyEmail(profile.email ?? "")
      }
    }).catch(() => {})
  }, [])

  async function handleGenerate() {
    if (!clientName.trim()) {
      toast.error("Nama klien penerima wajib diisi")
      return
    }
    if (!title.trim()) {
      toast.error("Judul proposal wajib diisi")
      return
    }
    if (!businessSummary.trim()) {
      toast.error("Ringkasan bisnis wajib diisi")
      return
    }

    setLoading(true)
    try {
      const result = await createProposalAction({
        title,
        type: proposalType,
        clientName,
        clientAddress,
        clientPhone,
        businessSummary,
        targetBudget: targetBudget ? parseFloat(targetBudget) : undefined,
        duration: duration || undefined,
        notes: notes || undefined,
        from: companyName || companyAddress || companyPhone || companyEmail
          ? { name: companyName, address: companyAddress, phone: companyPhone, email: companyEmail }
          : undefined,
      })
      setHtml(result.html)
      toast.success("Proposal berhasil dibuat!")
      if (companyName) {
        saveCompanyProfile({
          name: companyName,
          address: companyAddress || undefined,
          phone: companyPhone || undefined,
          email: companyEmail || undefined,
        }).catch(() => {})
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membuat proposal")
    } finally {
      setLoading(false)
    }
  }

  function handlePrint() {
    if (!html) return
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.print()
    }
  }

  async function handlePdfExport() {
    if (!html) return
    setExportingPdf(true)
    try {
      await exportHtmlToPdf(html, "Proposal")
      toast.success("PDF berhasil diunduh!")
    } catch {
      toast.error("Gagal export PDF")
    } finally {
      setExportingPdf(false)
    }
  }

  if (html) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b bg-white flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setHtml(null)}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali
          </Button>
          <h1 className="text-lg font-semibold">Preview Proposal</h1>
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" onClick={handlePrint}>Print</Button>
            <Button size="sm" onClick={handlePdfExport} disabled={exportingPdf}>
              {exportingPdf ? (
                <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Exporting...</>
              ) : (
                <><FileDown className="w-4 h-4 mr-1" />Download PDF</>
              )}
            </Button>
          </div>
        </div>
        <div className="flex-1 p-4">
          <div ref={previewRef} className="bg-white rounded-lg shadow-sm border" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Dashboard
          </Button>
          <h1 className="text-2xl font-bold">AI Proposal Generator</h1>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Data Perusahaan (Pengirim)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Nama Perusahaan</Label><Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="PT Maju Jaya" /></div>
                <div><Label>Email</Label><Input type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} placeholder="info@majujaya.com" /></div>
              </div>
              <div><Label>Alamat</Label><Input value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} placeholder="Jl. Sudirman No. 123, Jakarta" /></div>
              <div><Label>Telepon</Label><Input value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} placeholder="08123456789" /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Detail Proposal</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Judul Proposal *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Proposal Kerjasama Pengadaan Sistem IT" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Jenis Proposal</Label>
                  <select value={proposalType} onChange={(e) => setProposalType(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm mt-1">
                    {PROPOSAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div><Label>Durasi Proyek</Label><Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="3 bulan" /></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Data Penerima</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Nama Klien *</Label><Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="PT Solusi Digital" /></div>
                <div><Label>Telepon</Label><Input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="081987654321" /></div>
              </div>
              <div><Label>Alamat</Label><Input value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} placeholder="Jl. Gatot Subroto No. 45, Bandung" /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Isi Proposal</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Ringkasan Bisnis *</Label>
                <Textarea value={businessSummary} onChange={(e) => setBusinessSummary(e.target.value)} placeholder="Jelaskan proposal Anda secara singkat: masalah yang diselesaikan, solusi yang ditawarkan, dan manfaat utama..." rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Target Anggaran (Rp)</Label><Input type="number" value={targetBudget} onChange={(e) => setTargetBudget(e.target.value)} placeholder="50000000" /></div>
                <div><Label>Catatan Tambahan</Label><Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Catatan untuk AI" /></div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button size="lg" onClick={handleGenerate} disabled={loading}>
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />AI sedang membuat proposal...</>
              ) : "Generate Proposal"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
