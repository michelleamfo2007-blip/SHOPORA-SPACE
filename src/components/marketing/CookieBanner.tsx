"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-300">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-900 mb-2">Cookie Preferences</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            We use cookies to improve your experience on our platform, 
            analyze traffic, and personalize content. By clicking &quot;Accept&quot;, you consent to our use of cookies.
          </p>
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" className="flex-1 sm:flex-none" onClick={handleDecline}>
            Decline
          </Button>
          <Button className="flex-1 sm:flex-none" onClick={handleAccept}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
