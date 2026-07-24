"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createPurchaseOrderAction, getCompanyProfile, saveCompanyProfile } from "@/lib/actions/documents"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Plus, Trash2, FileDown, Loader2, ArrowLeft } from "lucide-react"
import { exportHtmlToPdf } from "@/lib/pdf-export"
import { escapeHtml } from "@/lib/utils"

interface POItem {
  name: string
  quantity: number
  unit: string
  unitPrice: number
}

export default function POClient() {
  const router = useRouter()
  const previewRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [html, setHtml] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState("")
  const [companyAddress, setCompanyAddress] = useState("")
  const [companyPhone, setCompanyPhone] = useState("")
  const [vendorName, setVendorName] = useState("")
  const [vendorAddress, setVendorAddress] = useState("")
  const [vendorPhone, setVendorPhone] = useState("")
  const [deliveryDate, setDeliveryDate] = useState("")
  const [paymentTerms, setPaymentTerms] = useState("")
  const [deliveryTerms, setDeliveryTerms] = useState("")
  const [notes, setNotes] = useState("")
  const [items, setItems] = useState<POItem[]>([
    { name: "", quantity: 1, unit: "pcs", unitPrice: 0 },
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
    setItems([...items, { name: "", quantity: 1, unit: "pcs", unitPrice: 0 }])
  }

  function removeItem(index: number) {
    if (items.length <= 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  function updateItem(index: number, field: keyof POItem, value: string | number) {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

  async function handleGenerate() {
    if (!vendorName.trim()) {
      toast.error("Nama vendor wajib diisi")
      return
    }
    if (items.some((item) => !item.name.trim())) {
      toast.error("Semua item wajib diisi namanya")
      return
    }

    setLoading(true)
    try {
      const result = await createPurchaseOrderAction({
        vendorName,
        vendorAddress,
        vendorPhone,
        deliveryDate,
        items: items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
        })),
        paymentTerms,
        deliveryTerms,
        notes,
      })
      setHtml(result.html)
      toast.success("Purchase Order berhasil dibuat!")
      if (companyName) {
        saveCompanyProfile({
          name: companyName,
          address: companyAddress || undefined,
          phone: companyPhone || undefined,
        }).catch(() => {})
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membuat Purchase Order")
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
      await exportHtmlToPdf(html, "Purchase-Order")
      toast.success("PDF berhasil diunduh!")
    } catch {
      toast.error("Gagal export PDF")
    } finally {
      setExportingPdf(false)
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  function formatRupiah(n: number) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n)
  }

  if (html) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b bg-white flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setHtml(null)}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali
          </Button>
          <h1 className="text-lg font-semibold">Preview Purchase Order</h1>
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
          <h1 className="text-2xl font-bold">AI Purchase Order Generator</h1>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Data Perusahaan (Pembeli)</CardTitle>
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
              <CardTitle className="text-base">Data Vendor (Pemasok)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vendorName">Nama Vendor *</Label>
                  <Input id="vendorName" value={vendorName} onChange={(e) => setVendorName(e.target.value)} placeholder="PT Sumber Barang" />
                </div>
                <div>
                  <Label htmlFor="vendorPhone">Telepon</Label>
                  <Input id="vendorPhone" value={vendorPhone} onChange={(e) => setVendorPhone(e.target.value)} placeholder="08123456789" />
                </div>
              </div>
              <div>
                <Label htmlFor="vendorAddress">Alamat</Label>
                <Input id="vendorAddress" value={vendorAddress} onChange={(e) => setVendorAddress(e.target.value)} placeholder="Jl. Raya Industri No. 10, Surabaya" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tanggal Pengiriman</CardTitle>
            </CardHeader>
            <CardContent>
              <Input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Item Pembelian</CardTitle>
              <Button variant="outline" size="sm" onClick={addItem}>
                <Plus className="w-4 h-4 mr-1" />
                Tambah Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex items-end gap-3">
                  <div className="flex-1">
                    <Label className="text-xs">Nama Item *</Label>
                    <Input value={item.name} onChange={(e) => updateItem(index, "name", e.target.value)} placeholder="Bahan baku A" />
                  </div>
                  <div className="w-20">
                    <Label className="text-xs">Qty</Label>
                    <Input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)} />
                  </div>
                  <div className="w-20">
                    <Label className="text-xs">Satuan</Label>
                    <Input value={item.unit} onChange={(e) => updateItem(index, "unit", e.target.value)} placeholder="pcs" />
                  </div>
                  <div className="w-36">
                    <Label className="text-xs">Harga Satuan</Label>
                    <Input type="number" min="0" value={item.unitPrice || ""} onChange={(e) => updateItem(index, "unitPrice", parseInt(e.target.value) || 0)} placeholder="0" />
                  </div>
                  <div className="w-36 text-right pb-2 text-sm font-medium">{formatRupiah(item.quantity * item.unitPrice)}</div>
                  <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeItem(index)} disabled={items.length <= 1}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              <div className="border-t pt-3 mt-3 flex justify-end">
                <div className="w-72 space-y-1 text-sm">
                  <div className="flex justify-between font-bold text-base border-t pt-1"><span>Grand Total</span><span className="text-blue-600">{formatRupiah(subtotal)}</span></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Syarat Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} placeholder="Contoh: Transfer 30 hari setelah invoice" rows={3} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Syarat Pengiriman</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea value={deliveryTerms} onChange={(e) => setDeliveryTerms(e.target.value)} placeholder="Contoh: Pengiriman ke gudang customer dalam 7 hari kerja" rows={3} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Catatan</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Catatan tambahan untuk Purchase Order (opsional)" rows={3} />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button size="lg" onClick={handleGenerate} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  AI sedang membuat Purchase Order...
                </>
              ) : (
                "Generate Purchase Order"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
