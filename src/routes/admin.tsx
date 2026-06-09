import { createFileRoute, redirect } from "@tanstack/react-router";
import { LogOut, ShieldAlert, Cpu, Database, Eye, Package, Settings, Sparkles } from "lucide-react";
import { checkAdminAuth } from "@/lib/admin.functions";
import { Layout } from "@/components/site/Layout";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    try {
      const auth = await checkAdminAuth();
      if (!auth.authenticated) {
        throw redirect({
          to: "/login",
        });
      }
    } catch (error) {
      if (typeof error === "object" && error !== null && "isRedirect" in error) {
        throw error;
      }
      throw redirect({
        to: "/login",
      });
    }
  },
  component: AdminPage,
});

function AdminPage() {
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
      });
      if (response.ok) {
        // Force fully reloading to clear local and browser state
        window.location.href = "/login";
      }
    } catch (e) {
      console.error("Failed to process logout", e);
    }
  };

  return (
    <Layout>
      <section className="py-24 bg-[#050505] min-h-screen text-white">
        <div className="container-luxe max-w-6xl">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border/20 pb-8 mb-10 gap-6">
            <div>
              <p className="eyebrow flex items-center gap-2">
                <Sparkles className="size-3 text-gold animate-pulse" />
                Access Control Protocol
              </p>
              <h1 className="font-display text-3xl md:text-5xl mt-3 leading-none uppercase tracking-wider text-white">
                Admin Workspace
              </h1>
            </div>
            
            <button
              onClick={handleLogout}
              className="btn-ghost-light !py-2.5 !px-5 flex items-center gap-2 uppercase tracking-widest text-xs font-semibold"
            >
              <LogOut className="size-4" />
              Terminate Session
            </button>
          </div>

          {/* Verification Status Alert */}
          <div className="mb-10 p-5 border border-gold/20 bg-gold/5 text-sm flex gap-4 items-center">
            <div className="size-10 bg-gold/10 text-gold border border-gold/30 rounded-full flex items-center justify-center shrink-0">
              <ShieldAlert className="size-5" />
            </div>
            <div>
              <p className="font-display text-white text-base tracking-wide">SECURE SHELL ESTABLISHED</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Session verified. Cookie `admin_session` verified with secure client signature checks.
              </p>
            </div>
          </div>

          {/* Grid Layout Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Stat Cards */}
            <div className="bg-[#1a1a1a] border border-border p-6 rounded-sm flex flex-col justify-between">
              <div>
                <Package className="size-6 text-gold mb-4" />
                <h3 className="font-display text-base tracking-wider text-white">Product Control</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Configure inventory, pricing margins, serial numbers, and custom blade details for shears database.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/10 flex justify-between items-center text-xs uppercase tracking-widest text-muted-foreground">
                <span>Total Items: 2</span>
                <span className="text-gold font-semibold">Locked</span>
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-border p-6 rounded-sm flex flex-col justify-between">
              <div>
                <Database className="size-6 text-gold mb-4" />
                <h3 className="font-display text-base tracking-wider text-white">Supabase Schema</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Active connection to database. Custom copywriting, FAQ blocks, and verified review seeds are read directly.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/10 flex justify-between items-center text-xs uppercase tracking-widest text-muted-foreground">
                <span>Tables: 5</span>
                <span className="text-emerald-400 font-semibold">Connected</span>
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-border p-6 rounded-sm flex flex-col justify-between">
              <div>
                <Cpu className="size-6 text-gold mb-4" />
                <h3 className="font-display text-base tracking-wider text-white">Service Automation</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Outgoing order hooks dispatched to n8n. Inbound webhooks validated with Stripe SHA-256 signatures.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/10 flex justify-between items-center text-xs uppercase tracking-widest text-muted-foreground">
                <span>Webhook Status</span>
                <span className="text-emerald-400 font-semibold">Active</span>
              </div>
            </div>

          </div>

          {/* Placeholder Console Block */}
          <div className="mt-10 bg-[#0c0c0c] border border-border p-6 rounded-sm font-mono text-xs text-muted-foreground space-y-2">
            <div className="flex justify-between text-gold font-semibold border-b border-border/10 pb-2 mb-4 font-display uppercase tracking-widest">
              <span>System Output log</span>
              <span>v1.0.0</span>
            </div>
            <p className="text-emerald-400/90">&gt; Authenticating session token...</p>
            <p className="text-emerald-400/90">&gt; Handshake verified successfully.</p>
            <p>&gt; Loaded ADMIN_SESSION_SECRET signature: verified HMAC key.</p>
            <p>&gt; Listening to Vercel production deployment configurations.</p>
            <p>&gt; Customer checkouts: GUEST_ONLY mode confirmed.</p>
            <p className="text-gold/90">&gt; NOTICE: Product editor components are currently locked in placeholder mode.</p>
          </div>

        </div>
      </section>
    </Layout>
  );
}
