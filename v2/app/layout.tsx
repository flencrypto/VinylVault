import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "VinylVault — Collector Archive",
  description: "Quiet, accurate, collector-first vinyl record management.",
  applicationName: "VinylVault Pro",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VinylVault",
  },
  icons: {
    icon: [
      { url: "/static/favicon.ico", type: "image/x-icon" },
      { url: "/static/icon-512.svg", type: "image/svg+xml" },
    ],
    apple: "/static/icon-192.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  )
}
