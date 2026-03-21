export const metadata = {
  title: "Offline — VinylVault",
}

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-vv-bg px-6 text-center">
      <h1 className="text-3xl font-bold text-vv-text">You&apos;re offline</h1>
      <p className="mt-4 max-w-md text-vv-text/70">
        VinylVault needs an internet connection to load this page. Check your
        connection and try again.
      </p>
    </div>
  )
}
