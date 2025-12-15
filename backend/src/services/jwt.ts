import jwt from 'jsonwebtoken';
import config from './config.js';

interface TokenPayload {
  id: string;
  phoneNumber?: string;
  username?: string;
  role?: string;
  type: 'access' | 'refresh';
}

export const jwtService = {
  /**
   * Sign access token (staff/admin)
   */
  signAccessToken(payload: Omit<TokenPayload, 'type'>) {
    return jwt.sign(
      { ...payload, type: 'access' },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRY }
    );
  },

  /**
   * Sign refresh token
   */
  signRefreshToken(payload: Omit<TokenPayload, 'type'>) {
    return jwt.sign(
      { ...payload, type: 'refresh' },
      config.JWT_REFRESH_SECRET,
      { expiresIn: config.JWT_REFRESH_EXPIRY }
    );
  },

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): TokenPayload | null {
    try {
      const payload = jwt.verify(token, config.JWT_SECRET) as TokenPayload;
      if (payload.type !== 'access') return null;
      return payload;
    } catch (err) {
      return null;
    }
  },

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): TokenPayload | null {
    try {
      const payload = jwt.verify(token, config.JWT_REFRESH_SECRET) as TokenPayload;
      if (payload.type !== 'refresh') return null;
      return payload;
    } catch (err) {
      return null;
    }
  },

  /**
   * Extract token from Authorization header
   */
  extractToken(authHeader?: string): string | null {
    if (!authHeader) return null;
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
    return parts[1];
  },
};

export default jwtService;
