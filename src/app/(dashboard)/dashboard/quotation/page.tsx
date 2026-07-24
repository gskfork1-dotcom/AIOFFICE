"use client"

import dynamic from "next/dynamic"

const QuotationClient = dynamic(() => import("./quotation-client"), { ssr: false })

export default function QuotationPage() {
  return <QuotationClient />
}
