import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const client = (SUPABASE_URL && SUPABASE_ANON_KEY) ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

type EventType = 'QR_SCANNED' | 'PACKAGE_ADDED' | 'PACKAGE_PICKED' | 'RELOAD_DATA';

interface NetEvent<T = any> {
  type: EventType;
  data: T;
  timestamp: number;
  userId?: string; // ID user yang broadcast (untuk filter per staff)
}

type Listener = (data: any, event?: NetEvent) => void;

class RealtimeNetService {
  private listeners: Map<EventType, Set<Listener>> = new Map();
  private subscribed = false;

  /** Subscribe to Supabase Realtime channel */
  subscribe() {
    if (this.subscribed) return;
    if (!client) {
      console.error('[RealtimeNet] Supabase client not initialized');
      return;
    }
    const channel = client.channel('pickpoint_realtime');
    channel.on('broadcast', { event: 'pp_event' }, (payload: any) => {
      try {
        const ev = payload.payload as NetEvent;
        const cbs = this.listeners.get(ev.type);
        // Pass both data and full event for filtering
        if (cbs) cbs.forEach(cb => cb(ev.data, ev));
        // eslint-disable-next-line no-console
        console.log('[RealtimeNet] Received', ev);
      } catch (err) {
        console.error('[RealtimeNet] Parse error:', err);
      }
    }).subscribe((status: any) => {
      // eslint-disable-next-line no-console
      console.log('[RealtimeNet] Channel status:', status);
    });
    this.subscribed = true;
  }

  /** Broadcast event to all subscribers (with optional userId for filtering) */
  broadcast(type: EventType, data: any, userId?: string) {
    if (!client) return;
    const ev: NetEvent = { type, data, timestamp: Date.now(), userId };
    client.channel('pickpoint_realtime').send({
      type: 'broadcast',
      event: 'pp_event',
      payload: ev
    });
    // eslint-disable-next-line no-console
    console.log('[RealtimeNet] Broadcasted', ev);
  }

  /** 
   * Listen to events, optionally filter by userId 
   * If filterUserId is provided, only events from that user will trigger callback
   */
  on(type: EventType, cb: Listener, filterUserId?: string) {
    const wrappedCb = (data: any, event?: NetEvent) => {
      // Jika ada filter userId, hanya proses event dari user tersebut
      if (filterUserId && event?.userId && event.userId !== filterUserId) {
        console.log(`[RealtimeNet] Ignoring event from ${event.userId}, expecting ${filterUserId}`);
        return;
      }
      cb(data);
    };
    
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(wrappedCb);
    return () => this.listeners.get(type)?.delete(wrappedCb);
  }
}

export const realtimeNet = new RealtimeNetService();
