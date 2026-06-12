import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { 
  LogOut, ShieldAlert, Sparkles, LayoutDashboard, Package, HelpCircle, 
  MessageSquare, FileText, Plus, Trash2, Save, Loader2, ArrowUpRight 
} from "lucide-react";
import { checkAdminAuth } from "@/lib/admin.functions";
import { fetchSiteContent, fetchFaqs, fetchTestimonials } from "@/lib/content";
import { products as fallbackProducts } from "@/lib/products";
import { supabase } from "@/lib/supabase";
import { Layout } from "@/components/site/Layout";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    try {
      const auth = await checkAdminAuth();
      if (!auth.authenticated) {
        throw redirect({
          to: "/login",
        });
      }
    } catch (error) {
      if (typeof error === "object" && error !== null && "isRedirect" in error) {
        throw error;
      }
      throw redirect({
        to: "/login",
      });
    }
  },
  loader: async () => {
    const siteContent = await fetchSiteContent();
    const faqs = await fetchFaqs();
    const testimonials = await fetchTestimonials();
    
    // Fetch current product states from Supabase (public read)
    const { data: dbProducts } = await supabase
      .from("products")
      .select("*")
      .in("slug", ["fujisan-thinning-shears", "micro-slit-shears"]);

    return {
      siteContent,
      faqs,
      testimonials,
      dbProducts: dbProducts || [],
    };
  },
  component: AdminPage,
});

