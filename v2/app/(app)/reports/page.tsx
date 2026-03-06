import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ReportsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Reports</h1>
        <p className="text-sm text-vv-text/60 mt-1">Build and export collection reports.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* Builder */}
        <Card className="bg-vv-panel border-vv-border p-4 h-fit">
          <div className="font-semibold">Report Builder</div>
          <div className="mt-4 space-y-3 text-sm text-vv-text/70">
            <div>Scope: <span className="text-vv-text">Whole vault</span></div>
            <div>Include photos: <span className="text-vv-text">No</span></div>
            <div>Include private notes: <span className="text-vv-text">No</span></div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button size="sm">Preview</Button>
            <Button size="sm" variant="outline" className="border-vv-border bg-vv-panel hover:bg-vv-card">Export CSV</Button>
          </div>
        </Card>

        {/* Preview */}
        <Card className="bg-vv-panel border-vv-border p-4">
          <div className="font-semibold">Preview</div>
          <div className="mt-3 text-sm text-vv-text/60">
            Configure the report on the left and click Preview to see results.
          </div>
        </Card>
      </div>
    </div>
  )
}
