"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createSOPAction } from "@/lib/actions/documents"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { FileDown, Loader2, ArrowLeft } from "lucide-react"
import { exportHtmlToPdf } from "@/lib/pdf-export"

export default function SOPClient() {
  const router = useRouter()
  const previewRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [html, setHtml] = useState<string | null>(null)

  const [title, setTitle] = useState("")
  const [businessType, setBusinessType] = useState("")
  const [department, setDepartment] = useState("")
  const [purpose, setPurpose] = useState("")
  const [steps, setSteps] = useState("")
  const [responsible, setResponsible] = useState("")
  const [notes, setNotes] = useState("")

  async function handleGenerate() {
    if (!title.trim()) {
      toast.error("Judul SOP wajib diisi")
      return
    }
    if (!businessType.trim()) {
      toast.error("Jenis usaha wajib diisi")
      return
    }

    setLoading(true)
    try {
      const result = await createSOPAction({
        title,
        businessType,
        department: department || undefined,
        purpose: purpose || undefined,
        steps: steps || undefined,
        responsible: responsible || undefined,
        notes: notes || undefined,
      })
      setHtml(result.html)
      toast.success("SOP berhasil dibuat!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membuat SOP")
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
      await exportHtmlToPdf(html, "SOP")
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
          <h1 className="text-lg font-semibold">Preview SOP</h1>
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
          <h1 className="text-2xl font-bold">AI SOP Generator</h1>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Informasi SOP</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Judul SOP *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="SOP Penerimaan Barang" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Jenis Usaha *</Label><Input value={businessType} onChange={(e) => setBusinessType(e.target.value)} placeholder="Toko Retail, Bengkel, Cafe..." /></div>
                <div><Label>Departemen</Label><Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Gudang, HR, Operasional..." /></div>
              </div>
              <div><Label>Penanggung Jawab</Label><Input value={responsible} onChange={(e) => setResponsible(e.target.value)} placeholder="Manager Gudang" /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Isi SOP</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tujuan SOP</Label>
                <Textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Menjelaskan tujuan dari SOP ini, misalnya: memastikan proses penerimaan barang berjalan konsisten dan akurat." rows={3} />
              </div>
              <div>
                <Label>Langkah-langkah (opsional - biarkan AI generate)</Label>
                <Textarea value={steps} onChange={(e) => setSteps(e.target.value)} placeholder="Jika ingin manual, tulis langkah-langkahnya. Jika kosong, AI akan generate otomatis berdasarkan jenis usaha." rows={4} />
              </div>
              <div>
                <Label>Catatan Tambahan</Label>
                <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Catatan untuk AI" />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button size="lg" onClick={handleGenerate} disabled={loading}>
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />AI sedang membuat SOP...</>
              ) : "Generate SOP"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
