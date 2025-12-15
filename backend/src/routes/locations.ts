import { Router, Response } from 'express';
import { query } from '../db.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/locations
 * List all locations
 */
router.get('/', async (req: Response) => {
  try {
    const res_locs = await query('SELECT id, name FROM locations ORDER BY name');
    res.json(res_locs.rows);
  } catch (err) {
    console.error('[Locations] GET error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/locations
 * Create location (admin only)
 */
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: admin only' });
    }

    const { name, pricing } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name required' });
    }

    const id = `loc_${Date.now()}`;

    await query(
      'INSERT INTO locations (id, name, pricing) VALUES ($1, $2, $3)',
      [id, name, JSON.stringify(pricing || {})]
    );

    res.status(201).json({ id, message: 'Location created' });
  } catch (err) {
    console.error('[Locations] POST error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
