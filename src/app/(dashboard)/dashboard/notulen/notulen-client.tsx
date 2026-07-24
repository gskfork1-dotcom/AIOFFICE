"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createNotulenAction } from "@/lib/actions/documents"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { ArrowLeft, FileDown, Loader2 } from "lucide-react"
import { exportHtmlToPdf } from "@/lib/pdf-export"

export default function NotulenClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [html, setHtml] = useState<string | null>(null)

  const [meetingTitle, setMeetingTitle] = useState("")
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [location, setLocation] = useState("")
  const [chairperson, setChairperson] = useState("")
  const [attendees, setAttendees] = useState("")
  const [absentees, setAbsentees] = useState("")
  const [agendaDescription, setAgendaDescription] = useState("")
  const [nextMeeting, setNextMeeting] = useState("")
  const [notes, setNotes] = useState("")

  async function handleGenerate() {
    if (!meetingTitle.trim()) { toast.error("Judul rapat wajib diisi"); return }
    if (!agendaDescription.trim()) { toast.error("Deskripsi pembahasan wajib diisi"); return }

    setLoading(true)
    try {
      const result = await createNotulenAction({
        meetingTitle, date, startTime, endTime, location, chairperson,
        attendees, absentees, agendaDescription, nextMeeting, notes,
      })
      setHtml(result.html)
      toast.success("Notulen rapat berhasil dibuat!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membuat notulen")
    } finally { setLoading(false) }
  }

  function handlePrint() {
    if (!html) return
    const w = window.open("", "_blank")
    if (w) { w.document.write(html); w.document.close(); w.print() }
  }

  async function handlePdfExport() {
    if (!html) return
    setExportingPdf(true)
    try {       await exportHtmlToPdf(html, "Notulen-Rapat"); toast.success("PDF berhasil diunduh!") }
    catch { toast.error("Gagal export PDF") }
    finally { setExportingPdf(false) }
  }

  if (html) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b bg-white flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setHtml(null)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Kembali
          </Button>
          <h1 className="text-lg font-semibold">Preview Notulen Rapat</h1>
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" onClick={handlePrint}>Print</Button>
            <Button size="sm" onClick={handlePdfExport} disabled={exportingPdf}>
              {exportingPdf ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Exporting...</> : <><FileDown className="w-4 h-4 mr-1" /> Download PDF</>}
            </Button>
          </div>
        </div>
        <div className="flex-1 p-4">
          <div className="bg-white rounded-lg shadow-sm border" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
          </Button>
          <h1 className="text-2xl font-bold">AI Notulen Rapat</h1>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Info Rapat</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Judul Rapat *</Label>
                <Input value={meetingTitle} onChange={e => setMeetingTitle(e.target.value)} placeholder="Rapat Bulanan Tim Marketing" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Tanggal</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
                <div><Label>Jam Mulai</Label><Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} /></div>
                <div><Label>Jam Selesai</Label><Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Lokasi</Label><Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Ruang Rapat Utama" /></div>
                <div><Label>Pimpinan Rapat</Label><Input value={chairperson} onChange={e => setChairperson(e.target.value)} placeholder="Budi Santoso" /></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Peserta</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Peserta Hadir (satu nama per baris)</Label>
                <Textarea value={attendees} onChange={e => setAttendees(e.target.value)} rows={3} placeholder={"Budi Santoso\nSiti Rahayu\nAndi Wijaya"} />
              </div>
              <div>
                <Label>Tidak Hadir (opsional, satu nama per baris)</Label>
                <Textarea value={absentees} onChange={e => setAbsentees(e.target.value)} rows={2} placeholder={"Dewi Lestari"} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Pembahasan</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Deskripsi Agenda / Pembahasan *</Label>
                <Textarea value={agendaDescription} onChange={e => setAgendaDescription(e.target.value)} rows={6} placeholder={"1. Evaluasi kinerja bulan Juni\n2. Rencana promosi Agustus\n3. Anggaran Q3\n4. Pemilihan vendor baru"} />
              </div>
              <div><Label>Rapat Berikutnya</Label><Input value={nextMeeting} onChange={e => setNextMeeting(e.target.value)} placeholder="Senin, 1 Agustus 2026" /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Catatan</CardTitle></CardHeader>
            <CardContent>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Catatan tambahan (opsional)" rows={3} />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button size="lg" onClick={handleGenerate} disabled={loading} className="bg-gray-600 hover:bg-gray-700 text-white">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> AI sedang membuat notulen...</> : "Generate Notulen"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
