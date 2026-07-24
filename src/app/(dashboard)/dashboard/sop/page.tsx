"use client"

import dynamic from "next/dynamic"

const SOPClient = dynamic(() => import("./sop-client"), { ssr: false })

export default function SOPPage() {
  return <SOPClient />
}
