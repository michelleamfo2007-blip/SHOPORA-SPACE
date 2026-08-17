const fs = require('fs');
const files = [
  'src/app/(dashboard)/[storeId]/billing/page.tsx',
  'src/app/(dashboard)/[storeId]/categories/page.tsx',
  'src/app/(dashboard)/[storeId]/customers/page.tsx',
  'src/app/(dashboard)/[storeId]/orders/page.tsx',
  'src/app/(dashboard)/[storeId]/settings/page.tsx',
  'src/app/(dashboard)/[storeId]/products/[productId]/page.tsx',
  'src/app/(dashboard)/[storeId]/products/new/page.tsx',
  'src/app/(dashboard)/[storeId]/settings/payments/page.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  
  // Fix auth
  if (content.includes('import { auth } from "@/auth"')) {
    content = content.replace('import { auth } from "@/auth"', 'import { getServerSession } from "next-auth/next";\nimport { authOptions } from "@/auth";');
    content = content.replace(/await auth\(\)/g, 'await getServerSession(authOptions)');
  }
  
  // Fix single param
  if (content.includes('params: { storeId: string }')) {
    content = content.replace('params: { storeId: string }', 'params: Promise<{ storeId: string }>');
    content = content.replace(/\{ params \}: \{ params: Promise<\{ storeId: string \}> \}\) \{/g, '{ params }: { params: Promise<{ storeId: string }> }) {\n  const { storeId } = await params;');
    content = content.replace(/params\.storeId/g, 'storeId');
  }

  // Fix double params
  if (content.includes('params: { storeId: string; productId: string }')) {
    content = content.replace('params: { storeId: string; productId: string }', 'params: Promise<{ storeId: string; productId: string }>');
    content = content.replace(/\{ params \}: \{ params: Promise<\{ storeId: string; productId: string \}> \}\) \{/g, '{ params }: { params: Promise<{ storeId: string; productId: string }> }) {\n  const { storeId, productId } = await params;');
    content = content.replace(/params\.storeId/g, 'storeId');
    content = content.replace(/params\.productId/g, 'productId');
  }

  fs.writeFileSync(file, content, 'utf8');
}
