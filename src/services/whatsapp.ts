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
    console.log(`[WA Gateway] Sending to ${formattedPhone}...`);
    
    const response = await fetch(settings.waEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    // Check for HTTP errors (like 404, 500)
    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.status === true) {
      console.log('[WA Gateway] Success:', data);
      return { success: true };
    } else {
      console.error('[WA Gateway] API Error:', data);
      return { success: false, error: data.msg || 'Unknown API Error' };
    }

  } catch (error: any) {
    console.error("[WA Gateway] Network/Fetch Failed", error);
    let errMsg = error.message;
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        errMsg = "Network Error: Possible CORS issue or Endpoint unreachable. If using browser, check console.";
    }
    return { success: false, error: errMsg };
  }
};

export const WhatsAppService = {
  // 1. New Package Notification
  sendNotification: async (pkg: Package, location: Location, settings: AppSettings): Promise<boolean> => {
    // Use environment-aware public domain
    const publicUrl = config.env === 'development' 
      ? `http://${config.publicDomain}`
      : `https://${config.publicDomain}`;
    
    const pickupLink = `${publicUrl}/tracking?id=${pkg.trackingNumber}`;
    
    let message = settings.waTemplatePackage || '';
    message = message
      .replace('{name}', pkg.recipientName)
      .replace('{tracking}', pkg.trackingNumber)
      .replace('{location}', location.name)
      // Note: We intentionally do not use {code} in the new template design as requested
      // but if the user adds it back to the template, it will work.
      .replace('{code}', pkg.pickupCode) 
      .replace('{link}', pickupLink);

    const result = await sendRawMessage(pkg.recipientPhone, message, settings);
    
    if (config.enableDebugMode) {
      console.log('📱 WhatsApp Notification:', {
        environment: config.env,
        recipient: pkg.recipientPhone,
        tracking: pkg.trackingNumber,
        link: pickupLink,
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
    const message = `*TEST NOTIFICATION*\n\nSystem: Pickpoint Dashboard\nTime: ${time}\nStatus: Connected ✅`;
    
    return await sendRawMessage(targetPhone, message, settings);
  }
};
