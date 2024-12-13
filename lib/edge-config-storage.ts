import { get, set, del } from '@vercel/edge-config';

export async function saveChat(chatId: string, messages: any[]) {
  await set(chatId, messages);
}

export async function loadChat(chatId: string): Promise<any[]> {
  const data = await get(chatId);
  return data || [];
}

export async function deleteChat(chatId: string) {
  await del(chatId);
}

export async function getRateLimit(): Promise<{ tokens: number; requests: number; timestamp: number }> {
  const rateLimit = await get('rateLimit');
  return rateLimit || { tokens: 0, requests: 0, timestamp: Date.now() };
}

export async function updateRateLimit(tokens: number, requests: number, timestamp: number) {
  await set('rateLimit', { tokens, requests, timestamp });
}

