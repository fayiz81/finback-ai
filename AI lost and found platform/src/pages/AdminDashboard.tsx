import { useState, useEffect, useCallback, useMemo } from 'react';
import emailjs from '@emailjs/browser';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { ROUTE_PATHS, calculateMatchScore, getDistanceInKm, getDaysDifference, normalizeScore } from '@/lib/index';
import {
  Users, Package, Shield, RefreshCw, Trash2, UserCheck, Mail,
  Search, LogOut, ChevronRight, AlertTriangle, CheckCircle2,
  MapPin, Image, BarChart2, TrendingUp, Sparkles, Eye, X,
  CheckCircle, XCircle, Clock, Send, Download,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface SupabaseUser {
  id: string; email: string; email_confirmed_at: string | null;
  created_at: string; last_sign_in_at: string | null;
  user_metadata: { full_name?: string };
}
interface Item {
  id: string; title: string; description: string; category: string;
  type: 'lost' | 'found'; status: string; image_url: string | null;
  location_name: string; location_lat: number; location_lng: number;
  created_at: string; user_id: string; date_lost?: string; date_found?: string;
  approved?: boolean;
}
type Tab = 'overview' | 'analytics' | 'matches' | 'items' | 'users' | 'notifications';

// ── Build AI matches ──────────────────────────────────────────────────────────
function buildMatches(lostItems: Item[], foundItems: Item[]) {
  const results: any[] = [];
  for (const lost of lostItems) {
    for (const found of foundItems) {
      const sameCategory = lost.category === found.category ? 0.8 : 0.2;
      const lostWords = (lost.title + ' ' + lost.description).toLowerCase().split(/\s+/);
      const foundWords = (found.title + ' ' + found.description).toLowerCase().split(/\s+/);
      const shared = lostWords.filter((w: string) => w.length > 3 && foundWords.includes(w)).length;
      const textSim = Math.min(1, sameCategory * 0.5 + (shared / Math.max(lostWords.length, 1)) * 0.5);
      const locationProx = normalizeScore(getDistanceInKm(lost.location_lat||0, lost.location_lng||0, found.location_lat||0, found.location_lng||0), 10);
      const timeProx = normalizeScore(getDaysDifference(new Date(lost.date_lost||lost.created_at), new Date(found.date_found||found.created_at)), 30);
      const imageSim = sameCategory === 0.8 ? 0.65 : 0.3;
      const score = calculateMatchScore(imageSim, textSim, locationProx, timeProx);
      if (score >= 0.3) results.push({ id: `${lost.id}-${found.id}`, lost, found, score, imageSim, textSim, locationProx, timeProx, adminStatus: 'pending' });
    }
  }
  return results.sort((a, b) => b.score - a.score);
}

// ── Mini bar chart ────────────────────────────────────────────────────────────
function MiniBar({ value, max, color = 'bg-primary' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div className={`h-full rounded-full ${color}`} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} />
      </div>
      <span className="text-xs text-white/40 w-6 text-right">{value}</span>
    </div>
  );
}

