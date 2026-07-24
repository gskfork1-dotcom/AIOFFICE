"use client"

import dynamic from "next/dynamic"

const ProposalClient = dynamic(() => import("./proposal-client"), { ssr: false })

export default function ProposalPage() {
  return <ProposalClient />
}
