"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createLetterAction, getCompanyProfile, saveCompanyProfile } from "@/lib/actions/documents"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { FileDown, Loader2, ArrowLeft } from "lucide-react"
import { exportHtmlToPdf } from "@/lib/pdf-export"

export default function LetterClient() {
  const router = useRouter()
  const previewRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [html, setHtml] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState("")
  const [companyAddress, setCompanyAddress] = useState("")
  const [companyPhone, setCompanyPhone] = useState("")
  const [recipientName, setRecipientName] = useState("")
  const [recipientPosition, setRecipientPosition] = useState("")
  const [recipientOrganization, setRecipientOrganization] = useState("")
  const [recipientAddress, setRecipientAddress] = useState("")
  const [subject, setSubject] = useState("")
  const [bodyDescription, setBodyDescription] = useState("")
  const [attachments, setAttachments] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    getCompanyProfile().then((profile) => {
      if (profile) {
        setCompanyName(profile.name)
        setCompanyAddress(profile.address ?? "")
        setCompanyPhone(profile.phone ?? "")
      }
    }).catch(() => {})
  }, [])

  async function handleGenerate() {
    if (!recipientName.trim()) {
      toast.error("Nama penerima wajib diisi")
      return
    }
    if (!subject.trim()) {
      toast.error("Perihal wajib diisi")
      return
    }
    if (!bodyDescription.trim()) {
      toast.error("Deskripsi isi surat wajib diisi")
      return
    }

    setLoading(true)
    try {
      const result = await createLetterAction({
        recipientName,
        recipientPosition: recipientPosition || undefined,
        recipientOrganization: recipientOrganization || undefined,
        recipientAddress: recipientAddress || undefined,
        subject,
        bodyDescription,
        attachments: attachments || undefined,
        notes: notes || undefined,
        from:
          companyName || companyAddress || companyPhone
            ? { name: companyName, address: companyAddress, phone: companyPhone }
            : undefined,
      })
      setHtml(result.html)
      toast.success("Surat berhasil dibuat!")
      if (companyName) {
        saveCompanyProfile({
          name: companyName,
          address: companyAddress || undefined,
          phone: companyPhone || undefined,
        }).catch(() => {})
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membuat surat")
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
      await exportHtmlToPdf(html, "Surat Resmi")
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
          <h1 className="text-lg font-semibold">Preview Surat Resmi</h1>
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" onClick={handlePrint}>
              Print
            </Button>
            <Button size="sm" onClick={handlePdfExport} disabled={exportingPdf}>
              {exportingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 mr-1" />
                  Download PDF
                </>
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
          <h1 className="text-2xl font-bold">AI Surat Resmi Generator</h1>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Data Perusahaan (Pengirim)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="companyName">Nama Perusahaan</Label>
                <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="PT Maju Jaya" />
              </div>
              <div>
                <Label htmlFor="companyAddress">Alamat</Label>
                <Input id="companyAddress" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} placeholder="Jl. Sudirman No. 123, Jakarta" />
              </div>
              <div>
                <Label htmlFor="companyPhone">Telepon</Label>
                <Input id="companyPhone" value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} placeholder="08123456789" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Data Penerima</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="recipientName">Nama Penerima *</Label>
                  <Input id="recipientName" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Bapak/Ibu Ahmad Susanto" />
                </div>
                <div>
                  <Label htmlFor="recipientPosition">Jabatan</Label>
                  <Input id="recipientPosition" value={recipientPosition} onChange={(e) => setRecipientPosition(e.target.value)} placeholder="Direktur Utama" />
                </div>
              </div>
              <div>
                <Label htmlFor="recipientOrganization">Instansi / Organisasi</Label>
                <Input id="recipientOrganization" value={recipientOrganization} onChange={(e) => setRecipientOrganization(e.target.value)} placeholder="PT Berkah Sejahtera" />
              </div>
              <div>
                <Label htmlFor="recipientAddress">Alamat Penerima</Label>
                <Input id="recipientAddress" value={recipientAddress} onChange={(e) => setRecipientAddress(e.target.value)} placeholder="Jl. Gatot Subroto No. 45, Bandung" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Isi Surat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="subject">Perihal *</Label>
                <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Undangan Rapat Koordinasi" />
              </div>
              <div>
                <Label htmlFor="bodyDescription">Deskripsi Isi Surat *</Label>
                <Textarea
                  id="bodyDescription"
                  value={bodyDescription}
                  onChange={(e) => setBodyDescription(e.target.value)}
                  placeholder="Jelaskan secara singkat isi surat yang ingin dibuat. Contoh: Surat undangan rapat koordinasi bulanan tanggal 15 Juli 2026 di ruang rapat utama. Bahas laporan kuartalan dan rencana kerja Q3."
                  rows={5}
                />
                <p className="text-xs text-muted-foreground mt-1">AI akan membuatkan isi surat formal berdasarkan deskripsi Anda</p>
              </div>
              <div>
                <Label htmlFor="attachments">Lampiran</Label>
                <Input id="attachments" value={attachments} onChange={(e) => setAttachments(e.target.value)} placeholder="Contoh: Lampiran 1, Lampiran 2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Catatan</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Catatan tambahan untuk surat (opsional)" rows={3} />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button size="lg" onClick={handleGenerate} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  AI sedang membuat surat...
                </>
              ) : (
                "Generate Surat Resmi"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
