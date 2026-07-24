"use client"

import dynamic from "next/dynamic"

const ContractClient = dynamic(() => import("./contract-client"), { ssr: false })

export default function ContractPage() {
  return <ContractClient />
}
