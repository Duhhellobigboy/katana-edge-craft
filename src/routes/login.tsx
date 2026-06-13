import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { KeyRound, AlertCircle, Loader2 } from "lucide-react";
import { checkAdminAuth } from "@/lib/admin.functions";
import { Layout } from "@/components/site/Layout";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    try {
      const auth = await checkAdminAuth();
      if (auth.authenticated) {
        throw redirect({
          to: "/admin",
        });
      }
    } catch (error) {
      // If redirect was thrown, re-throw it. Otherwise, continue.
      if (typeof error === "object" && error !== null && "isRedirect" in error) {
        throw error;
      }
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Redirect to protected admin area by reloading state
        window.location.href = "/admin";
      } else {
        setError(data.error || "Incorrect password. Please try again.");
      }
    } catch (err) {
      setError("A network error occurred. Please check configuration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="min-h-screen bg-[#050505] flex items-center justify-center py-20 px-4">
        <div className="w-full max-w-md luxe-card p-8 bg-[#1a1a1a] border border-[#242424] relative shadow-luxe">
          {/* Subtle top gold gradient border */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />
          
          <div className="text-center mb-8">
            <div className="inline-flex size-14 items-center justify-center rounded-full bg-gold/10 text-gold border border-gold/20 mb-4">
              <KeyRound className="size-6" />
            </div>
            <p className="eyebrow text-xs">Security Portal</p>
            <h1 className="font-display text-3xl uppercase tracking-wider text-white mt-2">
              Admin Login
            </h1>
            <p className="text-xs text-muted-foreground mt-2 max-w-xs mx-auto leading-normal">
              Authentication gateway for client management & copywriting adjustments.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 border border-red-500/20 bg-red-500/5 text-red-400 text-sm flex gap-3 items-center animate-fade-in rounded-sm">
              <AlertCircle className="size-5 shrink-0 text-red-500" />
              <p className="font-medium text-xs leading-normal">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[0.65rem] uppercase tracking-widest text-muted-foreground font-semibold">
                Client Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0a0a0a] border border-border py-3 px-4 text-sm text-white focus:outline-none focus:border-gold transition-colors focus:ring-1 focus:ring-gold rounded-sm placeholder:text-muted-foreground/30"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gold !py-3.5 mt-2 flex items-center justify-center font-bold text-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                "Access Control"
              )}
            </button>
          </form>
        </div>
      </section>
    </Layout>
  );
}
