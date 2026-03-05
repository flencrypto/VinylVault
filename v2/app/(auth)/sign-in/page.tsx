import Link from "next/link"

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-vv-bg text-vv-text flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="text-2xl font-bold">VinylVault</div>
          <div className="text-sm text-vv-text/60 mt-1">Sign in to your collector archive</div>
        </div>

        <div className="bg-vv-panel border border-vv-border rounded-vv p-6 space-y-4">
          <div className="text-sm text-vv-text/70">Sign-in form placeholder.</div>
          <Link
            href="/vault"
            className="block w-full text-center bg-vv-cyan text-vv-bg font-medium py-2 rounded-vv hover:bg-vv-cyan/90 transition-colors"
          >
            Continue to Vault →
          </Link>
        </div>
      </div>
    </div>
  )
}
