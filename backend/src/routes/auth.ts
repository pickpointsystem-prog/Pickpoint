import { Router, Request, Response } from 'express';
import { query } from '../db.js';
import jwtService from '../services/jwt.js';
import hashService from '../services/hash.js';
import waService from '../services/wa.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import config from '../config.js';

const router = Router();

/**
 * POST /api/auth/staff-login
 * Staff/Admin login with username + password
 */
router.post('/staff-login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Find user
    const res_user = await query('SELECT * FROM users WHERE username = $1', [username]);
    if (res_user.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = res_user.rows[0];

    // Compare password
    const isValid = await hashService.comparePassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = jwtService.signAccessToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    const refreshToken = jwtService.signRefreshToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    // Log activity
    await query(
      `INSERT INTO activities (id, type, description, timestamp, user_id, user_name) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        `act_${Date.now()}`,
        'LOGIN',
        `${user.name} logged in`,
        new Date().toISOString(),
        user.id,
        user.name,
      ]
    );

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        locationId: user.location_id,
      },
    });
  } catch (err) {
    console.error('[Auth] Staff login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/customer-register
 * Customer registration: phone + name + unit_number
 * Generates OTP and sends via WA
 */
router.post('/customer-register', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, name, unitNumber, locationId } = req.body;

    if (!phoneNumber || !name || !unitNumber) {
      return res.status(400).json({ error: 'Phone number, name, and unit number required' });
    }

    // Check if customer exists
    const res_existing = await query('SELECT id FROM customers WHERE phone_number = $1', [phoneNumber]);
    if (res_existing.rows.length > 0) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }

    // Generate OTP
    const otpCode = hashService.generateOTP();
    const otpExpiry = new Date(Date.now() + config.OTP_EXPIRY_MINUTES * 60 * 1000);

    // Create customer
    const customerId = `cust_${Date.now()}`;
    await query(
      `INSERT INTO customers (id, phone_number, name, unit_number, location_id, otp_code, otp_expiry) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [customerId, phoneNumber, name, unitNumber, locationId || 'loc_demo', otpCode, otpExpiry]
    );

    // Send OTP via WA
    const sent = await waService.sendOTP(phoneNumber, otpCode);

    res.json({
      message: 'OTP sent via WhatsApp',
      customerId,
      otpSent: sent,
    });
  } catch (err) {
    console.error('[Auth] Customer register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/verify-otp
 * Verify OTP and return access token
 */
router.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, otpCode } = req.body;

    if (!phoneNumber || !otpCode) {
      return res.status(400).json({ error: 'Phone number and OTP required' });
    }

    // Find customer
    const res_cust = await query(
      'SELECT * FROM customers WHERE phone_number = $1',
      [phoneNumber]
    );

    if (res_cust.rows.length === 0) {
      return res.status(401).json({ error: 'Customer not found' });
    }

    const customer = res_cust.rows[0];

    // Check OTP
    if (customer.otp_code !== otpCode || new Date() > customer.otp_expiry) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    // Clear OTP and update last_login
    await query(
      'UPDATE customers SET otp_code = NULL, otp_expiry = NULL, last_login_at = NOW() WHERE id = $1',
      [customer.id]
    );

    // Generate token (no PIN yet, customer will set PIN on next step)
    const accessToken = jwtService.signAccessToken({
      id: customer.id,
      phoneNumber: customer.phone_number,
      role: 'CUSTOMER',
    });

    res.json({
      accessToken,
      customer: {
        id: customer.id,
        phoneNumber: customer.phone_number,
        name: customer.name,
        isPinSet: !!customer.pin,
      },
    });
  } catch (err) {
    console.error('[Auth] Verify OTP error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/set-pin
 * Customer sets PIN after OTP verification
 * Requires access token
 */
router.post('/set-pin', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { pin } = req.body;
    const customerId = req.user?.id;

    if (!pin || pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
      return res.status(400).json({ error: 'PIN must be 4-6 digits' });
    }

    // Hash PIN
    const pinHash = await hashService.hashPassword(pin);

    // Update customer
    await query('UPDATE customers SET pin = $1 WHERE id = $2', [pinHash, customerId]);

    res.json({ message: 'PIN set successfully' });
  } catch (err) {
    console.error('[Auth] Set PIN error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/customer-login
 * Customer login with phone + PIN
 */
router.post('/customer-login', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, pin } = req.body;

    if (!phoneNumber || !pin) {
      return res.status(400).json({ error: 'Phone number and PIN required' });
    }

    // Find customer
    const res_cust = await query(
      'SELECT * FROM customers WHERE phone_number = $1',
      [phoneNumber]
    );

    if (res_cust.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const customer = res_cust.rows[0];

    // Check if PIN is set
    if (!customer.pin) {
      return res.status(401).json({ error: 'PIN not set. Please complete registration first.' });
    }

    // Compare PIN
    const isValid = await hashService.comparePassword(pin, customer.pin);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await query(
      'UPDATE customers SET last_login_at = NOW() WHERE id = $1',
      [customer.id]
    );

    // Generate token
    const accessToken = jwtService.signAccessToken({
      id: customer.id,
      phoneNumber: customer.phone_number,
      role: 'CUSTOMER',
    });

    res.json({
      accessToken,
      customer: {
        id: customer.id,
        phoneNumber: customer.phone_number,
        name: customer.name,
        isMember: customer.is_member,
      },
    });
  } catch (err) {
    console.error('[Auth] Customer login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const payload = jwtService.verifyRefreshToken(refreshToken);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Generate new access token
    const accessToken = jwtService.signAccessToken({
      id: payload.id,
      phoneNumber: payload.phoneNumber,
      username: payload.username,
      role: payload.role,
    });

    res.json({ accessToken });
  } catch (err) {
    console.error('[Auth] Refresh error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
