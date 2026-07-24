import { clerkMiddleware } from "@clerk/nextjs/server"

const publicPaths = ["/", "/login", "/register"]

function isPublicRoute(pathname: string): boolean {
  return publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))
}

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl
  if (pathname.startsWith("/api") || isPublicRoute(pathname)) {
    return
  }
  await auth.protect()
})

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
}
