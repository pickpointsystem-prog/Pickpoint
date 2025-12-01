import type { VercelRequest, VercelResponse } from "@vercel/node";

// Simple in-memory store (stateless across invocations). Replace with DB later.
let SETTINGS_CACHE: any | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, data: SETTINGS_CACHE });
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    SETTINGS_CACHE = body;
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
}
