import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FloraChain Enterprise - Blockchain Fresh Flower Supply Chain',
  description: 'A blockchain-powered, rule-based, optimized, auditable fresh-cut flower supply chain operating system. No AI/ML - Pure blockchain, MILP optimization, and mathematical formulas.',
  keywords: ['blockchain', 'supply chain', 'flowers', 'MILP', 'optimization', 'traceability', 'cold chain'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌸</text></svg>" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
