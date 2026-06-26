import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { 
  LogOut, ShieldAlert, Sparkles, LayoutDashboard, Package, HelpCircle, 
  MessageSquare, Plus, Trash2, Save, Loader2, Phone, Mail, Link as LinkIcon, Star, Eye, EyeOff, FileText
} from "lucide-react";
import { checkAdminAuth, getAdminDbFaqs } from "@/lib/admin.functions";
import { fetchSiteContent } from "@/lib/content";
import { products as fallbackProducts } from "@/lib/products";
import { getAdminDbProducts } from "@/lib/products";
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
    const faqs = await getAdminDbFaqs();
    
    // Fetch all current product states from Supabase via server-side function to bypass RLS
    const dbProducts = await getAdminDbProducts();

    return {
      siteContent,
      faqs: faqs || [],
      dbProducts: dbProducts || [],
    };
  },
  component: AdminPage,
});

function AdminPage() {
  const router = useRouter();
  const { siteContent, dbProducts, faqs: initialFaqs } = Route.useLoaderData();
  const [activeTab, setActiveTab] = useState<"general" | "products" | "faqs">("general");
  const [saving, setSaving] = useState(false);

  // --- GENERAL SITE COPY STATE ---
  const [heroTitle, setHeroTitle] = useState(siteContent["home.hero.title"] || "");
  const [heroSubtitle, setHeroSubtitle] = useState(siteContent["home.hero.subtitle"] || "");
  const [heroCta, setHeroCta] = useState(siteContent["home.hero.cta"] || "");
  const [saleBannerText, setSaleBannerText] = useState(siteContent["home.sale_banner.text"] || "");
  const [announcementText, setAnnouncementText] = useState(siteContent["home.announcement.text"] || "");

  // --- CONTACT & BRAND STATE ---
  const [supportEmail, setSupportEmail] = useState(siteContent["contact.support.email"] || "");
  const [supportPhone, setSupportPhone] = useState(siteContent["contact.support.phone"] || "");
  const [calendlyUrl, setCalendlyUrl] = useState(siteContent["contact.calendly.url"] || "");
  const [aboutStatement, setAboutStatement] = useState(siteContent["home.brand.statement"] || siteContent["about.brand.statement"] || "");
  const [seoTitle, setSeoTitle] = useState(siteContent["seo.title"] || "");
  const [seoDescription, setSeoDescription] = useState(siteContent["seo.description"] || "");

  // Sync state values when loader siteContent updates (e.g. after invalidate)
  useEffect(() => {
    if (siteContent) {
      setHeroTitle(siteContent["home.hero.title"] || "");
      setHeroSubtitle(siteContent["home.hero.subtitle"] || "");
      setHeroCta(siteContent["home.hero.cta"] || "");
      setSaleBannerText(siteContent["home.sale_banner.text"] || "");
      setAnnouncementText(siteContent["home.announcement.text"] || "");
      setSupportEmail(siteContent["contact.support.email"] || "");
      setSupportPhone(siteContent["contact.support.phone"] || "");
      setCalendlyUrl(siteContent["contact.calendly.url"] || "");
      setAboutStatement(siteContent["home.brand.statement"] || siteContent["about.brand.statement"] || "");
      setSeoTitle(siteContent["seo.title"] || "");
      setSeoDescription(siteContent["seo.description"] || "");
    }
  }, [siteContent]);

  // --- PRODUCTS STATE ---
  const [selectedProduct, setSelectedProduct] = useState("micro-slit-shears");
  const [prodName, setProdName] = useState("");
  const [prodTagline, setProdTagline] = useState("");
  const [prodShort, setProdShort] = useState("");
  const [prodLong, setProdLong] = useState("");
  const [prodImage, setProdImage] = useState("");
  const [prodFeatures, setProdFeatures] = useState<any[]>([]);
  const [prodBenefits, setProdBenefits] = useState<any[]>([]);
  const [prodSpecs, setProdSpecs] = useState<any[]>([]);
  const [prodFaq, setProdFaq] = useState<any[]>([]);
  const [prodVideoUrl, setProdVideoUrl] = useState("");
  const [prodGalleryUrls, setProdGalleryUrls] = useState<string[]>([]);
  const [prodAvailability, setProdAvailability] = useState<"Available" | "Coming Soon">("Coming Soon");

  // --- FAQS STATE ---
  const [faqs, setFaqs] = useState<any[]>(initialFaqs);

  useEffect(() => {
    const fallback = fallbackProducts.find(p => p.slug === selectedProduct);
    const dbProduct = dbProducts.find((p: any) => p.slug === selectedProduct);
    if (fallback) {
      setProdName(dbProduct?.name || fallback.name || "");
      setProdTagline(dbProduct?.tagline || fallback.tagline || "");
      setProdShort(dbProduct?.short_description || fallback.shortDescription || "");
      setProdLong(dbProduct?.long_description || fallback.longDescription || "");
      setProdImage(dbProduct?.image_url || fallback.image || "");
      setProdFeatures(dbProduct?.features || fallback.features || []);
      setProdBenefits(dbProduct?.benefits || fallback.benefits || []);
      setProdSpecs(dbProduct?.specs || fallback.specs || []);
      setProdFaq(dbProduct?.faq || fallback.faq || []);
      setProdVideoUrl(dbProduct?.video_url || fallback.video || "");
      setProdGalleryUrls(dbProduct?.gallery_urls || fallback.gallery || [dbProduct?.image_url || fallback.image || ""]);
      setProdAvailability(dbProduct?.availability || (dbProduct?.active !== false ? "Available" : "Coming Soon"));
    }
  }, [selectedProduct, dbProducts]);

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

  // --- SAVE GENERAL SITE COPY & CONTACT & SEO ---
  const saveGeneralContent = async () => {
    // 1. Validation Checks
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(supportEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    const phoneRegex = /^[\d+\s\(\)\-+]+$/;
    if (supportPhone && !phoneRegex.test(supportPhone)) {
      toast.error("Phone number can only contain digits, spaces, +, ( ), and -.");
      return;
    }

    if (calendlyUrl) {
      try {
        new URL(calendlyUrl);
      } catch {
        toast.error("Please enter a valid Calendly URL (e.g. https://calendly.com/your-url).");
        return;
      }
    }

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
            { key: "home.sale_banner.text", value: saleBannerText },
            { key: "home.announcement.text", value: announcementText },
            { key: "contact.support.email", value: supportEmail },
            { key: "contact.support.phone", value: supportPhone },
            { key: "contact.calendly.url", value: calendlyUrl },
            { key: "home.brand.statement", value: aboutStatement },
            { key: "about.brand.statement", value: aboutStatement },
            { key: "seo.title", value: seoTitle },
            { key: "seo.description", value: seoDescription },
          ],
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success("Homepage & Brand Copy saved successfully!");
        router.invalidate();
      } else {
        toast.error(data.error || "Failed to save homepage details.");
      }
    } catch {
      toast.error("A network error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // --- SAVE PRODUCT COPY ---
  const saveProductContent = async (slug: string) => {
    setSaving(true);
    const payload = {
      slug,
      name: prodName,
      tagline: prodTagline,
      shortDescription: prodShort,
      longDescription: prodLong,
      image: prodImage,
      features: prodFeatures,
      benefits: prodBenefits,
      specs: prodSpecs,
      faq: prodFaq,
      videoUrl: prodVideoUrl,
      galleryUrls: prodGalleryUrls.filter(Boolean),
      availability: prodAvailability,
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

  // --- FAQ OPERATIONS ---
  const addFaqField = () => {
    const newFaq = {
      question: "New FAQ Question?",
      answer: "FAQ Answer...",
      sort_order: faqs.length + 1,
      is_active: true,
      isNew: true,
    };
    setFaqs([...faqs, newFaq]);
  };

  const saveFaqItem = async (index: number) => {
    setSaving(true);
    const faq = faqs[index];
    try {
      const response = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: faq.isNew ? undefined : faq.id,
          question: faq.question,
          answer: faq.answer,
          sort_order: Number(faq.sort_order),
          is_active: faq.is_active,
        }),
      });

      const res = await response.json();
      if (response.ok && res.success) {
        toast.success("FAQ saved successfully!");
        const updated = [...faqs];
        updated[index] = { ...res.data, isNew: false };
        setFaqs(updated);
      } else {
        toast.error(res.error || "Failed to save FAQ.");
      }
    } catch {
      toast.error("Network error saving FAQ.");
    } finally {
      setSaving(false);
    }
  };

  const deleteFaqItem = async (index: number) => {
    const faq = faqs[index];
    if (faq.isNew) {
      const updated = [...faqs];
      updated.splice(index, 1);
      setFaqs(updated);
      return;
    }

    if (!confirm("Are you sure you want to permanently delete this FAQ from the database?")) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/faqs?id=${faq.id}`, {
        method: "DELETE",
      });

      const res = await response.json();
      if (response.ok && res.success) {
        toast.success("FAQ deleted successfully!");
        const updated = [...faqs];
        updated.splice(index, 1);
        setFaqs(updated);
      } else {
        toast.error(res.error || "Failed to delete FAQ.");
      }
    } catch {
      toast.error("Network error deleting FAQ.");
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

              <button
                onClick={() => setActiveTab("faqs")}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-xs font-semibold uppercase tracking-wider transition-colors rounded-sm text-left ${
                  activeTab === "faqs" ? "bg-gold text-black" : "bg-[#1a1a1a] text-muted-foreground hover:bg-[#242424] hover:text-white"
                }`}
              >
                <HelpCircle className="size-4 shrink-0" />
                FAQs Table
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
                      <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Homepage Hero Title</label>
                      <textarea
                        rows={2}
                        value={heroTitle}
                        onChange={(e) => setHeroTitle(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-border py-2.5 px-4 text-white focus:outline-none focus:border-gold rounded-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Homepage Hero Subtitle</label>
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
                      <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Brand/About Statement</label>
                      <textarea
                        rows={5}
                        value={aboutStatement}
                        onChange={(e) => setAboutStatement(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-border py-2.5 px-4 text-white focus:outline-none focus:border-gold rounded-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Contact/Support Email</label>
                      <input
                        type="email"
                        value={supportEmail}
                        onChange={(e) => setSupportEmail(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-border py-2.5 px-4 text-white focus:outline-none focus:border-gold rounded-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Phone Number</label>
                      <input
                        type="text"
                        value={supportPhone}
                        onChange={(e) => setSupportPhone(e.target.value)}
                        placeholder="+1 (316) 368-2814"
                        className="w-full bg-[#0a0a0a] border border-border py-2.5 px-4 text-white focus:outline-none focus:border-gold rounded-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Calendly URL</label>
                      <input
                        type="text"
                        value={calendlyUrl}
                        onChange={(e) => setCalendlyUrl(e.target.value)}
                        placeholder="https://calendly.com/your-brand-specialist"
                        className="w-full bg-[#0a0a0a] border border-border py-2.5 px-4 text-white focus:outline-none focus:border-gold rounded-sm font-mono text-xs text-gold"
                      />
                    </div>

                    <div className="border-t border-border/20 pt-6 mt-6 space-y-4">
                      <h3 className="font-display text-base tracking-wider text-gold uppercase">Special Banners</h3>
                      
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                          Sale Banner Text
                        </label>
                        <input
                          type="text"
                          value={saleBannerText}
                          placeholder="e.g. SUMMER SALE: USE CODE SUMMA20 FOR 20% OFF"
                          onChange={(e) => setSaleBannerText(e.target.value)}
                          className="w-full bg-[#0a0a0a] border border-border py-2.5 px-4 text-white focus:outline-none focus:border-gold rounded-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                          Announcement Bar Text
                        </label>
                        <input
                          type="text"
                          value={announcementText}
                          onChange={(e) => setAnnouncementText(e.target.value)}
                          className="w-full bg-[#0a0a0a] border border-border py-2.5 px-4 text-white focus:outline-none focus:border-gold rounded-sm"
                        />
                      </div>
                    </div>

                    <div className="border-t border-border/20 pt-6 mt-6 space-y-4">
                      <h3 className="font-display text-base tracking-wider text-gold uppercase">SEO Meta Details</h3>
                      
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                          SEO Title
                        </label>
                        <input
                          type="text"
                          value={seoTitle}
                          onChange={(e) => setSeoTitle(e.target.value)}
                          className="w-full bg-[#0a0a0a] border border-border py-2.5 px-4 text-white focus:outline-none focus:border-gold rounded-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                          SEO Description
                        </label>
                        <textarea
                          rows={3}
                          value={seoDescription}
                          onChange={(e) => setSeoDescription(e.target.value)}
                          className="w-full bg-[#0a0a0a] border border-border py-2.5 px-4 text-white focus:outline-none focus:border-gold rounded-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Product Copy */}
              {activeTab === "products" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border/20 pb-4 mb-4 gap-4">
                    <div className="flex items-center gap-4">
                      <h2 className="font-display text-xl uppercase tracking-wider text-white">Product Catalog</h2>
                      <select
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        className="bg-[#0a0a0a] border border-border text-sm text-gold py-1.5 px-3 rounded-sm font-semibold uppercase tracking-wider focus:outline-none focus:border-gold"
                      >
                        {fallbackProducts.map((p) => (
                          <option key={p.slug} value={p.slug}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => saveProductContent(selectedProduct)}
                      disabled={saving}
                      className="btn-gold !py-2 !px-4 text-xs font-bold"
                    >
                      {saving ? <Loader2 className="size-3.5 animate-spin text-black" /> : <Save className="size-3.5" />}
                      Save {prodName} Copy
                    </button>
                  </div>

                  {/* Warning label */}
                  <div className="p-3.5 bg-black/40 border border-border/50 text-xs text-muted-foreground leading-normal flex items-start gap-2">
                    <ShieldAlert className="size-4 text-gold shrink-0 mt-0.5" />
                    <span>
                      Stripe configurations, Stripe Price IDs, database slugs, and payment routes are developer-locked. Public availability settings can be toggled safely here without breaking payment integrations.
                    </span>
                  </div>

                  {/* Form fields for active product */}
                  <div className="space-y-6 text-sm">
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Display Title</label>
                        <input
                          type="text"
                          value={prodName}
                          onChange={(e) => setProdName(e.target.value)}
                          className="w-full bg-[#0a0a0a] border border-border py-2 px-3 text-white focus:outline-none focus:border-gold rounded-sm"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Availability Status</label>
                        <select
                          value={prodAvailability}
                          onChange={(e) => setProdAvailability(e.target.value as any)}
                          className="w-full bg-[#0a0a0a] border border-border py-2.5 px-3 text-white focus:outline-none focus:border-gold rounded-sm"
                        >
                          <option value="Available">Available</option>
                          <option value="Coming Soon">Coming Soon</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Tagline / Short description</label>
                      <input
                        type="text"
                        value={prodTagline}
                        onChange={(e) => setProdTagline(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-border py-2 px-3 text-white focus:outline-none focus:border-gold rounded-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Short Summary</label>
                      <input
                        type="text"
                        value={prodShort}
                        onChange={(e) => setProdShort(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-border py-2 px-3 text-white focus:outline-none focus:border-gold rounded-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Long Copy / Full description</label>
                      <textarea
                        rows={4}
                        value={prodLong}
                        onChange={(e) => setProdLong(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-border py-2.5 px-4 text-white focus:outline-none focus:border-gold rounded-sm"
                      />
                    </div>

                    {/* Media Fields */}
                    <div className="border-t border-border/20 pt-6 mt-6 space-y-4">
                      <h3 className="font-display text-base tracking-wider text-gold uppercase">Product Media & Links</h3>
                      
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Main Image Path / URL</label>
                        <input
                          type="text"
                          value={prodImage}
                          onChange={(e) => setProdImage(e.target.value)}
                          placeholder="/products/thunder/main.webp"
                          className="w-full bg-[#0a0a0a] border border-border py-2 px-3 text-white focus:outline-none focus:border-gold rounded-sm font-mono text-xs"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Demo Video Path / URL</label>
                        <input
                          type="text"
                          value={prodVideoUrl}
                          onChange={(e) => setProdVideoUrl(e.target.value)}
                          placeholder="e.g. /assets/fujisan/fujisan.mp4 or a YouTube/Vimeo embed link"
                          className="w-full bg-[#0a0a0a] border border-border py-2 px-3 text-white focus:outline-none focus:border-gold rounded-sm font-mono text-xs"
                        />
                      </div>

                      {/* Product Gallery Editor */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-baseline">
                          <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Product Gallery Image Paths</label>
                          <button
                            type="button"
                            onClick={() => setProdGalleryUrls([...prodGalleryUrls, ""])}
                            className="text-gold hover:underline text-xs uppercase tracking-wider font-semibold flex items-center gap-1"
                          >
                            <Plus className="size-3" /> Add Image Path
                          </button>
                        </div>
                        <div className="space-y-2">
                          {prodGalleryUrls.map((url, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <input
                                type="text"
                                value={url}
                                placeholder="/products/micro-slit/detail-1.webp"
                                onChange={(e) => {
                                  const updated = [...prodGalleryUrls];
                                  updated[idx] = e.target.value;
                                  setProdGalleryUrls(updated);
                                }}
                                className="flex-1 bg-[#0a0a0a] border border-border py-1.5 px-3 text-xs text-white focus:outline-none focus:border-gold rounded-sm font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...prodGalleryUrls];
                                  updated.splice(idx, 1);
                                  setProdGalleryUrls(updated);
                                }}
                                className="text-muted-foreground hover:text-red-400 p-1.5"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Array: Features (Title, Description) */}
                    <div className="border-t border-border/20 pt-6 space-y-4">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-display text-base tracking-wider text-gold uppercase">Features & Highlights</h3>
                        <button
                          type="button"
                          onClick={() => {
                            const add = { title: "New Feature", description: "Details..." };
                            setProdFeatures([...prodFeatures, add]);
                          }}
                          className="text-gold hover:underline text-xs uppercase tracking-wider font-semibold flex items-center gap-1"
                        >
                          <Plus className="size-3" /> Add Feature
                        </button>
                      </div>
                      <div className="space-y-3">
                        {prodFeatures.map((feat, idx) => (
                          <div key={idx} className="flex gap-3 items-start p-3 bg-black/20 border border-border/40 rounded-sm">
                            <div className="flex-1 grid sm:grid-cols-3 gap-3">
                              <input
                                type="text"
                                value={feat.title}
                                placeholder="Feature title"
                                onChange={(e) => {
                                  const updated = [...prodFeatures];
                                  updated[idx] = { ...updated[idx], title: e.target.value };
                                  setProdFeatures(updated);
                                }}
                                className="sm:col-span-1 bg-[#0a0a0a] border border-border py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-gold rounded-sm"
                              />
                              <input
                                type="text"
                                value={feat.description}
                                placeholder="Feature description details..."
                                onChange={(e) => {
                                  const updated = [...prodFeatures];
                                  updated[idx] = { ...updated[idx], description: e.target.value };
                                  setProdFeatures(updated);
                                }}
                                className="sm:col-span-2 bg-[#0a0a0a] border border-border py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-gold rounded-sm"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...prodFeatures];
                                updated.splice(idx, 1);
                                setProdFeatures(updated);
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
                            setProdBenefits([...prodBenefits, add]);
                          }}
                          className="text-gold hover:underline text-xs uppercase tracking-wider font-semibold flex items-center gap-1"
                        >
                          <Plus className="size-3" /> Add Benefit
                        </button>
                      </div>
                      <div className="space-y-3">
                        {prodBenefits.map((ben, idx) => (
                          <div key={idx} className="flex gap-3 items-start p-3 bg-black/20 border border-border/40 rounded-sm">
                            <div className="flex-1 grid sm:grid-cols-3 gap-3">
                              <input
                                type="text"
                                value={ben.title}
                                placeholder="Benefit summary"
                                onChange={(e) => {
                                  const updated = [...prodBenefits];
                                  updated[idx] = { ...updated[idx], title: e.target.value };
                                  setProdBenefits(updated);
                                }}
                                className="sm:col-span-1 bg-[#0a0a0a] border border-border py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-gold rounded-sm"
                              />
                              <input
                                type="text"
                                value={ben.description}
                                placeholder="Benefit detail..."
                                onChange={(e) => {
                                  const updated = [...prodBenefits];
                                  updated[idx] = { ...updated[idx], description: e.target.value };
                                  setProdBenefits(updated);
                                }}
                                className="sm:col-span-2 bg-[#0a0a0a] border border-border py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-gold rounded-sm"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...prodBenefits];
                                updated.splice(idx, 1);
                                setProdBenefits(updated);
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
                            setProdSpecs([...prodSpecs, add]);
                          }}
                          className="text-gold hover:underline text-xs uppercase tracking-wider font-semibold flex items-center gap-1"
                        >
                          <Plus className="size-3" /> Add Spec
                        </button>
                      </div>
                      <div className="space-y-3">
                        {prodSpecs.map((spec, idx) => (
                          <div key={idx} className="flex gap-3 items-start p-3 bg-black/20 border border-border/40 rounded-sm">
                            <div className="flex-1 grid sm:grid-cols-2 gap-3">
                              <input
                                type="text"
                                value={spec.label}
                                placeholder="Property label (e.g. Weight)"
                                onChange={(e) => {
                                  const updated = [...prodSpecs];
                                  updated[idx] = { ...updated[idx], label: e.target.value };
                                  setProdSpecs(updated);
                                }}
                                className="bg-[#0a0a0a] border border-border py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-gold rounded-sm"
                              />
                              <input
                                type="text"
                                value={spec.value}
                                placeholder="Specification value (e.g. 58g)"
                                onChange={(e) => {
                                  const updated = [...prodSpecs];
                                  updated[idx] = { ...updated[idx], value: e.target.value };
                                  setProdSpecs(updated);
                                }}
                                className="bg-[#0a0a0a] border border-border py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-gold rounded-sm"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...prodSpecs];
                                updated.splice(idx, 1);
                                setProdSpecs(updated);
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
                            setProdFaq([...prodFaq, add]);
                          }}
                          className="text-gold hover:underline text-xs uppercase tracking-wider font-semibold flex items-center gap-1"
                        >
                          <Plus className="size-3" /> Add FAQ
                        </button>
                      </div>
                      <div className="space-y-3">
                        {prodFaq.map((faqItem, idx) => (
                          <div key={idx} className="flex gap-3 items-start p-3 bg-black/20 border border-border/40 rounded-sm">
                            <div className="flex-1 grid gap-3">
                              <input
                                type="text"
                                value={faqItem.q}
                                placeholder="FAQ Question"
                                onChange={(e) => {
                                  const updated = [...prodFaq];
                                  updated[idx] = { ...updated[idx], q: e.target.value };
                                  setProdFaq(updated);
                                }}
                                className="w-full bg-[#0a0a0a] border border-border py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-gold rounded-sm"
                              />
                              <textarea
                                value={faqItem.a}
                                placeholder="FAQ Answer details..."
                                onChange={(e) => {
                                  const updated = [...prodFaq];
                                  updated[idx] = { ...updated[idx], a: e.target.value };
                                  setProdFaq(updated);
                                }}
                                className="w-full bg-[#0a0a0a] border border-border py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-gold rounded-sm"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...prodFaq];
                                updated.splice(idx, 1);
                                setProdFaq(updated);
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



              {/* Tab 5: FAQ Manager */}
              {activeTab === "faqs" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-border/20 pb-4 mb-4">
                    <h2 className="font-display text-xl uppercase tracking-wider text-white">FAQs Manager Table</h2>
                    <button
                      onClick={addFaqField}
                      className="btn-gold !py-2 !px-4 text-xs font-bold"
                    >
                      <Plus className="size-3.5 mr-1" />
                      Add FAQ
                    </button>
                  </div>

                  <div className="space-y-6">
                    {faqs.map((faq, idx) => (
                      <div key={idx} className="p-5 bg-black/30 border border-border/30 rounded-sm space-y-4">
                        <div className="flex flex-wrap gap-4 items-center justify-between">
                          <h3 className="font-semibold text-sm text-gold">FAQ #{idx + 1} {faq.isNew && "(Unsaved)"}</h3>
                          
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...faqs];
                                updated[idx].is_active = !updated[idx].is_active;
                                setFaqs(updated);
                              }}
                              className={`p-1.5 rounded-sm border ${
                                faq.is_active 
                                  ? "border-green-500/30 bg-green-500/10 text-green-400" 
                                  : "border-red-500/30 bg-red-500/10 text-red-400"
                              }`}
                              title={faq.is_active ? "Visible on site" : "Hidden from site"}
                            >
                              {faq.is_active ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                            </button>

                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-muted-foreground uppercase">Sort:</span>
                              <input
                                type="number"
                                value={faq.sort_order}
                                onChange={(e) => {
                                  const updated = [...faqs];
                                  updated[idx].sort_order = e.target.value;
                                  setFaqs(updated);
                                }}
                                className="w-12 bg-[#0a0a0a] border border-border py-0.5 px-1.5 text-center text-xs text-white focus:outline-none focus:border-gold rounded-sm"
                              />
                            </div>
                            
                            <button
                              onClick={() => saveFaqItem(idx)}
                              disabled={saving}
                              className="text-xs bg-gold/10 border border-gold/30 hover:bg-gold text-gold hover:text-black py-1.5 px-3 transition-all flex items-center gap-1 font-semibold"
                            >
                              <Save className="size-3.5" /> Save
                            </button>
                            
                            <button
                              onClick={() => deleteFaqItem(idx)}
                              className="text-xs bg-red-500/10 border border-red-500/30 hover:bg-red-500 hover:text-white py-1.5 px-3 text-red-400 transition-all flex items-center gap-1 font-semibold"
                            >
                              <Trash2 className="size-3.5" /> Delete
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] uppercase text-muted-foreground font-semibold">Question</label>
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) => {
                              const updated = [...faqs];
                              updated[idx].question = e.target.value;
                              setFaqs(updated);
                            }}
                            className="w-full bg-[#0a0a0a] border border-border py-2 px-3 text-xs text-white focus:outline-none focus:border-gold rounded-sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] uppercase text-muted-foreground font-semibold">Answer</label>
                          <textarea
                            rows={3}
                            value={faq.answer}
                            onChange={(e) => {
                              const updated = [...faqs];
                              updated[idx].answer = e.target.value;
                              setFaqs(updated);
                            }}
                            className="w-full bg-[#0a0a0a] border border-border py-2 px-3 text-xs text-white focus:outline-none focus:border-gold rounded-sm"
                          />
                        </div>
                      </div>
                    ))}
                    {faqs.length === 0 && (
                      <div className="text-center py-10 border border-dashed border-border/40 text-muted-foreground text-sm">
                        No FAQs added yet. Click "Add FAQ" to create one.
                      </div>
                    )}
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
