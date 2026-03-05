import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AddPage() {
  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Add / Scan</h1>
        <p className="text-sm text-vv-text/60 mt-1">Add records via quick form, barcode, or photos.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { title: "Quick Add", desc: "Fill in artist, title, and condition manually.", icon: "✍️" },
          { title: "Barcode", desc: "Enter a barcode to find candidate pressings.", icon: "🔍" },
          { title: "Photos", desc: "Upload label/runout photos and attach to a record.", icon: "📷" },
        ].map((t) => (
          <Card key={t.title} className="bg-vv-panel border-vv-border p-4 hover:bg-vv-card transition-colors cursor-pointer">
            <div className="text-2xl mb-2">{t.icon}</div>
            <div className="font-semibold">{t.title}</div>
            <div className="text-sm text-vv-text/65 mt-1">{t.desc}</div>
          </Card>
        ))}
      </div>

      <Card className="bg-vv-panel border-vv-border p-4">
        <div className="font-semibold">Drafts</div>
        <div className="text-sm text-vv-text/60 mt-2">No drafts yet. Start adding a record to create a draft.</div>
        <Button className="mt-3" variant="outline">
          New quick-add draft
        </Button>
      </Card>
    </div>
  )
}
