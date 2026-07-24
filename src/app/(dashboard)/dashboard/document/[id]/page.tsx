"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { getDocument, deleteDocument, toggleFavorite } from "@/lib/actions/documents"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ArrowLeft, FileDown, Trash2, Loader2, Star } from "lucide-react"

type Doc = {
  id: string
  title: string
  type: string
  html: string | null
  isFavorite: boolean
  createdAt: Date
}

export default function DocumentPage() {
  const params = useParams()
  const router = useRouter()
  const previewRef = useRef<HTMLDivElement>(null)
  const [doc, setDoc] = useState<Doc | null>(null)
  const [loading, setLoading] = useState(true)
  const [exportingPdf, setExportingPdf] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const d = await getDocument(params.id as string)
        if (!d) {
          toast.error("Dokumen tidak ditemukan")
          router.push("/dashboard/workspace")
          return
        }
        setDoc(d as Doc)
      } catch {
        toast.error("Gagal memuat dokumen")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id, router])

  async function handleToggleFavorite() {
    if (!doc) return
    try {
      await toggleFavorite(doc.id)
      setDoc({ ...doc, isFavorite: !doc.isFavorite })
      toast.success(doc.isFavorite ? "Dihapus dari favorit" : "Ditambahkan ke favorit")
    } catch {
      toast.error("Gagal mengubah favorit")
    }
  }

  function handlePrint() {
    if (!doc?.html) return
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(doc.html)
      printWindow.document.close()
      printWindow.print()
    }
  }

  async function handlePdfExport() {
    if (!doc?.html) return
    setExportingPdf(true)
    try {
      const { exportHtmlToPdf } = await import("@/lib/pdf-export")
      await exportHtmlToPdf(doc.html, doc.title)
      toast.success("PDF berhasil diunduh!")
    } catch {
      toast.error("Gagal export PDF")
    } finally {
      setExportingPdf(false)
    }
  }

  async function handleDelete() {
    if (!doc || !confirm("Yakin ingin menghapus dokumen ini?")) return
    try {
      await deleteDocument(doc.id)
      toast.success("Dokumen dihapus")
      router.push("/dashboard/workspace")
    } catch {
      toast.error("Gagal menghapus dokumen")
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Memuat dokumen...</p>
      </div>
    )
  }

  if (!doc) return null

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b bg-white flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/workspace")}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Kembali
        </Button>
        <h1 className="text-lg font-semibold">{doc.title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={handleToggleFavorite}>
            <Star className={`w-4 h-4 ${doc.isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`} />
          </Button>
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
          <Button size="sm" variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-1" />
            Hapus
          </Button>
        </div>
      </div>
      <div className="flex-1 p-4">
        {doc.html ? (
          <div ref={previewRef} className="bg-white rounded-lg shadow-sm border" dangerouslySetInnerHTML={{ __html: doc.html }} />
        ) : (
          <div className="text-center py-12 text-muted-foreground">Dokumen ini tidak memiliki preview</div>
        )}
      </div>
    </div>
  )
}
