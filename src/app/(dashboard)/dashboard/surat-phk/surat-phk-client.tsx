"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createSuratPHKAction, getCompanyProfile } from "@/lib/actions/documents"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { FileDown, Loader2, ArrowLeft } from "lucide-react"
import { exportHtmlToPdf } from "@/lib/pdf-export"

export default function SuratPHKClient() {
  const router = useRouter()
  const previewRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [html, setHtml] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState("")

  const [employeeName, setEmployeeName] = useState("")
  const [employeeAddress, setEmployeeAddress] = useState("")
  const [employeePosition, setEmployeePosition] = useState("")
  const [department, setDepartment] = useState("")
  const [terminationDate, setTerminationDate] = useState("")
  const [lastWorkingDate, setLastWorkingDate] = useState("")
  const [terminationType, setTerminationType] = useState("")
  const [reason, setReason] = useState("")
  const [severancePay, setSeverancePay] = useState("")
  const [finalSettlement, setFinalSettlement] = useState("")
  const [outstandingLeave, setOutstandingLeave] = useState("")
  const [companyAssets, setCompanyAssets] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    getCompanyProfile().then((profile) => {
      if (profile) {
        setCompanyName(profile.name)
      }
    }).catch(() => {})
  }, [])

  async function handleGenerate() {
    if (!employeeName.trim()) {
      toast.error("Nama karyawan wajib diisi")
      return
    }
    if (!employeePosition.trim()) {
      toast.error("Jabatan karyawan wajib diisi")
      return
    }
    if (!terminationDate.trim()) {
      toast.error("Tanggal PHK wajib diisi")
      return
    }
    if (!reason.trim()) {
      toast.error("Alasan PHK wajib diisi")
      return
    }

    setLoading(true)
    try {
      const result = await createSuratPHKAction({
        employeeName,
        employeeAddress: employeeAddress || undefined,
        employeePosition,
        department: department || undefined,
        terminationDate,
        lastWorkingDate: lastWorkingDate || undefined,
        reason,
        terminationType: terminationType || undefined,
        severancePay: severancePay || undefined,
        finalSettlement: finalSettlement || undefined,
        outstandingLeave: outstandingLeave || undefined,
        companyAssets: companyAssets || undefined,
        notes: notes || undefined,
      })
      setHtml(result.html)
      toast.success("Surat PHK berhasil dibuat!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membuat surat PHK")
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
      await exportHtmlToPdf(html, "Surat-PHK")
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
          <h1 className="text-lg font-semibold">Preview Surat PHK</h1>
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
          <h1 className="text-2xl font-bold">AI Surat PHK</h1>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Data Karyawan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="employeeName">Nama Karyawan *</Label>
                <Input id="employeeName" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} placeholder="Budi Santoso" />
              </div>
              <div>
                <Label htmlFor="employeeAddress">Alamat</Label>
                <Textarea id="employeeAddress" value={employeeAddress} onChange={(e) => setEmployeeAddress(e.target.value)} placeholder="Jl. Merdeka No. 10, Jakarta Selatan" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employeePosition">Jabatan *</Label>
                  <Input id="employeePosition" value={employeePosition} onChange={(e) => setEmployeePosition(e.target.value)} placeholder="Staff Marketing" />
                </div>
                <div>
                  <Label htmlFor="department">Departemen</Label>
                  <Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Marketing" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detail PHK</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="terminationDate">Tanggal Efektif PHK *</Label>
                  <Input id="terminationDate" type="date" value={terminationDate} onChange={(e) => setTerminationDate(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="lastWorkingDate">Hari Kerja Terakhir</Label>
                  <Input id="lastWorkingDate" type="date" value={lastWorkingDate} onChange={(e) => setLastWorkingDate(e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="terminationType">Jenis Pemutusan</Label>
                <Input id="terminationType" value={terminationType} onChange={(e) => setTerminationType(e.target.value)} placeholder="Pemutusan Hubungan Kerja" />
                <p className="text-xs text-muted-foreground mt-1">PHK, Pengunduran Diri, Akhir Kontrak</p>
              </div>
              <div>
                <Label htmlFor="reason">Alasan PHK *</Label>
                <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Deskripsikan alasan pemutusan hubungan kerja secara profesional..." rows={3} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hak Karyawan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="severancePay">Pesangon</Label>
                  <Input id="severancePay" value={severancePay} onChange={(e) => setSeverancePay(e.target.value)} placeholder="3 bulan gaji" />
                </div>
                <div>
                  <Label htmlFor="outstandingLeave">Cuti Belum Diambil</Label>
                  <Input id="outstandingLeave" value={outstandingLeave} onChange={(e) => setOutstandingLeave(e.target.value)} placeholder="12 hari cuti belum diambil" />
                </div>
              </div>
              <div>
                <Label htmlFor="finalSettlement">Pembayaran Terakhir</Label>
                <Textarea id="finalSettlement" value={finalSettlement} onChange={(e) => setFinalSettlement(e.target.value)} placeholder="Gaji terakhir + cuti tidak terpakai + bonus" rows={2} />
              </div>
              <div>
                <Label htmlFor="companyAssets">Pengembalian Aset Perusahaan</Label>
                <Textarea id="companyAssets" value={companyAssets} onChange={(e) => setCompanyAssets(e.target.value)} placeholder="Laptop, kartu akses, kartu nama" rows={2} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Catatan</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Catatan tambahan untuk surat PHK (opsional)" rows={3} />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button size="lg" onClick={handleGenerate} disabled={loading} className="bg-red-600 hover:bg-red-700">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  AI sedang membuat surat PHK...
                </>
              ) : (
                "Generate Surat PHK"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
