"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/lib/cart";
import { ShoppingCart, X, Plus, Minus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CartDrawerProps {
  currency: string;
  primaryColor?: string | null;
  basePath: string;
}

export function CartDrawer({ currency, primaryColor, basePath }: CartDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const cart = useCart();
  const router = useRouter();

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <button className="relative flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
        <ShoppingCart className="h-5 w-5" />
        <span className="text-sm font-medium">0</span>
      </button>
    );
  }

  const totalItems = cart.getTotalItems();
  const totalPrice = cart.getTotalPrice();

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="relative flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ShoppingCart className="h-5 w-5" />
        <span className="text-sm font-medium">{totalItems}</span>
        {totalItems > 0 && (
          <span 
            className="absolute -top-2 -right-3 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm"
            style={{ backgroundColor: primaryColor || '#ef4444' }}
          >
            {totalItems > 99 ? '99+' : totalItems}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl transition-transform duration-300 ease-in-out transform flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Your Cart
          </h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-10 w-10 text-slate-300" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Your cart is empty</h3>
                <p className="text-slate-500">Looks like you haven't added anything yet.</p>
              </div>
              <button 
                onClick={() => {
                  setIsOpen(false);
                  router.push(`${basePath}/products`);
                }}
                className="mt-4 px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
                style={{ backgroundColor: primaryColor || '#0f172a' }}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-6">
              {cart.items.map((item) => (
                <li key={item.variantId} className="flex gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-100">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover object-center"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-slate-300">
                        <ShoppingCart className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between text-base font-semibold text-slate-900 mb-1">
                      <h3 className="line-clamp-2 pr-4">{item.name}</h3>
                      <p className="ml-4 whitespace-nowrap">{currency} {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    
                    <div className="flex flex-1 items-end justify-between text-sm">
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                        <button 
                          onClick={() => cart.updateQuantity(item.variantId, item.quantity - 1)}
                          className="px-2 py-1.5 bg-slate-50 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-3 py-1.5 font-medium text-slate-900 min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => cart.updateQuantity(item.variantId, item.quantity + 1)}
                          className="px-2 py-1.5 bg-slate-50 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => cart.removeItem(item.variantId)}
                        className="font-medium text-red-500 hover:text-red-700 flex items-center gap-1 p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart.items.length > 0 && (
          <div className="border-t border-slate-100 bg-white px-6 py-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between text-lg font-semibold text-slate-900 mb-2">
              <p>Subtotal</p>
              <p>{currency} {totalPrice.toFixed(2)}</p>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              Delivery fees are calculated at checkout.
            </p>
            <button
              onClick={() => {
                setIsOpen(false);
                router.push(`${basePath}/checkout`);
              }}
              className="flex w-full items-center justify-center rounded-xl border border-transparent bg-slate-900 px-6 py-4 text-base font-bold text-white hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl"
              style={{ backgroundColor: primaryColor || '#0f172a' }}
            >
              Checkout Now
            </button>
          </div>
        )}
      </div>
    </>
  );
}
