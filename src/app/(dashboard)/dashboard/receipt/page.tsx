"use client"
import dynamic from "next/dynamic"
const ReceiptClient = dynamic(() => import("./receipt-client"), { ssr: false })
export default function ReceiptPage() { return <ReceiptClient /> }
