import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "VinylVault — Collector Archive",
  description: "Quiet, accurate, collector-first vinyl record management.",
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
