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
      className="group luxe-card flex flex-col h-full overflow-hidden w-full"
    >
      <div className="product-image-wrap aspect-square flex items-center justify-center p-[10%] relative shrink-0">
        <img
          src={product.image}
          alt={`${product.name} — ${product.tagline}`}
          width={1024}
          height={1024}
          loading="lazy"
          className="w-full h-full object-contain object-center"
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {product.bestSeller && (
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.18em] bg-gold text-black px-2 py-1 shadow-sm">
              Best Seller
            </span>
          )}
          {product.active !== false && !product.bestSeller && (
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.18em] bg-gold text-black px-2 py-1 shadow-sm">
              Available
            </span>
          )}
          {product.active === false && (
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.18em] bg-[#1a1a1a] text-gold border border-gold/30 px-2 py-1 shadow-sm">
              Coming Soon
            </span>
          )}
          {product.compareAt && (
            <span className="text-[0.65rem] uppercase tracking-[0.18em] bg-gold text-gold-foreground px-2 py-1">
              Save ${product.compareAt - product.price}
            </span>
          )}
        </div>
      </div>
      <div className={`flex-1 flex flex-col justify-between ${compact ? "p-5 md:p-6" : "p-6 md:p-8"}`}>
        <div>
          {/* Reviews Rating Row */}
          <div className="h-5 flex items-center mb-3">
            {product.reviewCount !== undefined && product.reviewCount > 0 ? (
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-3.5 fill-gold text-gold" />
                ))}
                <span className="text-xs text-muted-foreground ml-2">
                  {product.rating} · {product.reviewCount.toLocaleString()} reviews
                </span>
              </div>
            ) : null}
          </div>

          {/* Title Row - Fixed Height to Align Descriptions */}
          <div className={`overflow-hidden ${compact ? "h-14 md:h-16" : "h-16 md:h-20"}`}>
            <h3
              className={`${
                compact
                  ? "font-display text-xl md:text-2xl"
                  : "font-display text-2xl md:text-3xl"
              } leading-tight line-clamp-2`}
            >
              {product.name}
            </h3>
          </div>

          {/* Description Row - Fixed Height to Align Footer */}
          <div className="mt-2 overflow-hidden h-12 md:h-16">
            <p className="text-sm text-muted-foreground line-clamp-3 leading-normal">
              {product.shortDescription}
            </p>
          </div>
        </div>

        {/* Footer Row (Price and CTA) */}
        <div className={`flex items-end justify-between border-t border-border/20 pt-4 ${compact ? "mt-4" : "mt-5"}`}>
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
