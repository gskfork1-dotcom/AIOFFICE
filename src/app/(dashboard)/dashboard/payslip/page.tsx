"use client"
import dynamic from "next/dynamic"
const PayslipClient = dynamic(() => import("./payslip-client"), { ssr: false })
export default function PayslipPage() { return <PayslipClient /> }
