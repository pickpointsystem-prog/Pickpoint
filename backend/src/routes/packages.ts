import { Router, Response } from 'express';
import { query } from '../db.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import waService from '../services/wa.js';

const router = Router();

/**
 * GET /api/packages
 * List packages for location (staff) or all packages for customer
 */
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { locationId, status, phone } = req.query;

    let sql = 'SELECT * FROM packages WHERE 1=1';
    const params: any[] = [];

    if (req.user?.role === 'STAFF') {
      // Staff sees only packages for their location
      sql += ' AND location_id = $1';
      params.push(req.user?.id);
    } else if (req.user?.role === 'CUSTOMER') {
      // Customer sees only their packages
      sql += ' AND recipient_phone = $1';
      params.push(phone || req.user?.phoneNumber);
    }

    if (status) {
      sql += ` AND status = $${params.length + 1}`;
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC LIMIT 100';

    const res_packages = await query(sql, params);
    res.json(res_packages.rows);
  } catch (err) {
    console.error('[Packages] GET error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/packages/:id
 * Get package details
 */
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const res_pkg = await query('SELECT * FROM packages WHERE id = $1', [id]);
    if (res_pkg.rows.length === 0) {
      return res.status(404).json({ error: 'Package not found' });
    }

    res.json(res_pkg.rows[0]);
  } catch (err) {
    console.error('[Packages] GET detail error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/packages
 * Create new package (staff only)
 */
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'STAFF' && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: staff only' });
    }

    const {
      trackingNumber,
      recipientName,
      recipientPhone,
      unitNumber,
      courier,
      size,
      locationId,
    } = req.body;

    if (!trackingNumber || !recipientName || !recipientPhone || !unitNumber || !courier || !size) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const packageId = `pkg_${Date.now()}`;
    const now = new Date().toISOString();

    await query(
      `INSERT INTO packages (
        id, tracking_number, recipient_name, recipient_phone, unit_number,
        courier, size, location_id, status, dates, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        packageId,
        trackingNumber,
        recipientName,
        recipientPhone,
        unitNumber,
        courier,
        size,
        locationId || 'loc_demo',
        'ARRIVED',
        JSON.stringify({ arrivedAt: now }),
        now,
      ]
    );

    // Send notification via WA
    const loc_res = await query('SELECT name FROM locations WHERE id = $1', [locationId]);
    const locationName = loc_res.rows[0]?.name || 'PickPoint';
    waService.sendPackageNotification(recipientPhone, { tracking_number: trackingNumber, recipient_name: recipientName }, locationName);

    res.status(201).json({ id: packageId, message: 'Package created' });
  } catch (err) {
    console.error('[Packages] POST error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/packages/:id
 * Update package status (staff only)
 */
router.patch('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'STAFF' && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: staff only' });
    }

    const { id } = req.params;
    const { status, photoUrl, pickupCode } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status required' });
    }

    const pkg_res = await query('SELECT * FROM packages WHERE id = $1', [id]);
    if (pkg_res.rows.length === 0) {
      return res.status(404).json({ error: 'Package not found' });
    }

    const pkg = pkg_res.rows[0];
    const dates = JSON.parse(pkg.dates || '{}');

    if (status === 'PICKED') {
      dates.pickedAt = new Date().toISOString();
    }

    await query(
      'UPDATE packages SET status = $1, dates = $2, photo = $3, pickup_code = $4 WHERE id = $5',
      [status, JSON.stringify(dates), photoUrl || null, pickupCode || null, id]
    );

    res.json({ message: 'Package updated' });
  } catch (err) {
    console.error('[Packages] PATCH error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
