import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function ValuationPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Valuation</h1>
        <p className="text-sm text-vv-text/60 mt-1">Collection insights — not flip tools.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-vv-panel border-vv-border p-4 sm:col-span-2 lg:col-span-2">
          <div className="font-semibold">Collection range</div>
          <div className="mt-2 text-3xl font-bold text-vv-text">—</div>
          <div className="text-sm text-vv-text/60 mt-1">
            Connect Discogs comps data to compute a range.
          </div>
        </Card>

        <Card className="bg-vv-panel border-vv-border p-4">
          <div className="font-semibold">Confidence</div>
          <div className="mt-2 text-sm text-vv-text/70 space-y-1">
            <div>High: <span className="text-vv-text">0 records</span></div>
            <div>Medium: <span className="text-vv-text">0 records</span></div>
            <div>Low: <span className="text-vv-text">4 records</span></div>
          </div>
        </Card>
      </div>

      <Card className="bg-vv-panel border-vv-border p-4">
        <div className="font-semibold">What would improve your data quality</div>
        <ul className="mt-3 space-y-2 text-sm text-vv-text/70 list-disc pl-5">
          <li>Add matrix / runout text for pressing ID</li>
          <li>Confirm label variation and catalogue number</li>
          <li>Add front + label photos for 3 records</li>
          <li>
            <Link href="/review" className="text-vv-cyan hover:underline">
              Resolve 1 open review issue
            </Link>
          </li>
        </ul>
      </Card>
    </div>
  )
}
