import type { Metadata } from 'next'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import { BotIdClient } from 'botid/client'

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
      <head>
        <BotIdClient
          protect={[
            { path: '/api/session', method: 'POST' },
            { path: '/api/session/*/join', method: 'POST' },
            { path: '/api/session/*/vote', method: 'POST' },
            { path: '/api/session/*/reveal', method: 'POST' },
            { path: '/api/session/*/reset', method: 'POST' },
          ]}
        />
      </head>
      <body>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
