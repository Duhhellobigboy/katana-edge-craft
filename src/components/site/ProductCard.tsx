import { Link } from "@tanstack/react-router";
import { Star, ArrowUpRight } from "lucide-react";
import { formatProductPrice, type Product } from "@/lib/products";

export function ProductCard({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className="group luxe-card block overflow-hidden"
    >
      <div className={compact ? "product-image-wrap aspect-[3/4]" : "product-image-wrap aspect-[4/5]"}>
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
      <div className={compact ? "p-5 md:p-6" : "p-6 md:p-8"}>
        <div className={`flex items-center gap-1 ${compact ? "mb-2.5" : "mb-3"}`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="size-3.5 fill-gold text-gold" />
          ))}
          <span className="text-xs text-muted-foreground ml-2">
            {product.rating} · {product.reviewCount.toLocaleString()} reviews
          </span>
        </div>
        <h3
          className={
            compact
              ? "font-display text-xl md:text-2xl leading-tight"
              : "font-display text-2xl md:text-3xl leading-tight"
          }
        >
          {product.name}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">{product.shortDescription}</p>

        <div className={`flex items-end justify-between ${compact ? "mt-4" : "mt-5"}`}>
          <div className="flex items-baseline gap-3">
            <span className={compact ? "font-display text-xl md:text-2xl" : "font-display text-2xl"}>
              {formatProductPrice(product.price)}
            </span>
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
