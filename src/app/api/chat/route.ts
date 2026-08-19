import { openai } from '@ai-sdk/openai';
import { streamText, convertToModelMessages, UIMessage } from 'ai';
import { db } from '@/lib/db';
import { getStoreByHost } from '@/lib/tenant';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // The new AI SDK v4 sends messages as UIMessage[] in the 'messages' field
    const messages: UIMessage[] = body.messages ?? [];
    const { storeId, domain } = body;

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
      where: { storeId: store.id, status: 'ACTIVE', visibility: 'VISIBLE' },
      take: 20,
      select: {
        name: true,
        description: true,
        price: true,
        variants: { select: { price: true }, take: 1 },
        categories: { select: { name: true } }
      }
    });

    const productsContext = products.length > 0
      ? products.map(p => `- ${p.name} ($${p.variants[0]?.price ?? p.price ?? 'N/A'}): ${p.description || 'No description'} [Categories: ${p.categories.map(c => c.name).join(', ') || 'Uncategorized'}]`).join('\n')
      : 'No products currently available.';

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
      messages: convertToModelMessages(messages),
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('AI Chat Error:', error);
    return new Response('Error processing chat request', { status: 500 });
  }
}
