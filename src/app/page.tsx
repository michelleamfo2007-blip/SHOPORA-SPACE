import { Navbar } from "@/components/marketing/navbar";
import { Hero } from "@/components/marketing/hero";
import { Features } from "@/components/marketing/features";
import { AppShowcase } from "@/components/marketing/app-showcase";
import { Payments } from "@/components/marketing/payments";
import { Pricing } from "@/components/marketing/pricing";
import { Footer } from "@/components/marketing/footer";
import { PlatformAnalyticsTracker } from "@/components/marketing/PlatformAnalyticsTracker";

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-950 selection:bg-stone-950 selection:text-white">
      <PlatformAnalyticsTracker />
      <Navbar />

      <main>
        <Hero />
        <Features />
        <AppShowcase />
        <Payments />
        <Pricing />
      </main>

      <Footer />
    </div>
  );
}
