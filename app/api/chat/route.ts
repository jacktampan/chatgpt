import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { saveChat, loadChat, deleteChat } from '@/lib/kv-storage';
import { nanoid } from 'nanoid';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages, chatId } = await req.json();
  const id = chatId || nanoid();

  const result = streamText({
    model: openai('gpt-3.5-turbo'),
    messages,
    onCompletion: async (completion) => {
      const updatedMessages = [...messages, { role: 'assistant', content: completion }];
      await saveChat(id, updatedMessages);
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

