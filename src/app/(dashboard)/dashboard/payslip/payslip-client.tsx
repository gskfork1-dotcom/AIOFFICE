"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createPayslipAction } from "@/lib/actions/documents"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { FileDown, Loader2, ArrowLeft } from "lucide-react"
import { exportHtmlToPdf } from "@/lib/pdf-export"

export default function PayslipClient() {
  const router = useRouter()
  const previewRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [html, setHtml] = useState<string | null>(null)

  const [employeeName, setEmployeeName] = useState("")
  const [employeeNip, setEmployeeNip] = useState("")
  const [employeePosition, setEmployeePosition] = useState("")
  const [employeeDepartment, setEmployeeDepartment] = useState("")
  const [period, setPeriod] = useState("")

  const [baseSalary, setBaseSalary] = useState(0)
  const [allowances, setAllowances] = useState(0)
  const [allowanceDescription, setAllowanceDescription] = useState("")
  const [deductions, setDeductions] = useState(0)
  const [deductionDescription, setDeductionDescription] = useState("")
  const [notes, setNotes] = useState("")

  const totalEarnings = baseSalary + allowances
  const totalDeductions = deductions
  const netSalary = totalEarnings - totalDeductions

  function formatRupiah(n: number) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n)
  }

  async function handleGenerate() {
    if (!employeeName.trim()) {
      toast.error("Nama karyawan wajib diisi")
      return
    }
    if (!period.trim()) {
      toast.error("Periode gaji wajib diisi")
      return
    }
    if (baseSalary <= 0) {
      toast.error("Gaji pokok harus lebih dari 0")
      return
    }

    setLoading(true)
    try {
      const result = await createPayslipAction({
        employeeName,
        employeeNip: employeeNip || undefined,
        employeePosition: employeePosition || undefined,
        employeeDepartment: employeeDepartment || undefined,
        period,
        baseSalary,
        allowances: allowances || undefined,
        allowanceDescription: allowanceDescription || undefined,
        deductions: deductions || undefined,
        deductionDescription: deductionDescription || undefined,
        notes: notes || undefined,
      })
      setHtml(result.html)
      toast.success("Slip gaji berhasil dibuat!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membuat slip gaji")
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
      await exportHtmlToPdf(html, "Slip Gaji")
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
          <h1 className="text-lg font-semibold">Preview Slip Gaji</h1>
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
          <h1 className="text-2xl font-bold">Slip Gaji</h1>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Data Karyawan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employeeName">Nama Karyawan *</Label>
                  <Input id="employeeName" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} placeholder="Budi Santoso" />
                </div>
                <div>
                  <Label htmlFor="employeeNip">NIP</Label>
                  <Input id="employeeNip" value={employeeNip} onChange={(e) => setEmployeeNip(e.target.value)} placeholder="199001012020001001" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employeePosition">Jabatan</Label>
                  <Input id="employeePosition" value={employeePosition} onChange={(e) => setEmployeePosition(e.target.value)} placeholder="Staff Marketing" />
                </div>
                <div>
                  <Label htmlFor="employeeDepartment">Departemen</Label>
                  <Input id="employeeDepartment" value={employeeDepartment} onChange={(e) => setEmployeeDepartment(e.target.value)} placeholder="Marketing" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Periode</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-48">
                <Label htmlFor="period">Periode Gaji *</Label>
                <Input id="period" value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="Juli 2026" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pendapatan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="baseSalary">Gaji Pokok *</Label>
                <Input id="baseSalary" type="number" min="0" value={baseSalary || ""} onChange={(e) => setBaseSalary(parseInt(e.target.value) || 0)} placeholder="0" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="allowances">Tunjangan</Label>
                  <Input id="allowances" type="number" min="0" value={allowances || ""} onChange={(e) => setAllowances(parseInt(e.target.value) || 0)} placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="allowanceDescription">Keterangan Tunjangan</Label>
                  <Input id="allowanceDescription" value={allowanceDescription} onChange={(e) => setAllowanceDescription(e.target.value)} placeholder="Tunjangan transport, makan, dll" />
                </div>
              </div>
              <div className="border-t pt-3 flex justify-end">
                <div className="w-72 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gaji Pokok</span>
                    <span>{formatRupiah(baseSalary)}</span>
                  </div>
                  {allowances > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tunjangan</span>
                      <span>{formatRupiah(allowances)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-base border-t pt-1">
                    <span>Total Pendapatan</span>
                    <span className="text-emerald-600">{formatRupiah(totalEarnings)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Potongan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="deductions">Total Potongan</Label>
                  <Input id="deductions" type="number" min="0" value={deductions || ""} onChange={(e) => setDeductions(parseInt(e.target.value) || 0)} placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="deductionDescription">Keterangan Potongan</Label>
                  <Input id="deductionDescription" value={deductionDescription} onChange={(e) => setDeductionDescription(e.target.value)} placeholder="BPJS, PPh 21, dll" />
                </div>
              </div>
              {deductions > 0 && (
                <div className="border-t pt-3 flex justify-end">
                  <div className="w-72 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Potongan</span>
                      <span className="text-red-500">{formatRupiah(totalDeductions)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ringkasan Gaji</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-72 ml-auto space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Pendapatan</span>
                  <span>{formatRupiah(totalEarnings)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Potongan</span>
                  <span>{formatRupiah(totalDeductions)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Gaji Bersih</span>
                  <span className="text-emerald-600">{formatRupiah(netSalary)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Catatan</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Catatan tambahan untuk slip gaji (opsional)" rows={3} />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button size="lg" onClick={handleGenerate} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  AI sedang membuat slip gaji...
                </>
              ) : (
                "Generate Slip Gaji"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
