"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getTrashedDocuments, restoreDocument, permanentDeleteDocument } from "@/lib/actions/documents"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { ArrowLeft, Trash2, RotateCcw, FileText } from "lucide-react"

type TrashedDoc = {
  id: string
  title: string
  type: string
  deletedAt: Date | string
}

export default function TrashPage() {
  const router = useRouter()
  const [documents, setDocuments] = useState<TrashedDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const docs = await getTrashedDocuments()
        if (!cancelled) setDocuments(docs as TrashedDoc[])
      } catch {
        if (!cancelled) toast.error("Gagal memuat trash")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  async function handleRestore(id: string) {
    try {
      await restoreDocument(id)
      setDocuments(documents.filter((d) => d.id !== id))
      toast.success("Dokumen dipulihkan")
    } catch {
      toast.error("Gagal memulihkan dokumen")
    }
  }

  async function handlePermanentDelete(id: string) {
    if (!confirm("Yakin ingin menghapus permanen? Dokumen tidak bisa dikembalikan.")) return
    try {
      await permanentDeleteDocument(id)
      setDocuments(documents.filter((d) => d.id !== id))
      toast.success("Dokumen dihapus permanen")
    } catch {
      toast.error("Gagal menghapus dokumen")
    }
  }

  function formatDate(d: Date | string) {
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d))
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Memuat trash...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/workspace")}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Workspace
          </Button>
          <h1 className="text-2xl font-bold">Trash</h1>
          <span className="text-sm text-muted-foreground">({documents.length} dokumen)</span>
        </div>

        {documents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Trash2 className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Trash kosong</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-red-50 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{doc.title}</div>
                    <div className="text-xs text-muted-foreground">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-medium mr-2">{doc.type}</span>
                      Dihapus: {formatDate(doc.deletedAt)}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleRestore(doc.id)}>
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Pulihkan
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handlePermanentDelete(doc.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
