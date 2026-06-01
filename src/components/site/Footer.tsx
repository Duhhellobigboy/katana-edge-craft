import { Link } from "@tanstack/react-router";
import { Phone, Mail, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-border bg-card">
      <div className="container-luxe py-20 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="font-display text-2xl">
            Katana<span className="text-gold">·</span>Edge
          </Link>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs">
            Precision crafted. Professionally trusted. Premium barber and stylist shears engineered for the working professional.
          </p>
        </div>

        <div>
          <h4 className="eyebrow mb-4">Shop</h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li><Link to="/products/$slug" params={{ slug: "fujisan-thinning-scissors" }} className="hover:text-gold transition">Fujisan Thinning Scissors</Link></li>
            <li><Link to="/products/$slug" params={{ slug: "micro-slit-scissors" }} className="hover:text-gold transition">Micro Slit Scissors</Link></li>
            <li><Link to="/shop" className="hover:text-gold transition">All Scissors</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="eyebrow mb-4">Company</h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-gold transition">About</Link></li>
            <li><Link to="/why-katana-edge" className="hover:text-gold transition">Why Professionals Choose Us</Link></li>
            <li><Link to="/reviews" className="hover:text-gold transition">Reviews</Link></li>
            <li><Link to="/faq" className="hover:text-gold transition">FAQ</Link></li>
            <li><Link to="/contact" className="hover:text-gold transition">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="eyebrow mb-4">Contact</h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li>
              <a href="tel:+13163682814" className="hover:text-gold transition inline-flex items-center gap-2">
                <Phone className="size-3.5" /> +1 (316) 368-2814
              </a>
            </li>
            <li>
              <a href="mailto:hello@katanaedge.com" className="hover:text-gold transition inline-flex items-center gap-2">
                <Mail className="size-3.5" /> hello@katanaedge.com
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gold transition inline-flex items-center gap-2">
                <Instagram className="size-3.5" /> @katanaedge
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-luxe py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Katana Edge. All rights reserved.</p>
          <p className="tracking-[0.18em] uppercase">Precision Crafted · Professionally Trusted</p>
        </div>
      </div>
    </footer>
  );
}
