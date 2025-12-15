import { Request, Response, NextFunction } from 'express';
import jwtService from '../services/jwt.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    phoneNumber?: string;
    username?: string;
    role?: string;
  };
}

/**
 * Verify JWT token from Authorization header
 */
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtService.extractToken(authHeader);

    if (!token) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const payload = jwtService.verifyAccessToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = {
      id: payload.id,
      phoneNumber: payload.phoneNumber,
      username: payload.username,
      role: payload.role,
    };

    next();
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Require specific role (for admin operations)
 */
export const requireRole = (role: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
    }
    next();
  };
};

export default authMiddleware;
