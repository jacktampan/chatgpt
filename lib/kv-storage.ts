import { kv } from '@vercel/kv';

const kvStore = kv({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export async function saveChat(chatId: string, messages: any[]) {
  await kvStore.set(chatId, JSON.stringify(messages));
}

export async function loadChat(chatId: string): Promise<any[]> {
  const data = await kvStore.get<string>(chatId);
  return data ? JSON.parse(data) : [];
}

export async function deleteChat(chatId: string) {
  await kvStore.del(chatId);
}

