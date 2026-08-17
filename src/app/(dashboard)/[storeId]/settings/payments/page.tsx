"use client";

import { useState } from "react";
import { savePaymentSettings } from "@/server/actions/payment";
import { useRouter } from "next/navigation";
import { use } from "react";

export default function PaymentSettingsPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = use(params);
  const router = useRouter();
  
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState("");
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const result = await savePaymentSettings(
      storeId,
      bankName,
      accountName,
      accountNumber,
      mobileMoneyNumber,
      instructions
    );

    setLoading(false);

    if (result?.error) {
      alert(result.error);
    } else {
      alert("Payment details saved successfully!");
      router.refresh();
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Manual Payment Details</h1>
      <p className="text-slate-500 mb-6">
        Customers will see these details at checkout. They will transfer funds directly to you, 
        and you will manually verify their orders in the Orders tab.
      </p>
      
      <form onSubmit={onSubmit} className="space-y-6">
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Bank Name</label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="e.g. Zenith Bank"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Account Name</label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="e.g. Jane Doe"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Account Number</label>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="e.g. 1234567890"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Mobile Money Number</label>
          <input
            type="text"
            value={mobileMoneyNumber}
            onChange={(e) => setMobileMoneyNumber(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="e.g. MTN Momo 0540000000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Payment Instructions (Optional)</label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full p-2 border rounded h-24"
            placeholder="e.g. Please use your Order ID as the payment reference."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {loading ? "Saving..." : "Save Payment Details"}
        </button>
      </form>
    </div>
  );
}
