import { Link } from "@tanstack/react-router";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, AlertTriangle } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { MAX_CHECKOUT_QUANTITY } from "@/lib/product-keys";
import { formatProductPrice } from "@/lib/products";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

type CartDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, cartTotal, cartCount } = useCart();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md bg-[#0a0a0a] border-l border-border/40 text-white flex flex-col p-0 h-full">
        {/* Header */}
        <div className="p-6 border-b border-border/40">
          <SheetHeader className="text-left">
            <SheetTitle className="text-2xl font-display uppercase tracking-wider text-white flex items-center gap-2">
              <ShoppingCart className="size-5 text-gold" />
              Your Cart ({cartCount})
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground uppercase tracking-widest">
              Premium Precision Barber Shears
            </SheetDescription>
          </SheetHeader>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="size-16 rounded-full border border-dashed border-border/40 flex items-center justify-center text-muted-foreground">
                <ShoppingCart className="size-6" />
              </div>
              <div>
                <h3 className="font-display text-lg tracking-wide">Your cart is empty</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Add some high-performance shears to get started.
                </p>
              </div>
              <Link
                to="/products"
                onClick={() => onOpenChange(false)}
                className="btn-gold mt-4 inline-flex items-center gap-2"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.variantKey}
                className="flex items-center gap-4 pb-6 border-b border-border/20 last:border-0 last:pb-0"
              >
                {/* Image */}
                <div className="size-20 bg-card border border-border/40 overflow-hidden flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-display text-base tracking-wide truncate">{item.name}</h4>
                  
                  {/* Selected options / specification labels */}
                  {(item.selectedSize || item.selectedHandle || item.selectedStyle) && (
                    <div className="flex flex-wrap gap-1.5 mt-1 text-[0.65rem] uppercase tracking-widest text-muted-foreground font-semibold">
                      {item.selectedSize && (
                        <span className="bg-[#111] border border-border/20 px-1.5 py-0.5 rounded-sm">
                          Inches: {item.selectedSize}
                        </span>
                      )}
                      {item.selectedHandle && (
                        <span className="bg-[#111] border border-border/20 px-1.5 py-0.5 rounded-sm">
                          Handle: {item.selectedHandle}
                        </span>
                      )}
                      {item.selectedStyle && (
                        <span className="bg-[#111] border border-border/20 px-1.5 py-0.5 rounded-sm">
                          Style: {item.selectedStyle}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Legacy reselect warning */}
                  {item.variantKey === "legacy_microslit" && (
                    <div className="mt-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2 flex items-start gap-1.5">
                      <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Options required</p>
                        <Link
                          to="/products/$slug"
                          params={{ slug: item.slug }}
                          onClick={() => onOpenChange(false)}
                          className="underline hover:text-amber-300 font-bold block mt-0.5"
                        >
                          Please reselect your options →
                        </Link>
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-gold mt-1.5">{formatProductPrice(item.price)}</p>

                  {/* Quantity and Actions */}
                  <div className="flex items-center justify-between mt-3">
                    {/* Qty Selector */}
                    {item.variantKey !== "legacy_microslit" ? (
                      <div className="flex items-center border border-border/40 text-xs">
                        <button
                          onClick={() => updateQuantity(item.variantKey, item.quantity - 1)}
                          className="size-7 flex items-center justify-center hover:bg-secondary/40 text-muted-foreground hover:text-white transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-8 text-center font-display text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variantKey, item.quantity + 1)}
                          disabled={item.quantity >= MAX_CHECKOUT_QUANTITY}
                          className="size-7 flex items-center justify-center hover:bg-secondary/40 text-muted-foreground hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
                          aria-label="Increase quantity"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-7" />
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => removeItem(item.variantKey)}
                      className="text-muted-foreground hover:text-red-400 transition-colors p-1"
                      aria-label="Remove item"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Summary */}
        {items.length > 0 && (
          <div className="p-6 border-t border-border/40 bg-black/40 space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-sm uppercase tracking-widest text-muted-foreground">Subtotal</span>
              <span className="font-display text-2xl text-white">
                {formatProductPrice(cartTotal)}
              </span>
            </div>
            {items.some(item => item.variantKey === "legacy_microslit") && (
              <p className="text-xs text-amber-400 font-medium leading-normal bg-amber-500/10 border border-amber-500/20 p-2">
                Note: Sizing is required for Micro Slit before you can proceed to checkout.
              </p>
            )}
            <p className="text-xs text-muted-foreground leading-normal">
              Shipping & taxes calculated at checkout. Free shipping on orders over $99.
            </p>
            <div className="pt-2">
              <Link
                to="/checkout"
                disabled={items.some(item => item.variantKey === "legacy_microslit")}
                onClick={() => onOpenChange(false)}
                className={`w-full btn-gold !py-3 flex items-center justify-center gap-2 group font-semibold ${
                  items.some(item => item.variantKey === "legacy_microslit") ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                Proceed to Checkout
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
