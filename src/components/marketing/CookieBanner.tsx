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
    <div className="fixed inset-x-0 bottom-0 z-50 p-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-xl sm:flex-row sm:items-center">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-stone-950">Cookies</h3>
          <p className="mt-1 text-sm leading-relaxed text-stone-600">
            We use cookies to improve the site and understand traffic. Accept to allow them, or decline to continue without them.
          </p>
        </div>
        <div className="flex gap-2 sm:shrink-0">
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
