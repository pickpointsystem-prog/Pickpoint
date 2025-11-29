import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(405).json({ status: false, msg: 'Method Not Allowed' });
  }

  try {
    const { api_key, sender, number, message, endpoint } = req.body || {};

    const target = endpoint || process.env.WA_GATEWAY_URL;
    if (!target) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(400).json({ status: false, msg: 'Missing gateway endpoint (provide in body.endpoint or env WA_GATEWAY_URL)' });
    }

    const payload = { api_key, sender, number, message };

    const resp = await fetch(target, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(api_key ? { Authorization: `Bearer ${api_key}` } : {})
      },
      body: JSON.stringify(payload)
    });

    const text = await resp.text();
    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      // Return text if upstream is not JSON
      json = { status: resp.ok, msg: text };
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(resp.status).json(json);
  } catch (err: any) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({ status: false, msg: err?.message || 'Proxy error' });
  }
}
