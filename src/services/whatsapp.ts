import { AppSettings, Package, Location, Customer } from '../types';
import config from '../config/environment';

// Generic helper to send raw message
const sendRawMessage = async (phone: string, message: string, settings: AppSettings): Promise<{success: boolean, error?: string}> => {
  // Format Phone Number: Ensure it starts with 62, remove non-digits
  let formattedPhone = phone.replace(/\D/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '62' + formattedPhone.substring(1);
  } else if (!formattedPhone.startsWith('62')) {
    // If user enters 812..., prefix 62
    formattedPhone = '62' + formattedPhone;
  }

  const payload = {
    api_key: settings.waApiKey,
    sender: settings.waSender,
    number: formattedPhone,
    message: message
  };

  try {
    const endpoint = settings.waEndpoint || config.whatsappApiUrl;
    console.log(`[WA Gateway] Endpoint: ${endpoint} | Sending to ${formattedPhone}...`);

    // If endpoint is relative to /api (proxy style) ensure we prepend origin in development
    const finalEndpoint = endpoint.startsWith('/') ? `${window.location.origin}${endpoint}` : endpoint;
    const response = await fetch(finalEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    // Check for HTTP errors (like 404, 500)
    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status} ${response.statusText} | Body: ${errorBody.slice(0,300)}`);
    }

    // Try read JSON; if fails, read text for diagnostics
    let data: any;
    try {
      data = await response.json();
    } catch {
      const text = await response.text();
      console.error('[WA Gateway] Non-JSON response:', text);
      return { success: false, error: 'Respon gateway tidak valid (format bukan JSON)' };
    }
    
    if (data.status === true) {
      console.log('[WA Gateway] Success:', data);
      return { success: true };
    } else {
      console.error('[WA Gateway] API Error:', data);
      return { success: false, error: data.msg || 'Kesalahan API tidak diketahui' };
    }

  } catch (error: any) {
    console.error("[WA Gateway] Network/Fetch Failed", error);
    let errMsg = error.message;
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      errMsg = "Kesalahan jaringan: kemungkinan masalah CORS atau endpoint tidak dapat dijangkau. Pertimbangkan penggunaan proxy server (Vercel/Cloudflare) untuk menghindari CORS.";
    }
    return { success: false, error: errMsg };
  }
};

export const WhatsAppService = {
  // 1. New Package Notification
  sendNotification: async (pkg: Package, location: Location, settings: AppSettings): Promise<boolean> => {
    // Use environment-aware public domain
    const sanitizedDomain = config.publicDomain.replace(/^https?:\/\//, '');
    const isLocalDomain = /localhost|127\.0\.0\.1|0\.0\.0\.0/.test(sanitizedDomain);
    const protocol = isLocalDomain ? 'http' : 'https';
    const publicUrl = `${protocol}://${sanitizedDomain}`;
    
    // Link pembayaran untuk notifikasi paket baru
    const paymentLink = `${publicUrl}/payment?ids=${pkg.id}`;
    
    let message = settings.waTemplatePackage || '';
    message = message
      .replace('{name}', pkg.recipientName)
      .replace('{tracking}', pkg.trackingNumber)
      .replace('{location}', location.name)
      .replace('{code}', pkg.trackingNumber)
      .replace('{link}', paymentLink);

    const result = await sendRawMessage(pkg.recipientPhone, message, settings);
    
    if (config.enableDebugMode) {
      console.log('📱 WhatsApp Notification:', {
        environment: config.env,
        recipient: pkg.recipientPhone,
        tracking: pkg.trackingNumber,
        link: paymentLink,
        success: result.success
      });
    }
    
    return result.success;
  },

  // 2. Member Activation Notification
  sendMemberActivation: async (customer: Customer, locationName: string, settings: AppSettings): Promise<boolean> => {
    if (!customer.membershipExpiry) return false;

    let message = settings.waTemplateMember || '';
    const expiryDate = new Date(customer.membershipExpiry).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    message = message
        .replace('{name}', customer.name)
        .replace('{location}', locationName)
        .replace('{expiry}', expiryDate);

    const result = await sendRawMessage(customer.phoneNumber, message, settings);
    return result.success;
  },

  // 3. Test Notification
  sendTestMessage: async (targetPhone: string, settings: AppSettings): Promise<{success: boolean, error?: string}> => {
    const time = new Date().toLocaleString();
    const message = `*TEST NOTIFIKASI*\n\nSistem: Pickpoint Dashboard\nWaktu: ${time}\nStatus: Tersambung ✅`;
    
    return await sendRawMessage(targetPhone, message, settings);
  }
};
