"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function StoreAnalyticsTracker({ domain }: { domain: string }) {
  const pathname = usePathname();

  useEffect(() => {
    // Only track once per page load, ignoring small route changes or strict mode double fires
    const trackView = async () => {
      // Check if we already tracked this session today to determine "unique visitor"
      const today = new Date().toISOString().split("T")[0];
      const storageKey = `tracked_visit_${domain}`;
      const lastVisit = localStorage.getItem(storageKey);
      
      const isNewVisitor = lastVisit !== today;

      try {
        await fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain, isNewVisitor }),
        });

        if (isNewVisitor) {
          localStorage.setItem(storageKey, today);
        }
      } catch (error) {
        console.error("Failed to track analytics:", error);
      }
    };

    // Delay tracking slightly to not block initial render
    const timeout = setTimeout(trackView, 1000);
    return () => clearTimeout(timeout);
  }, [domain, pathname]);

  return null;
}
