"use client"
import dynamic from "next/dynamic"
const LetterClient = dynamic(() => import("./letter-client"), { ssr: false })
export default function LetterPage() { return <LetterClient /> }
