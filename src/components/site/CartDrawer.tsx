import { Link } from "@tanstack/react-router";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { useCart } from "@/hooks/useCart";
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
              <button
                onClick={() => onOpenChange(false)}
                className="btn-gold mt-4 inline-flex items-center gap-2"
              >
                Browse Products
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.slug}
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
                  <p className="text-sm text-gold mt-0.5">${item.price}</p>

                  {/* Quantity and Actions */}
                  <div className="flex items-center justify-between mt-3">
                    {/* Qty Selector */}
                    <div className="flex items-center border border-border/40 text-xs">
                      <button
                        onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                        className="size-7 flex items-center justify-center hover:bg-secondary/40 text-muted-foreground hover:text-white transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-8 text-center font-display text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                        className="size-7 flex items-center justify-center hover:bg-secondary/40 text-muted-foreground hover:text-white transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => removeItem(item.slug)}
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
              <span className="font-display text-2xl text-white">${cartTotal}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-normal">
              Shipping & taxes calculated at checkout. Free shipping on orders over $99.
            </p>
            <div className="pt-2">
              <Link
                to="/checkout"
                onClick={() => onOpenChange(false)}
                className="w-full btn-gold !py-3 flex items-center justify-center gap-2 group font-semibold"
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
