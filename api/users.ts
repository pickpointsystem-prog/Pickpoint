import type { VercelRequest, VercelResponse } from "@vercel/node";

let USERS: any[] = [];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, data: USERS });
  }
  if (req.method === 'POST') {
    const body = req.body || [];
    USERS = Array.isArray(body) ? body : USERS;
    return res.status(200).json({ ok: true });
  }
  return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
}
