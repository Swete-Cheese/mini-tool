interface Env {
  SHARE_DATA: KVNamespace;
}

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function generateToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 8; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

export async function onRequest(context: { request: Request; env: Env }) {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  const url = new URL(context.request.url);
  const token = url.searchParams.get('token');

  // GET — retrieve share data by token
  if (context.request.method === 'GET' && token) {
    const data = await context.env.SHARE_DATA.get(token);
    if (!data) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }
    return new Response(data, {
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  }

  // POST — store share data, return token
  if (context.request.method === 'POST') {
    const body = await context.request.json();
    const newToken = generateToken();
    await context.env.SHARE_DATA.put(newToken, JSON.stringify(body), { expirationTtl: 86400 * 30 });
    return new Response(JSON.stringify({ token: newToken }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}
