import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AlertTriangle,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
  ShoppingBag,
  User as UserIcon,
} from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { useCart } from "@/hooks/useCart";
import { getGuestCheckoutSessionId } from "@/lib/guest-session";
import {
  cartItemsToCheckoutLineItems,
  urlParamsToCheckoutLineItems,
} from "@/lib/cart-checkout";
import type { CheckoutLineItem } from "@/lib/product-keys";
import { CHECKOUT_CONFIG_CLIENT_MESSAGE } from "@/lib/checkout-messages";

const checkoutFormSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z.string().trim().min(7, "Phone number is required."),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export const Route = createFileRoute("/checkout")({
  validateSearch: (search: Record<string, unknown>) => ({
    cancelled:
      search.cancelled === "true" || search.cancelled === true ? true : undefined,
    product:
      search.product === "microslit" || search.product === "fujisan"
        ? search.product
        : undefined,
    quantity:
      typeof search.quantity === "string"
        ? parseInt(search.quantity, 10)
        : typeof search.quantity === "number"
          ? search.quantity
          : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Checkout | Katana Edge" },
      {
        name: "description",
        content: "Complete your Katana Edge order and continue to secure Stripe checkout.",
      },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { cancelled, product, quantity } = Route.useSearch() as {
    cancelled?: boolean;
    product?: "microslit" | "fujisan";
    quantity?: number;
  };
  const { items: cartItems } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [guestSessionId, setGuestSessionId] = useState("");
  const [restoring, setRestoring] = useState(true);

  const orderItems = useMemo<CheckoutLineItem[]>(() => {
    const fromCart = cartItemsToCheckoutLineItems(cartItems);
    if (fromCart.length > 0) return fromCart;
    return urlParamsToCheckoutLineItems(product, quantity);
  }, [cartItems, product, quantity]);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
    },
  });

  useEffect(() => {
    const sessionId = getGuestCheckoutSessionId();
    setGuestSessionId(sessionId);

    const restoreSession = async () => {
      try {
        const response = await fetch(
          `/api/checkout-session?checkoutSessionId=${encodeURIComponent(sessionId)}`
        );
        const data = await response.json();

        if (response.ok && data.session) {
          if (data.session.fullName) form.setValue("fullName", data.session.fullName);
          if (data.session.email) form.setValue("email", data.session.email);
          if (data.session.phone) form.setValue("phone", data.session.phone);
        }
      } catch (err) {
        console.error("Failed to restore checkout session:", err);
      } finally {
        setRestoring(false);
      }
    };

    restoreSession();
  }, [form]);

  const onSubmit = async (values: CheckoutFormValues) => {
    if (orderItems.length === 0) {
      setSubmitError("Your cart is empty. Add shears from the shop first.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const checkoutSessionId = guestSessionId || getGuestCheckoutSessionId();

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkoutSessionId,
          items: orderItems.map((item) => ({
            productKey: item.productKey,
            quantity: item.quantity,
          })),
          ...values,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || CHECKOUT_CONFIG_CLIENT_MESSAGE,
        );
      }

      if (!data.url) {
        throw new Error("Checkout URL was not returned.");
      }

      window.location.href = data.url;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : CHECKOUT_CONFIG_CLIENT_MESSAGE;
      setSubmitError(message);
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <section className="py-16 md:py-24 bg-[#050505] min-h-screen text-white">
        <div className="container-luxe max-w-3xl">
          <div className="text-center mb-10">
            <p className="eyebrow">Katana Edge</p>
            <h1 className="font-display text-4xl md:text-5xl uppercase tracking-wide mt-3">
              Secure Checkout
            </h1>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Review your order, enter your details, and continue to Stripe-hosted
              payment. Card details are never collected on this site.
            </p>
          </div>

          {cancelled && (
            <div className="mb-8 flex items-start gap-3 border border-amber-500/40 bg-amber-500/10 p-4 text-amber-200">
              <AlertTriangle className="size-5 shrink-0 mt-0.5" />
              <p className="text-sm">
                Payment was cancelled. You can try again below.
              </p>
            </div>
          )}

          {submitError && (
            <div className="mb-8 flex items-start gap-3 border border-red-500/40 bg-red-500/10 p-4 text-red-200">
              <AlertTriangle className="size-5 shrink-0 mt-0.5" />
              <p className="text-sm">{submitError}</p>
            </div>
          )}

          {restoring ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <Loader2 className="size-8 text-gold animate-spin" />
              <p className="text-sm text-muted-foreground uppercase tracking-widest">
                Loading your session…
              </p>
            </div>
          ) : orderItems.length === 0 ? (
            <div className="bg-card border border-border/40 p-10 text-center space-y-4">
              <ShoppingBag className="size-10 text-gold mx-auto" />
              <h2 className="font-display text-2xl uppercase tracking-wide">
                No items to checkout
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Add shears to your cart from the shop, then return here to complete
                payment. You can order up to 20 pieces per product.
              </p>
              <Link to="/products" className="btn-gold inline-flex mt-2">
                Browse Shop
              </Link>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="bg-card border border-border/40 p-6 md:p-8">
                <h2 className="font-display text-2xl uppercase tracking-wide border-b border-border/20 pb-4 mb-6">
                  1. Your Order
                </h2>

                <div className="divide-y divide-border/20">
                  {orderItems.map((item) => (
                    <div
                      key={item.productKey}
                      className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <div>
                        <h3 className="font-display text-lg uppercase tracking-wide">
                          {item.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <span className="font-display text-xl text-gold shrink-0">
                        {item.priceDisplay}
                        {item.quantity > 1 && (
                          <span className="block text-xs text-muted-foreground text-right mt-0.5">
                            × {item.quantity}
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border/20">
                  Final total is calculated on Stripe using your selected quantities
                  (max 20 per product).
                </p>
              </div>

              <div className="bg-card border border-border/40 p-6 md:p-8">
                <h2 className="font-display text-2xl uppercase tracking-wide border-b border-border/20 pb-4 mb-6">
                  2. Your Details
                </h2>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input
                        type="text"
                        {...form.register("fullName")}
                        placeholder="John Doe"
                        className="w-full bg-background border border-border/40 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>
                    {form.formState.errors.fullName && (
                      <p className="text-sm text-red-400">
                        {form.formState.errors.fullName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input
                        type="email"
                        {...form.register("email")}
                        placeholder="john@email.com"
                        className="w-full bg-background border border-border/40 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-400">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                      Phone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input
                        type="tel"
                        {...form.register("phone")}
                        placeholder="+1 604 555 1234"
                        className="w-full bg-background border border-border/40 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>
                    {form.formState.errors.phone && (
                      <p className="text-sm text-red-400">
                        {form.formState.errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground bg-black/30 border border-border/30 p-3 flex gap-2">
                <ShieldCheck className="size-4 text-gold shrink-0 mt-0.5" />
                <span>
                  Secured with SSL encryption. Payment is processed on Stripe — we never
                  see or store your card details.
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-gold !py-4 font-semibold flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin text-black" />
                    Redirecting to Stripe…
                  </>
                ) : (
                  "Continue to Payment"
                )}
              </button>
            </form>
          )}
        </div>
      </section>
    </Layout>
  );
}
