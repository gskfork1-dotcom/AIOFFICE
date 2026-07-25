import "server-only"
import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const isProd = process.env.NODE_ENV === "production"

  const url = isProd ? process.env.TURSO_DATABASE_URL : "file:./dev.db"
  if (!url) {
    throw new Error(
      "Missing database URL. Set TURSO_DATABASE_URL in your environment variables."
    )
  }

  const adapter = new PrismaLibSql({
    url,
    authToken: isProd ? process.env.TURSO_AUTH_TOKEN : undefined,
  })

  return new PrismaClient({
    adapter,
    log: isProd ? ["error"] : ["error", "warn"],
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
