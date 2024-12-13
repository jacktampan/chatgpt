import fs from 'fs/promises';
import path from 'path';

const STORAGE_DIR = path.join(process.cwd(), 'chat_storage');

export async function saveChat(chatId: string, messages: any[]) {
  await fs.mkdir(STORAGE_DIR, { recursive: true });
  const filePath = path.join(STORAGE_DIR, `${chatId}.json`);
  await fs.writeFile(filePath, JSON.stringify(messages, null, 2));
}

export async function loadChat(chatId: string): Promise<any[]> {
  const filePath = path.join(STORAGE_DIR, `${chatId}.json`);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

