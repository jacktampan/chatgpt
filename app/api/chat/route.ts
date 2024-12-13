import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { saveChat, loadChat, deleteChat, getRateLimit, updateRateLimit } from '@/lib/edge-config-storage';
import { nanoid } from 'nanoid';

export const runtime = 'edge';

const TOKEN_LIMIT = 450000;
const REQUEST_LIMIT = 4500;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds

export async function POST(req: Request) {
  const { messages, chatId } = await req.json();
  const id = chatId || nanoid();

  // Check rate limits
  const { tokens, requests, timestamp } = await getRateLimit();
  const now = Date.now();

  if (now - timestamp > RATE_LIMIT_WINDOW) {
    // Reset rate limits if the window has passed
    await updateRateLimit(0, 0, now);
  } else if (tokens >= TOKEN_LIMIT || requests >= REQUEST_LIMIT) {
    return new Response('Rate limit exceeded', { status: 429 });
  }

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    onCompletion: async (completion) => {
      const updatedMessages = [...messages, { role: 'assistant', content: completion }];
      await saveChat(id, updatedMessages);

      // Update rate limits
      const newTokens = tokens + completion.length;
      const newRequests = requests + 1;
      await updateRateLimit(newTokens, newRequests, timestamp);
    },
  });

  return result.toDataStreamResponse({
    headers: {
      'X-Chat-Id': id,
    },
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const chatId = url.searchParams.get('chatId');

  if (!chatId) {
    return new Response('Chat ID is required', { status: 400 });
  }

  const messages = await loadChat(chatId);
  return new Response(JSON.stringify(messages), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const chatId = url.searchParams.get('chatId');

  if (!chatId) {
    return new Response('Chat ID is required', { status: 400 });
  }

  try {
    await deleteChat(chatId);
    return new Response('Chat history cleared', { status: 200 });
  } catch (error) {
    console.error('Error deleting chat history:', error);
    return new Response('Failed to clear chat history', { status: 500 });
  }
}

