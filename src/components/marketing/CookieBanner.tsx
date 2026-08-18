"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie_consent", "declined");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 md:p-6 shadow-2xl z-50 animate-in slide-in-from-bottom-10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-slate-600 max-w-3xl">
          <p>
            <strong>We use cookies</strong> to improve your experience on our platform, 
            analyze traffic, and personalize content. By clicking &quot;Accept&quot;, you consent to our use of cookies.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none" onClick={handleDecline}>
            Decline
          </Button>
          <Button className="flex-1 md:flex-none" onClick={handleAccept}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
