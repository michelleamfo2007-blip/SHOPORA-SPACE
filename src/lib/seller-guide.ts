/** The Seller Guide (website dashboard). The app's guide screen uses the same text. */
export type GuideSection = { title: string; body?: string; items?: string[]; tip?: string }

export const SELLER_GUIDE: GuideSection[] = [
  {
    title: "1. Create your account and store",
    items: [
      "Sign up on shopora.space or in the Shopora app.",
      "Name your store and choose its web address, e.g. yourstore.shopora.space.",
      "Pick a plan. Your 1-month free trial starts as soon as the store is created.",
    ],
  },
  {
    title: "2. Choose the plan that fits",
    items: [
      "Starter (GHS 100/month): up to 25 products, your store and the seller app, orders, stock, customers, MoMo and bank payments, Shopora Delivery in Accra.",
      "Professional (GHS 200/month): up to 50 products, plus recording WhatsApp, Instagram and walk-in orders, WhatsApp payment reminders, the share kit, customer notes and tags, sales reports and a monthly goal.",
      "Business (GHS 300/month): unlimited products and every tool, including profit tracking, Excel downloads, bulk editing and staff accounts.",
    ],
    tip: "You can switch plans any time under Billing. New tools turn on straight away.",
  },
  {
    title: "3. Set up your store",
    items: [
      "Logo and cover image",
      "Brand colour",
      "Homepage headline and a short description",
      "WhatsApp, Instagram or email so customers can reach you",
      "Your story, shown on your homepage",
    ],
    tip: "The store setup checklist on your dashboard shows what is still missing.",
  },
  {
    title: "4. Add your products",
    items: [
      "A clear name and up to 2 good photos",
      "Selling price, and an old price if it is on sale",
      "Stock quantity, so nobody can buy more than you have",
      "Sizes and colours, each with its own price and stock",
      "A short description (use Generate description to start one)",
    ],
    tip: "Use bright, well-lit photos on a plain background. They sell better.",
  },
  {
    title: "5. Organise with categories",
    body: "Group products so customers find them quickly, for example Dresses, Tops and Bags, or Hair, Wigs and Skincare.",
  },
  {
    title: "6. Add your payment details",
    body: "Customers pay you directly by Mobile Money or bank transfer. Add your MoMo number and bank details under Payments so they show at checkout.",
    tip: "Always check the money has arrived before you verify a payment.",
  },
  {
    title: "7. Set up delivery",
    items: [
      "Write your delivery policy: areas, fees and how long it takes.",
      "In Accra, turn on Shopora Delivery so a Shopora rider collects from you and delivers to the customer's exact map pin.",
      "Customers pay the delivery fee to the rider on arrival.",
    ],
  },
  {
    title: "8. Preview, then share your store",
    body: "Open your store as a customer would and check photos, prices, delivery and payment details. Then share your link in your Instagram and TikTok bio, on WhatsApp, Facebook, business cards and flyers.",
  },
  {
    title: "9. Handle your orders",
    items: [
      "You get an alert on your phone and an email for every new order.",
      "Match the customer's payment reference with your MoMo or bank alert, then tap Verify payment.",
      "Move the order to Shipped and Delivered; customers are emailed at each step.",
      "Cancelled orders go back into stock automatically.",
    ],
  },
  {
    title: "10. Sell on WhatsApp and Instagram too (Professional)",
    items: [
      "Record an order for any WhatsApp, Instagram, phone or walk-in sale. Stock comes off so your website never oversells.",
      "Send a WhatsApp payment reminder to customers who have not paid yet.",
      "Use the share kit on any product for ready-made WhatsApp Status and Instagram images, with a caption.",
      "Keep private notes and tags on customers, like VIP or Wholesale.",
    ],
  },
  {
    title: "11. Know your numbers",
    items: [
      "Professional: sales reports by date and a monthly sales goal on your home screen.",
      "Business: add cost prices to see your profit, and download reports for Excel.",
    ],
  },
  {
    title: "12. Work as a team (Business)",
    body: "Invite staff by email under Team. Staff can handle orders, products, stock and customers, but cannot see payments, reports, billing or settings.",
  },
  {
    title: "13. Run your shop from your phone",
    body: "The Shopora app for iPhone and Android has your whole dashboard: orders, products, payments, delivery, reports and more. Log in with the same email and password.",
  },
  {
    title: "14. Your free month and billing",
    body: "Your first month is free. After that, pay your plan by MoMo or bank transfer under Billing to keep your store open.",
  },
]

export const LAUNCH_CHECKLIST = [
  "Store name and web address set",
  "Logo and cover image added",
  "Headline and description written",
  "Products added with photos, prices and stock",
  "Categories organised",
  "Payment details added",
  "Delivery policy written",
  "Contact details added",
  "Store previewed on a phone",
  "Store link shared",
]
