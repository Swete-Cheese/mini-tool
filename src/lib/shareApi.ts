import type { ShareData } from './shareLink';

export async function storeShareData(data: ShareData): Promise<string> {
  const res = await fetch('/api/share', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('存储分享数据失败');
  const result = await res.json();
  return result.token;
}

export async function retrieveShareData(token: string): Promise<ShareData | null> {
  try {
    const res = await fetch(`/api/share?token=${encodeURIComponent(token)}`);
    if (!res.ok) return null;
    return JSON.parse(await res.text());
  } catch {
    return null;
  }
}
