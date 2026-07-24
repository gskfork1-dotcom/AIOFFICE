"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBeritaAcaraAction, getCompanyProfile } from "@/lib/actions/documents"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { FileDown, Loader2, ArrowLeft } from "lucide-react"
import { exportHtmlToPdf } from "@/lib/pdf-export"

export default function BAClient() {
  const router = useRouter()
  const previewRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [html, setHtml] = useState<string | null>(null)

  const [fromName, setFromName] = useState("")
  const [fromPosition, setFromPosition] = useState("Direktur")
  const [eventTitle, setEventTitle] = useState("")
  const [eventDescription, setEventDescription] = useState("")
  const [location, setLocation] = useState("")
  const [participants, setParticipants] = useState("")
  const [details, setDetails] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    getCompanyProfile().then((profile) => {
      if (profile) {
        setFromName(profile.name)
      }
    }).catch(() => {})
  }, [])

  async function handleGenerate() {
    if (!eventTitle.trim()) {
      toast.error("Judul peristiwa wajib diisi")
      return
    }
    if (!eventDescription.trim()) {
      toast.error("Deskripsi peristiwa wajib diisi")
      return
    }
    if (!details.trim()) {
      toast.error("Uraian kejadian wajib diisi")
      return
    }

    setLoading(true)
    try {
      const result = await createBeritaAcaraAction({
        eventTitle,
        eventDescription,
        location,
        participants,
        details,
        notes,
      })
      setHtml(result.html)
      toast.success("Berita Acara berhasil dibuat!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membuat berita acara")
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
      await exportHtmlToPdf(html, "Berita-Acara")
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
          <h1 className="text-lg font-semibold">Preview Berita Acara</h1>
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
          <h1 className="text-2xl font-bold">AI Berita Acara</h1>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Info Peristiwa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="eventTitle">Judul Peristiwa *</Label>
                <Input id="eventTitle" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder="Serah Terima Proyek Pembangunan" />
              </div>
              <div>
                <Label htmlFor="eventDescription">Deskripsi Peristiwa *</Label>
                <Input id="eventDescription" value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} placeholder="Serah terima hasil pekerjaan antara kontraktor dan pemilik proyek" />
              </div>
              <div>
                <Label htmlFor="location">Lokasi</Label>
                <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Gedung Kantor Pusat" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pelapor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fromName">Nama</Label>
                  <Input id="fromName" value={fromName} onChange={(e) => setFromName(e.target.value)} disabled placeholder="Otomatis dari profil perusahaan" />
                </div>
                <div>
                  <Label htmlFor="fromPosition">Jabatan</Label>
                  <Input id="fromPosition" value={fromPosition} onChange={(e) => setFromPosition(e.target.value)} placeholder="Direktur" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Peserta</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="participants">Daftar Peserta</Label>
              <Textarea id="participants" value={participants} onChange={(e) => setParticipants(e.target.value)} rows={4} placeholder={"Satu peserta per baris, format: Nama - Jabatan - Instansi\nBudi Santoso - Project Manager - PT Maju Jaya\nSiti Rahayu - QC Lead - CV Berkah"} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Uraian</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="details">Uraian Kejadian *</Label>
              <Textarea id="details" value={details} onChange={(e) => setDetails(e.target.value)} rows={6} placeholder="Deskripsikan kronologi/uraian kejadian. AI akan membuat berita acara formal berdasarkan uraian yang Anda berikan." />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Catatan</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Catatan tambahan untuk berita acara (opsional)" rows={3} />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button size="lg" onClick={handleGenerate} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  AI sedang membuat berita acara...
                </>
              ) : (
                "Generate Berita Acara"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
