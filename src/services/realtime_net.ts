import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const client = (SUPABASE_URL && SUPABASE_ANON_KEY) ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

type EventType = 'QR_SCANNED' | 'PACKAGE_ADDED' | 'PACKAGE_PICKED' | 'RELOAD_DATA';

interface NetEvent<T = any> {
  type: EventType;
  data: T;
  timestamp: number;
}

type Listener = (data: any) => void;

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
        if (cbs) cbs.forEach(cb => cb(ev.data));
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

  /** Broadcast event to all subscribers */
  broadcast(type: EventType, data: any) {
    if (!client) return;
    const ev: NetEvent = { type, data, timestamp: Date.now() };
    client.channel('pickpoint_realtime').send({
      type: 'broadcast',
      event: 'pp_event',
      payload: ev
    });
    // eslint-disable-next-line no-console
    console.log('[RealtimeNet] Broadcasted', ev);
  }

  on(type: EventType, cb: Listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(cb);
    return () => this.listeners.get(type)?.delete(cb);
  }
}

export const realtimeNet = new RealtimeNetService();
