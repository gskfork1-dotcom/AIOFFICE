"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createSuratPengangkatanAction, getCompanyProfile } from "@/lib/actions/documents"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { FileDown, Loader2, ArrowLeft } from "lucide-react"
import { exportHtmlToPdf } from "@/lib/pdf-export"

export default function SuratPengangkatanClient() {
  const router = useRouter()
  const previewRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [html, setHtml] = useState<string | null>(null)

  const [employeeName, setEmployeeName] = useState("")
  const [employeeAddress, setEmployeeAddress] = useState("")
  const [employeePosition, setEmployeePosition] = useState("")
  const [department, setDepartment] = useState("")
  const [startDate, setStartDate] = useState("")
  const [probationPeriod, setProbationPeriod] = useState("3 bulan")
  const [salary, setSalary] = useState("")
  const [workingHours, setWorkingHours] = useState("09:00 - 17:00")
  const [benefits, setBenefits] = useState("")
  const [terms, setTerms] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    getCompanyProfile().catch(() => {})
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
    if (!startDate.trim()) {
      toast.error("Tanggal mulai wajib diisi")
      return
    }

    setLoading(true)
    try {
      const result = await createSuratPengangkatanAction({
        employeeName,
        employeeAddress: employeeAddress || undefined,
        employeePosition,
        department: department || undefined,
        startDate,
        probationPeriod: probationPeriod || undefined,
        salary: salary ? Number(salary) : undefined,
        workingHours: workingHours || undefined,
        benefits: benefits || undefined,
        terms: terms || undefined,
        notes: notes || undefined,
      })
      setHtml(result.html)
      toast.success("Surat pengangkatan berhasil dibuat!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membuat surat pengangkatan")
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
      await exportHtmlToPdf(html, "Surat-Pengangkatan")
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
          <h1 className="text-lg font-semibold">Preview Surat Pengangkatan</h1>
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" onClick={handlePrint}>
              Print
            </Button>
            <Button size="sm" onClick={handlePdfExport} disabled={exportingPdf} className="bg-emerald-600 hover:bg-emerald-700">
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
          <h1 className="text-2xl font-bold">AI Surat Pengangkatan</h1>
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
                <Textarea id="employeeAddress" value={employeeAddress} onChange={(e) => setEmployeeAddress(e.target.value)} placeholder="Alamat lengkap karyawan" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employeePosition">Jabatan *</Label>
                  <Input id="employeePosition" value={employeePosition} onChange={(e) => setEmployeePosition(e.target.value)} placeholder="Marketing Manager" />
                </div>
                <div>
                  <Label htmlFor="department">Departemen</Label>
                  <Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Departemen Pemasaran" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detail Pekerjaan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Tanggal Mulai *</Label>
                  <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="probationPeriod">Masa Percobaan</Label>
                  <Input id="probationPeriod" value={probationPeriod} onChange={(e) => setProbationPeriod(e.target.value)} placeholder="3 bulan" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="salary">Gaji Pokok (Rp)</Label>
                  <Input id="salary" type="number" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="5000000" />
                </div>
                <div>
                  <Label htmlFor="workingHours">Jam Kerja</Label>
                  <Input id="workingHours" value={workingHours} onChange={(e) => setWorkingHours(e.target.value)} placeholder="09:00 - 17:00" />
                </div>
              </div>
              <div>
                <Label htmlFor="benefits">Benefit</Label>
                <Textarea id="benefits" value={benefits} onChange={(e) => setBenefits(e.target.value)} placeholder="BPJS Kesehatan, BPJS Ketenagakerjaan, THR" rows={2} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Syarat & Ketentuan</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea value={terms} onChange={(e) => setTerms(e.target.value)} placeholder="Syarat dan ketentuan tambahan untuk pengangkatan ini (opsional)" rows={3} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Catatan</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Catatan tambahan (opsional)" rows={3} />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button size="lg" onClick={handleGenerate} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  AI sedang membuat surat pengangkatan...
                </>
              ) : (
                "Generate Surat Pengangkatan"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
