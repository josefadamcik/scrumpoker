import type { Metadata } from 'next'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import Script from 'next/script'

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
      <body>
        {children}
        <SpeedInsights />
        <Analytics />
        <Script
          src="https://storage.ko-fi.com/cdn/scripts/overlay-widget.js"
          strategy="lazyOnload"
        />
        <Script id="kofi-widget" strategy="lazyOnload">
          {`
            kofiWidgetOverlay.draw('josefadamcik', {
              'type': 'floating-chat',
              'floating-chat.donateButton.text': 'Tip Me',
              'floating-chat.donateButton.background-color': '#fcbf47',
              'floating-chat.donateButton.text-color': '#323842'
            });
          `}
        </Script>
      </body>
    </html>
  )
}
