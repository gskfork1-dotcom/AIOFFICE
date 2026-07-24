"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { getDocuments, deleteDocument, toggleFavorite, getFolders, createFolder, deleteFolder } from "@/lib/actions/documents"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Trash2, FileText, Folder, ArrowLeft, FolderPlus, Star, Search, Trash } from "lucide-react"

type Doc = {
  id: string
  title: string
  type: string
  createdAt: Date
  isFavorite: boolean
  folderId: string | null
  folder: { name: string } | null
}

type FolderItem = {
  id: string
  name: string
  _count: { documents: number }
}

export default function WorkspacePage() {
  const router = useRouter()
  const [documents, setDocuments] = useState<Doc[]>([])
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [newFolderName, setNewFolderName] = useState("")
  const [loading, setLoading] = useState(true)
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [docs, fols, allDocs] = await Promise.all([
          getDocuments(selectedFolder),
          getFolders(),
          selectedFolder !== null ? getDocuments(null) : null,
        ])
        if (!cancelled) {
          setDocuments(docs as Doc[])
          setFolders(fols as FolderItem[])
          setTotalCount(allDocs ? (allDocs as Doc[]).length : (docs as Doc[]).length)
        }
      } catch {
        if (!cancelled) toast.error("Gagal memuat data")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [selectedFolder])

  const filteredDocs = useMemo(() => {
    if (!searchQuery.trim()) return documents
    const q = searchQuery.toLowerCase()
    return documents.filter((d) => d.title.toLowerCase().includes(q) || d.type.toLowerCase().includes(q))
  }, [documents, searchQuery])

  async function handleDeleteDoc(id: string) {
    if (!confirm("Yakin ingin menghapus dokumen ini?")) return
    try {
      await deleteDocument(id)
      setDocuments(documents.filter((d) => d.id !== id))
      setTotalCount((prev) => prev - 1)
      toast.success("Dokumen dipindahkan ke trash")
    } catch {
      toast.error("Gagal menghapus dokumen")
    }
  }

  async function handleToggleFavorite(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    try {
      const result = await toggleFavorite(id)
      setDocuments(documents.map((d) => d.id === id ? { ...d, isFavorite: result.isFavorite } : d))
    } catch {
      toast.error("Gagal update favorit")
    }
  }

  async function handleCreateFolder() {
    if (!newFolderName.trim()) return
    try {
      const folder = await createFolder(newFolderName)
      setFolders([{ id: folder.id, name: folder.name, _count: { documents: 0 } }, ...folders])
      setNewFolderName("")
      setShowNewFolder(false)
      toast.success("Folder dibuat")
    } catch {
      toast.error("Gagal membuat folder")
    }
  }

  async function handleDeleteFolder(id: string) {
    if (!confirm("Yakin ingin menghapus folder ini?")) return
    try {
      await deleteFolder(id)
      setFolders(folders.filter((f) => f.id !== id))
      toast.success("Folder dihapus")
    } catch {
      toast.error("Gagal menghapus folder")
    }
  }

  function viewDocument(id: string) {
    router.push(`/dashboard/document/${id}`)
  }

  function formatDate(d: Date | string) {
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d))
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Memuat workspace...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Workspace</h1>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <div className="col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Folder</CardTitle>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowNewFolder(!showNewFolder)}>
                    <FolderPlus className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                {showNewFolder && (
                  <div className="flex gap-1 mb-2">
                    <Input value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="Nama folder" className="h-8 text-xs" onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()} autoFocus />
                    <Button size="sm" className="h-8 px-2" onClick={handleCreateFolder}>OK</Button>
                  </div>
                )}
                <button
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-slate-100 text-left font-medium ${selectedFolder === null ? "bg-slate-100" : ""}`}
                  onClick={() => setSelectedFolder(null)}
                >
                  <FileText className="w-4 h-4" />
                  Semua Dokumen
                  <span className="ml-auto text-xs text-muted-foreground">{totalCount}</span>
                </button>
                <button
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-slate-100 text-left font-medium"
                  onClick={() => router.push("/dashboard/trash")}
                >
                  <Trash className="w-4 h-4 text-muted-foreground" />
                  Trash
                </button>
                {folders.map((folder) => (
                  <div key={folder.id} className={`group flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-slate-100 cursor-pointer ${selectedFolder === folder.id ? "bg-slate-100" : ""}`} onClick={() => setSelectedFolder(folder.id)}>
                    <Folder className="w-4 h-4 text-amber-500" />
                    <span className="flex-1 truncate">{folder.name}</span>
                    <span className="text-xs text-muted-foreground">{folder._count.documents}</span>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id) }} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {selectedFolder === null ? "Semua Dokumen" : folders.find(f => f.id === selectedFolder)?.name ?? "Dokumen"}
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/invoice")}>+ Invoice</Button>
                <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/quotation")}>+ Quotation</Button>
              </div>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari dokumen..."
                className="pl-9"
              />
            </div>

            {filteredDocs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">{searchQuery ? "Tidak ada dokumen yang cocok" : "Belum ada dokumen"}</p>
                  {!searchQuery && <p className="text-sm text-muted-foreground mt-1">Buat dokumen pertama Anda</p>}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {filteredDocs.map((doc) => (
                  <Card key={doc.id} className="hover:shadow-sm transition-shadow cursor-pointer" onClick={() => viewDocument(doc.id)}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{doc.title}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-medium">{doc.type}</span>
                          {doc.folder && <span>{doc.folder.name}</span>}
                          <span>{formatDate(doc.createdAt)}</span>
                        </div>
                      </div>
                      <button
                        className="shrink-0 text-muted-foreground hover:text-amber-500"
                        onClick={(e) => handleToggleFavorite(doc.id, e)}
                      >
                        <Star className={`w-4 h-4 ${doc.isFavorite ? "fill-amber-400 text-amber-400" : ""}`} />
                      </button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={(e) => { e.stopPropagation(); handleDeleteDoc(doc.id) }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
