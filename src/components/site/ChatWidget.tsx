import { useState } from "react";
import { MessageCircle, X, Phone, Send } from "lucide-react";

export function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 size-14 rounded-full bg-gold text-gold-foreground shadow-luxe hover:shadow-gold transition-all hover:scale-105 flex items-center justify-center"
        aria-label="Open chat"
        style={{ boxShadow: "var(--shadow-luxe)" }}
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[340px] max-w-[calc(100vw-2rem)] bg-card border border-border rounded-md shadow-luxe overflow-hidden animate-fade-up">
          <div className="bg-gradient-to-br from-card to-background p-5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center">
                <MessageCircle className="size-5 text-gold" />
              </div>
              <div>
                <p className="font-display text-lg leading-tight">Katana Concierge</p>
                <p className="text-xs text-muted-foreground">Typically replies in minutes</p>
              </div>
            </div>
          </div>
          <div className="p-5 space-y-3 max-h-72 overflow-y-auto">
            <div className="bg-secondary px-4 py-3 rounded-md text-sm text-foreground">
              Welcome to Katana Edge. How can we help you today?
            </div>
            <div className="bg-secondary px-4 py-3 rounded-md text-sm text-foreground">
              Ask about the Fujisan, Micro Slit, sharpening program, or shipping.
            </div>
          </div>
          <div className="p-3 border-t border-border flex gap-2">
            <input
              placeholder="Type your message…"
              className="flex-1 bg-transparent border border-border px-3 py-2 text-sm outline-none focus:border-gold transition"
            />
            <button className="size-9 flex items-center justify-center bg-gold text-gold-foreground rounded-sm">
              <Send className="size-4" />
            </button>
          </div>
          <a
            href="tel:+13163682814"
            className="block text-center px-4 py-3 text-xs uppercase tracking-[0.18em] text-gold border-t border-border hover:bg-secondary transition"
          >
            <Phone className="size-3.5 inline mr-2" />
            Call +1 (316) 368-2814
          </a>
        </div>
      )}
    </>
  );
}
