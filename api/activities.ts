import type { VercelRequest, VercelResponse } from "@vercel/node";

let ACTIVITIES: any[] = [];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, data: ACTIVITIES });
  }
  if (req.method === 'POST') {
    const body = req.body || [];
    ACTIVITIES = Array.isArray(body) ? body : ACTIVITIES;
    return res.status(200).json({ ok: true });
  }
  return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
}
