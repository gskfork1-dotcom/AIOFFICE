"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createQuotationAction, getCompanyProfile, saveCompanyProfile } from "@/lib/actions/documents"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Plus, Trash2, FileDown, Loader2, ArrowLeft } from "lucide-react"
import { exportHtmlToPdf } from "@/lib/pdf-export"

interface QuotationItem {
  name: string
  description: string
  quantity: number
  unitPrice: number
}

export default function QuotationClient() {
  const router = useRouter()
  const previewRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [html, setHtml] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState("")
  const [companyAddress, setCompanyAddress] = useState("")
  const [companyPhone, setCompanyPhone] = useState("")
  const [companyEmail, setCompanyEmail] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [discount, setDiscount] = useState(0)
  const [notes, setNotes] = useState("")
  const [validUntil, setValidUntil] = useState("")
  const [items, setItems] = useState<QuotationItem[]>([
    { name: "", description: "", quantity: 1, unitPrice: 0 },
  ])

  useEffect(() => {
    getCompanyProfile().then((profile) => {
      if (profile) {
        setCompanyName(profile.name)
        setCompanyAddress(profile.address ?? "")
        setCompanyPhone(profile.phone ?? "")
        setCompanyEmail(profile.email ?? "")
      }
    }).catch(() => {})
  }, [])

  function addItem() {
    setItems([...items, { name: "", description: "", quantity: 1, unitPrice: 0 }])
  }

  function removeItem(index: number) {
    if (items.length <= 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  function updateItem(index: number, field: keyof QuotationItem, value: string | number) {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

  async function handleGenerate() {
    if (!customerName.trim()) {
      toast.error("Nama customer wajib diisi")
      return
    }
    if (items.some((item) => !item.name.trim())) {
      toast.error("Semua item wajib diisi namanya")
      return
    }

    setLoading(true)
    try {
      const result = await createQuotationAction({
        customerName,
        customerAddress,
        customerPhone,
        items: items.map((item) => ({
          name: item.name,
          description: item.description || undefined,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        discount: discount || undefined,
        notes,
        validUntil: validUntil || undefined,
        from:
          companyName || companyAddress || companyPhone || companyEmail
            ? { name: companyName, address: companyAddress, phone: companyPhone, email: companyEmail }
            : undefined,
      })
      setHtml(result.html)
      toast.success("Quotation berhasil dibuat!")
      if (companyName) {
        saveCompanyProfile({
          name: companyName,
          address: companyAddress || undefined,
          phone: companyPhone || undefined,
          email: companyEmail || undefined,
        }).catch(() => {})
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membuat quotation")
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
      await exportHtmlToPdf(html, "Quotation")
      toast.success("PDF berhasil diunduh!")
    } catch {
      toast.error("Gagal export PDF")
    } finally {
      setExportingPdf(false)
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const discountAmount = Math.round(subtotal * (discount / 100))
  const totalAfterDiscount = subtotal - discountAmount

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
          <h1 className="text-lg font-semibold">Preview Quotation</h1>
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
          <h1 className="text-2xl font-bold">AI Quotation Generator</h1>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Data Perusahaan (Pengirim)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Nama Perusahaan</Label>
                  <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="PT Maju Jaya" />
                </div>
                <div>
                  <Label htmlFor="companyEmail">Email</Label>
                  <Input id="companyEmail" type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} placeholder="info@majujaya.com" />
                </div>
              </div>
              <div>
                <Label htmlFor="companyAddress">Alamat</Label>
                <Input id="companyAddress" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} placeholder="Jl. Sudirman No. 123, Jakarta" />
              </div>
              <div>
                <Label htmlFor="companyPhone">Telepon</Label>
                <Input id="companyPhone" value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} placeholder="08123456789" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Data Customer (Penerima)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Nama Customer *</Label>
                  <Input id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="CV Berkah Sejahtera" />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Telepon</Label>
                  <Input id="customerPhone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="081987654321" />
                </div>
              </div>
              <div>
                <Label htmlFor="customerAddress">Alamat</Label>
                <Input id="customerAddress" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} placeholder="Jl. Gatot Subroto No. 45, Bandung" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Item Penawaran</CardTitle>
              <Button variant="outline" size="sm" onClick={addItem}>
                <Plus className="w-4 h-4 mr-1" />
                Tambah Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <Label className="text-xs">Nama Item</Label>
                      <Input value={item.name} onChange={(e) => updateItem(index, "name", e.target.value)} placeholder="Layanan konsultasi" />
                    </div>
                    <div className="w-24">
                      <Label className="text-xs">Qty</Label>
                      <Input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)} />
                    </div>
                    <div className="w-40">
                      <Label className="text-xs">Harga Satuan</Label>
                      <Input type="number" min="0" value={item.unitPrice || ""} onChange={(e) => updateItem(index, "unitPrice", parseInt(e.target.value) || 0)} placeholder="0" />
                    </div>
                    <div className="w-36 text-right pb-2 text-sm font-medium">{formatRupiah(item.quantity * item.unitPrice)}</div>
                    <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeItem(index)} disabled={items.length <= 1}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div>
                    <Label className="text-xs">Deskripsi (opsional)</Label>
                    <Input value={item.description} onChange={(e) => updateItem(index, "description", e.target.value)} placeholder="Deskripsi singkat item" />
                  </div>
                </div>
              ))}

              <div className="border-t pt-3 mt-3 flex justify-end">
                <div className="w-72 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatRupiah(subtotal)}</span></div>
                  {discount > 0 && (
                    <div className="flex justify-between text-red-600"><span>Diskon ({discount}%)</span><span>-{formatRupiah(discountAmount)}</span></div>
                  )}
                  <div className="flex justify-between font-bold text-base border-t pt-1"><span>Total</span><span className="text-green-600">{formatRupiah(totalAfterDiscount)}</span></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pengaturan Tambahan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discount">Diskon (%)</Label>
                  <Input id="discount" type="number" min="0" max="100" value={discount || ""} onChange={(e) => setDiscount(parseInt(e.target.value) || 0)} placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="validUntil">Berlaku Hingga</Label>
                  <Input id="validUntil" type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Catatan</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Catatan tambahan untuk penawaran (opsional)" rows={3} />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button size="lg" onClick={handleGenerate} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  AI sedang membuat quotation...
                </>
              ) : (
                "Generate Quotation"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
