import Link from "next/link"

export const metadata = {
  title: "Authentication Declined - VinylVault",
  description: "Unable to verify your credentials",
}

export default function AuthDeclinedPage() {
  return (
    <div className="min-h-screen bg-vv-bg text-vv-text flex items-center justify-center px-6">
      <div className="max-w-2xl w-full">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-vv-cyan">VinylVault</h1>
        </header>

        <main className="bg-vv-card rounded-vv border border-vv-border p-8">
          <div className="text-center space-y-6">
            {/* Error X Icon */}
            <div className="flex justify-center">
              <svg
                className="w-24 h-24 text-red-500"
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
                  d="M16 16 36 36 M36 16 16 36"
                />
              </svg>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-vv-text mb-2">
                Authentication Declined
              </h2>
              <p className="text-red-500 font-medium">
                We were unable to verify your credentials.
              </p>
            </div>

            {/* Error Info Box */}
            <div className="bg-vv-bg border border-red-500/30 rounded-vv p-6 text-left">
              <h3 className="text-lg font-semibold text-vv-cyan mb-3">
                Possible Reasons
              </h3>
              <ul className="space-y-2 text-vv-text/80">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">✗</span>
                  <span>Invalid username or password</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">✗</span>
                  <span>Account has been suspended or deactivated</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">✗</span>
                  <span>Access permissions have changed</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">✗</span>
                  <span>Session has expired</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/sign-in"
                className="bg-vv-cyan text-vv-bg font-semibold px-6 py-3 rounded-vv hover:bg-vv-cyan/90 transition-colors"
              >
                Try Again
              </Link>
              <Link
                href="/sign-in?action=reset"
                className="border border-vv-border text-vv-text/80 px-6 py-3 rounded-vv hover:bg-vv-card/50 transition-colors"
              >
                Reset Password
              </Link>
              <Link
                href="/settings"
                className="border border-vv-border text-vv-text/80 px-6 py-3 rounded-vv hover:bg-vv-card/50 transition-colors"
              >
                Contact Support
              </Link>
            </div>

            {/* Additional Help Info */}
            <div className="text-left space-y-4 bg-vv-bg/50 rounded-vv p-6">
              <h3 className="text-lg font-semibold text-vv-cyan">Need Help?</h3>
              <p className="text-sm text-vv-text/80">
                If you continue to experience authentication issues, please:
              </p>
              <ul className="space-y-2 text-sm text-vv-text/80 list-disc list-inside ml-4">
                <li>Verify that your account is active</li>
                <li>Check that you&apos;re using the correct credentials</li>
                <li>Clear your browser cache and cookies</li>
                <li>Contact our support team for assistance</li>
              </ul>
              <p className="text-sm text-vv-text/60 pt-4 border-t border-vv-border">
                <strong className="text-vv-text/80">Privacy Note:</strong> All
                authentication attempts are logged for security purposes in
                accordance with our{" "}
                <Link
                  href="/privacy"
                  className="text-vv-cyan hover:text-vv-cyan/80 underline"
                >
                  Privacy Policy
                </Link>
                .
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
              href="/auth-accepted"
              className="text-vv-cyan hover:text-vv-cyan/80 transition-colors"
            >
              Auth Accepted
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
