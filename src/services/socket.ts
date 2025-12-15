/**
 * Socket.io Client Service
 * Singleton untuk mengelola koneksi socket.io ke backend
 * Menggantikan realtimeService (BroadcastChannel) dan realtimeNet (Supabase Realtime)
 */

import io, { Socket } from 'socket.io-client';

type EventType = 'QR_SCANNED' | 'PACKAGE_ADDED' | 'PACKAGE_PICKED' | 'RELOAD_DATA' | 'PACKAGE_STATUS_UPDATED';

interface SocketEvent {
  type: EventType;
  data: any;
  timestamp: number;
}

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<EventType, Set<(data: any) => void>> = new Map();
  private url: string;
  private namespace: string;
  private token: string | null = null;

  constructor() {
    this.url = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    this.namespace = '/staff'; // Default to staff
  }

  /**
   * Initialize socket connection (staff namespace)
   */
  initStaff(token: string) {
    this.token = token;
    this.namespace = '/staff';
    this.connect();
  }

  /**
   * Initialize socket connection (customer namespace)
   */
  initCustomer(token: string) {
    this.token = token;
    this.namespace = '/customer';
    this.connect();
  }

  /**
   * Private: Create and configure socket connection
   */
  private connect() {
    if (this.socket?.connected) {
      console.log('[SocketService] Already connected');
      return;
    }

    console.log('[SocketService] Connecting to', this.url + this.namespace);

    this.socket = io(this.url + this.namespace, {
      auth: {
        token: this.token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Connection events
    this.socket.on('connect', () => {
      console.log('[SocketService] Connected to', this.namespace);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[SocketService] Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[SocketService] Connection error:', error);
    });

    // Setup event listeners
    this.setupListeners();
  }

  /**
   * Setup socket event listeners
   */
  private setupListeners() {
    if (!this.socket) return;

    // QR_SCANNED event (for staff to receive from other staff)
    this.socket.on('QR_SCANNED', (data) => {
      console.log('[SocketService] QR_SCANNED received:', data);
      this.triggerListeners('QR_SCANNED', data);
    });

    // PACKAGE_ADDED event
    this.socket.on('PACKAGE_ADDED', (data) => {
      console.log('[SocketService] PACKAGE_ADDED received:', data);
      this.triggerListeners('PACKAGE_ADDED', data);
    });

    // PACKAGE_PICKED event
    this.socket.on('PACKAGE_PICKED', (data) => {
      console.log('[SocketService] PACKAGE_PICKED received:', data);
      this.triggerListeners('PACKAGE_PICKED', data);
    });

    // RELOAD_DATA event
    this.socket.on('RELOAD_DATA', (data) => {
      console.log('[SocketService] RELOAD_DATA received:', data);
      this.triggerListeners('RELOAD_DATA', data);
    });

    // PACKAGE_STATUS_UPDATED event (for customers)
    this.socket.on('PACKAGE_STATUS_UPDATED', (data) => {
      console.log('[SocketService] PACKAGE_STATUS_UPDATED received:', data);
      this.triggerListeners('PACKAGE_STATUS_UPDATED', data);
    });
  }

  /**
   * Emit event to server
   */
  emit(event: EventType, data: any) {
    if (!this.socket?.connected) {
      console.warn('[SocketService] Socket not connected, cannot emit', event);
      return;
    }

    console.log('[SocketService] Emitting', event, data);
    this.socket.emit(event, data);
  }

  /**
   * Listen to event
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
      callbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          console.error('[SocketService] Listener error:', err);
        }
      });
    }
  }

  /**
   * Disconnect socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
      console.log('[SocketService] Disconnected');
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Singleton instance
export const socketService = new SocketService();

export default socketService;
