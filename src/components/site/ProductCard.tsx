import { Link } from "@tanstack/react-router";
import { Star, ArrowUpRight } from "lucide-react";
import type { Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className="group luxe-card block overflow-hidden"
    >
      <div className="product-image-wrap aspect-[4/5]">
        <img
          src={product.image}
          alt={`${product.name} — ${product.tagline}`}
          width={1024}
          height={1024}
          loading="lazy"
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.compareAt && (
            <span className="text-[0.65rem] uppercase tracking-[0.18em] bg-gold text-gold-foreground px-2 py-1">
              Save ${product.compareAt - product.price}
            </span>
          )}
        </div>
      </div>
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="size-3.5 fill-gold text-gold" />
          ))}
          <span className="text-xs text-muted-foreground ml-2">
            {product.rating} · {product.reviewCount.toLocaleString()} reviews
          </span>
        </div>
        <h3 className="font-display text-2xl md:text-3xl leading-tight">{product.name}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{product.tagline}</p>

        <div className="mt-5 flex items-end justify-between">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-2xl">${product.price}</span>
            {product.compareAt && (
              <span className="text-sm text-muted-foreground line-through">${product.compareAt}</span>
            )}
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-gold opacity-0 group-hover:opacity-100 transition-opacity">
            View <ArrowUpRight className="size-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
