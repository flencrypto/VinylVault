import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const integrations = [
  {
    name: "Discogs",
    desc: "Import your Discogs collection, sync wantlist, and fetch comp data.",
    connected: false,
  },
  {
    name: "eBay",
    desc: "Pull sold listings for valuation comps.",
    connected: false,
  },
  {
    name: "PriceCharting",
    desc: "Additional price reference data.",
    connected: false,
  },
]

export default function IntegrationsPage() {
  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Integrations</h1>
        <p className="text-sm text-vv-text/60 mt-1">Connect external services to enrich your Vault.</p>
      </div>

      <div className="space-y-3">
        {integrations.map((int) => (
          <Card key={int.name} className="bg-vv-panel border-vv-border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">{int.name}</div>
                <div className="text-sm text-vv-text/65 mt-1">{int.desc}</div>
              </div>
              <Button size="sm" variant="outline" className="border-vv-border bg-vv-panel hover:bg-vv-card shrink-0">
                {int.connected ? "Disconnect" : "Connect"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
