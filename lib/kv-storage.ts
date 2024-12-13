import { kv } from '@vercel/kv';

export async function saveChat(chatId: string, messages: any[]) {
  await kv.set(chatId, JSON.stringify(messages));
}

export async function loadChat(chatId: string): Promise<any[]> {
  const data = await kv.get<string>(chatId);
  return data ? JSON.parse(data) : [];
}

export async function deleteChat(chatId: string) {
  await kv.del(chatId);
}

