"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[Auth Error]", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-md w-full px-4 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold mb-2">Gagal Memuat Halaman Login</h1>
        <p className="text-muted-foreground mb-6">
          {error.message || "Terjadi kesalahan saat memuat layanan autentikasi."}
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground mb-4">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="outline">
            Coba Lagi
          </Button>
          <Button onClick={() => (window.location.href = "/")}>
            Ke Beranda
          </Button>
        </div>
      </div>
    </div>
  )
}
