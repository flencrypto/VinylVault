import type { Metadata, Viewport } from "next"
import "./globals.css"
import ServiceWorkerRegister from "@/components/pwa/service-worker-register"

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

export const viewport: Viewport = {
  themeColor: "#c8973f",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          src="https://unpkg.com/@elevenlabs/convai-widget-embed"
          async
          type="text/javascript"
        />
      </head>
      <body className="antialiased">
        {children}
        {/* ElevenLabs Conversational AI Widget */}
        <div
          dangerouslySetInnerHTML={{
            __html: '<elevenlabs-convai agent-id="agent_9101kgpbsbwkfazrdcnxxddsnk1c"></elevenlabs-convai>',
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('DOMContentLoaded', () => {
                const widget = document.querySelector('elevenlabs-convai');
                if (widget) {
                  widget.addEventListener('elevenlabs-convai:call', (event) => {
                    event.detail.config.clientTools = {
                      redirectToExternalURL: ({ url }) => {
                        window.open(url, '_blank', 'noopener,noreferrer');
                      },
                    };
                  });
                }
              });
            `,
          }}
        />
      </body>
    </html>
  )
}
