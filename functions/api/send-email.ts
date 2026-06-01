interface EmailRequestBody {
  to: string;
  from_name: string;
  from_email: string;
  project_name: string;
  pdf_data_url: string;
}

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function onRequest(context: { request: Request; env: { RESEND_API_KEY?: string } }) {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  }

  const apiKey = context.env.RESEND_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  }

  try {
    const body: EmailRequestBody = await context.request.json();

    if (!body.pdf_data_url || !body.project_name) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    const recipient = body.to || '815143231@qq.com';
    // jsPDF may output: data:application/pdf;filename=xxx;base64,...
    const pdfBase64 = body.pdf_data_url.replace(/^data:[^,]*,/, '');

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'NDA签署工具 <onboarding@resend.dev>',
        to: [recipient],
        subject: `【NDA签署完成】${body.project_name}`,
        html: `<p>您发起的保密协议「${body.project_name}」已被 <strong>${body.from_name}</strong>（${body.from_email}）在线签署完成。</p>
               <p>签署时间：${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}</p>
               <p>完整签署版PDF请见附件。</p>`,
        attachments: [
          {
            filename: `${body.project_name}_签署版.pdf`,
            content: pdfBase64,
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return new Response(JSON.stringify({ error: 'Resend API error', detail: errText }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  }
}
