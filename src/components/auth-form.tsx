"use client"

import dynamic from "next/dynamic"
import Link from "next/link"

const ClerkSignIn = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.SignIn),
  { ssr: false, loading: () => <div className="h-96 animate-pulse bg-slate-100 rounded-lg" /> }
)

const ClerkSignUp = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.SignUp),
  { ssr: false, loading: () => <div className="h-96 animate-pulse bg-slate-100 rounded-lg" /> }
)

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <Link href="/" className="inline-flex items-center gap-1">
          <span className="text-2xl font-bold text-blue-600">AIOFFICE</span>
          <span className="text-2xl font-light">.id</span>
        </Link>
      </div>

      {mode === "login" ? (
        <ClerkSignIn
          routing="hash"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "w-full shadow-none border-0",
            },
          }}
        />
      ) : (
        <ClerkSignUp
          routing="hash"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "w-full shadow-none border-0",
            },
          }}
        />
      )}

      <p className="text-sm text-muted-foreground">
        {mode === "login" ? (
          <>
            Belum punya akun?{" "}
            <Link href="/register" className="text-blue-600 hover:underline">
              Daftar
            </Link>
          </>
        ) : (
          <>
            Sudah punya akun?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Masuk
            </Link>
          </>
        )}
      </p>
    </div>
  )
}
