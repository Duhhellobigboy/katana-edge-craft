import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, ShoppingCart } from "lucide-react";
import logoImg from "@/assets/logo.jpg";
import { useCart } from "@/hooks/useCart";
import { CartDrawer } from "@/components/site/CartDrawer";

type NavLink = {
  to: "/" | "/products" | "/about" | "/contact";
  label: string;
};

const navLinks: NavLink[] = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Shop" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const tickerMessages = [
  { text: "INSPIRED BY SEKI • TRUSTED WORLDWIDE • PRECISION WITHOUT COMPROMISE", color: "text-white" },
  { text: "INSPIRED BY SEKI • TRUSTED WORLDWIDE • PRECISION WITHOUT COMPROMISE", color: "text-gold" },
  { text: "INSPIRED BY SEKI • TRUSTED WORLDWIDE • PRECISION WITHOUT COMPROMISE", color: "text-white" },
  { text: "INSPIRED BY SEKI • TRUSTED WORLDWIDE • PRECISION WITHOUT COMPROMISE", color: "text-gold" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { cartCount, cartOpen, setCartOpen } = useCart();

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

      <div className="container-luxe grid grid-cols-3 items-center h-16 md:h-20">
        {/* LEFT NAV (DESKTOP) & MOBILE MENU TOGGLE */}
        <div className="flex items-center justify-start">
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                className="text-[0.68rem] uppercase tracking-[0.15em] text-white hover:text-gold transition-colors whitespace-nowrap"
                activeProps={{ className: "text-gold" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <button
            className="lg:hidden p-2 -ml-2 text-white hover:text-gold transition-colors"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {/* CENTER LOGO */}
        <div className="flex items-center justify-center">
          <Link to="/" className="flex items-center justify-center group py-2">
            <img
              src={logoImg}
              alt="Katana Edge Logo"
              className="h-10 md:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              style={{ filter: "invert(1) brightness(1.2)", mixBlendMode: "screen" }}
            />
          </Link>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center justify-end">
          <button
            type="button"
            className="text-white hover:text-gold transition-colors relative"
            aria-label="Cart"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingCart className="size-4 md:size-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-gold text-gold-foreground size-4 rounded-full text-[0.6rem] font-bold flex items-center justify-center animate-fade-in">
                {cartCount}
              </span>
            )}
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
                onClick={() => setOpen(false)}
                className="text-sm uppercase tracking-[0.18em] text-white hover:text-gold py-2"
                activeProps={{ className: "text-gold" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/products"
              onClick={() => setOpen(false)}
              className="btn-gold mt-2 text-center"
            >
              Apply Now
            </Link>
          </nav>
        </div>
      )}
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </header>
  );
}
