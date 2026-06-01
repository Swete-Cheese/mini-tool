import type { ShareData } from './shareLink';

const BUCKET = 'nda-share-k29xm7dw';
const BASE = `https://kvdb.io/${BUCKET}`;

function generateToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 8; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

export async function storeShareData(data: ShareData): Promise<string> {
  const token = generateToken();
  const res = await fetch(`${BASE}/${token}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('存储分享数据失败');
  return token;
}

export async function retrieveShareData(token: string): Promise<ShareData | null> {
  try {
    const res = await fetch(`${BASE}/${token}`);
    if (!res.ok) return null;
    return JSON.parse(await res.text());
  } catch {
    return null;
  }
}
