import { Link } from "@tanstack/react-router";
import { Phone, Mail, Instagram } from "lucide-react";

import { useEffect, useState } from "react";
import { fetchSiteContent } from "@/lib/content";

export function Footer() {
  const [email, setEmail] = useState("hello@katanaedge.com");
  const [phone, setPhone] = useState("+1 (316) 368-2814");

  useEffect(() => {
    fetchSiteContent().then((content) => {
      if (content["contact.support.email"]) {
        setEmail(content["contact.support.email"]);
      }
      if (content["contact.support.phone"]) {
        setPhone(content["contact.support.phone"]);
      }
    }).catch((err) => {
      console.error("Failed to load footer site content", err);
    });
  }, []);

  const phoneLink = phone.replace(/[^\d+]/g, "");

  return (
    <footer className="mt-32 border-t border-border bg-card">
      <div className="container-luxe py-20 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="font-display text-2xl">
            Katana<span className="text-gold">·</span>Edge
          </Link>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs">
            Inspired by Japanese craftsmanship. Trusted by professionals worldwide. Premium shears engineered for exceptional performance.
          </p>
        </div>

        <div>
          <h4 className="eyebrow mb-4">Shop</h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li><Link to="/products/$slug" params={{ slug: "fujisan-thinning-shears" }} className="hover:text-gold transition">Fujisan</Link></li>
            <li><Link to="/products/$slug" params={{ slug: "micro-slit-shears" }} className="hover:text-gold transition">Micro Slit</Link></li>
            <li><Link to="/products" className="hover:text-gold transition">All Scissors</Link></li>
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
              <a href={`tel:${phoneLink}`} className="hover:text-gold transition inline-flex items-center gap-2">
                <Phone className="size-3.5" /> {phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${email}`} className="hover:text-gold transition inline-flex items-center gap-2">
                <Mail className="size-3.5" /> {email}
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
          <p className="tracking-[0.18em] uppercase text-[10px] text-muted-foreground/85">Crafted With Precision · Inspired By Tradition</p>
        </div>
      </div>
    </footer>
  );
}
