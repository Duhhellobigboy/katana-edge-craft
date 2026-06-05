import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, ShieldCheck, Mail, MapPin, Truck, ChevronRight, Loader2, ArrowRight } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/lib/supabase";
import { getOrderDetailsBySession } from "@/lib/checkout.functions";
import { Layout } from "@/components/site/Layout";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout/success")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      session_id: typeof search.session_id === "string" ? search.session_id : "",
    };
  },
  component: SuccessPage,
});

function SuccessPage() {
  const { session_id } = Route.useSearch() as { session_id: string };
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Clear cart and fetch order details on mount
  useEffect(() => {
    // Proactively clear the cart upon reaching success page
    clearCart();

    const fetchOrderDetails = async () => {
      if (!session_id) {
        setError("Missing session ID parameter");
        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const accessToken = session?.access_token;

        if (!accessToken) {
          setError("You must be logged in to view order details");
          setLoading(false);
          return;
        }

        const response = await getOrderDetailsBySession({
          data: {
            sessionId: session_id,
            accessToken,
          },
        });

        setOrder(response);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to retrieve order confirmation details");
        toast.error("Could not load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [session_id]);

  return (
    <Layout>
      <section className="py-20 md:py-32 bg-[#050505] min-h-screen text-white">
        <div className="container-luxe max-w-4xl">
          
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="size-10 text-gold animate-spin" />
              <p className="text-sm text-muted-foreground uppercase tracking-widest">Retrieving Order Details...</p>
            </div>
          ) : error ? (
            <div className="bg-card border border-red-500/30 p-8 text-center max-w-md mx-auto space-y-4">
              <div className="size-16 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
                <ShieldCheck className="size-8" />
              </div>
              <h1 className="font-display text-2xl uppercase tracking-wider text-red-400">Order Verification Error</h1>
              <p className="text-sm text-muted-foreground leading-normal">{error}</p>
              <div className="pt-4">
                <Link to="/" className="btn-gold inline-flex">Return to Home</Link>
              </div>
            </div>
          ) : (
            <div className="space-y-10">
              
              {/* Hero Success Badge */}
              <div className="text-center space-y-4 border-b border-border/20 pb-10">
                <div className="inline-flex size-20 items-center justify-center bg-gold/10 text-gold border border-gold/40 rounded-full animate-bounce">
                  <CheckCircle2 className="size-10" />
                </div>
                <p className="eyebrow">Payment Successful</p>
                <h1 className="font-display text-4xl md:text-6xl uppercase tracking-wider mt-2">
                  Thank you for your purchase
                </h1>
                <p className="text-muted-foreground max-w-lg mx-auto text-sm">
                  Your payment has been processed. A confirmation email has been dispatched, and our master sharpeners are packing your shears.
                </p>
              </div>

              {/* Order Info & Delivery details */}
              <div className="grid md:grid-cols-5 gap-8">
                
                {/* Details Column */}
                <div className="md:col-span-3 space-y-6">
                  
                  {/* Order Items */}
                  <div className="bg-card border border-border/40 p-6 space-y-4">
                    <h3 className="font-display text-lg uppercase tracking-wide border-b border-border/20 pb-2">
                      Purchased Items
                    </h3>
                    <div className="divide-y divide-border/10">
                      {order.items.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between py-3 first:pt-0 last:pb-0 text-sm">
                          <div>
                            <span className="font-medium text-white">{item.name}</span>
                            <span className="text-muted-foreground text-xs block mt-0.5">Quantity: {item.quantity}</span>
                          </div>
                          <span className="font-display text-base text-gold">${item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-border/20 pt-4 flex justify-between items-baseline font-semibold">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">Total Paid</span>
                      <span className="font-display text-xl text-gold">${order.amountTotal}</span>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  {order.shippingAddress && (
                    <div className="bg-card border border-border/40 p-6 space-y-4">
                      <h3 className="font-display text-lg uppercase tracking-wide border-b border-border/20 pb-2 flex items-center gap-2">
                        <MapPin className="size-4 text-gold" />
                        Shipping Destination
                      </h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p className="font-semibold text-white">{order.shippingAddress.name}</p>
                        <p>{order.shippingAddress.line1}</p>
                        {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                        <p>
                          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postal_code}
                        </p>
                        <p className="uppercase tracking-wider text-xs font-semibold text-white mt-1">
                          {order.shippingAddress.country}
                        </p>
                      </div>
                    </div>
                  )}

                </div>

                {/* Tracking & Checklist Column */}
                <div className="md:col-span-2 space-y-6">
                  
                  {/* Order Status */}
                  <div className="bg-card border border-border/40 p-6 space-y-4">
                    <h3 className="font-display text-lg uppercase tracking-wide border-b border-border/20 pb-2">
                      Order Reference
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-widest block">System Order ID</span>
                        <span className="font-mono text-xs text-white select-all break-all">{order.orderId || "Pending Database Sync..."}</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-widest block">Stripe Session</span>
                        <span className="font-mono text-xs text-muted-foreground select-all break-all">{session_id}</span>
                      </div>
                      <div className="pt-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs uppercase tracking-widest bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                          <Truck className="size-3" />
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Lifetime Guarantee */}
                  <div className="bg-card border border-border/40 p-6 space-y-3">
                    <ShieldCheck className="size-6 text-gold" />
                    <h4 className="font-display text-base uppercase tracking-wide text-white">Lifetime Warranty Activated</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Every shear purchased from Katana Edge is automatically registered under our premium structural warranty and lifetime free sharpening program.
                    </p>
                  </div>

                </div>

              </div>

              {/* Browse CTA */}
              <div className="text-center pt-8 border-t border-border/20">
                <Link
                  to="/products"
                  className="btn-gold !py-3 px-8 inline-flex items-center gap-2 group font-semibold uppercase tracking-wider text-xs"
                >
                  Continue Shopping
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

            </div>
          )}

        </div>
      </section>
    </Layout>
  );
}
