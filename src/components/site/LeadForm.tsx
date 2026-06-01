import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

export function LeadForm({ variant = "inline" }: { variant?: "inline" | "footer" | "compact" }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setDone(true);
  };

  const isFooter = variant === "footer";
  const isCompact = variant === "compact";

  return (
    <section
      className={
        isFooter
          ? "relative py-24 md:py-32 border-t border-border bg-gradient-to-b from-background to-card"
          : isCompact
          ? "py-12"
          : "py-20 md:py-28"
      }
    >
      <div className="container-luxe">
        <div className="max-w-2xl mx-auto text-center">
          <p className="eyebrow">Exclusive Access</p>
          <h2 className="font-display text-3xl md:text-5xl mt-4 leading-tight">
            Join the professionals' list
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Be first to receive early-access releases, sharpening reminders, and tutorials from
            master barbers. No noise — just craft.
          </p>

          {done ? (
            <div className="mt-10 inline-flex items-center gap-3 px-6 py-4 border border-gold/40 text-gold">
              <Check className="size-4" /> You're on the list. Welcome to the craft.
            </div>
          ) : (
            <form onSubmit={submit} className="mt-10 flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <input
                type="text"
                required
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 bg-transparent border border-border focus:border-gold outline-none px-5 py-4 text-sm placeholder:text-muted-foreground transition-colors"
              />
              <input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-transparent border border-border focus:border-gold outline-none px-5 py-4 text-sm placeholder:text-muted-foreground transition-colors"
              />
              <button type="submit" className="btn-gold">
                Join <ArrowRight className="size-4" />
              </button>
            </form>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            By joining you agree to occasional emails. Unsubscribe any time.
          </p>
        </div>
      </div>
    </section>
  );
}
