import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function VaultPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Vault</h1>
        <p className="text-sm text-vv-text/60 mt-1">Your collection at a glance.</p>
      </div>

      {/* Row 1: Totals */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Records", value: "4" },
          { label: "Artists", value: "4" },
          { label: "Labels", value: "2" },
          { label: "Needs Review", value: "1", href: "/review", accent: true },
        ].map((stat) => (
          <Card
            key={stat.label}
            className={`bg-vv-panel border-vv-border p-4 ${stat.href ? "cursor-pointer hover:bg-vv-card transition-colors" : ""}`}
          >
            {stat.href ? (
              <Link href={stat.href} className="block">
                <div className={`text-2xl font-bold ${stat.accent ? "text-vv-warning" : ""}`}>{stat.value}</div>
                <div className="text-sm text-vv-text/60 mt-1">{stat.label}</div>
              </Link>
            ) : (
              <>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-vv-text/60 mt-1">{stat.label}</div>
              </>
            )}
          </Card>
        ))}
      </div>

      {/* Row 2: Recent + Review preview */}
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card className="bg-vv-panel border-vv-border p-4">
          <div className="font-semibold mb-3">Recently Added</div>
          <div className="space-y-2 text-sm text-vv-text/80">
            {[
              { artist: "Radiohead", title: "OK Computer", id: "okc" },
              { artist: "Aphex Twin", title: "Selected Ambient Works 85–92", id: "saw" },
              { artist: "Joni Mitchell", title: "Blue", id: "blue" },
              { artist: "Miles Davis", title: "Kind of Blue", id: "kind" },
            ].map((r) => (
              <Link
                key={r.id}
                href={`/record/${r.id}`}
                className="flex items-center gap-2 py-1.5 hover:text-vv-cyan transition-colors"
              >
                <span className="font-medium">{r.artist}</span>
                <span className="text-vv-text/50">—</span>
                <span>{r.title}</span>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="bg-vv-panel border-vv-border p-4">
          <div className="font-semibold mb-3">Needs Review</div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between py-1.5 border-b border-vv-divider">
              <span className="text-vv-text/80">Aphex Twin — SAW 85–92</span>
              <span className="text-xs text-vv-warning bg-vv-warning/10 px-2 py-0.5 rounded-full">Variant</span>
            </div>
            <div className="mt-3">
              <Link href="/review" className="text-xs text-vv-cyan hover:underline">
                View all →
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Row 3: Value snapshot */}
      <Card className="bg-vv-panel border-vv-border p-4">
        <div className="font-semibold mb-3">Value Snapshot</div>
        <div className="text-sm text-vv-text/70">
          Estimated collection range: <span className="text-vv-text font-medium">—</span>
          <span className="ml-3 text-vv-text/50 text-xs">(connect Discogs comps to populate)</span>
        </div>
        <div className="mt-2">
          <Link href="/valuation" className="text-xs text-vv-cyan hover:underline">
            Full valuation →
          </Link>
        </div>
      </Card>
    </div>
  )
}
