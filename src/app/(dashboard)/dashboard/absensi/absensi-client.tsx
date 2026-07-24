"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createAbsensiAction, getCompanyProfile } from "@/lib/actions/documents"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Plus, Trash2, FileDown, Loader2, ArrowLeft } from "lucide-react"
import { exportHtmlToPdf } from "@/lib/pdf-export"

interface Employee {
  name: string
  position: string
  hadir: number
  sakit: number
  izin: number
  alpha: number
  cuti: number
}

const emptyEmployee: Employee = { name: "", position: "", hadir: 0, sakit: 0, izin: 0, alpha: 0, cuti: 0 }

export default function AbsensiClient() {
  const router = useRouter()
  const previewRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [html, setHtml] = useState<string | null>(null)

  const [period, setPeriod] = useState("")
  const [department, setDepartment] = useState("")
  const [employees, setEmployees] = useState<Employee[]>([{ ...emptyEmployee }])
  const [notes, setNotes] = useState("")

  useEffect(() => {
    getCompanyProfile().catch(() => {})
  }, [])

  function addEmployee() {
    setEmployees([...employees, { ...emptyEmployee }])
  }

  function removeEmployee(index: number) {
    if (employees.length <= 1) return
    setEmployees(employees.filter((_, i) => i !== index))
  }

  function updateEmployee(index: number, field: keyof Employee, value: string | number) {
    const updated = [...employees]
    updated[index] = { ...updated[index], [field]: value }
    setEmployees(updated)
  }

  async function handleGenerate() {
    if (!period.trim()) {
      toast.error("Periode wajib diisi")
      return
    }
    if (employees.some((e) => !e.name.trim())) {
      toast.error("Semua karyawan wajib diisi namanya")
      return
    }

    setLoading(true)
    try {
      const result = await createAbsensiAction({
        period,
        department,
        employees: employees.map((e) => ({
          name: e.name,
          position: e.position,
          hadir: e.hadir,
          sakit: e.sakit,
          izin: e.izin,
          alpha: e.alpha,
          cuti: e.cuti,
        })),
        notes,
      })
      setHtml(result.html)
      toast.success("Laporan Absensi berhasil dibuat!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membuat laporan absensi")
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
      await exportHtmlToPdf(html, "Laporan-Absensi")
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
          <h1 className="text-lg font-semibold">Preview Laporan Absensi</h1>
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
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Dashboard
          </Button>
          <h1 className="text-2xl font-bold">AI Laporan Absensi</h1>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="period">Periode *</Label>
                  <Input id="period" value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="2026-07" />
                  <p className="text-xs text-muted-foreground mt-1">Format: YYYY-MM</p>
                </div>
                <div>
                  <Label htmlFor="department">Departemen</Label>
                  <Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Semua Departemen" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Data Karyawan</CardTitle>
              <Button variant="outline" size="sm" onClick={addEmployee}>
                <Plus className="w-4 h-4 mr-1" />
                Tambah Karyawan
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 w-10">No</th>
                      <th className="text-left py-2 px-2">Nama *</th>
                      <th className="text-left py-2 px-2">Jabatan</th>
                      <th className="text-center py-2 px-2 w-16">Hadir</th>
                      <th className="text-center py-2 px-2 w-16">Sakit</th>
                      <th className="text-center py-2 px-2 w-16">Izin</th>
                      <th className="text-center py-2 px-2 w-16">Alpha</th>
                      <th className="text-center py-2 px-2 w-16">Cuti</th>
                      <th className="text-center py-2 px-2 w-12">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 px-2 text-muted-foreground">{index + 1}</td>
                        <td className="py-2 px-2">
                          <Input value={emp.name} onChange={(e) => updateEmployee(index, "name", e.target.value)} placeholder="Nama karyawan" />
                        </td>
                        <td className="py-2 px-2">
                          <Input value={emp.position} onChange={(e) => updateEmployee(index, "position", e.target.value)} placeholder="Jabatan" />
                        </td>
                        <td className="py-2 px-2">
                          <Input type="number" min="0" value={emp.hadir || ""} onChange={(e) => updateEmployee(index, "hadir", parseInt(e.target.value) || 0)} className="text-center" />
                        </td>
                        <td className="py-2 px-2">
                          <Input type="number" min="0" value={emp.sakit || ""} onChange={(e) => updateEmployee(index, "sakit", parseInt(e.target.value) || 0)} className="text-center" />
                        </td>
                        <td className="py-2 px-2">
                          <Input type="number" min="0" value={emp.izin || ""} onChange={(e) => updateEmployee(index, "izin", parseInt(e.target.value) || 0)} className="text-center" />
                        </td>
                        <td className="py-2 px-2">
                          <Input type="number" min="0" value={emp.alpha || ""} onChange={(e) => updateEmployee(index, "alpha", parseInt(e.target.value) || 0)} className="text-center" />
                        </td>
                        <td className="py-2 px-2">
                          <Input type="number" min="0" value={emp.cuti || ""} onChange={(e) => updateEmployee(index, "cuti", parseInt(e.target.value) || 0)} className="text-center" />
                        </td>
                        <td className="py-2 px-2 text-center">
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeEmployee(index)} disabled={employees.length <= 1}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Catatan</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Catatan tambahan untuk laporan absensi (opsional)" rows={3} />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button size="lg" onClick={handleGenerate} disabled={loading} className="bg-cyan-600 hover:bg-cyan-700 text-white">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  AI sedang membuat laporan absensi...
                </>
              ) : (
                "Generate Laporan Absensi"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
