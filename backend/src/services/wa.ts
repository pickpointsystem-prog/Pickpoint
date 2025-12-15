import config from '../config.js';
import { query } from '../db.js';

interface WAMessage {
  to: string;
  message: string;
}

export const waService = {
  /**
   * Send WhatsApp message via configured gateway
   */
  async sendMessage(to: string, message: string): Promise<boolean> {
    try {
      // Fetch settings from DB
      const res = await query('SELECT wa_api_key, wa_endpoint FROM settings LIMIT 1');
      const settings = res.rows[0];

      if (!settings || !settings.wa_api_key || !settings.wa_endpoint) {
        console.error('[WA] Settings not configured');
        return false;
      }

      // Call WA gateway (example: MessageBird, Twilio, etc.)
      // This is a placeholder - adapt to your actual WA provider
      const response = await fetch(settings.wa_endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.wa_api_key}`,
        },
        body: JSON.stringify({
          to,
          message,
        }),
      });

      if (!response.ok) {
        console.error('[WA] Failed to send message:', await response.text());
        return false;
      }

      console.log('[WA] Message sent to:', to);
      return true;
    } catch (err) {
      console.error('[WA] Error sending message:', err);
      return false;
    }
  },

  /**
   * Send OTP via WhatsApp
   */
  async sendOTP(phoneNumber: string, otpCode: string): Promise<boolean> {
    try {
      const res = await query('SELECT wa_template_otp FROM settings LIMIT 1');
      const settings = res.rows[0];

      if (!settings || !settings.wa_template_otp) {
        console.error('[WA] OTP template not configured');
        return false;
      }

      const message = settings.wa_template_otp.replace('{code}', otpCode);
      return this.sendMessage(phoneNumber, message);
    } catch (err) {
      console.error('[WA] Error sending OTP:', err);
      return false;
    }
  },

  /**
   * Send package notification via WhatsApp
   */
  async sendPackageNotification(phoneNumber: string, packageData: any, locationName: string): Promise<boolean> {
    try {
      const res = await query('SELECT wa_template_package FROM settings LIMIT 1');
      const settings = res.rows[0];

      if (!settings || !settings.wa_template_package) {
        console.error('[WA] Package template not configured');
        return false;
      }

      const link = `https://paket.pickpoint.my.id?tracking=${packageData.tracking_number}`;
      const message = settings.wa_template_package
        .replace('{name}', packageData.recipient_name)
        .replace('{tracking}', packageData.tracking_number)
        .replace('{location}', locationName)
        .replace('{link}', link);

      return this.sendMessage(phoneNumber, message);
    } catch (err) {
      console.error('[WA] Error sending package notification:', err);
      return false;
    }
  },
};

export default waService;
