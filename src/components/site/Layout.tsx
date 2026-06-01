import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { LeadForm } from "./LeadForm";

export function Layout({ children, hideLead }: { children: ReactNode; hideLead?: boolean }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-16 md:pt-20">{children}</main>
      {!hideLead && <LeadForm variant="footer" />}
      <Footer />
    </div>
  );
}
