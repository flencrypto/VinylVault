import Link from "next/link"

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-vv-bg text-vv-text flex items-center justify-center p-4">
      <div className="max-w-md text-center space-y-6">
        <div className="text-2xl font-semibold">Welcome to VinylVault</div>
        <div className="text-sm text-vv-text/70">
          Let&apos;s get your archive set up. This takes about 2 minutes.
        </div>
        <Link
          href="/vault"
          className="inline-block bg-vv-cyan text-vv-bg font-medium px-6 py-3 rounded-vv hover:bg-vv-cyan/90 transition-colors"
        >
          Get started →
        </Link>
      </div>
    </div>
  )
}
