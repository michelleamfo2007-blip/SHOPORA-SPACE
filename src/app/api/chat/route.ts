import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { db } from '@/lib/db';
import { getStoreByHost } from '@/lib/tenant';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, storeId, domain } = await req.json();

    let store;
    if (domain) {
      store = await getStoreByHost(domain);
    } else if (storeId) {
      store = await db.store.findUnique({ where: { id: storeId } });
    }

    if (!store) {
      return new Response('Store not found', { status: 404 });
    }

    // Fetch store products to provide context to the AI
    const products = await db.product.findMany({
      where: { storeId: store.id, isArchived: false },
      take: 20,
      select: { name: true, price: true, description: true, category: { select: { name: true } } }
    });

    const productsContext = products.map(p => `- ${p.name} ($${p.price.toString()}): ${p.description || ''} [Category: ${p.category.name}]`).join('\n');

    const systemPrompt = `You are a friendly, helpful AI shopping assistant for a store called "${store.name}".
Your goal is to help customers find the perfect products for their needs. Be concise, polite, and enthusiastic.
Only recommend products that are actually available in this store. Do not invent products.

Available products in our store:
${productsContext}

If a user asks for something we don't have, politely let them know and recommend the closest alternative from our available products.
Keep your responses relatively short and easy to read. Use emojis occasionally.`;

    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('AI Chat Error:', error);
    return new Response('Error processing chat request', { status: 500 });
  }
}
