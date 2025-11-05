import type { Metadata } from 'next'
import { SpeedInsights } from "@vercel/speed-insights/next"

import './globals.css'

export const metadata: Metadata = {
  title: 'Scrum Poker',
  description: 'Simple planning poker app for agile teams',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}
      <SpeedInsights />
      </body>
    </html>
  )
}
