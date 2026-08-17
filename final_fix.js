const fs = require('fs');

// Fix checkout.ts
let checkout = fs.readFileSync('src/server/actions/checkout.ts', 'utf8');
if (!checkout.includes('orderNumber:')) {
  checkout = checkout.replace('totalAmount,', 'orderNumber: `ORD-${Date.now().toString().slice(-6)}`,\n      totalAmount,');
  fs.writeFileSync('src/server/actions/checkout.ts', checkout);
}

// Fix paystack
let paystack = fs.readFileSync('src/app/api/webhooks/paystack/route.ts', 'utf8');
paystack = paystack.replace('status: "PAID"', 'status: "PROCESSING"');
paystack = paystack.replace(/console\.log\(\`Order \$\{updatedOrder\.id\} marked as PAID.*\`\)/, 'console.log(`Order ${updatedOrder.id} marked as PROCESSING`)');
fs.writeFileSync('src/app/api/webhooks/paystack/route.ts', paystack);

// Fix platform route
let platform = fs.readFileSync('src/app/api/webhooks/platform/[provider]/route.ts', 'utf8');
platform = platform.replace('provider.toUpperCase()', 'String(provider).toUpperCase()');
fs.writeFileSync('src/app/api/webhooks/platform/[provider]/route.ts', platform);
