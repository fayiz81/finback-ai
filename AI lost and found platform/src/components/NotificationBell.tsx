import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Zap, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'match' | 'item' | 'info';
  timestamp: Date;
  read: boolean;
}

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifications.filter(n => !n.read).length;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Supabase Realtime — listen for new items that match user's items
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications-' + user.id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'items' }, (payload) => {
        const newItem = payload.new as any;
        // Only notify if it's NOT the current user's item
        if (newItem.user_id !== user.id) {
          const n: Notification = {
            id: newItem.id,
            title: newItem.type === 'found' ? '🟢 New Found Item' : '🔴 New Lost Item',
            message: `"${newItem.title}" was just reported${newItem.location_name ? ` at ${newItem.location_name}` : ''}`,
            type: 'item',
            timestamp: new Date(),
            read: false,
          };
          setNotifications(prev => [n, ...prev].slice(0, 20));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const clear = () => setNotifications([]);

  if (!user) return null;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Bell button */}
      <motion.button
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => { setOpen(o => !o); if (unread > 0) markAllRead(); }}
        style={{
          width: 36, height: 36, borderRadius: 10,
          background: unread > 0 ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.06)',
          border: unread > 0 ? '1px solid rgba(124,58,237,0.35)' : '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: unread > 0 ? '#a78bfa' : 'rgba(255,255,255,0.6)',
          cursor: 'pointer', position: 'relative',
        }}
      >
        <Bell style={{ width: 16, height: 16 }} />
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              style={{
                position: 'absolute', top: -4, right: -4,
                width: 16, height: 16, borderRadius: '50%',
                background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
                fontSize: 9, fontWeight: 700, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid #08080f',
              }}
            >
              {unread > 9 ? '9+' : unread}
            </motion.span>
          )}
        </AnimatePresence>
        {/* Pulse when has unread */}
        {unread > 0 && (
          <motion.span
            animate={{ scale: [1, 2], opacity: [0.4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              position: 'absolute', inset: 0, borderRadius: 10,
              border: '1px solid rgba(124,58,237,0.4)', pointerEvents: 'none',
            }}
          />
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              width: 320, zIndex: 100,
              background: 'rgba(12,10,24,0.98)', backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16,
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Bell style={{ width: 14, height: 14, color: '#a78bfa' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Notifications</span>
                {unread > 0 && (
                  <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 20, background: 'rgba(124,58,237,0.2)', color: '#a78bfa', fontWeight: 600 }}>
                    {unread} new
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {notifications.length > 0 && (
                  <button onClick={clear} style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: 6 }}>
                    Clear
                  </button>
                )}
                <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 2 }}>
                  <X style={{ width: 13, height: 13 }} />
                </button>
              </div>
            </div>

            {/* Items */}
            <div style={{ maxHeight: 340, overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>
                    No notifications yet.<br />You'll be alerted when new items are reported.
                  </p>
                </div>
              ) : (
                notifications.map((n, i) => (
                  <motion.div key={n.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      background: n.read ? 'transparent' : 'rgba(124,58,237,0.05)',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {n.type === 'match' ? <Zap style={{ width: 13, height: 13, color: '#a78bfa' }} /> : <Package style={{ width: 13, height: 13, color: '#60a5fa' }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{n.title}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.message}</div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>
                          {n.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
