import Link from "next/link"

export const metadata = {
  title: "Authentication Accepted - VinylVault",
  description: "Your credentials have been verified successfully",
}

export default function AuthAcceptedPage() {
  return (
    <div className="min-h-screen bg-vv-bg text-vv-text flex items-center justify-center px-6">
      <div className="max-w-2xl w-full">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-vv-cyan">VinylVault</h1>
        </header>

        <main className="bg-vv-card rounded-vv border border-vv-border p-8">
          <div className="text-center space-y-6">
            {/* Success Checkmark */}
            <div className="flex justify-center">
              <svg
                className="w-24 h-24 text-green-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 52 52"
              >
                <circle
                  className="stroke-current opacity-25"
                  cx="26"
                  cy="26"
                  r="25"
                  fill="none"
                  strokeWidth="2"
                />
                <path
                  className="stroke-current"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.1 27.2l7.1 7.2 16.7-16.8"
                />
              </svg>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-vv-text mb-2">
                Authentication Accepted
              </h2>
              <p className="text-green-500 font-medium">
                Your credentials have been verified successfully!
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-vv-bg border border-green-500/30 rounded-vv p-6 text-left">
              <h3 className="text-lg font-semibold text-vv-cyan mb-3">
                What&apos;s Next?
              </h3>
              <ul className="space-y-2 text-vv-text/80">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>You now have access to VinylVault services</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Your session is secure and encrypted</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>You can proceed to use all authorized features</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/vault"
                className="bg-vv-cyan text-vv-bg font-semibold px-6 py-3 rounded-vv hover:bg-vv-cyan/90 transition-colors"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/privacy"
                className="border border-vv-border text-vv-text/80 px-6 py-3 rounded-vv hover:bg-vv-card/50 transition-colors"
              >
                View Privacy Policy
              </Link>
            </div>

            {/* Additional Info */}
            <div className="text-sm text-vv-text/60 bg-vv-bg/50 rounded-vv p-4">
              <p>
                <strong className="text-vv-text/80">Security Notice:</strong> Your
                authentication data is protected in accordance with our{" "}
                <Link
                  href="/privacy"
                  className="text-vv-cyan hover:text-vv-cyan/80 underline"
                >
                  Privacy Policy
                </Link>
                . We never share your credentials with third parties.
              </p>
            </div>
          </div>
        </main>

        <footer className="mt-8 text-center text-sm">
          <p className="text-vv-text/60 mb-4">
            © 2026 VinylVault. All rights reserved.
          </p>
          <nav className="flex gap-4 justify-center">
            <Link
              href="/privacy"
              className="text-vv-cyan hover:text-vv-cyan/80 transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-vv-text/40">|</span>
            <Link
              href="/auth-declined"
              className="text-vv-cyan hover:text-vv-cyan/80 transition-colors"
            >
              Auth Declined
            </Link>
            <span className="text-vv-text/40">|</span>
            <Link
              href="/"
              className="text-vv-cyan hover:text-vv-cyan/80 transition-colors"
            >
              Home
            </Link>
          </nav>
        </footer>
      </div>
    </div>
  )
}
