import "server-only"
import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const isProd = process.env.NODE_ENV === "production"

  const adapter = new PrismaLibSql({
    url: isProd ? process.env.TURSO_DATABASE_URL! : "file:./dev.db",
    authToken: isProd ? process.env.TURSO_AUTH_TOKEN : undefined,
  })

  return new PrismaClient({
    adapter,
    log: isProd ? ["error"] : ["error", "warn"],
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
