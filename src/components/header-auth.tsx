"use client"

import Link from "next/link"
import { useAuth } from "@clerk/nextjs"
import { SignInButton, UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"

export function HeaderAuth() {
  const { isSignedIn } = useAuth()

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost">Dashboard</Button>
        </Link>
        <UserButton />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <SignInButton mode="modal">
        <Button variant="ghost">Masuk</Button>
      </SignInButton>
      <SignInButton mode="modal">
        <Button>Daftar Gratis</Button>
      </SignInButton>
    </div>
  )
}
