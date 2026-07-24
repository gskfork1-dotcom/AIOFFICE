"use client"

import dynamic from "next/dynamic"

const InvoiceClient = dynamic(() => import("./invoice-client"), { ssr: false })

export default function InvoicePage() {
  return <InvoiceClient />
}
