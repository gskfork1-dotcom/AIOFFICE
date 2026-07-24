import { AuthForm } from "@/components/auth-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md px-4">
        <AuthForm mode="login" />
      </div>
    </div>
  )
}
