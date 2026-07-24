import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { UserButton } from "@clerk/nextjs"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  if (!userId) redirect("/login")

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <span className="text-xl font-bold text-blue-600">AIOFFICE</span>
          <span className="text-xl font-light">.id</span>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto text-sm">
          <a href="/dashboard" className="block px-3 py-2 rounded-md font-medium hover:bg-slate-100">Dashboard</a>
          <a href="/dashboard/workspace" className="block px-3 py-2 rounded-md font-medium hover:bg-slate-100">Workspace</a>

          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 mt-4 px-3">Penjualan</div>
          <a href="/dashboard/invoice" className="block px-3 py-1.5 rounded-md hover:bg-slate-100">AI Invoice</a>
          <a href="/dashboard/quotation" className="block px-3 py-1.5 rounded-md hover:bg-slate-100">AI Quotation</a>
          <a href="/dashboard/po" className="block px-3 py-1.5 rounded-md hover:bg-slate-100">Purchase Order</a>

          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 mt-3 px-3">Administrasi</div>
          <a href="/dashboard/letter" className="block px-3 py-1.5 rounded-md hover:bg-slate-100">Surat Resmi</a>
          <a href="/dashboard/memo" className="block px-3 py-1.5 rounded-md hover:bg-slate-100">Memo</a>
          <a href="/dashboard/proposal" className="block px-3 py-1.5 rounded-md hover:bg-slate-100">AI Proposal</a>
          <a href="/dashboard/contract" className="block px-3 py-1.5 rounded-md hover:bg-slate-100">AI Kontrak</a>
          <a href="/dashboard/sop" className="block px-3 py-1.5 rounded-md hover:bg-slate-100">AI SOP</a>
          <a href="/dashboard/notulen" className="block px-3 py-1.5 rounded-md hover:bg-slate-100">Notulen Rapat</a>
          <a href="/dashboard/ba" className="block px-3 py-1.5 rounded-md hover:bg-slate-100">Berita Acara</a>
          <a href="/dashboard/delivery" className="block px-3 py-1.5 rounded-md hover:bg-slate-100">Surat Jalan</a>

          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 mt-3 px-3">Keuangan</div>
          <a href="/dashboard/receipt" className="block px-3 py-1.5 rounded-md hover:bg-slate-100">Kwitansi</a>

          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 mt-3 px-3">HR</div>
          <a href="/dashboard/payslip" className="block px-3 py-1.5 rounded-md hover:bg-slate-100">Slip Gaji</a>
          <a href="/dashboard/absensi" className="block px-3 py-1.5 rounded-md hover:bg-slate-100">Absensi</a>
          <a href="/dashboard/surat-pengangkatan" className="block px-3 py-1.5 rounded-md hover:bg-slate-100">Surat Pengangkatan</a>
          <a href="/dashboard/surat-phk" className="block px-3 py-1.5 rounded-md hover:bg-slate-100">Surat PHK</a>

          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 mt-3 px-3">Lainnya</div>
          <a href="/dashboard/settings" className="block px-3 py-1.5 rounded-md hover:bg-slate-100">Pengaturan</a>
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center justify-center">
            <UserButton />
          </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col bg-slate-50">{children}</main>
    </div>
  )
}
