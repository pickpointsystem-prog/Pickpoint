/**
 * RealtimeService - Broadcast events antar tab/device menggunakan BroadcastChannel
 * Untuk sync events seperti: scan QR, tambah paket, pickup, dll
 */

type EventType = 'QR_SCANNED' | 'PACKAGE_ADDED' | 'PACKAGE_PICKED' | 'RELOAD_DATA';

interface RealtimeEvent {
  type: EventType;
  data: any;
  timestamp: number;
  deviceId: string;
}

class RealtimeService {
  private channel: BroadcastChannel | null = null;
  private deviceId: string;
  private listeners: Map<EventType, Set<(data: any) => void>> = new Map();

  constructor() {
    this.deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Check if BroadcastChannel is supported
    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel('pickpoint_realtime');
      this.channel.onmessage = (event: MessageEvent<RealtimeEvent>) => {
        // Jangan proses event dari device sendiri
        if (event.data.deviceId === this.deviceId) return;
        
        console.log('[RealtimeService] Received event:', event.data);
        this.triggerListeners(event.data.type, event.data.data);
      };
    } else {
      console.warn('[RealtimeService] BroadcastChannel not supported, using localStorage fallback');
      // Fallback to localStorage events
      window.addEventListener('storage', (e) => {
        if (e.key === 'pickpoint_realtime_event' && e.newValue) {
          try {
            const event: RealtimeEvent = JSON.parse(e.newValue);
            if (event.deviceId === this.deviceId) return;
            this.triggerListeners(event.type, event.data);
          } catch (err) {
            console.error('[RealtimeService] Failed to parse storage event:', err);
          }
        }
      });
    }
  }

  /**
   * Broadcast event ke semua device/tab lain
   */
  broadcast(type: EventType, data: any) {
    const event: RealtimeEvent = {
      type,
      data,
      timestamp: Date.now(),
      deviceId: this.deviceId
    };

    if (this.channel) {
      this.channel.postMessage(event);
    } else {
      // Fallback: localStorage
      localStorage.setItem('pickpoint_realtime_event', JSON.stringify(event));
      // Clear immediately to allow same event again
      setTimeout(() => localStorage.removeItem('pickpoint_realtime_event'), 100);
    }

    console.log('[RealtimeService] Broadcasted event:', event);
  }

  /**
   * Listen to specific event type
   */
  on(type: EventType, callback: (data: any) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(type)?.delete(callback);
    };
  }

  /**
   * Trigger all listeners for an event type
   */
  private triggerListeners(type: EventType, data: any) {
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      callbacks.forEach(cb => {
        try {
          cb(data);
        } catch (err) {
          console.error('[RealtimeService] Listener error:', err);
        }
      });
    }
  }

  /**
   * Close connection
   */
  close() {
    if (this.channel) {
      this.channel.close();
    }
    this.listeners.clear();
  }

  /**
   * Get current device ID
   */
  getDeviceId() {
    return this.deviceId;
  }
}

// Singleton instance
export const realtimeService = new RealtimeService();

export default RealtimeService;