// ── Item Detail Modal ─────────────────────────────────────────────────────────
function ItemModal({ item, onClose }: { item: Item; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          className="bg-[#0e0e18] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
          onClick={e => e.stopPropagation()}>
          {item.image_url && (
            <div className="h-52 overflow-hidden">
              <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold">{item.title}</h2>
                <p className="text-xs text-white/40 mt-0.5">{item.category} · {item.type}</p>
              </div>
              <button onClick={onClose} className="text-white/30 hover:text-white transition-colors"><X size={18} /></button>
            </div>
            <p className="text-sm text-white/60 mb-4 leading-relaxed">{item.description}</p>
            <div className="space-y-2 text-sm text-white/50">
              <div className="flex items-center gap-2"><MapPin size={13} />{item.location_name || `${item.location_lat?.toFixed(4)}, ${item.location_lng?.toFixed(4)}`}</div>
              <div className="flex items-center gap-2"><Clock size={13} />Submitted {new Date(item.created_at).toLocaleDateString()}</div>
            </div>
            {/* Map embed using coordinates */}
            {item.location_lat && item.location_lng && (
              <div className="mt-4 rounded-xl overflow-hidden border border-white/10">
                <iframe
                  title="location"
                  width="100%" height="180"
                  style={{ border: 0 }}
                  src={`https://maps.google.com/maps?q=${item.location_lat},${item.location_lng}&z=15&output=embed`}
                />
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { isAdmin, isLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [users, setUsers] = useState<SupabaseUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState<'all'|'confirmed'|'unconfirmed'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success'|'error' } | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemSearch, setItemSearch] = useState('');
  const [itemTypeFilter, setItemTypeFilter] = useState<'all'|'lost'|'found'>('all');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [matchStatuses, setMatchStatuses] = useState<Record<string, 'pending'|'confirmed'|'dismissed'>>({});
  const [notifSubject, setNotifSubject] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [notifTarget, setNotifTarget] = useState<'all'|'lost'|'found'>('all');
  const [notifSending, setNotifSending] = useState(false);

  const showToast = (msg: string, type: 'success'|'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers();
      if (error) throw error;
      setUsers(data.users as SupabaseUser[]);
    } catch (err: any) { showToast(err.message || 'Failed to load users', 'error'); }
    finally { setUsersLoading(false); }
  }, []);

  const fetchItems = useCallback(async () => {
    setItemsLoading(true);
    try {
      const { data, error } = await supabase.from('items').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (err: any) { showToast(err.message || 'Failed to load items', 'error'); }
    finally { setItemsLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); fetchItems(); }, [fetchUsers, fetchItems]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase.channel('admin-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => fetchItems())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchItems]);

  const lostItems = items.filter(i => i.type === 'lost');
  const foundItems = items.filter(i => i.type === 'found');
  const allMatches = useMemo(() => buildMatches(lostItems, foundItems), [lostItems, foundItems]);

  // Analytics: last 14 days
  const analyticsData = useMemo(() => {
    const days: { label: string; lost: number; found: number; date: string }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dateStr = d.toDateString();
      days.push({
        label: d.toLocaleDateString('en', { weekday: 'short', day: 'numeric' }),
        date: dateStr,
        lost: items.filter(item => item.type === 'lost' && new Date(item.created_at).toDateString() === dateStr).length,
        found: items.filter(item => item.type === 'found' && new Date(item.created_at).toDateString() === dateStr).length,
      });
    }
    return days;
  }, [items]);

  const maxDayCount = useMemo(() => Math.max(...analyticsData.map(d => d.lost + d.found), 1), [analyticsData]);

  const categoryBreakdown = useMemo(() => {
    const cats: Record<string, number> = {};
    items.forEach(i => { cats[i.category] = (cats[i.category] || 0) + 1; });
    return Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [items]);

  const confirmEmail = async (userId: string) => {
    setActionLoading(userId + '_confirm');
    try {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { email_confirm: true });
      if (error) throw error;
      showToast('Email confirmed!'); await fetchUsers();
    } catch (err: any) { showToast(err.message, 'error'); }
    finally { setActionLoading(null); }
  };

  const deleteUser = async (userId: string, email: string) => {
    if (!confirm(`Delete ${email}?`)) return;
    setActionLoading(userId + '_delete');
    try {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (error) throw error;
      showToast(`Deleted ${email}`); await fetchUsers();
    } catch (err: any) { showToast(err.message, 'error'); }
    finally { setActionLoading(null); }
  };

  const deleteItem = async (itemId: string) => {
    if (!confirm('Delete this item?')) return;
    setActionLoading(itemId + '_item');
    try {
      const { error } = await supabase.from('items').delete().eq('id', itemId);
      if (error) throw error;
      showToast('Item deleted');
      setItems(prev => prev.filter(i => i.id !== itemId));
    } catch (err: any) { showToast(err.message, 'error'); }
    finally { setActionLoading(null); }
  };

  const handleMatchStatus = (matchId: string, status: 'confirmed'|'dismissed') => {
    setMatchStatuses(prev => ({ ...prev, [matchId]: status }));
    showToast(status === 'confirmed' ? 'Match confirmed ✓' : 'Match dismissed');
  };

  const sendNotification = async () => {
    if (!notifSubject || !notifBody) { showToast('Fill in subject and message', 'error'); return; }
    setNotifSending(true);

    const EMAILJS_SERVICE_ID = 'service_0gpttgh';
    const EMAILJS_TEMPLATE_ID = 'template_ffsyxug';
    const EMAILJS_PUBLIC_KEY = '8WuJMcm-wl0Ho8cYA';

    // Get target users
    let targetUsers = users.filter(u => u.email_confirmed_at);
    if (notifTarget === 'lost') {
      const lostUserIds = new Set(items.filter(i => i.type === 'lost').map(i => i.user_id));
      targetUsers = targetUsers.filter(u => lostUserIds.has(u.id));
    } else if (notifTarget === 'found') {
      const foundUserIds = new Set(items.filter(i => i.type === 'found').map(i => i.user_id));
      targetUsers = targetUsers.filter(u => foundUserIds.has(u.id));
    }

    if (targetUsers.length === 0) {
      showToast('No users to notify', 'error');
      setNotifSending(false);
      return;
    }

    let sent = 0;
    for (const user of targetUsers) {
      try {
        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          {
            to_email: user.email,
            user_name: user.user_metadata?.full_name || user.email.split('@')[0],
            lost_title: notifSubject,
            found_title: notifBody,
            confidence: '—',
            found_location: '—',
            found_date: new Date().toLocaleDateString(),
            match_url: 'https://finback-ai.vercel.app/matches',
          },
          EMAILJS_PUBLIC_KEY
        );
        sent++;
      } catch (err) {
        console.error('EmailJS error for', user.email, err);
      }
    }

    showToast(`Notification sent to ${sent} users ✓`);
    setNotifSubject(''); setNotifBody('');
    setNotifSending(false);
  };

  const exportCSV = (type: 'items'|'users') => {
    if (type === 'items') {
      const rows = [['ID','Title','Type','Category','Location','Date'],
        ...items.map(i => [i.id, i.title, i.type, i.category, i.location_name, i.created_at])];
      const csv = rows.map(r => r.join(',')).join('\n');
      const a = document.createElement('a'); a.href = 'data:text/csv,' + encodeURIComponent(csv);
      a.download = 'finback_items.csv'; a.click();
    } else {
      const rows = [['ID','Email','Name','Confirmed','Joined'],
        ...users.map(u => [u.id, u.email, u.user_metadata?.full_name||'', u.email_confirmed_at?'Yes':'No', u.created_at])];
      const csv = rows.map(r => r.join(',')).join('\n');
      const a = document.createElement('a'); a.href = 'data:text/csv,' + encodeURIComponent(csv);
      a.download = 'finback_users.csv'; a.click();
    }
    showToast('CSV downloaded ✓');
  };

  const filteredUsers = users.filter(u => {
    const name = u.user_metadata?.full_name || '';
    const matchSearch = name.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase());
    const matchFilter = userFilter === 'all' || (userFilter === 'confirmed' && u.email_confirmed_at) || (userFilter === 'unconfirmed' && !u.email_confirmed_at);
    return matchSearch && matchFilter;
  });

  const filteredItems = items.filter(i => {
    const matchSearch = i.title?.toLowerCase().includes(itemSearch.toLowerCase()) || i.location_name?.toLowerCase().includes(itemSearch.toLowerCase());
    const matchType = itemTypeFilter === 'all' || i.type === itemTypeFilter;
    return matchSearch && matchType;
  });

  const stats = {
    totalUsers: users.length, confirmed: users.filter(u => u.email_confirmed_at).length,
    unconfirmed: users.filter(u => !u.email_confirmed_at).length,
    totalItems: items.length, lostItems: lostItems.length, foundItems: foundItems.length,
    totalMatches: allMatches.length,
    highConfidence: allMatches.filter(m => m.score > 0.7).length,
  };

  const today = new Date().toDateString();
  const todayItems = items.filter(i => new Date(i.created_at).toDateString() === today).length;

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#09090f]">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!isAdmin()) return <Navigate to={ROUTE_PATHS.HOME} replace />;

  const navItems: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <BarChart2 size={16} /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp size={16} /> },
    { id: 'matches', label: 'AI Matches', icon: <Sparkles size={16} />, count: stats.totalMatches },
    { id: 'items', label: 'Items', icon: <Package size={16} />, count: stats.totalItems },
    { id: 'users', label: 'Users', icon: <Users size={16} />, count: stats.totalUsers },
    { id: 'notifications', label: 'Notifications', icon: <Mail size={16} /> },
  ];

  return (
    <div className="flex min-h-screen bg-[#09090f] text-white" style={{ fontFamily: 'system-ui, sans-serif' }}>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-6 left-1/2 z-50 px-5 py-3 rounded-xl text-sm font-medium flex items-center gap-2 shadow-2xl ${
              toast.type === 'success' ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300' : 'bg-red-500/20 border border-red-500/30 text-red-300'
            }`}>
            {toast.type === 'success' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}{toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Item Detail Modal */}
      {selectedItem && <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />}

      {/* Sidebar */}
      <motion.aside animate={{ width: sidebarOpen ? 220 : 64 }} transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="relative flex-shrink-0 flex flex-col bg-[#0e0e18] border-r border-white/5 overflow-hidden">
        <div className="flex items-center gap-3 px-4 h-16 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <Shield size={14} />
          </div>
          {sidebarOpen && <span className="font-bold text-sm whitespace-nowrap">FinBack Admin</span>}
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                activeTab === item.id ? 'bg-violet-500/15 text-violet-300' : 'text-white/40 hover:text-white/80 hover:bg-white/5'
              }`}>
              <span className="flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="flex-1 text-left whitespace-nowrap">{item.label}</span>}
              {sidebarOpen && item.count !== undefined && (
                <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded-md">{item.count}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/5 space-y-1">
          <button onClick={() => { fetchUsers(); fetchItems(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-white/80 hover:bg-white/5 transition-all">
            <RefreshCw size={16} className="flex-shrink-0" />{sidebarOpen && <span>Refresh</span>}
          </button>
          <button onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut size={16} className="flex-shrink-0" />{sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-4 -right-3 w-6 h-6 rounded-full bg-[#1a1a2e] border border-white/10 flex items-center justify-center text-white/40 hover:text-white z-10">
          <ChevronRight size={12} className={`transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
        </button>
      </motion.aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#09090f]/80 backdrop-blur sticky top-0 z-20">
          <div>
            <h1 className="font-bold text-lg capitalize">{activeTab}</h1>
            <p className="text-xs text-white/30">FinBack AI Control Panel</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            Live · {todayItems} items today
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <AnimatePresence mode="wait">

            {/* ── OVERVIEW ── */}
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Users', value: stats.totalUsers, sub: `${stats.unconfirmed} unconfirmed`, icon: <Users size={16} />, color: 'from-violet-500/20 to-violet-500/5', accent: 'text-violet-400' },
                    { label: 'Total Items', value: stats.totalItems, sub: `${stats.lostItems} lost · ${stats.foundItems} found`, icon: <Package size={16} />, color: 'from-blue-500/20 to-blue-500/5', accent: 'text-blue-400' },
                    { label: 'AI Matches', value: stats.totalMatches, sub: `${stats.highConfidence} high confidence`, icon: <Sparkles size={16} />, color: 'from-emerald-500/20 to-emerald-500/5', accent: 'text-emerald-400' },
                    { label: 'Today', value: todayItems, sub: 'new items submitted', icon: <TrendingUp size={16} />, color: 'from-amber-500/20 to-amber-500/5', accent: 'text-amber-400' },
                  ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                      <div className={`p-5 rounded-2xl bg-gradient-to-br ${s.color} border border-white/5`}>
                        <div className={`${s.accent} mb-3`}>{s.icon}</div>
                        <div className="text-3xl font-bold mb-1">{s.value}</div>
                        <div className="text-xs text-white/40 font-medium">{s.label}</div>
                        <div className="text-xs text-white/25 mt-0.5">{s.sub}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                      <span className="font-semibold text-sm">Recent Items</span>
                      <button onClick={() => setActiveTab('items')} className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">View all <ChevronRight size={12} /></button>
                    </div>
                    <div className="divide-y divide-white/5">
                      {items.slice(0, 5).map(item => (
                        <div key={item.id} className="px-5 py-3 flex items-center gap-3 hover:bg-white/[0.02] cursor-pointer" onClick={() => setSelectedItem(item)}>
                          <div className="w-9 h-9 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
                            {item.image_url ? <img src={item.image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Image size={12} className="text-white/20" /></div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.title}</p>
                            <p className="text-xs text-white/30 flex items-center gap-1"><MapPin size={9} />{item.location_name || '—'}</p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${item.type === 'lost' ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'}`}>{item.type}</span>
                          <Eye size={12} className="text-white/20" />
                        </div>
                      ))}
                      {items.length === 0 && <div className="px-5 py-8 text-center text-white/25 text-sm">No items yet</div>}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                      <span className="font-semibold text-sm">Recent Users</span>
                      <button onClick={() => setActiveTab('users')} className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">View all <ChevronRight size={12} /></button>
                    </div>
                    <div className="divide-y divide-white/5">
                      {users.slice(0, 5).map(user => (
                        <div key={user.id} className="px-5 py-3 flex items-center gap-3 hover:bg-white/[0.02]">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/30 to-indigo-500/30 flex items-center justify-center text-xs font-bold text-violet-300 flex-shrink-0">
                            {(user.user_metadata?.full_name || user.email || '?')[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user.user_metadata?.full_name || user.email}</p>
                            <p className="text-xs text-white/30 truncate">{user.email}</p>
                          </div>
                          {user.email_confirmed_at
                            ? <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">confirmed</span>
                            : <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">pending</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── ANALYTICS ── */}
            {activeTab === 'analytics' && (
              <motion.div key="analytics" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 14-day chart */}
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="font-semibold text-sm">Items Over Time</h3>
                        <p className="text-xs text-white/30 mt-0.5">Last 14 days</p>
                      </div>
                      <button onClick={() => exportCSV('items')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-white/5 text-white/50 border border-white/10 hover:text-white transition-all">
                        <Download size={11} />Export CSV
                      </button>
                    </div>
                    <div className="flex items-end gap-1 h-32">
                      {analyticsData.map((d, i) => {
                        const total = d.lost + d.found;
                        const lostH = maxDayCount > 0 ? (d.lost / maxDayCount) * 100 : 0;
                        const foundH = maxDayCount > 0 ? (d.found / maxDayCount) * 100 : 0;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1a1a2e] border border-white/10 rounded-lg px-2 py-1 text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all z-10 pointer-events-none">
                              {d.label}: {total} items
                            </div>
                            <div className="w-full flex flex-col-reverse gap-0.5">
                              <motion.div className="w-full rounded-t-sm bg-red-500/50" style={{ height: `${lostH}%` }} initial={{ height: 0 }} animate={{ height: `${lostH}%` }} transition={{ delay: i * 0.03, duration: 0.5 }} />
                              <motion.div className="w-full bg-emerald-500/50" style={{ height: `${foundH}%` }} initial={{ height: 0 }} animate={{ height: `${foundH}%` }} transition={{ delay: i * 0.03, duration: 0.5 }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between mt-2">
                      {analyticsData.filter((_, i) => i % 2 === 0).map((d, i) => (
                        <span key={i} className="text-[9px] text-white/25">{d.label.split(' ')[0]}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="flex items-center gap-1.5 text-xs text-white/40"><span className="w-2 h-2 rounded-sm bg-red-500/50" />Lost</span>
                      <span className="flex items-center gap-1.5 text-xs text-white/40"><span className="w-2 h-2 rounded-sm bg-emerald-500/50" />Found</span>
                    </div>
                  </div>

                  {/* Category breakdown */}
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                    <h3 className="font-semibold text-sm mb-1">Category Breakdown</h3>
                    <p className="text-xs text-white/30 mb-5">Items by category</p>
                    <div className="space-y-3">
                      {categoryBreakdown.length > 0 ? categoryBreakdown.map(([cat, count]) => (
                        <div key={cat}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-white/60">{cat}</span>
                            <span className="text-white/40">{count}</span>
                          </div>
                          <MiniBar value={count} max={items.length} color="bg-violet-500/60" />
                        </div>
                      )) : <p className="text-white/25 text-sm text-center py-8">No data yet</p>}
                    </div>
                  </div>
                </div>

                {/* Summary stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Items', value: stats.totalItems },
                    { label: 'Lost', value: stats.lostItems },
                    { label: 'Found', value: stats.foundItems },
                    { label: 'AI Matches', value: stats.totalMatches },
                  ].map((s, i) => (
                    <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
                      <div className="text-2xl font-bold mb-1">{s.value}</div>
                      <div className="text-xs text-white/30">{s.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── AI MATCHES ── */}
            {activeTab === 'matches' && (
              <motion.div key="matches" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold">AI Match Review</h2>
                    <p className="text-xs text-white/30 mt-0.5">{allMatches.length} potential matches found · Review and confirm</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {Object.values(matchStatuses).filter(s => s === 'confirmed').length} confirmed
                    </span>
                    <span className="px-2 py-1 rounded-lg bg-white/5 text-white/40 border border-white/10">
                      {Object.values(matchStatuses).filter(s => s === 'dismissed').length} dismissed
                    </span>
                  </div>
                </div>

                {allMatches.length === 0 ? (
                  <div className="rounded-2xl border border-white/5 p-12 text-center">
                    <Sparkles size={32} className="mx-auto text-white/15 mb-3" />
                    <p className="text-white/25 text-sm">No matches yet. Submit lost and found items to generate AI matches.</p>
                  </div>
                ) : allMatches.map((match, i) => {
                  const status = matchStatuses[match.id] || 'pending';
                  const pct = Math.round(match.score * 100);
                  const isHigh = match.score > 0.7;
                  return (
                    <motion.div key={match.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      className={`rounded-2xl border p-5 transition-all ${
                        status === 'confirmed' ? 'border-emerald-500/30 bg-emerald-500/[0.04]' :
                        status === 'dismissed' ? 'border-white/5 bg-white/[0.01] opacity-50' :
                        'border-white/8 bg-white/[0.02]'
                      }`}>
                      <div className="flex flex-col lg:flex-row gap-4">
                        {/* Lost item */}
                        <div className="flex-1 flex gap-3 items-start">
                          <div className="w-12 h-12 rounded-xl bg-white/5 overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => setSelectedItem(match.lost)}>
                            {match.lost.image_url ? <img src={match.lost.image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Image size={14} className="text-white/20" /></div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] text-red-400 uppercase tracking-widest">Lost</span>
                            <p className="font-semibold text-sm truncate">{match.lost.title}</p>
                            <p className="text-xs text-white/30 flex items-center gap-1"><MapPin size={9} />{match.lost.location_name || '—'}</p>
                          </div>
                        </div>

                        {/* Score */}
                        <div className="flex flex-col items-center justify-center px-4 gap-1 flex-shrink-0">
                          <div className={`text-2xl font-bold font-mono ${isHigh ? 'text-emerald-400' : 'text-amber-400'}`}>{pct}%</div>
                          <div className="text-[10px] text-white/25">confidence</div>
                          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mt-1">
                            {[['🖼️', match.imageSim], ['📝', match.textSim], ['📍', match.locationProx], ['⏰', match.timeProx]].map(([icon, val]: any, j) => (
                              <div key={j} className="flex items-center gap-1 text-[9px] text-white/30">
                                <span>{icon}</span><span className="font-mono">{Math.round(val*100)}%</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Found item */}
                        <div className="flex-1 flex gap-3 items-start">
                          <div className="w-12 h-12 rounded-xl bg-white/5 overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => setSelectedItem(match.found)}>
                            {match.found.image_url ? <img src={match.found.image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Image size={14} className="text-white/20" /></div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] text-emerald-400 uppercase tracking-widest">Found</span>
                            <p className="font-semibold text-sm truncate">{match.found.title}</p>
                            <p className="text-xs text-white/30 flex items-center gap-1"><MapPin size={9} />{match.found.location_name || '—'}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {status === 'pending' && <>
                            <button onClick={() => handleMatchStatus(match.id, 'confirmed')}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">
                              <CheckCircle size={12} />Confirm
                            </button>
                            <button onClick={() => handleMatchStatus(match.id, 'dismissed')}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs bg-white/5 text-white/40 border border-white/10 hover:text-white/70 transition-all">
                              <XCircle size={12} />Dismiss
                            </button>
                          </>}
                          {status === 'confirmed' && <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle size={12} />Confirmed</span>}
                          {status === 'dismissed' && <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-white/25 border border-white/5"><XCircle size={12} />Dismissed</span>}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* ── ITEMS ── */}
            {activeTab === 'items' && (
              <motion.div key="items" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative flex-1 min-w-48">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input value={itemSearch} onChange={e => setItemSearch(e.target.value)} placeholder="Search items..." className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:border-violet-500/50" />
                  </div>
                  {(['all','lost','found'] as const).map(f => (
                    <button key={f} onClick={() => setItemTypeFilter(f)} className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all ${itemTypeFilter === f ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'bg-white/5 text-white/40 border border-white/10 hover:text-white/70'}`}>{f}</button>
                  ))}
                  <button onClick={() => exportCSV('items')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs bg-white/5 text-white/50 border border-white/10 hover:text-white transition-all ml-auto">
                    <Download size={11} />Export CSV
                  </button>
                </div>
                <div className="rounded-2xl border border-white/5 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-white/[0.03] border-b border-white/5">
                        <th className="text-left px-5 py-3 text-xs font-medium text-white/40">Item</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-white/40">Type</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-white/40">Category</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-white/40">Location</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-white/40">Date</th>
                        <th className="text-right px-5 py-3 text-xs font-medium text-white/40">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {itemsLoading ? (
                        <tr><td colSpan={6} className="text-center py-12"><div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                      ) : filteredItems.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-12 text-white/25">No items found</td></tr>
                      ) : filteredItems.map(item => (
                        <tr key={item.id} className="hover:bg-white/[0.02]">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
                                {item.image_url ? <img src={item.image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Image size={14} className="text-white/20" /></div>}
                              </div>
                              <div>
                                <p className="font-medium text-white/90">{item.title}</p>
                                <p className="text-xs text-white/30 line-clamp-1">{item.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5"><span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${item.type === 'lost' ? 'bg-red-500/15 text-red-400 border-red-500/20' : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'}`}>{item.type}</span></td>
                          <td className="px-5 py-3.5 text-white/40 text-xs">{item.category}</td>
                          <td className="px-5 py-3.5 text-white/40 text-xs"><span className="flex items-center gap-1"><MapPin size={10} />{item.location_name || '—'}</span></td>
                          <td className="px-5 py-3.5 text-white/40 text-xs">{new Date(item.created_at).toLocaleDateString()}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setSelectedItem(item)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-white/5 text-white/50 border border-white/10 hover:text-white transition-all">
                                <Eye size={11} />View
                              </button>
                              <button onClick={() => deleteItem(item.id)} disabled={actionLoading === item.id + '_item'} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50">
                                {actionLoading === item.id + '_item' ? <RefreshCw size={11} className="animate-spin" /> : <Trash2 size={11} />}Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* ── USERS ── */}
            {activeTab === 'users' && (
              <motion.div key="users" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative flex-1 min-w-48">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search users..." className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:border-violet-500/50" />
                  </div>
                  {(['all','confirmed','unconfirmed'] as const).map(f => (
                    <button key={f} onClick={() => setUserFilter(f)} className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all ${userFilter === f ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'bg-white/5 text-white/40 border border-white/10 hover:text-white/70'}`}>{f}</button>
                  ))}
                  <button onClick={() => exportCSV('users')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs bg-white/5 text-white/50 border border-white/10 hover:text-white transition-all ml-auto">
                    <Download size={11} />Export CSV
                  </button>
                </div>
                <div className="rounded-2xl border border-white/5 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-white/[0.03] border-b border-white/5">
                        <th className="text-left px-5 py-3 text-xs font-medium text-white/40">User</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-white/40">Status</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-white/40">Joined</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-white/40">Last Sign In</th>
                        <th className="text-right px-5 py-3 text-xs font-medium text-white/40">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {usersLoading ? (
                        <tr><td colSpan={5} className="text-center py-12"><div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-12 text-white/25">No users found</td></tr>
                      ) : filteredUsers.map(user => (
                        <tr key={user.id} className="hover:bg-white/[0.02]">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/30 to-indigo-500/30 flex items-center justify-center text-xs font-bold text-violet-300 flex-shrink-0">
                                {(user.user_metadata?.full_name || user.email || '?')[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-white/90">{user.user_metadata?.full_name || '—'}</p>
                                <p className="text-xs text-white/35">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            {user.email_confirmed_at
                              ? <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"><UserCheck size={11} />Confirmed</span>
                              : <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20"><Mail size={11} />Pending</span>}
                          </td>
                          <td className="px-5 py-3.5 text-white/35 text-xs">{new Date(user.created_at).toLocaleDateString()}</td>
                          <td className="px-5 py-3.5 text-white/35 text-xs">{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : '—'}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end gap-2">
                              {!user.email_confirmed_at && (
                                <button onClick={() => confirmEmail(user.id)} disabled={actionLoading === user.id + '_confirm'} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all disabled:opacity-50">
                                  {actionLoading === user.id + '_confirm' ? <RefreshCw size={11} className="animate-spin" /> : <UserCheck size={11} />}Confirm
                                </button>
                              )}
                              <button onClick={() => deleteUser(user.id, user.email)} disabled={actionLoading === user.id + '_delete'} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50">
                                {actionLoading === user.id + '_delete' ? <RefreshCw size={11} className="animate-spin" /> : <Trash2 size={11} />}Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* ── NOTIFICATIONS ── */}
            {activeTab === 'notifications' && (
              <motion.div key="notifications" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 max-w-2xl">
                <div>
                  <h2 className="font-semibold mb-1">Send Notification</h2>
                  <p className="text-xs text-white/30">Send in-app notifications to your users</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 space-y-5">
                  {/* Target */}
                  <div>
                    <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Target Audience</label>
                    <div className="flex gap-2">
                      {[{v:'all',label:'All Users'},{v:'lost',label:'Users with Lost Items'},{v:'found',label:'Users with Found Items'}].map(t => (
                        <button key={t.v} onClick={() => setNotifTarget(t.v as any)}
                          className={`px-3 py-2 rounded-xl text-xs transition-all ${notifTarget === t.v ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'bg-white/5 text-white/40 border border-white/10 hover:text-white/70'}`}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Subject */}
                  <div>
                    <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Subject</label>
                    <input value={notifSubject} onChange={e => setNotifSubject(e.target.value)} placeholder="e.g. Your item may have been found!"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:border-violet-500/50" />
                  </div>
                  {/* Message */}
                  <div>
                    <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Message</label>
                    <textarea value={notifBody} onChange={e => setNotifBody(e.target.value)} rows={4} placeholder="Write your message here..."
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:border-violet-500/50 resize-none" />
                  </div>
                  {/* Preview */}
                  {(notifSubject || notifBody) && (
                    <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
                      <p className="text-[10px] text-violet-400 uppercase tracking-widest mb-2">Preview</p>
                      <p className="text-sm font-semibold mb-1">{notifSubject || 'No subject'}</p>
                      <p className="text-xs text-white/50 leading-relaxed">{notifBody || 'No message'}</p>
                    </div>
                  )}
                  <button onClick={sendNotification} disabled={notifSending || !notifSubject || !notifBody}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm bg-violet-500/20 text-violet-300 border border-violet-500/30 hover:bg-violet-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                    {notifSending ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                    {notifSending ? 'Sending...' : `Send to ${notifTarget === 'all' ? `All ${users.length} Users` : notifTarget === 'lost' ? `${lostItems.length} Lost Reporters` : `${foundItems.length} Finders`}`}
                  </button>
                </div>

                {/* Recent notifications log */}
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                  <div className="px-5 py-4 border-b border-white/5">
                    <span className="font-semibold text-sm">Notification Log</span>
                  </div>
                  <div className="px-5 py-8 text-center text-white/25 text-sm">
                    No notifications sent yet
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
