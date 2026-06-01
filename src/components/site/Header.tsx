import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Search, ShoppingCart } from "lucide-react";

type NavLink =
  | { to: "/"; label: string; params?: never }
  | { to: "/products"; label: string; params?: never }
  | { to: "/about"; label: string; params?: never }
  | { to: "/contact"; label: string; params?: never }
  | { to: "/products/$slug"; label: string; params: { slug: string } };

const navLinks: NavLink[] = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Shop" },
  { to: "/products/$slug", params: { slug: "fujisan-thinning-scissors" }, label: "Fujisan Scissors" },
  { to: "/products/$slug", params: { slug: "micro-slit-scissors" }, label: "Micro Slit Scissors" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const tickerMessages = [
  { text: "PRECISION CUTTING • PROFESSIONAL BARBER SHEARS • JAPANESE STEEL", color: "text-white" },
  { text: "FUJISAN THINNING SCISSORS • MICRO SLIT TECHNOLOGY • ELITE BARBERS ONLY", color: "text-gold" },
  { text: "BUILT FOR BARBERS WHO DEMAND CONTROL • SHARPER. CLEANER. FASTER.", color: "text-white" },
  { text: "KATANA EDGE • PROFESSIONAL GROOMING TOOLS • WORLDWIDE SHIPPING", color: "text-gold" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0a0a0a] border-b border-border"
          : "bg-transparent"
      }`}
    >
      {/* TOP TICKER BAR */}
      <div className="bg-[#000000] overflow-hidden py-2.5 border-b border-white/5">
        <div className="flex gap-16 animate-marquee whitespace-nowrap">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-16">
              {tickerMessages.map((msg, j) => (
                <span key={j} className={`text-xs font-bold uppercase tracking-[0.2em] ${msg.color}`}>
                  {msg.text} <span className="text-white/20 ml-16">·</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="container-luxe flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="font-display text-xl md:text-2xl tracking-tight text-white">
            Katana<span className="text-gold">·</span>Edge
          </span>
        </Link>

        {/* CENTER NAV */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              params={l.params as any}
              className="text-xs uppercase tracking-[0.18em] text-white hover:text-gold transition-colors"
              activeProps={{ className: "text-gold" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-4 md:gap-6">
          <button className="text-white hover:text-gold transition-colors" aria-label="Search">
            <Search className="size-4 md:size-5" />
          </button>
          <button className="text-white hover:text-gold transition-colors" aria-label="Cart">
            <ShoppingCart className="size-4 md:size-5" />
          </button>
          
          <Link to="/products" className="btn-gold hidden sm:inline-flex !py-2.5 !px-5 !text-[0.7rem]">
            Shop Now
          </Link>
          <button
            className="lg:hidden p-2 -mr-2 text-white"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE NAV */}
      {open && (
        <div className="lg:hidden border-t border-border bg-[#0a0a0a]">
          <nav className="container-luxe py-6 flex flex-col gap-4">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                params={l.params as any}
                onClick={() => setOpen(false)}
                className="text-sm uppercase tracking-[0.18em] text-white hover:text-gold py-2"
                activeProps={{ className: "text-gold" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
