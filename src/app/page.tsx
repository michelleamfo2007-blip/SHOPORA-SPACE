import { Navbar } from "@/components/marketing/navbar";
import { Hero } from "@/components/marketing/hero";
import { MarqueeStrip } from "@/components/marketing/marquee-strip";
import { Features } from "@/components/marketing/features";
import { AppShowcase } from "@/components/marketing/app-showcase";
import { Payments } from "@/components/marketing/payments";
import { Pricing } from "@/components/marketing/pricing";
import { Footer } from "@/components/marketing/footer";
import { PlatformAnalyticsTracker } from "@/components/marketing/PlatformAnalyticsTracker";
import { getFeaturedStorefront } from "@/lib/featured-storefront";

export const revalidate = 300;

export default async function Home() {
  const featuredStore = await getFeaturedStorefront();

  return (
    <div className="min-h-screen bg-[#f6f2ea] text-[#12100e] lining-nums selection:bg-[#12100e] selection:text-white">
      <PlatformAnalyticsTracker />
      <Navbar />

      <main>
        <Hero store={featuredStore} />
        <MarqueeStrip />
        <Features />
        <AppShowcase />
        <Payments />
        <Pricing />
      </main>

      <Footer />
    </div>
  );
}
