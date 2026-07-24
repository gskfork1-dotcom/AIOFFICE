"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createMemoAction, getCompanyProfile } from "@/lib/actions/documents"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { FileDown, Loader2, ArrowLeft } from "lucide-react"
import { exportHtmlToPdf } from "@/lib/pdf-export"

export default function MemoClient() {
  const router = useRouter()
  const previewRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [html, setHtml] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState("")
  const [position, setPosition] = useState("Direktur")
  const [recipientName, setRecipientName] = useState("")
  const [recipientPosition, setRecipientPosition] = useState("")
  const [subject, setSubject] = useState("")
  const [bodyDescription, setBodyDescription] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    getCompanyProfile().then((profile) => {
      if (profile) {
        setCompanyName(profile.name)
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
      toast.error("Deskripsi isi memo wajib diisi")
      return
    }

    setLoading(true)
    try {
      const result = await createMemoAction({
        recipientName,
        recipientPosition: recipientPosition || undefined,
        subject,
        bodyDescription,
        notes: notes || undefined,
      })
      setHtml(result.html)
      toast.success("Memo berhasil dibuat!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membuat memo")
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
      await exportHtmlToPdf(html, "Memo")
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
          <h1 className="text-lg font-semibold">Preview Memo</h1>
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
          <h1 className="text-2xl font-bold">AI Memo Generator</h1>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dari (Pengirim)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="companyName">Nama</Label>
                <Input id="companyName" value={companyName} disabled placeholder="Otomatis dari profil perusahaan" />
              </div>
              <div>
                <Label htmlFor="position">Jabatan</Label>
                <Input id="position" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Direktur" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Kepada (Penerima)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="recipientName">Nama Penerima *</Label>
                <Input id="recipientName" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Bapak/Ibu Ahmad Susanto" />
              </div>
              <div>
                <Label htmlFor="recipientPosition">Jabatan</Label>
                <Input id="recipientPosition" value={recipientPosition} onChange={(e) => setRecipientPosition(e.target.value)} placeholder="Manajer Keuangan" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Isi Memo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="subject">Perihal *</Label>
                <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Evaluasi Kinerja Kuartal 3" />
              </div>
              <div>
                <Label htmlFor="bodyDescription">Deskripsi Isi Memo *</Label>
                <Textarea
                  id="bodyDescription"
                  value={bodyDescription}
                  onChange={(e) => setBodyDescription(e.target.value)}
                  placeholder="Deskripsikan isi memo yang ingin dibuat..."
                  rows={6}
                />
                <p className="text-xs text-muted-foreground mt-1">AI akan membuatkan isi memo berdasarkan deskripsi Anda</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Catatan</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Catatan tambahan untuk memo (opsional)" rows={3} />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button size="lg" onClick={handleGenerate} disabled={loading} className="bg-slate-600 hover:bg-slate-700">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  AI sedang membuat memo...
                </>
              ) : (
                "Generate Memo"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
