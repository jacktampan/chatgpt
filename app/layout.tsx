import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Trash2 } from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Memory Chat',
  description: 'Chat application with persistent memory',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

