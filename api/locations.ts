import type { VercelRequest, VercelResponse } from "@vercel/node";

let LOCATIONS: any[] = [];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, data: LOCATIONS });
  }
  if (req.method === 'POST') {
    const body = req.body || [];
    LOCATIONS = Array.isArray(body) ? body : LOCATIONS;
    return res.status(200).json({ ok: true });
  }
  return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
}
