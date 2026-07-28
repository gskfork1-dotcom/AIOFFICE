import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserButton } from "@clerk/nextjs"
import { db } from "@/lib/db"
import { FileText } from "lucide-react"

export const dynamic = "force-dynamic"

const FREE_LIMIT = 5

interface DashboardData {
  documentCount: number
  generationCount: number
  user: {
    role: string
    subscription: { tier: string } | null
  } | null
  recentDocs: { id: string; title: string; type: string; createdAt: Date }[]
  typeCounts: { type: string; _count: { type: number } }[]
}

async function fetchDashboardData(userId: string): Promise<DashboardData> {
  const [documentCount, generationCount, user, recentDocs, typeCounts] =
    await Promise.all([
      db.document.count({ where: { userId } }),
      db.aIGeneration.count({ where: { userId } }),
      db.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
      }),
      db.document.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, title: true, type: true, createdAt: true },
      }),
      db.document.groupBy({
        by: ["type"],
        where: { userId },
        _count: { type: true },
      }),
    ])

  return { documentCount, generationCount, user, recentDocs, typeCounts }
}

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect("/login")

  let data: DashboardData
  try {
    data = await fetchDashboardData(userId)
  } catch (err) {
    console.error("[Dashboard] Database error:", err)
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🗄️</div>
          <h2 className="text-xl font-bold mb-2">Gagal Memuat Data</h2>
          <p className="text-muted-foreground mb-4">
            Terjadi kesalahan saat menghubungi database. Silakan coba lagi
            nanti.
          </p>
          <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
            Muat Ulang
          </Link>
        </div>
      </div>
    )
  }

  const { documentCount, generationCount, user, recentDocs, typeCounts } = data

  const tier = user?.subscription?.tier ?? user?.role ?? "FREE"
  const isFree = tier === "FREE"
  const aiRemaining = isFree ? Math.max(0, FREE_LIMIT - generationCount) : "Unlimited"

  const typeMap: Record<string, number> = {}
  for (const t of typeCounts) {
    typeMap[t.type] = t._count.type
  }

  function formatDate(d: Date | string) {
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d))
  }

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Selamat datang</h1>
            <p className="text-muted-foreground mt-1">AI Office untuk bisnis Anda</p>
          </div>
          <UserButton />
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Dokumen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{documentCount}</div>
              <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                <span>Invoice: {typeMap["INVOICE"] ?? 0}</span>
                <span>Quotation: {typeMap["QUOTATION"] ?? 0}</span>
                <span>Proposal: {typeMap["PROPOSAL"] ?? 0}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">AI Generate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {isFree ? `${generationCount} / ${FREE_LIMIT}` : generationCount}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isFree ? `Sisa ${typeof aiRemaining === "number" ? aiRemaining : aiRemaining}x` : tier}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Paket</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{tier}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {isFree ? "Upgrade untuk fitur unlimited" : "Aktif"}
              </p>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-xl font-semibold mb-4">Buat Dokumen Baru</h2>
        <div className="grid md:grid-cols-4 gap-3 mb-8">
          <Link href="/dashboard/invoice"><Card className="hover:shadow-md transition-shadow cursor-pointer"><CardContent className="p-4"><div className="text-2xl mb-1">📄</div><h3 className="font-semibold text-sm">AI Invoice</h3><p className="text-xs text-muted-foreground mt-1">Buat invoice profesional</p></CardContent></Card></Link>
          <Link href="/dashboard/quotation"><Card className="hover:shadow-md transition-shadow cursor-pointer"><CardContent className="p-4"><div className="text-2xl mb-1">📋</div><h3 className="font-semibold text-sm">AI Quotation</h3><p className="text-xs text-muted-foreground mt-1">Surat penawaran menarik</p></CardContent></Card></Link>
          <Link href="/dashboard/po"><Card className="hover:shadow-md transition-shadow cursor-pointer"><CardContent className="p-4"><div className="text-2xl mb-1">🛒</div><h3 className="font-semibold text-sm">Purchase Order</h3><p className="text-xs text-muted-foreground mt-1">Pesanan pembelian</p></CardContent></Card></Link>
          <Link href="/dashboard/letter"><Card className="hover:shadow-md transition-shadow cursor-pointer"><CardContent className="p-4"><div className="text-2xl mb-1">✉️</div><h3 className="font-semibold text-sm">Surat Resmi</h3><p className="text-xs text-muted-foreground mt-1">Surat formal & resmi</p></CardContent></Card></Link>
          <Link href="/dashboard/memo"><Card className="hover:shadow-md transition-shadow cursor-pointer"><CardContent className="p-4"><div className="text-2xl mb-1">📝</div><h3 className="font-semibold text-sm">Memo</h3><p className="text-xs text-muted-foreground mt-1">Memo internal</p></CardContent></Card></Link>
          <Link href="/dashboard/proposal"><Card className="hover:shadow-md transition-shadow cursor-pointer"><CardContent className="p-4"><div className="text-2xl mb-1">📑</div><h3 className="font-semibold text-sm">AI Proposal</h3><p className="text-xs text-muted-foreground mt-1">Proposal bisnis lengkap</p></CardContent></Card></Link>
          <Link href="/dashboard/contract"><Card className="hover:shadow-md transition-shadow cursor-pointer"><CardContent className="p-4"><div className="text-2xl mb-1">📝</div><h3 className="font-semibold text-sm">AI Kontrak</h3><p className="text-xs text-muted-foreground mt-1">Draft kontrak resmi</p></CardContent></Card></Link>
          <Link href="/dashboard/sop"><Card className="hover:shadow-md transition-shadow cursor-pointer"><CardContent className="p-4"><div className="text-2xl mb-1">📋</div><h3 className="font-semibold text-sm">AI SOP</h3><p className="text-xs text-muted-foreground mt-1">Standard Operating Procedure</p></CardContent></Card></Link>
          <Link href="/dashboard/notulen"><Card className="hover:shadow-md transition-shadow cursor-pointer"><CardContent className="p-4"><div className="text-2xl mb-1">🗒️</div><h3 className="font-semibold text-sm">Notulen Rapat</h3><p className="text-xs text-muted-foreground mt-1">Notulen rapat otomatis</p></CardContent></Card></Link>
          <Link href="/dashboard/ba"><Card className="hover:shadow-md transition-shadow cursor-pointer"><CardContent className="p-4"><div className="text-2xl mb-1">📜</div><h3 className="font-semibold text-sm">Berita Acara</h3><p className="text-xs text-muted-foreground mt-1">Berita acara formal</p></CardContent></Card></Link>
          <Link href="/dashboard/receipt"><Card className="hover:shadow-md transition-shadow cursor-pointer"><CardContent className="p-4"><div className="text-2xl mb-1">🧾</div><h3 className="font-semibold text-sm">Kwitansi</h3><p className="text-xs text-muted-foreground mt-1">Kwitansi pembayaran</p></CardContent></Card></Link>
          <Link href="/dashboard/delivery"><Card className="hover:shadow-md transition-shadow cursor-pointer"><CardContent className="p-4"><div className="text-2xl mb-1">🚚</div><h3 className="font-semibold text-sm">Surat Jalan</h3><p className="text-xs text-muted-foreground mt-1">Surat pengiriman barang</p></CardContent></Card></Link>
          <Link href="/dashboard/payslip"><Card className="hover:shadow-md transition-shadow cursor-pointer"><CardContent className="p-4"><div className="text-2xl mb-1">💰</div><h3 className="font-semibold text-sm">Slip Gaji</h3><p className="text-xs text-muted-foreground mt-1">Slip gaji karyawan</p></CardContent></Card></Link>
          <Link href="/dashboard/absensi"><Card className="hover:shadow-md transition-shadow cursor-pointer"><CardContent className="p-4"><div className="text-2xl mb-1">📊</div><h3 className="font-semibold text-sm">Absensi</h3><p className="text-xs text-muted-foreground mt-1">Laporan kehadiran</p></CardContent></Card></Link>
          <Link href="/dashboard/surat-pengangkatan"><Card className="hover:shadow-md transition-shadow cursor-pointer"><CardContent className="p-4"><div className="text-2xl mb-1">📋</div><h3 className="font-semibold text-sm">Surat Pengangkatan</h3><p className="text-xs text-muted-foreground mt-1">Surat pengangkatan karyawan</p></CardContent></Card></Link>
          <Link href="/dashboard/surat-phk"><Card className="hover:shadow-md transition-shadow cursor-pointer"><CardContent className="p-4"><div className="text-2xl mb-1">📄</div><h3 className="font-semibold text-sm">Surat PHK</h3><p className="text-xs text-muted-foreground mt-1">Surat pemutusan kerja</p></CardContent></Card></Link>
          <Link href="/dashboard/workspace"><Card className="hover:shadow-md transition-shadow cursor-pointer"><CardContent className="p-4"><div className="text-2xl mb-1">📁</div><h3 className="font-semibold text-sm">Workspace</h3><p className="text-xs text-muted-foreground mt-1">Kelola semua dokumen</p></CardContent></Card></Link>
        </div>

        {recentDocs.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-4">Dokumen Terbaru</h2>
            <div className="space-y-2">
              {recentDocs.map((doc) => (
                <Link key={doc.id} href={`/dashboard/document/${doc.id}`}>
                  <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{doc.title}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-medium">{doc.type}</span>
                          <span>{formatDate(doc.createdAt)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
