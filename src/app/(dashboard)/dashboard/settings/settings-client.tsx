"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCompanyProfile, saveCompanyProfile } from "@/lib/actions/documents"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { ArrowLeft, Loader2, Check } from "lucide-react"

export default function SettingsClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [companyName, setCompanyName] = useState("")
  const [companyAddress, setCompanyAddress] = useState("")
  const [companyPhone, setCompanyPhone] = useState("")
  const [companyEmail, setCompanyEmail] = useState("")

  useEffect(() => {
    getCompanyProfile().then((profile) => {
      if (profile) {
        setCompanyName(profile.name)
        setCompanyAddress(profile.address ?? "")
        setCompanyPhone(profile.phone ?? "")
        setCompanyEmail(profile.email ?? "")
      }
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    if (!companyName.trim()) {
      toast.error("Nama perusahaan wajib diisi")
      return
    }
    setSaving(true)
    try {
      await saveCompanyProfile({
        name: companyName,
        address: companyAddress || undefined,
        phone: companyPhone || undefined,
        email: companyEmail || undefined,
      })
      toast.success("Profil perusahaan berhasil disimpan!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Memuat profil...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Pengaturan Profil</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profil Perusahaan</CardTitle>
            <p className="text-sm text-muted-foreground">
              Data ini akan otomatis terisi di semua dokumen (invoice, quotation, proposal, kontrak, SOP).
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nama Perusahaan *</Label>
              <Input id="name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="PT Maju Jaya Sejahtera" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} placeholder="info@company.com" />
            </div>
            <div>
              <Label htmlFor="address">Alamat</Label>
              <Input id="address" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} placeholder="Jl. Sudirman No. 123, Jakarta Selatan" />
            </div>
            <div>
              <Label htmlFor="phone">Telepon</Label>
              <Input id="phone" value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} placeholder="08123456789" />
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Menyimpan...</>
                ) : (
                  <><Check className="w-4 h-4 mr-2" />Simpan Profil</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
