import bcrypt from 'bcrypt';

export const hashService = {
  /**
   * Hash password
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  },

  /**
   * Compare password with hash
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },

  /**
   * Generate OTP (6 digits)
   */
  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },
};

export default hashService;