function AdminPage() {
  const { siteContent, dbProducts } = Route.useLoaderData();
  const [activeTab, setActiveTab] = useState<"general" | "products">("general");
  const [saving, setSaving] = useState(false);

  // --- GENERAL SITE COPY STATE ---
  const [heroTitle, setHeroTitle] = useState(siteContent["home.hero.title"] || "");
  const [heroSubtitle, setHeroSubtitle] = useState(siteContent["home.hero.subtitle"] || "");
  const [heroCta, setHeroCta] = useState(siteContent["home.hero.cta"] || "");
  const [aboutStatement, setAboutStatement] = useState(siteContent["about.brand.statement"] || "");
  const [supportEmail, setSupportEmail] = useState(siteContent["contact.support.email"] || "");
  const [seoTitle, setSeoTitle] = useState(siteContent["seo.title"] || "");
  const [seoDescription, setSeoDescription] = useState(siteContent["seo.description"] || "");

  // --- PRODUCTS COPY STATE ---
  const fujisanFallback = fallbackProducts.find(p => p.slug === "fujisan-thinning-shears")!;
  const fujisanDb = dbProducts.find(p => p.slug === "fujisan-thinning-shears");

  const microslitFallback = fallbackProducts.find(p => p.slug === "micro-slit-shears")!;
  const microslitDb = dbProducts.find(p => p.slug === "micro-slit-shears");

  // Selected product state
  const [selectedProduct, setSelectedProduct] = useState<"fujisan" | "microslit">("fujisan");

  // Product copywriting states initialized safely
  const [prodNameFujisan, setProdNameFujisan] = useState(fujisanDb?.name || fujisanFallback.name);
  const [prodTaglineFujisan, setProdTaglineFujisan] = useState(fujisanDb?.tagline || fujisanFallback.tagline);
  const [prodShortFujisan, setProdShortFujisan] = useState(fujisanDb?.short_description || fujisanFallback.shortDescription);
  const [prodLongFujisan, setProdLongFujisan] = useState(fujisanDb?.long_description || fujisanFallback.longDescription);
  const [prodImageFujisan, setProdImageFujisan] = useState(fujisanDb?.image_url || fujisanFallback.image);
  const [prodFeaturesFujisan, setProdFeaturesFujisan] = useState<any[]>(
    fujisanDb?.features || fujisanFallback.features || []
  );
  const [prodBenefitsFujisan, setProdBenefitsFujisan] = useState<any[]>(
    fujisanDb?.benefits || fujisanFallback.benefits || []
  );
  const [prodSpecsFujisan, setProdSpecsFujisan] = useState<any[]>(
    fujisanDb?.specs || fujisanFallback.specs || []
  );
  const [prodFaqFujisan, setProdFaqFujisan] = useState<any[]>(
    fujisanDb?.faq || fujisanFallback.faq || []
  );

  const [prodNameMicroslit, setProdNameMicroslit] = useState(microslitDb?.name || microslitFallback.name);
  const [prodTaglineMicroslit, setProdTaglineMicroslit] = useState(microslitDb?.tagline || microslitFallback.tagline);
  const [prodShortMicroslit, setProdShortMicroslit] = useState(microslitDb?.short_description || microslitFallback.shortDescription);
  const [prodLongMicroslit, setProdLongMicroslit] = useState(microslitDb?.long_description || microslitFallback.longDescription);
  const [prodImageMicroslit, setProdImageMicroslit] = useState(microslitDb?.image_url || microslitFallback.image);
  const [prodFeaturesMicroslit, setProdFeaturesMicroslit] = useState<any[]>(
    microslitDb?.features || microslitFallback.features || []
  );
  const [prodBenefitsMicroslit, setProdBenefitsMicroslit] = useState<any[]>(
    microslitDb?.benefits || microslitFallback.benefits || []
  );
  const [prodSpecsMicroslit, setProdSpecsMicroslit] = useState<any[]>(
    microslitDb?.specs || microslitFallback.specs || []
  );
  const [prodFaqMicroslit, setProdFaqMicroslit] = useState<any[]>(
    microslitDb?.faq || microslitFallback.faq || []
  );

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/admin/logout", { method: "POST" });
      if (response.ok) {
        window.location.href = "/login";
      }
    } catch {
      toast.error("Logout failed");
    }
  };

  // --- SAVE GENERAL SITE COPY ---
  const saveGeneralContent = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates: [
            { key: "home.hero.title", value: heroTitle },
            { key: "home.hero.subtitle", value: heroSubtitle },
            { key: "home.hero.cta", value: heroCta },
            { key: "about.brand.statement", value: aboutStatement },
            { key: "contact.support.email", value: supportEmail },
            { key: "seo.title", value: seoTitle },
            { key: "seo.description", value: seoDescription },
          ],
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success("Homepage & brand copywriting saved successfully!");
      } else {
        toast.error(data.error || "Failed to save general copy details.");
      }
    } catch {
      toast.error("A network error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // --- SAVE PRODUCT COPY ---
  const saveProductContent = async (key: "fujisan" | "microslit") => {
    setSaving(true);
    const slug = key === "fujisan" ? "fujisan-thinning-shears" : "micro-slit-shears";
    const payload = key === "fujisan" 
      ? {
          slug,
          name: prodNameFujisan,
          tagline: prodTaglineFujisan,
          shortDescription: prodShortFujisan,
          longDescription: prodLongFujisan,
          image: prodImageFujisan,
          features: prodFeaturesFujisan,
          benefits: prodBenefitsFujisan,
          specs: prodSpecsFujisan,
          faq: prodFaqFujisan,
        }
      : {
          slug,
          name: prodNameMicroslit,
          tagline: prodTaglineMicroslit,
          shortDescription: prodShortMicroslit,
          longDescription: prodLongMicroslit,
          image: prodImageMicroslit,
          features: prodFeaturesMicroslit,
          benefits: prodBenefitsMicroslit,
          specs: prodSpecsMicroslit,
          faq: prodFaqMicroslit,
        };

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success(`Product copy for ${payload.name} saved successfully!`);
      } else {
        toast.error(data.error || "Failed to update product copy.");
      }
    } catch {
      toast.error("A network error occurred. Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <section className="py-24 bg-[#050505] min-h-screen text-white">
        <div className="container-luxe max-w-6xl">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border/20 pb-8 mb-10 gap-6">
            <div>
              <p className="eyebrow flex items-center gap-2">
                <Sparkles className="size-3 text-gold animate-pulse" />
                Live Content Manager
              </p>
              <h1 className="font-display text-3xl md:text-5xl mt-3 leading-none uppercase tracking-wider text-white">
                Website Editor
              </h1>
            </div>
            
            <button
              onClick={handleLogout}
              className="btn-ghost-light !py-2.5 !px-5 flex items-center gap-2 uppercase tracking-widest text-xs font-semibold"
            >
              <LogOut className="size-4" />
              Sign Out
            </button>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar navigation */}
            <div className="space-y-2 lg:col-span-1">
              <button
                onClick={() => setActiveTab("general")}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-xs font-semibold uppercase tracking-wider transition-colors rounded-sm text-left ${
                  activeTab === "general" ? "bg-gold text-black" : "bg-[#1a1a1a] text-muted-foreground hover:bg-[#242424] hover:text-white"
                }`}
              >
                <LayoutDashboard className="size-4 shrink-0" />
                Homepage & Brand
              </button>
              <button
                onClick={() => setActiveTab("products")}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-xs font-semibold uppercase tracking-wider transition-colors rounded-sm text-left ${
                  activeTab === "products" ? "bg-gold text-black" : "bg-[#1a1a1a] text-muted-foreground hover:bg-[#242424] hover:text-white"
                }`}
              >
                <Package className="size-4 shrink-0" />
                Product Copy
              </button>
            </div>

            {/* Editor Workspace */}
            <div className="lg:col-span-3 luxe-card bg-[#1a1a1a] border border-border/40 p-8 shadow-luxe relative">
              
              {/* Tab 1: Homepage & Brand */}
              {activeTab === "general" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-border/20 pb-4 mb-4">
                    <h2 className="font-display text-xl uppercase tracking-wider text-white">Homepage & Brand Copy</h2>
                    <button
                      onClick={saveGeneralContent}
                      disabled={saving}
                      className="btn-gold !py-2 !px-4 text-xs font-bold"
                    >
                      {saving ? <Loader2 className="size-3.5 animate-spin text-black" /> : <Save className="size-3.5" />}
                      Save Copy
                    </button>
                  </div>

                  <div className="space-y-4 text-sm">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Hero Title</label>
                      <textarea
                        rows={2}
                        value={heroTitle}
                        onChange={(e) => setHeroTitle(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-border py-2.5 px-4 text-white focus:outline-none focus:border-gold rounded-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Hero Subtitle</label>
                      <textarea
                        rows={3}
                        value={heroSubtitle}
                        onChange={(e) => setHeroSubtitle(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-border py-2.5 px-4 text-white focus:outline-none focus:border-gold rounded-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Hero CTA Button Text</label>
                      <input
                        type="text"
                        value={heroCta}
                        onChange={(e) => setHeroCta(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-border py-2.5 px-4 text-white focus:outline-none focus:border-gold rounded-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Brand / About statement</label>
                      <textarea
                        rows={4}
                        value={aboutStatement}
                        onChange={(e) => setAboutStatement(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-border py-2.5 px-4 text-white focus:outline-none focus:border-gold rounded-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Contact / Support Email</label>
                      <input
                        type="email"
                        value={supportEmail}
                        onChange={(e) => setSupportEmail(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-border py-2.5 px-4 text-white focus:outline-none focus:border-gold rounded-sm"
                      />
                    </div>
                    <div className="border-t border-border/20 pt-6 mt-6 space-y-4">
                      <h3 className="font-display text-base tracking-wider text-gold uppercase">SEO Meta details</h3>
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">SEO Browser Title</label>
                        <input
                          type="text"
                          value={seoTitle}
                          onChange={(e) => setSeoTitle(e.target.value)}
                          className="w-full bg-[#0a0a0a] border border-border py-2.5 px-4 text-white focus:outline-none focus:border-gold rounded-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">SEO Meta Description</label>
                        <textarea
                          rows={2}
                          value={seoDescription}
                          onChange={(e) => setSeoDescription(e.target.value)}
                          className="w-full bg-[#0a0a0a] border border-border py-2.5 px-4 text-white focus:outline-none focus:border-gold rounded-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Product Copy */}
              {activeTab === "products" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border/20 pb-4 mb-4 gap-4">
                    <div className="flex items-center gap-4">
                      <h2 className="font-display text-xl uppercase tracking-wider text-white">Product Catalog</h2>
                      <select
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value as "fujisan" | "microslit")}
                        className="bg-[#0a0a0a] border border-border text-sm text-gold py-1.5 px-3 rounded-sm font-semibold uppercase tracking-wider focus:outline-none focus:border-gold"
                      >
                        <option value="fujisan">Fujisan Thinning</option>
                        <option value="microslit">Micro Slit Straight</option>
                      </select>
                    </div>
                    <button
                      onClick={() => saveProductContent(selectedProduct)}
                      disabled={saving}
                      className="btn-gold !py-2 !px-4 text-xs font-bold"
                    >
                      {saving ? <Loader2 className="size-3.5 animate-spin text-black" /> : <Save className="size-3.5" />}
                      Save {selectedProduct === "fujisan" ? "Fujisan" : "Micro Slit"} Copy
                    </button>
                  </div>

                  {/* Warning label */}
                  <div className="p-3.5 bg-black/40 border border-border/50 text-xs text-muted-foreground leading-normal flex items-start gap-2">
                    <ShieldAlert className="size-4 text-gold shrink-0 mt-0.5" />
                    <span>
                      Prices and Stripe Payment details are managed securely by developers inside Stripe and environment variables. Copy editing here does not alter card gateways.
                    </span>
                  </div>

                  {/* Form fields for active product */}
                  <div className="space-y-6 text-sm">
                    {/* General copy fields */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Display Title</label>
                        <input
                          type="text"
                          value={selectedProduct === "fujisan" ? prodNameFujisan : prodNameMicroslit}
                          onChange={(e) => selectedProduct === "fujisan" ? setProdNameFujisan(e.target.value) : setProdNameMicroslit(e.target.value)}
                          className="w-full bg-[#0a0a0a] border border-border py-2 px-3 text-white focus:outline-none focus:border-gold rounded-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Tagline / Short description</label>
                        <input
                          type="text"
                          value={selectedProduct === "fujisan" ? prodTaglineFujisan : prodTaglineMicroslit}
                          onChange={(e) => selectedProduct === "fujisan" ? setProdTaglineFujisan(e.target.value) : setProdTaglineMicroslit(e.target.value)}
                          className="w-full bg-[#0a0a0a] border border-border py-2 px-3 text-white focus:outline-none focus:border-gold rounded-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Short Summary</label>
                      <input
                        type="text"
                        value={selectedProduct === "fujisan" ? prodShortFujisan : prodShortMicroslit}
                        onChange={(e) => selectedProduct === "fujisan" ? setProdShortFujisan(e.target.value) : setProdShortMicroslit(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-border py-2 px-3 text-white focus:outline-none focus:border-gold rounded-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Long Copy / Full description</label>
                      <textarea
                        rows={4}
                        value={selectedProduct === "fujisan" ? prodLongFujisan : prodLongMicroslit}
                        onChange={(e) => selectedProduct === "fujisan" ? setProdLongFujisan(e.target.value) : setProdLongMicroslit(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-border py-2.5 px-4 text-white focus:outline-none focus:border-gold rounded-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Product Image URL</label>
                      <input
                        type="text"
                        value={selectedProduct === "fujisan" ? prodImageFujisan : prodImageMicroslit}
                        onChange={(e) => selectedProduct === "fujisan" ? setProdImageFujisan(e.target.value) : setProdImageMicroslit(e.target.value)}
                        placeholder="/assets/fujisan.jpg"
                        className="w-full bg-[#0a0a0a] border border-border py-2 px-3 text-white focus:outline-none focus:border-gold rounded-sm font-mono text-xs"
                      />
                    </div>

                    {/* Array: Features (Title, Description) */}
                    <div className="border-t border-border/20 pt-6 space-y-4">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-display text-base tracking-wider text-gold uppercase">Features & Highlights</h3>
                        <button
                          type="button"
                          onClick={() => {
                            const add = { title: "New Feature", description: "Details..." };
                            if (selectedProduct === "fujisan") setProdFeaturesFujisan([...prodFeaturesFujisan, add]);
                            else setProdFeaturesMicroslit([...prodFeaturesMicroslit, add]);
                          }}
                          className="text-gold hover:underline text-xs uppercase tracking-wider font-semibold flex items-center gap-1"
                        >
                          <Plus className="size-3" /> Add Feature
                        </button>
                      </div>
                      <div className="space-y-3">
                        {(selectedProduct === "fujisan" ? prodFeaturesFujisan : prodFeaturesMicroslit).map((feat, idx) => (
                          <div key={idx} className="flex gap-3 items-start p-3 bg-black/20 border border-border/40 rounded-sm">
                            <div className="flex-1 grid sm:grid-cols-3 gap-3">
                              <input
                                type="text"
                                value={feat.title}
                                placeholder="Feature title"
                                onChange={(e) => {
                                  const updated = selectedProduct === "fujisan" ? [...prodFeaturesFujisan] : [...prodFeaturesMicroslit];
                                  updated[idx].title = e.target.value;
                                  selectedProduct === "fujisan" ? setProdFeaturesFujisan(updated) : setProdFeaturesMicroslit(updated);
                                }}
                                className="sm:col-span-1 bg-[#0a0a0a] border border-border py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-gold rounded-sm"
                              />
                              <input
                                type="text"
                                value={feat.description}
                                placeholder="Feature description details..."
                                onChange={(e) => {
                                  const updated = selectedProduct === "fujisan" ? [...prodFeaturesFujisan] : [...prodFeaturesMicroslit];
                                  updated[idx].description = e.target.value;
                                  selectedProduct === "fujisan" ? setProdFeaturesFujisan(updated) : setProdFeaturesMicroslit(updated);
                                }}
                                className="sm:col-span-2 bg-[#0a0a0a] border border-border py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-gold rounded-sm"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = selectedProduct === "fujisan" ? [...prodFeaturesFujisan] : [...prodFeaturesMicroslit];
                                updated.splice(idx, 1);
                                selectedProduct === "fujisan" ? setProdFeaturesFujisan(updated) : setProdFeaturesMicroslit(updated);
                              }}
                              className="text-muted-foreground hover:text-red-400 p-1.5 transition-colors"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Array: Benefits (Title, Description) */}
                    <div className="border-t border-border/20 pt-6 space-y-4">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-display text-base tracking-wider text-gold uppercase">Product Benefits</h3>
                        <button
                          type="button"
                          onClick={() => {
                            const add = { title: "New Benefit", description: "Details..." };
                            if (selectedProduct === "fujisan") setProdBenefitsFujisan([...prodBenefitsFujisan, add]);
                            else setProdBenefitsMicroslit([...prodBenefitsMicroslit, add]);
                          }}
                          className="text-gold hover:underline text-xs uppercase tracking-wider font-semibold flex items-center gap-1"
                        >
                          <Plus className="size-3" /> Add Benefit
                        </button>
                      </div>
                      <div className="space-y-3">
                        {(selectedProduct === "fujisan" ? prodBenefitsFujisan : prodBenefitsMicroslit).map((ben, idx) => (
                          <div key={idx} className="flex gap-3 items-start p-3 bg-black/20 border border-border/40 rounded-sm">
                            <div className="flex-1 grid sm:grid-cols-3 gap-3">
                              <input
                                type="text"
                                value={ben.title}
                                placeholder="Benefit summary"
                                onChange={(e) => {
                                  const updated = selectedProduct === "fujisan" ? [...prodBenefitsFujisan] : [...prodBenefitsMicroslit];
                                  updated[idx].title = e.target.value;
                                  selectedProduct === "fujisan" ? setProdBenefitsFujisan(updated) : setProdBenefitsMicroslit(updated);
                                }}
                                className="sm:col-span-1 bg-[#0a0a0a] border border-border py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-gold rounded-sm"
                              />
                              <input
                                type="text"
                                value={ben.description}
                                placeholder="Benefit detail..."
                                onChange={(e) => {
                                  const updated = selectedProduct === "fujisan" ? [...prodBenefitsFujisan] : [...prodBenefitsMicroslit];
                                  updated[idx].description = e.target.value;
                                  selectedProduct === "fujisan" ? setProdBenefitsFujisan(updated) : setProdBenefitsMicroslit(updated);
                                }}
                                className="sm:col-span-2 bg-[#0a0a0a] border border-border py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-gold rounded-sm"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = selectedProduct === "fujisan" ? [...prodBenefitsFujisan] : [...prodBenefitsMicroslit];
                                updated.splice(idx, 1);
                                selectedProduct === "fujisan" ? setProdBenefitsFujisan(updated) : setProdBenefitsMicroslit(updated);
                              }}
                              className="text-muted-foreground hover:text-red-400 p-1.5 transition-colors"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Array: Specs (Label, Value) */}
                    <div className="border-t border-border/20 pt-6 space-y-4">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-display text-base tracking-wider text-gold uppercase">Specifications</h3>
                        <button
                          type="button"
                          onClick={() => {
                            const add = { label: "Tolerances", value: "0.1mm" };
                            if (selectedProduct === "fujisan") setProdSpecsFujisan([...prodSpecsFujisan, add]);
                            else setProdSpecsMicroslit([...prodSpecsMicroslit, add]);
                          }}
                          className="text-gold hover:underline text-xs uppercase tracking-wider font-semibold flex items-center gap-1"
                        >
                          <Plus className="size-3" /> Add Spec
                        </button>
                      </div>
                      <div className="space-y-3">
                        {(selectedProduct === "fujisan" ? prodSpecsFujisan : prodSpecsMicroslit).map((spec, idx) => (
                          <div key={idx} className="flex gap-3 items-start p-3 bg-black/20 border border-border/40 rounded-sm">
                            <div className="flex-1 grid sm:grid-cols-2 gap-3">
                              <input
                                type="text"
                                value={spec.label}
                                placeholder="Property label (e.g. Weight)"
                                onChange={(e) => {
                                  const updated = selectedProduct === "fujisan" ? [...prodSpecsFujisan] : [...prodSpecsMicroslit];
                                  updated[idx].label = e.target.value;
                                  selectedProduct === "fujisan" ? setProdSpecsFujisan(updated) : setProdSpecsMicroslit(updated);
                                }}
                                className="bg-[#0a0a0a] border border-border py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-gold rounded-sm"
                              />
                              <input
                                type="text"
                                value={spec.value}
                                placeholder="Specification value (e.g. 58g)"
                                onChange={(e) => {
                                  const updated = selectedProduct === "fujisan" ? [...prodSpecsFujisan] : [...prodSpecsMicroslit];
                                  updated[idx].value = e.target.value;
                                  selectedProduct === "fujisan" ? setProdSpecsFujisan(updated) : setProdSpecsMicroslit(updated);
                                }}
                                className="bg-[#0a0a0a] border border-border py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-gold rounded-sm"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = selectedProduct === "fujisan" ? [...prodSpecsFujisan] : [...prodSpecsMicroslit];
                                updated.splice(idx, 1);
                                selectedProduct === "fujisan" ? setProdSpecsFujisan(updated) : setProdSpecsMicroslit(updated);
                              }}
                              className="text-muted-foreground hover:text-red-400 p-1.5 transition-colors"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Array: Product specific FAQ */}
                    <div className="border-t border-border/20 pt-6 space-y-4">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-display text-base tracking-wider text-gold uppercase">Product specific FAQs</h3>
                        <button
                          type="button"
                          onClick={() => {
                            const add = { q: "FAQ Question?", a: "FAQ Answer details." };
                            if (selectedProduct === "fujisan") setProdFaqFujisan([...prodFaqFujisan, add]);
                            else setProdFaqMicroslit([...prodFaqMicroslit, add]);
                          }}
                          className="text-gold hover:underline text-xs uppercase tracking-wider font-semibold flex items-center gap-1"
                        >
                          <Plus className="size-3" /> Add FAQ
                        </button>
                      </div>
                      <div className="space-y-3">
                        {(selectedProduct === "fujisan" ? prodFaqFujisan : prodFaqMicroslit).map((faq, idx) => (
                          <div key={idx} className="flex gap-3 items-start p-3 bg-black/20 border border-border/40 rounded-sm">
                            <div className="flex-1 space-y-2">
                              <input
                                type="text"
                                value={faq.q}
                                placeholder="Product FAQ Question"
                                onChange={(e) => {
                                  const updated = selectedProduct === "fujisan" ? [...prodFaqFujisan] : [...prodFaqMicroslit];
                                  updated[idx].q = e.target.value;
                                  selectedProduct === "fujisan" ? setProdFaqFujisan(updated) : setProdFaqMicroslit(updated);
                                }}
                                className="w-full bg-[#0a0a0a] border border-border py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-gold rounded-sm"
                              />
                              <textarea
                                rows={2}
                                value={faq.a}
                                placeholder="Product FAQ Answer details..."
                                onChange={(e) => {
                                  const updated = selectedProduct === "fujisan" ? [...prodFaqFujisan] : [...prodFaqMicroslit];
                                  updated[idx].a = e.target.value;
                                  selectedProduct === "fujisan" ? setProdFaqFujisan(updated) : setProdFaqMicroslit(updated);
                                }}
                                className="w-full bg-[#0a0a0a] border border-border py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-gold rounded-sm"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = selectedProduct === "fujisan" ? [...prodFaqFujisan] : [...prodFaqMicroslit];
                                updated.splice(idx, 1);
                                selectedProduct === "fujisan" ? setProdFaqFujisan(updated) : setProdFaqMicroslit(updated);
                              }}
                              className="text-muted-foreground hover:text-red-400 p-1.5 transition-colors"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}


            </div>
          </div>

        </div>
      </section>
    </Layout>
  );
}
