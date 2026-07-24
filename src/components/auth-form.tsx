"use client"

import { SignIn, SignUp } from "@clerk/nextjs"
import Link from "next/link"

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
        <SignIn
          routing="hash"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "w-full shadow-none border-0",
            },
          }}
        />
      ) : (
        <SignUp
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
