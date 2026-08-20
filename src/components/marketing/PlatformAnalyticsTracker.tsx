"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function PlatformAnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const trackView = async () => {
      const today = new Date().toISOString().split("T")[0];
      const storageKey = `tracked_visit_platform`;
      const lastVisit = localStorage.getItem(storageKey);
      
      const isNewVisitor = lastVisit !== today;

      try {
        await fetch("/api/analytics/platform", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isNewVisitor }),
        });

        if (isNewVisitor) {
          localStorage.setItem(storageKey, today);
        }
      } catch (error) {
        console.error("Failed to track platform analytics:", error);
      }
    };

    const timeout = setTimeout(trackView, 1000);
    return () => clearTimeout(timeout);
  }, [pathname]);

  return null;
}
