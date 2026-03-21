import Link from "next/link"

export default function RootPage() {
  return (
    <div className="min-h-screen bg-vv-bg text-vv-text flex flex-col items-center justify-center p-8 text-center">
      <div className="max-w-xl space-y-6">
        <div className="text-4xl font-bold tracking-tight">VinylVault</div>
        <div className="text-vv-text/70 text-lg">
          Quiet, accurate, collector-first. Archive your vinyl the right way.
        </div>
        <div className="flex gap-4 justify-center">
          <Link
            href="/vault"
            className="bg-vv-cyan text-vv-bg font-semibold px-6 py-3 rounded-vv hover:bg-vv-cyan/90 transition-colors"
          >
            Open Vault
          </Link>
          <Link
            href="/sign-in"
            className="border border-vv-border text-vv-text/80 px-6 py-3 rounded-vv hover:bg-vv-card transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
