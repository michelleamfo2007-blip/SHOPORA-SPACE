"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useCart } from "@/lib/cart";
import { ShoppingBag, X, Plus, Minus } from "lucide-react";
import { useRouter } from "next/navigation";

function subscribeToNothing() {
  return () => {};
}

interface CartDrawerProps {
  currency: string;
  basePath: string;
}

function money(currency: string, amount: number) {
  return `${currency} ${amount.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function CartDrawer({ currency, basePath }: CartDrawerProps) {
  const isMounted = useSyncExternalStore(subscribeToNothing, () => true, () => false);
  const cart = useCart();
  const router = useRouter();
  const isOpen = cart.isDrawerOpen;

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  const totalItems = isMounted ? cart.getTotalItems() : 0;
  const totalPrice = cart.getTotalPrice();

  const bagButton = (
    <button
      onClick={cart.openDrawer}
      className="relative -mr-2 flex h-10 w-10 items-center justify-center text-stone-900"
      aria-label={`Open bag, ${totalItems} items`}
    >
      <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
      {totalItems > 0 && (
        <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--store-accent)] px-1 text-[10px] font-semibold text-white">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </button>
  );

  if (!isMounted) return bagButton;

  return (
    <>
      {bagButton}

      <div
        className={`fixed inset-0 z-50 bg-stone-950/30 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={cart.closeDrawer}
      />

      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-[#faf8f5] transition-[transform,visibility] duration-300 ease-out ${
          isOpen ? "visible translate-x-0 shadow-2xl" : "invisible translate-x-full"
        }`}
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <div className="flex h-16 items-center justify-between border-b border-stone-200 px-6">
          <h2 className="font-display text-2xl text-stone-900">
            Your bag {totalItems > 0 && <span className="font-store text-sm text-stone-500">({totalItems})</span>}
          </h2>
          <button
            onClick={cart.closeDrawer}
            className="-mr-2 flex h-10 w-10 items-center justify-center text-stone-500 hover:text-stone-900"
            aria-label="Close bag"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          {cart.items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingBag className="mb-5 h-10 w-10 text-stone-300" strokeWidth={1} />
              <p className="font-display text-2xl text-stone-900">Your bag is empty</p>
              <p className="mt-2 text-sm text-stone-500">Find something you love and it will appear here.</p>
              <button
                onClick={() => {
                  cart.closeDrawer();
                  router.push(`${basePath}/products`);
                }}
                className="mt-8 h-12 rounded-full bg-stone-900 px-8 text-sm font-medium tracking-wide text-white transition-colors hover:bg-stone-700"
              >
                Start shopping
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-stone-200">
              {cart.items.map((item) => (
                <li key={item.variantId} className="flex gap-4 py-6">
                  <div className="h-28 w-22 shrink-0 overflow-hidden bg-stone-100">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-stone-300">
                        <ShoppingBag className="h-5 w-5" strokeWidth={1} />
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex justify-between gap-3">
                      <h3 className="line-clamp-2 text-sm text-stone-900">{item.name}</h3>
                      <p className="whitespace-nowrap text-sm text-stone-900">{money(currency, item.price * item.quantity)}</p>
                    </div>
                    <p className="mt-1 text-xs text-stone-500">{money(currency, item.price)} each</p>

                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center border border-stone-300">
                        <button
                          onClick={() => cart.updateQuantity(item.variantId, item.quantity - 1)}
                          className="flex h-8 w-8 items-center justify-center text-stone-600 hover:text-stone-900"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => cart.updateQuantity(item.variantId, item.quantity + 1)}
                          className="flex h-8 w-8 items-center justify-center text-stone-600 hover:text-stone-900"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => cart.removeItem(item.variantId)}
                        className="text-xs text-stone-500 underline underline-offset-4 hover:text-stone-900"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart.items.length > 0 && (
          <div className="border-t border-stone-200 px-6 py-6">
            <div className="flex justify-between text-sm">
              <p className="uppercase tracking-[0.15em] text-stone-500">Subtotal</p>
              <p className="font-medium text-stone-900">{money(currency, totalPrice)}</p>
            </div>
            <p className="mt-2 text-xs text-stone-500">Delivery fee is paid to the rider on arrival.</p>
            <button
              onClick={() => {
                cart.closeDrawer();
                router.push(`${basePath}/checkout`);
              }}
              className="mt-5 h-13 w-full rounded-full bg-[var(--store-accent)] text-sm font-medium tracking-wide text-white transition-opacity hover:opacity-90"
            >
              Checkout
            </button>
            <button
              onClick={cart.closeDrawer}
              className="mt-3 w-full text-center text-xs text-stone-500 underline underline-offset-4 hover:text-stone-900"
            >
              Continue shopping
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
