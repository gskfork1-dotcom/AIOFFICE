import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SignInButton } from "@clerk/nextjs"
import { HeaderAuth } from "@/components/header-auth"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1">
            <span className="text-2xl font-bold text-blue-600">AIOFFICE</span>
            <span className="text-2xl font-light">.id</span>
          </Link>
          <HeaderAuth />
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            AI Karyawan Administrasi
            <br />
            <span className="text-blue-600">untuk UMKM Indonesia</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Buat invoice, quotation, proposal, kwitansi, surat jalan, surat resmi, slip gaji, dan dokumen bisnis lainnya dalam
            hitungan detik. Tanpa perlu menguasai Microsoft Office atau Canva.
          </p>
          <div className="flex items-center justify-center gap-4">
            <SignInButton mode="modal">
              <Button size="lg" className="text-base px-8">
                Mulai Gratis
              </Button>
            </SignInButton>
          </div>
        </section>

        <section className="bg-slate-50 py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Semua yang UMKM Butuhkan
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  title: "Invoice & Quotation",
                  desc: "Buat invoice profesional dan surat penawaran dalam hitungan detik.",
                },
                {
                  title: "Proposal & Kontrak",
                  desc: "Generate proposal bisnis dan draft kontrak yang siap pakai.",
                },
                {
                  title: "Kwitansi & Surat Jalan",
                  desc: "Kwitansi pembayaran dan surat pengiriman barang otomatis.",
                },
                {
                  title: "Surat Resmi & Slip Gaji",
                  desc: "Surat formal perusahaan dan slip gaji karyawan.",
                },
                {
                  title: "SOP & Dokumen Lainnya",
                  desc: "Standard Operating Procedure dan berbagai dokumen bisnis.",
                },
                {
                  title: "Workspace Terorganisir",
                  desc: "Folder, favorit, pencarian, dan sampah untuk kelola semua dokumen.",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="bg-white p-6 rounded-xl border shadow-sm"
                >
                  <h3 className="text-lg font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} AIOFFICE.id. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
