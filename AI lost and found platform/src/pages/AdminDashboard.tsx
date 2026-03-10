import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { ROUTE_PATHS } from '@/lib/index';
import {
  Users, Package, Shield, RefreshCw, Trash2,
  UserCheck, Mail, Search, LogOut, ChevronRight,
  AlertTriangle, CheckCircle2, MapPin, Image,
  BarChart2, TrendingUp,
} from 'lucide-react';

interface SupabaseUser {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  user_metadata: { full_name?: string };
}

interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'lost' | 'found';
  status: string;
  image_url: string | null;
  location_name: string;
  created_at: string;
  user_id: string;
}

type Tab = 'overview' | 'users' | 'items';

export default function AdminDashboard() {
  const { isAdmin, isLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [users, setUsers] = useState<SupabaseUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'confirmed' | 'unconfirmed'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const [items, setItems] = useState<Item[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemSearch, setItemSearch] = useState('');
  const [itemTypeFilter, setItemTypeFilter] = useState<'all' | 'lost' | 'found'>('all');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers();
      if (error) throw error;
      setUsers(data.users as SupabaseUser[]);
    } catch (err: any) {
      showToast(err.message || 'Failed to load users. Check VITE_SUPABASE_SERVICE_KEY in Vercel.', 'error');
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const fetchItems = useCallback(async () => {
    setItemsLoading(true);
    try {
      const { data, error } = await supabase.from('items').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load items', 'error');
    } finally {
      setItemsLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); fetchItems(); }, [fetchUsers, fetchItems]);

  const confirmEmail = async (userId: string) => {
    setActionLoading(userId + '_confirm');
    try {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { email_confirm: true });
      if (error) throw error;
      showToast('Email confirmed!');
      await fetchUsers();
    } catch (err: any) { showToast(err.message, 'error'); }
    finally { setActionLoading(null); }
  };

  const deleteUser = async (userId: string, email: string) => {
    if (!confirm(`Delete ${email}? This cannot be undone.`)) return;
    setActionLoading(userId + '_delete');
    try {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (error) throw error;
      showToast(`Deleted ${email}`);
      await fetchUsers();
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
      await fetchItems();
    } catch (err: any) { showToast(err.message, 'error'); }
    finally { setActionLoading(null); }
  };

  const updateItemStatus = async (itemId: string, status: string) => {
    try {
      const { error } = await supabase.from('items').update({ status }).eq('id', itemId);
      if (error) throw error;
      showToast(`Status → ${status}`);
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, status } : i));
    } catch (err: any) { showToast(err.message, 'error'); }
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
    totalUsers: users.length,
    confirmed: users.filter(u => u.email_confirmed_at).length,
    unconfirmed: users.filter(u => !u.email_confirmed_at).length,
    totalItems: items.length,
    lostItems: items.filter(i => i.type === 'lost').length,
    foundItems: items.filter(i => i.type === 'found').length,
    activeItems: items.filter(i => i.status === 'active').length,
    resolvedItems: items.filter(i => i.status === 'resolved').length,
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#09090f]">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!isAdmin()) return <Navigate to={ROUTE_PATHS.HOME} replace />;

  const navItems: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <BarChart2 size={16} /> },
    { id: 'users', label: 'Users', icon: <Users size={16} />, count: stats.totalUsers },
    { id: 'items', label: 'Items', icon: <Package size={16} />, count: stats.totalItems },
  ];

  return (
    <div className="flex min-h-screen bg-[#09090f] text-white" style={{ fontFamily: 'system-ui, sans-serif' }}>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-6 left-1/2 z-50 px-5 py-3 rounded-xl text-sm font-medium flex items-center gap-2 shadow-2xl ${
              toast.type === 'success'
                ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/20 border border-red-500/30 text-red-300'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 220 : 64 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="relative flex-shrink-0 flex flex-col bg-[#0e0e18] border-r border-white/5 overflow-hidden"
      >
        <div className="flex items-center gap-3 px-4 h-16 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <Shield size={14} />
          </div>
          {sidebarOpen && <span className="font-bold text-sm whitespace-nowrap">FinBack Admin</span>}
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                activeTab === item.id ? 'bg-violet-500/15 text-violet-300' : 'text-white/40 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="flex-1 text-left whitespace-nowrap">{item.label}</span>}
              {sidebarOpen && item.count !== undefined && (
                <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded-md">{item.count}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5 space-y-1">
          <button
            onClick={() => { fetchUsers(); fetchItems(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-white/80 hover:bg-white/5 transition-all"
          >
            <RefreshCw size={16} className="flex-shrink-0" />
            {sidebarOpen && <span>Refresh</span>}
          </button>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={16} className="flex-shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-4 -right-3 w-6 h-6 rounded-full bg-[#1a1a2e] border border-white/10 flex items-center justify-center text-white/40 hover:text-white z-10"
        >
          <ChevronRight size={12} className={`transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
        </button>
      </motion.aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center px-6 border-b border-white/5 bg-[#09090f]/80 backdrop-blur sticky top-0 z-20">
          <div>
            <h1 className="font-bold text-lg capitalize">{activeTab}</h1>
            <p className="text-xs text-white/30">FinBack AI Control Panel</p>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <AnimatePresence mode="wait">

            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Users', value: stats.totalUsers, sub: `${stats.unconfirmed} unconfirmed`, icon: <Users size={16} />, color: 'from-violet-500/20 to-violet-500/5', accent: 'text-violet-400' },
                    { label: 'Total Items', value: stats.totalItems, sub: `${stats.lostItems} lost · ${stats.foundItems} found`, icon: <Package size={16} />, color: 'from-blue-500/20 to-blue-500/5', accent: 'text-blue-400' },
                    { label: 'Active Items', value: stats.activeItems, sub: 'currently open', icon: <TrendingUp size={16} />, color: 'from-emerald-500/20 to-emerald-500/5', accent: 'text-emerald-400' },
                    { label: 'Resolved', value: stats.resolvedItems, sub: 'successfully closed', icon: <CheckCircle2 size={16} />, color: 'from-amber-500/20 to-amber-500/5', accent: 'text-amber-400' },
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
                  {/* Recent Items */}
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                      <span className="font-semibold text-sm">Recent Items</span>
                      <button onClick={() => setActiveTab('items')} className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">View all <ChevronRight size={12} /></button>
                    </div>
                    <div className="divide-y divide-white/5">
                      {items.slice(0, 5).map(item => (
                        <div key={item.id} className="px-5 py-3 flex items-center gap-3 hover:bg-white/[0.02]">
                          <div className="w-9 h-9 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
                            {item.image_url ? <img src={item.image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Image size={12} className="text-white/20" /></div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.title}</p>
                            <p className="text-xs text-white/30 flex items-center gap-1"><MapPin size={9} />{item.location_name || '—'}</p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${item.type === 'lost' ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'}`}>{item.type}</span>
                        </div>
                      ))}
                      {items.length === 0 && <div className="px-5 py-8 text-center text-white/25 text-sm">No items yet</div>}
                    </div>
                  </div>

                  {/* Recent Users */}
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
                            : <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">pending</span>
                          }
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* USERS */}
            {activeTab === 'users' && (
              <motion.div key="users" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative flex-1 min-w-48">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search users..." className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:border-violet-500/50" />
                  </div>
                  {(['all', 'confirmed', 'unconfirmed'] as const).map(f => (
                    <button key={f} onClick={() => setUserFilter(f)} className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all ${userFilter === f ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'bg-white/5 text-white/40 border border-white/10 hover:text-white/70'}`}>{f}</button>
                  ))}
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
                              : <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20"><Mail size={11} />Pending</span>
                            }
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

            {/* ITEMS */}
            {activeTab === 'items' && (
              <motion.div key="items" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative flex-1 min-w-48">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input value={itemSearch} onChange={e => setItemSearch(e.target.value)} placeholder="Search items..." className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:border-violet-500/50" />
                  </div>
                  {(['all', 'lost', 'found'] as const).map(f => (
                    <button key={f} onClick={() => setItemTypeFilter(f)} className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all ${itemTypeFilter === f ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'bg-white/5 text-white/40 border border-white/10 hover:text-white/70'}`}>{f}</button>
                  ))}
                </div>

                <div className="rounded-2xl border border-white/5 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-white/[0.03] border-b border-white/5">
                        <th className="text-left px-5 py-3 text-xs font-medium text-white/40">Item</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-white/40">Type</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-white/40">Category</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-white/40">Location</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-white/40">Status</th>
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
                          <td className="px-5 py-3.5">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${item.type === 'lost' ? 'bg-red-500/15 text-red-400 border-red-500/20' : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'}`}>{item.type}</span>
                          </td>
                          <td className="px-5 py-3.5 text-white/40 text-xs">{item.category}</td>
                          <td className="px-5 py-3.5 text-white/40 text-xs"><span className="flex items-center gap-1"><MapPin size={10} />{item.location_name || '—'}</span></td>
                          <td className="px-5 py-3.5">
                            <select value={item.status} onChange={e => updateItemStatus(item.id, e.target.value)} className="bg-white/5 border border-white/10 text-xs text-white/70 rounded-lg px-2 py-1 focus:outline-none focus:border-violet-500/50 cursor-pointer">
                              <option value="active">active</option>
                              <option value="matched">matched</option>
                              <option value="resolved">resolved</option>
                            </select>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex justify-end">
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

          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
