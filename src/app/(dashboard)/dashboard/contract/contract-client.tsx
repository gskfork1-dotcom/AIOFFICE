"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createContractAction, getCompanyProfile, saveCompanyProfile } from "@/lib/actions/documents"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { FileDown, Loader2, ArrowLeft } from "lucide-react"
import { exportHtmlToPdf } from "@/lib/pdf-export"

const CONTRACT_TYPES = ["Kontrak Kerja", "Freelance", "Sewa", "MoU", "Perjanjian Lainnya"]

export default function ContractClient() {
  const router = useRouter()
  const previewRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [html, setHtml] = useState<string | null>(null)

  const [companyName, setCompanyName] = useState("")
  const [companyAddress, setCompanyAddress] = useState("")
  const [companyPhone, setCompanyPhone] = useState("")
  const [companyEmail, setCompanyEmail] = useState("")

  const [contractType, setContractType] = useState("Kontrak Kerja")
  const [partyAName, setPartyAName] = useState("")
  const [partyAPosition, setPartyAPosition] = useState("")
  const [partyAAddress, setPartyAAddress] = useState("")
  const [partyAPhone, setPartyAPhone] = useState("")
  const [partyBName, setPartyBName] = useState("")
  const [partyBPosition, setPartyBPosition] = useState("")
  const [partyBAddress, setPartyBAddress] = useState("")
  const [partyBPhone, setPartyBPhone] = useState("")
  const [subject, setSubject] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [contractValue, setContractValue] = useState("")
  const [specialTerms, setSpecialTerms] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    getCompanyProfile().then((profile) => {
      if (profile) {
        setCompanyName(profile.name)
        setCompanyAddress(profile.address ?? "")
        setCompanyPhone(profile.phone ?? "")
        setCompanyEmail(profile.email ?? "")
        setPartyAName(profile.name)
        setPartyAAddress(profile.address ?? "")
        setPartyAPhone(profile.phone ?? "")
      }
    }).catch(() => {})
  }, [])

  async function handleGenerate() {
    if (!partyBName.trim()) {
      toast.error("Nama Pihak Kedua wajib diisi")
      return
    }
    if (!subject.trim()) {
      toast.error("Materi perjanjian wajib diisi")
      return
    }

    setLoading(true)
    try {
      const result = await createContractAction({
        type: contractType,
        partyAName: partyAName || companyName,
        partyAAddress,
        partyAPhone,
        partyAPosition,
        partyBName,
        partyBAddress,
        partyBPhone,
        partyBPosition,
        subject,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        contractValue: contractValue ? parseFloat(contractValue) : undefined,
        specialTerms: specialTerms || undefined,
        notes: notes || undefined,
      })
      setHtml(result.html)
      toast.success("Kontrak berhasil dibuat!")
      if (companyName) {
        saveCompanyProfile({
          name: companyName,
          address: companyAddress || undefined,
          phone: companyPhone || undefined,
          email: companyEmail || undefined,
        }).catch(() => {})
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membuat kontrak")
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
      await exportHtmlToPdf(html, "Kontrak")
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
          <h1 className="text-lg font-semibold">Preview Kontrak</h1>
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
          <h1 className="text-2xl font-bold">AI Contract Generator</h1>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Detail Kontrak</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Jenis Kontrak</Label>
                  <select value={contractType} onChange={(e) => setContractType(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm mt-1">
                    {CONTRACT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div><Label>Nilai Kontrak (Rp)</Label><Input type="number" value={contractValue} onChange={(e) => setContractValue(e.target.value)} placeholder="100000000" /></div>
              </div>
              <div><Label>Materi Perjanjian *</Label><Textarea value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Jelaskan secara singkat objek perjanjian ini..." rows={3} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Tanggal Mulai</Label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
                <div><Label>Tanggal Berakhir</Label><Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Pihak Pertama (Anda)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Nama</Label><Input value={partyAName} onChange={(e) => setPartyAName(e.target.value)} placeholder="PT Maju Jaya" /></div>
                <div><Label>Jabatan</Label><Input value={partyAPosition} onChange={(e) => setPartyAPosition(e.target.value)} placeholder="Direktur Utama" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Alamat</Label><Input value={partyAAddress} onChange={(e) => setPartyAAddress(e.target.value)} placeholder="Jl. Sudirman No. 123" /></div>
                <div><Label>Telepon</Label><Input value={partyAPhone} onChange={(e) => setPartyAPhone(e.target.value)} placeholder="08123456789" /></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Pihak Kedua</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Nama *</Label><Input value={partyBName} onChange={(e) => setPartyBName(e.target.value)} placeholder="CV Berkah Sejahtera" /></div>
                <div><Label>Jabatan</Label><Input value={partyBPosition} onChange={(e) => setPartyBPosition(e.target.value)} placeholder="Manager Operasional" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Alamat</Label><Input value={partyBAddress} onChange={(e) => setPartyBAddress(e.target.value)} placeholder="Jl. Gatot Subroto No. 45" /></div>
                <div><Label>Telepon</Label><Input value={partyBPhone} onChange={(e) => setPartyBPhone(e.target.value)} placeholder="081987654321" /></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Klausul & Catatan</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Syarat Khusus</Label><Textarea value={specialTerms} onChange={(e) => setSpecialTerms(e.target.value)} placeholder="Klausul tambahan yang ingin dimasukkan (opsional)..." rows={3} /></div>
              <div><Label>Catatan Tambahan</Label><Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Catatan untuk AI" /></div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button size="lg" onClick={handleGenerate} disabled={loading}>
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />AI sedang membuat kontrak...</>
              ) : "Generate Kontrak"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
