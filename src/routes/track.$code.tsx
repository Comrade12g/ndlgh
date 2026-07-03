import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { PackageSearch, Clock, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/track/$code")({
  head: ({ params }) => ({
    meta: [
      { title: `Tracking ${params.code} — NDL Ghana` },
      { name: "description", content: `Live tracking for shipment ${params.code} on NDL Ghana.` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TrackPage,
});

function TrackPage() {
  const { code } = Route.useParams();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-3">
            <Logo className="h-9 w-9" />
            <div className="font-display text-lg font-extrabold text-brand-navy">
              NDL <span className="text-brand-orange">GHANA</span>
            </div>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-brand-orange/10 p-2 text-brand-orange">
            <PackageSearch className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Tracking</div>
            <div className="font-mono text-lg font-bold text-brand-navy">{code}</div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-8 text-center">
          <Clock className="mx-auto h-10 w-10 text-brand-sky" />
          <h1 className="mt-4 font-display text-xl font-bold text-brand-navy">
            Tracking not available yet
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            We couldn't find this shipment. It may not be in our system yet, the number could be
            mistyped, or the shipment hasn't been dispatched. Sign in to your portal to see all your
            packages and their live status.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/auth" search={{ mode: "signin" } as never}>
              <Button className="bg-brand-orange hover:bg-brand-orange/90">
                Sign in to portal
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline">Try another code</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
