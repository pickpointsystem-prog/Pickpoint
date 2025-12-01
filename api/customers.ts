import type { VercelRequest, VercelResponse } from "@vercel/node";

let CUSTOMERS: any[] = [];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, data: CUSTOMERS });
  }
  if (req.method === 'POST') {
    const body = req.body || [];
    CUSTOMERS = Array.isArray(body) ? body : CUSTOMERS;
    return res.status(200).json({ ok: true });
  }
  return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
}
