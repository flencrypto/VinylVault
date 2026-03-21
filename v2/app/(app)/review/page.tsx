import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const issues = [
  {
    id: "saw",
    artist: "Aphex Twin",
    title: "Selected Ambient Works 85–92",
    issue: "Variant unresolved",
    type: "variant" as const,
  },
]

export default function ReviewPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Needs Review</h1>
        <p className="text-sm text-vv-text/60 mt-1">
          {issues.length} item{issues.length === 1 ? "" : "s"} need your attention.
        </p>
      </div>

      <div className="space-y-3">
        {issues.map((item) => (
          <Card key={item.id} className="bg-vv-panel border-vv-border p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium truncate">{item.artist} — {item.title}</div>
                <div className="mt-1">
                  <Badge variant="destructive" className="text-xs">{item.issue}</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" asChild>
                  <Link href={`/record/${item.id}`}>Fix now</Link>
                </Button>
                <Button size="sm" variant="outline" className="border-vv-border bg-vv-panel hover:bg-vv-card">
                  Snooze
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
