-- Close the Supabase Data API on application tables.
-- Prisma connects as the database owner, which bypasses row security.

ALTER TABLE "VerificationToken" ADD CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier", "token");
ALTER TABLE "VerificationToken" DROP CONSTRAINT IF EXISTS "VerificationToken_identifier_token_key";

DROP INDEX IF EXISTS "StoreAnalytics_storeId_idx";

CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "Account"("userId");
CREATE INDEX IF NOT EXISTS "Domain_storeId_idx" ON "Domain"("storeId");
CREATE INDEX IF NOT EXISTS "InventoryHistory_variantId_idx" ON "InventoryHistory"("variantId");
CREATE INDEX IF NOT EXISTS "Order_storeId_idx" ON "Order"("storeId");
CREATE INDEX IF NOT EXISTS "Order_customerId_idx" ON "Order"("customerId");
CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX IF NOT EXISTS "OrderItem_variantId_idx" ON "OrderItem"("variantId");
CREATE INDEX IF NOT EXISTS "Payment_orderId_idx" ON "Payment"("orderId");
CREATE INDEX IF NOT EXISTS "Product_storeId_idx" ON "Product"("storeId");
CREATE INDEX IF NOT EXISTS "ProductVariant_productId_idx" ON "ProductVariant"("productId");
CREATE INDEX IF NOT EXISTS "Review_storeId_idx" ON "Review"("storeId");
CREATE INDEX IF NOT EXISTS "Review_productId_idx" ON "Review"("productId");
CREATE INDEX IF NOT EXISTS "Review_customerId_idx" ON "Review"("customerId");
CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");
CREATE INDEX IF NOT EXISTS "ShippingRate_zoneId_idx" ON "ShippingRate"("zoneId");
CREATE INDEX IF NOT EXISTS "ShippingZone_storeId_idx" ON "ShippingZone"("storeId");
CREATE INDEX IF NOT EXISTS "StoreMember_userId_idx" ON "StoreMember"("userId");
CREATE INDEX IF NOT EXISTS "Subscription_planId_idx" ON "Subscription"("planId");
CREATE INDEX IF NOT EXISTS "SubscriptionPayment_subscriptionId_idx" ON "SubscriptionPayment"("subscriptionId");
CREATE INDEX IF NOT EXISTS "SupportTicket_storeId_idx" ON "SupportTicket"("storeId");
CREATE INDEX IF NOT EXISTS "SupportTicket_customerId_idx" ON "SupportTicket"("customerId");

DO $$
DECLARE
  table_name text;
BEGIN
  FOR table_name IN
    SELECT c.relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', table_name);
  END LOOP;
END $$;
