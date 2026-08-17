"use client";

import { useState } from "react";
import { savePaymentSettings } from "@/server/actions/payment";
import { useRouter } from "next/navigation";

export default function PaymentSettingsPage({
  params,
}: {
  params: { storeId: string };
}) {
  const router = useRouter();
  const [provider, setProvider] = useState<"PAYSTACK" | "STRIPE">("PAYSTACK");
  const [publicKey, setPublicKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const result = await savePaymentSettings(
      params.storeId,
      provider,
      publicKey,
      secretKey
    );

    setLoading(false);

    if (result.error) {
      alert(result.error);
    } else {
      alert("Payment settings saved successfully!");
      router.refresh();
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Payment Settings</h1>
      
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Provider</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as any)}
            className="w-full p-2 border rounded"
          >
            <option value="PAYSTACK">Paystack</option>
            <option value="STRIPE">Stripe</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Public Key</label>
          <input
            type="text"
            required
            value={publicKey}
            onChange={(e) => setPublicKey(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Secret Key</label>
          <input
            type="password"
            required
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Will be encrypted securely"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {loading ? "Saving..." : "Save Connection"}
        </button>
      </form>
    </div>
  );
}
