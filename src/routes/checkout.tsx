import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { ShoppingBag, ArrowRight, ShieldCheck, Mail, Lock, User as UserIcon, LogOut, Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/hooks/useCart";
import { Layout } from "@/components/site/Layout";
import { createStripeCheckoutSession } from "@/lib/checkout.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      cancelled: search.cancelled === "true" || search.cancelled === true ? true : undefined,
    };
  },
  component: CheckoutPage,
});

function CheckoutPage() {
  const { cancelled } = Route.useSearch() as { cancelled?: boolean };
  const { items, cartTotal, cartCount } = useCart();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Fetch current session on mount and monitor updates
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;
        
        if (data.session) {
          toast.success("Account created successfully!");
        } else {
          toast.success("Registration successful! Please check your email for confirmation.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        toast.success("Welcome back!");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setCheckoutLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      if (!accessToken) {
        toast.error("Please login to proceed with the payment.");
        setCheckoutLoading(false);
        return;
      }

      const response = await createStripeCheckoutSession({
        data: {
          cartItems: items.map((item) => ({
            slug: item.slug,
            quantity: item.quantity,
          })),
          accessToken,
        },
      });

      if (response && response.url) {
        window.location.href = response.url;
      } else {
        throw new Error("Unable to retrieve payment gateway URL");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create checkout session");
      setCheckoutLoading(false);
    }
  };

  return (
    <Layout>
      <section className="py-20 md:py-32 bg-[#050505] min-h-screen text-white">
        <div className="container-luxe max-w-6xl">
          
          {/* Header */}
          <div className="border-b border-border/20 pb-8 mb-10">
            <p className="eyebrow">Checkout Process</p>
            <h1 className="font-display text-4xl md:text-6xl mt-4 leading-none uppercase tracking-wide">
              Secure Checkout
            </h1>
          </div>

          {/* Cancellation Alert */}
          {cancelled && (
            <div className="mb-8 p-4 border border-yellow-500/40 bg-yellow-500/10 text-yellow-200 text-sm flex gap-3 items-center">
              <AlertTriangle className="size-5 shrink-0 text-yellow-500" />
              <div>
                <p className="font-medium">Payment Cancelled</p>
                <p className="text-xs text-yellow-300/80 mt-0.5">
                  The payment session was aborted. No charges were made, and your cart contents are saved.
                </p>
              </div>
            </div>
          )}

          {authLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="size-8 text-gold animate-spin" />
              <p className="text-sm text-muted-foreground uppercase tracking-widest">Checking Account Status...</p>
            </div>
          ) : !user ? (
            /* Authentication Section */
            <div className="grid md:grid-cols-2 gap-12 items-start max-w-4xl mx-auto">
              
              {/* Info Column */}
              <div className="space-y-6">
                <h2 className="font-display text-3xl uppercase tracking-wide text-gold">Create an Account to Checkout</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use Supabase Auth to securely register your customer profile. This ensures you can access your order history, lifetime sharpening guarantees, and shipment tracking info at any time.
                </p>
                
                <div className="space-y-4 border border-border/20 bg-card p-6">
                  <div className="flex gap-3">
                    <ShieldCheck className="size-5 text-gold shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold">Secure Encryption</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        All passwords and credentials are fully encrypted. Card details are routed securely via Stripe.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4 border-t border-border/20">
                    <ShoppingBag className="size-5 text-gold shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold">Easy Order Management</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Track shipments and access premium support records directly inside your dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Column */}
              <div className="bg-card border border-border/40 p-8">
                <div className="flex gap-4 border-b border-border/20 pb-4 mb-6">
                  <button
                    onClick={() => setIsSignUp(false)}
                    className={`font-display text-lg uppercase tracking-wider pb-2 border-b-2 transition-colors ${
                      !isSignUp ? "border-gold text-gold" : "border-transparent text-muted-foreground hover:text-white"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setIsSignUp(true)}
                    className={`font-display text-lg uppercase tracking-wider pb-2 border-b-2 transition-colors ${
                      isSignUp ? "border-gold text-gold" : "border-transparent text-muted-foreground hover:text-white"
                    }`}
                  >
                    Register
                  </button>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                  {isSignUp && (
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Full Name</label>
                      <div className="relative">
                        <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="John Doe"
                          className="w-full bg-background border border-border/40 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-gold transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="barber@example.com"
                        className="w-full bg-background border border-border/40 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-background border border-border/40 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full btn-gold !py-3 font-semibold mt-4 flex items-center justify-center gap-2"
                  >
                    {formLoading ? (
                      <Loader2 className="size-4 animate-spin text-black" />
                    ) : isSignUp ? (
                      "Create Account"
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </form>
              </div>

            </div>
          ) : (
            /* Logged In Checkout View */
            <div className="grid lg:grid-cols-3 gap-10 items-start">
              
              {/* Order Summary & Items list */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-card border border-border/40 p-6">
                  <h2 className="font-display text-2xl uppercase tracking-wide border-b border-border/20 pb-4 mb-4">
                    1. Order Review
                  </h2>
                  
                  {items.length === 0 ? (
                    <div className="py-10 text-center">
                      <p className="text-muted-foreground mb-4">Your cart is empty.</p>
                      <Link to="/products" className="btn-gold inline-flex">Go to Shop</Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/20">
                      {items.map((item) => (
                        <div key={item.slug} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                          <img src={item.image} alt={item.name} className="size-16 object-cover border border-border/40" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-display text-lg truncate">{item.name}</h3>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">Qty: {item.quantity}</p>
                          </div>
                          <span className="font-display text-lg text-gold">${item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-card border border-border/40 p-6">
                  <h2 className="font-display text-2xl uppercase tracking-wide border-b border-border/20 pb-4 mb-4">
                    2. Shipment Information
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Stripe Checkout will securely collect your physical shipping address and tax info during the payment step. We currently ship worldwide from our warehouse.
                  </p>
                </div>
              </div>

              {/* Checkout CTA Column */}
              <div className="space-y-6">
                <div className="bg-card border border-border/40 p-6">
                  <h2 className="font-display text-2xl uppercase tracking-wide border-b border-border/20 pb-4 mb-4">
                    Summary
                  </h2>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Items Total ({cartCount})</span>
                      <span>${cartTotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-emerald-400 uppercase tracking-widest text-xs font-semibold">FREE</span>
                    </div>
                    <div className="flex justify-between border-t border-border/20 pt-3 text-base font-semibold">
                      <span>Total Amount</span>
                      <span className="text-gold text-lg font-display">${cartTotal}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border/20 space-y-4">
                    <div className="text-xs text-muted-foreground bg-black/30 p-3 flex gap-2">
                      <ShieldCheck className="size-4 text-gold shrink-0 mt-0.5" />
                      <span>Secured with SSL 256-bit encryption. Card details are processed on Stripe.</span>
                    </div>

                    <button
                      onClick={handleCheckout}
                      disabled={checkoutLoading || items.length === 0}
                      className="w-full btn-gold !py-3 flex items-center justify-center gap-2 group font-semibold uppercase tracking-wider text-xs"
                    >
                      {checkoutLoading ? (
                        <>
                          <Loader2 className="size-4 animate-spin text-black" />
                          Redirecting to Payment...
                        </>
                      ) : (
                        <>
                          Proceed to Payment
                          <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Profile Overview */}
                <div className="bg-card border border-border/40 p-6 flex flex-col justify-between items-start">
                  <div className="w-full">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">Logged In As</p>
                    <p className="text-sm font-semibold truncate mt-1">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="mt-4 text-xs text-red-400 hover:text-red-300 flex items-center gap-2 transition-colors uppercase tracking-widest font-semibold"
                  >
                    <LogOut className="size-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </section>
    </Layout>
  );
}
