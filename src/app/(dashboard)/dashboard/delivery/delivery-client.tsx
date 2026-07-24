"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createDeliveryAction, getCompanyProfile, saveCompanyProfile } from "@/lib/actions/documents"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Plus, Trash2, FileDown, Loader2, ArrowLeft } from "lucide-react"
import { exportHtmlToPdf } from "@/lib/pdf-export"

interface DeliveryItem {
  name: string
  quantity: number
  unit: string
  description: string
}

export default function DeliveryClient() {
  const router = useRouter()
  const previewRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [html, setHtml] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState("")
  const [companyAddress, setCompanyAddress] = useState("")
  const [companyPhone, setCompanyPhone] = useState("")
  const [recipientName, setRecipientName] = useState("")
  const [recipientAddress, setRecipientAddress] = useState("")
  const [recipientPhone, setRecipientPhone] = useState("")
  const [vehicle, setVehicle] = useState("")
  const [driver, setDriver] = useState("")
  const [notes, setNotes] = useState("")
  const [items, setItems] = useState<DeliveryItem[]>([
    { name: "", quantity: 1, unit: "Pcs", description: "" },
  ])

  useEffect(() => {
    getCompanyProfile().then((profile) => {
      if (profile) {
        setCompanyName(profile.name)
        setCompanyAddress(profile.address ?? "")
        setCompanyPhone(profile.phone ?? "")
      }
    }).catch(() => {})
  }, [])

  function addItem() {
    setItems([...items, { name: "", quantity: 1, unit: "Pcs", description: "" }])
  }

  function removeItem(index: number) {
    if (items.length <= 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  function updateItem(index: number, field: keyof DeliveryItem, value: string | number) {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

  async function handleGenerate() {
    if (!recipientName.trim()) {
      toast.error("Nama penerima wajib diisi")
      return
    }
    if (items.some((item) => !item.name.trim())) {
      toast.error("Semua item wajib diisi namanya")
      return
    }

    setLoading(true)
    try {
      const result = await createDeliveryAction({
        recipientName,
        recipientAddress,
        recipientPhone,
        items: items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          description: item.description,
        })),
        vehicle,
        driver,
        notes,
        from:
          companyName || companyAddress || companyPhone
            ? { name: companyName, address: companyAddress, phone: companyPhone }
            : undefined,
      })
      setHtml(result.html)
      toast.success("Surat jalan berhasil dibuat!")
      if (companyName) {
        saveCompanyProfile({
          name: companyName,
          address: companyAddress || undefined,
          phone: companyPhone || undefined,
        }).catch(() => {})
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membuat surat jalan")
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
      await exportHtmlToPdf(html, "Surat Jalan")
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
          <h1 className="text-lg font-semibold">Preview Surat Jalan</h1>
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
          <h1 className="text-2xl font-bold">Surat Jalan</h1>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Data Pengirim</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Nama Perusahaan</Label>
                  <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="PT Maju Jaya" />
                </div>
                <div>
                  <Label htmlFor="companyPhone">Telepon</Label>
                  <Input id="companyPhone" value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} placeholder="08123456789" />
                </div>
              </div>
              <div>
                <Label htmlFor="companyAddress">Alamat</Label>
                <Input id="companyAddress" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} placeholder="Jl. Sudirman No. 123, Jakarta" />
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
                  <Input id="recipientName" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="CV Berkah Sejahtera" />
                </div>
                <div>
                  <Label htmlFor="recipientPhone">Telepon</Label>
                  <Input id="recipientPhone" value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} placeholder="081987654321" />
                </div>
              </div>
              <div>
                <Label htmlFor="recipientAddress">Alamat</Label>
                <Input id="recipientAddress" value={recipientAddress} onChange={(e) => setRecipientAddress(e.target.value)} placeholder="Jl. Gatot Subroto No. 45, Bandung" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Item / Barang</CardTitle>
              <Button variant="outline" size="sm" onClick={addItem}>
                <Plus className="w-4 h-4 mr-1" />
                Tambah Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-3">
                    <Label className="text-xs">Nama Item</Label>
                    <Input value={item.name} onChange={(e) => updateItem(index, "name", e.target.value)} placeholder="Barang ABC" />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Qty</Label>
                    <Input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)} />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Satuan</Label>
                    <Input value={item.unit} onChange={(e) => updateItem(index, "unit", e.target.value)} placeholder="Pcs" />
                  </div>
                  <div className="col-span-4">
                    <Label className="text-xs">Deskripsi</Label>
                    <Input value={item.description} onChange={(e) => updateItem(index, "description", e.target.value)} placeholder="Keterangan barang (opsional)" />
                  </div>
                  <div className="col-span-1">
                    <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeItem(index)} disabled={items.length <= 1}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Kendaraan & Pengemudi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vehicle">Kendaraan</Label>
                  <Input id="vehicle" value={vehicle} onChange={(e) => setVehicle(e.target.value)} placeholder="Truk Box B 1234 CD" />
                </div>
                <div>
                  <Label htmlFor="driver">Pengemudi</Label>
                  <Input id="driver" value={driver} onChange={(e) => setDriver(e.target.value)} placeholder="Budi Santoso" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Catatan</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Catatan tambahan untuk surat jalan (opsional)" rows={3} />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button size="lg" onClick={handleGenerate} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Membuat Surat Jalan...
                </>
              ) : (
                "Generate Surat Jalan"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
