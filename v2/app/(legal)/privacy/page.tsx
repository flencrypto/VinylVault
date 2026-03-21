import Link from "next/link"

export const metadata = {
  title: "Privacy Policy - VinylVault",
  description: "VinylVault Privacy Policy and data protection information",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-vv-bg text-vv-text">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <header className="text-center pb-8 border-b-2 border-vv-cyan/30 mb-8">
          <h1 className="text-4xl font-bold text-vv-cyan mb-2">
            VinylVault Privacy Policy
          </h1>
          <p className="text-vv-text/60 italic">
            Last Updated: February 5, 2026
          </p>
        </header>

        <main className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-vv-cyan mb-4">
              Introduction
            </h2>
            <p className="text-vv-text/80 leading-relaxed">
              Welcome to VinylVault. We respect your privacy and are committed to
              protecting your personal data. This privacy policy will inform you
              about how we look after your personal data when you visit our website
              and tell you about your privacy rights and how the law protects you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-vv-cyan mb-4">
              Information We Collect
            </h2>
            <p className="text-vv-text/80 leading-relaxed mb-3">
              We may collect, use, store and transfer different kinds of personal
              data about you which we have grouped together as follows:
            </p>
            <ul className="space-y-2 text-vv-text/80 list-disc list-inside ml-4">
              <li>
                <strong className="text-vv-text">Identity Data:</strong> includes
                first name, last name, username or similar identifier.
              </li>
              <li>
                <strong className="text-vv-text">Contact Data:</strong> includes
                email address and telephone numbers.
              </li>
              <li>
                <strong className="text-vv-text">Technical Data:</strong> includes
                internet protocol (IP) address, browser type and version, time zone
                setting and location, browser plug-in types and versions, operating
                system and platform.
              </li>
              <li>
                <strong className="text-vv-text">Usage Data:</strong> includes
                information about how you use our website and services.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-vv-cyan mb-4">
              How We Use Your Information
            </h2>
            <p className="text-vv-text/80 leading-relaxed mb-3">
              We will only use your personal data when the law allows us to. Most
              commonly, we will use your personal data in the following
              circumstances:
            </p>
            <ul className="space-y-2 text-vv-text/80 list-disc list-inside ml-4">
              <li>To register you as a new user</li>
              <li>To manage our relationship with you</li>
              <li>To improve our website, products/services</li>
              <li>To deliver relevant content and advertisements to you</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-vv-cyan mb-4">
              Authentication and Authorization
            </h2>
            <p className="text-vv-text/80 leading-relaxed mb-3">
              When you attempt to access VinylVault, we use authentication
              mechanisms to verify your identity. Your authentication status will
              determine your level of access:
            </p>
            <ul className="space-y-2 text-vv-text/80 list-disc list-inside ml-4">
              <li>
                <strong className="text-vv-text">Authentication Accepted:</strong>{" "}
                You will be granted access to our services and features based on
                your authorization level.
              </li>
              <li>
                <strong className="text-vv-text">Authentication Declined:</strong>{" "}
                Access will be restricted, and you will be directed to an
                appropriate information page.
              </li>
            </ul>
            <p className="text-vv-text/80 leading-relaxed mt-3">
              We take reasonable measures to protect your authentication credentials
              and personal information during this process.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-vv-cyan mb-4">
              Data Security
            </h2>
            <p className="text-vv-text/80 leading-relaxed">
              We have put in place appropriate security measures to prevent your
              personal data from being accidentally lost, used or accessed in an
              unauthorized way, altered or disclosed. In addition, we limit access
              to your personal data to those employees, agents, contractors and
              other third parties who have a business need to know.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-vv-cyan mb-4">
              Data Retention
            </h2>
            <p className="text-vv-text/80 leading-relaxed">
              We will only retain your personal data for as long as necessary to
              fulfill the purposes we collected it for, including for the purposes
              of satisfying any legal, accounting, or reporting requirements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-vv-cyan mb-4">
              Your Legal Rights
            </h2>
            <p className="text-vv-text/80 leading-relaxed mb-3">
              Under certain circumstances, you have rights under data protection
              laws in relation to your personal data, including the right to:
            </p>
            <ul className="space-y-2 text-vv-text/80 list-disc list-inside ml-4">
              <li>Request access to your personal data</li>
              <li>Request correction of your personal data</li>
              <li>Request erasure of your personal data</li>
              <li>Object to processing of your personal data</li>
              <li>Request restriction of processing your personal data</li>
              <li>Request transfer of your personal data</li>
              <li>Right to withdraw consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-vv-cyan mb-4">
              Third-Party Links
            </h2>
            <p className="text-vv-text/80 leading-relaxed">
              This website may include links to third-party websites, plug-ins and
              applications. Clicking on those links or enabling those connections
              may allow third parties to collect or share data about you. We do not
              control these third-party websites and are not responsible for their
              privacy statements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-vv-cyan mb-4">
              Contact Us
            </h2>
            <p className="text-vv-text/80 leading-relaxed mb-2">
              If you have any questions about this privacy policy or our privacy
              practices, please contact us at:
            </p>
            <p className="text-vv-text/80">Email: privacy@vinylvault.com</p>
          </section>
        </main>

        <footer className="mt-12 pt-8 border-t border-vv-border text-center">
          <p className="text-vv-text/60 mb-4">
            © 2026 VinylVault. All rights reserved.
          </p>
          <nav className="flex gap-4 justify-center text-sm">
            <Link
              href="/auth-accepted"
              className="text-vv-cyan hover:text-vv-cyan/80 transition-colors"
            >
              Authentication Accepted
            </Link>
            <span className="text-vv-text/40">|</span>
            <Link
              href="/auth-declined"
              className="text-vv-cyan hover:text-vv-cyan/80 transition-colors"
            >
              Authentication Declined
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
