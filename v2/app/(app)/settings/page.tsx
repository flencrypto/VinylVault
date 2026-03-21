import { Card } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-vv-text/60 mt-1">Preferences and account settings.</p>
      </div>

      {[
        { title: "Profile", desc: "Display name, email, avatar." },
        { title: "Grading defaults", desc: "Conservative grading, default condition tier." },
        { title: "Privacy", desc: "Control what's visible on public profiles." },
        { title: "Notifications", desc: "Email and push preferences." },
        { title: "Data export", desc: "Export your full vault as JSON or CSV." },
      ].map((s) => (
        <Card key={s.title} className="bg-vv-panel border-vv-border p-4 hover:bg-vv-card transition-colors cursor-pointer">
          <div className="font-medium">{s.title}</div>
          <div className="text-sm text-vv-text/60 mt-1">{s.desc}</div>
        </Card>
      ))}
    </div>
  )
}
