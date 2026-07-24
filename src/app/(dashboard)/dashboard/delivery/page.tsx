"use client"
import dynamic from "next/dynamic"
const DeliveryClient = dynamic(() => import("./delivery-client"), { ssr: false })
export default function DeliveryPage() { return <DeliveryClient /> }
