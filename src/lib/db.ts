import "server-only"
import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const isProd = process.env.NODE_ENV === "production"

  const url = isProd ? (process.env.TURSO_DATABASE_URL ?? "") : "file:./dev.db"

  const adapter = new PrismaLibSql({
    url,
    authToken: isProd ? process.env.TURSO_AUTH_TOKEN : undefined,
  })

  return new PrismaClient({
    adapter,
    log: isProd ? ["error"] : ["error", "warn"],
  })
}

function getDb(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma
  const client = createPrismaClient()
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client
  return client
}

export const db = new Proxy({} as PrismaClient, {
  get(_, prop) {
    return (getDb() as Record<string | symbol, unknown>)[prop]
  },
})
