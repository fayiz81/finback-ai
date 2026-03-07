import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { mockLostItems, mockFoundItems, mockMatches } from '@/data/index';
import { USER_ROLES, ITEM_CATEGORIES } from '@/lib/index';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users, Package, TrendingUp, AlertTriangle, CheckCircle,
  Activity, Shield, Clock, MapPin, Mail, RefreshCw,
  UserCheck, UserX, Trash2, Search, BarChart3, Filter,
} from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/index';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

interface SupabaseUser {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  user_metadata: { full_name?: string };
  banned_until?: string | null;
}

export default function AdminDashboard() {
  const { isAdmin, isLoading } = useAuth();

  // Users state
  const [users, setUsers] = useState<SupabaseUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [userFilter, setUserFilter] = useState('all'); // all | confirmed | unconfirmed

  // Load real users from Supabase
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers();
      if (error) throw error;
      setUsers(data.users as SupabaseUser[]);
    } catch (err: any) {
      setUsersError(err.message || 'Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Confirm a user's email
  const confirmEmail = async (userId: string) => {
    setActionLoading(userId + '_confirm');
    setActionSuccess('');
    try {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        email_confirm: true,
      });
      if (error) throw error;
      setActionSuccess('Email confirmed successfully!');
      await fetchUsers();
    } catch (err: any) {
      setUsersError(err.message || 'Failed to confirm email');
    } finally {
      setActionLoading(null);
    }
  };

  // Delete a user
  const deleteUser = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete user ${email}? This cannot be undone.`)) return;
    setActionLoading(userId + '_delete');
    setActionSuccess('');
    try {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (error) throw error;
      setActionSuccess(`User ${email} deleted.`);
      await fetchUsers();
    } catch (err: any) {
      setUsersError(err.message || 'Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  // Stats from mock data (replace with real queries when ready)
  const stats = useMemo(() => {
    const totalLostItems = mockLostItems.length;
    const totalFoundItems = mockFoundItems.length;
    const totalMatches = mockMatches.length;
    const activeMatches = mockMatches.filter((m) => m.status === 'pending').length;
    const confirmedMatches = mockMatches.filter((m) => m.status === 'confirmed').length;
    const highConfidenceMatches = mockMatches.filter((m) => m.confidenceScore > 0.8).length;
    const confirmedUsers = users.filter((u) => u.email_confirmed_at).length;
    const unconfirmedUsers = users.filter((u) => !u.email_confirmed_at).length;

    const recentActivity = [
      ...mockLostItems.map((item) => ({ type: 'lost', item, timestamp: item.createdAt })),
      ...mockFoundItems.map((item) => ({ type: 'found', item, timestamp: item.createdAt })),
      ...mockMatches.map((match) => ({ type: 'match', match, timestamp: match.createdAt })),
    ]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    return {
      totalUsers: users.length,
      confirmedUsers,
      unconfirmedUsers,
      totalLostItems,
      totalFoundItems,
      totalMatches,
      activeMatches,
      confirmedMatches,
      highConfidenceMatches,
      recentActivity,
    };
  }, [users]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const name = user.user_metadata?.full_name || '';
      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        userFilter === 'all' ||
        (userFilter === 'confirmed' && user.email_confirmed_at) ||
        (userFilter === 'unconfirmed' && !user.email_confirmed_at);
      return matchesSearch && matchesFilter;
    });
  }, [users, searchQuery, userFilter]);

  const filteredItems = useMemo(() => {
    const allItems = [
      ...mockLostItems.map((item) => ({ ...item, itemType: 'lost' as const })),
      ...mockFoundItems.map((item) => ({ ...item, itemType: 'found' as const })),
    ];
    return allItems.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [searchQuery, filterStatus, filterCategory]);

  const filteredMatches = useMemo(() => {
    return mockMatches.filter((match) => filterStatus === 'all' || match.status === filterStatus);
  }, [filterStatus]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAdmin()) return <Navigate to={ROUTE_PATHS.HOME} replace />;

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-4 py-8 mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-2">Platform oversight and management tools</p>
            </div>
            <Badge variant="secondary" className="px-4 py-2">
              <Shield className="w-4 h-4 mr-2" />
              Administrator
            </Badge>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                title: 'Total Users',
                value: stats.totalUsers,
                sub: `${stats.confirmedUsers} confirmed, ${stats.unconfirmedUsers} pending`,
                icon: <Users className="w-4 h-4 text-primary" />,
                border: 'border-primary/20',
                delay: 0.1,
              },
              {
                title: 'Total Items',
                value: stats.totalLostItems + stats.totalFoundItems,
                sub: `${stats.totalLostItems} lost, ${stats.totalFoundItems} found`,
                icon: <Package className="w-4 h-4 text-accent" />,
                border: 'border-accent/20',
                delay: 0.2,
              },
              {
                title: 'AI Matches',
                value: stats.totalMatches,
                sub: `${stats.highConfidenceMatches} high confidence (>80%)`,
                icon: <TrendingUp className="w-4 h-4 text-chart-3" />,
                border: 'border-chart-3/20',
                delay: 0.3,
              },
              {
                title: 'Unconfirmed Emails',
                value: stats.unconfirmedUsers,
                sub: 'Users needing email confirmation',
                icon: <Mail className="w-4 h-4 text-destructive" />,
                border: 'border-destructive/20',
                delay: 0.4,
              },
            ].map((s) => (
              <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: s.delay }}>
                <Card className={s.border}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">{s.title}</CardTitle>
                    {s.icon}
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{s.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview"><BarChart3 className="w-4 h-4 mr-2" />Overview</TabsTrigger>
              <TabsTrigger value="users"><Users className="w-4 h-4 mr-2" />Users</TabsTrigger>
              <TabsTrigger value="items"><Package className="w-4 h-4 mr-2" />Items</TabsTrigger>
              <TabsTrigger value="matches"><Activity className="w-4 h-4 mr-2" />Matches</TabsTrigger>
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Analytics</CardTitle>
                  <CardDescription>Real-time system statistics and performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { label: 'Match Success Rate', value: stats.confirmedMatches / (stats.totalMatches || 1), color: 'bg-chart-3' },
                      { label: 'Active Matches', value: stats.activeMatches / (stats.totalMatches || 1), color: 'bg-accent' },
                      { label: 'Email Confirmation Rate', value: stats.confirmedUsers / (stats.totalUsers || 1), color: 'bg-primary' },
                    ].map((bar) => (
                      <div key={bar.label} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{bar.label}</span>
                          <span className="text-sm text-muted-foreground">{Math.round(bar.value * 100)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className={`${bar.color} h-2 rounded-full transition-all duration-500`} style={{ width: `${bar.value * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest platform events and user actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <div className="flex-shrink-0">
                          {activity.type === 'lost' && <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-destructive" /></div>}
                          {activity.type === 'found' && <div className="w-10 h-10 rounded-full bg-chart-3/10 flex items-center justify-center"><CheckCircle className="w-5 h-5 text-chart-3" /></div>}
                          {activity.type === 'match' && <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center"><Activity className="w-5 h-5 text-accent" /></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            {activity.type === 'lost' && 'item' in activity && `Lost Item: ${activity.item.title}`}
                            {activity.type === 'found' && 'item' in activity && `Found Item: ${activity.item.title}`}
                            {activity.type === 'match' && 'match' in activity && `AI Match Generated (${Math.round(activity.match.confidenceScore * 100)}% confidence)`}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{activity.timestamp.toLocaleString()}</span>
                            {(activity.type === 'lost' || activity.type === 'found') && 'item' in activity && (
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{activity.item.location.name}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* USERS TAB */}
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>User Management</CardTitle>
                      <CardDescription>Manage real users from Supabase — confirm emails, delete accounts</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchUsers} disabled={usersLoading}>
                      <RefreshCw className={`w-4 h-4 mr-2 ${usersLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Feedback messages */}
                  {actionSuccess && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 text-sm text-green-500 bg-green-500/10 border border-green-500/20 px-4 py-3 rounded-lg flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />{actionSuccess}
                    </motion.div>
                  )}
                  {usersError && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-lg flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />{usersError}
                    </motion.div>
                  )}

                  {/* Filters */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={userFilter} onValueChange={setUserFilter}>
                      <SelectTrigger className="w-44">
                        <SelectValue placeholder="Filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="unconfirmed">Unconfirmed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {usersLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                  ) : (
                    <div className="rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Email Status</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead>Last Sign In</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredUsers.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                No users found
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredUsers.map((user) => (
                              <TableRow key={user.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{user.user_metadata?.full_name || '—'}</p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {user.email_confirmed_at ? (
                                    <Badge variant="default" className="bg-green-500/15 text-green-500 border-green-500/20">
                                      <UserCheck className="w-3 h-3 mr-1" />Confirmed
                                    </Badge>
                                  ) : (
                                    <Badge variant="destructive" className="bg-orange-500/15 text-orange-400 border-orange-500/20">
                                      <Mail className="w-3 h-3 mr-1" />Unconfirmed
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                  {new Date(user.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                  {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : '—'}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {!user.email_confirmed_at && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => confirmEmail(user.id)}
                                        disabled={actionLoading === user.id + '_confirm'}
                                        className="text-green-500 border-green-500/30 hover:bg-green-500/10"
                                      >
                                        {actionLoading === user.id + '_confirm' ? (
                                          <RefreshCw className="w-3 h-3 animate-spin" />
                                        ) : (
                                          <><UserCheck className="w-3 h-3 mr-1" />Confirm</>
                                        )}
                                      </Button>
                                    )}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => deleteUser(user.id, user.email)}
                                      disabled={actionLoading === user.id + '_delete'}
                                      className="text-destructive border-destructive/30 hover:bg-destructive/10"
                                    >
                                      {actionLoading === user.id + '_delete' ? (
                                        <RefreshCw className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <><Trash2 className="w-3 h-3 mr-1" />Delete</>
                                      )}
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ITEMS TAB */}
            <TabsContent value="items" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Item Management</CardTitle>
                  <CardDescription>Monitor and manage lost and found items</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="Search items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="matched">Matched</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {ITEM_CATEGORIES.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <img src={item.imageUrl} alt={item.title} className="w-12 h-12 rounded-lg object-cover" />
                                <div>
                                  <p className="font-medium">{item.title}</p>
                                  <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={item.itemType === 'lost' ? 'destructive' : 'default'}>{item.itemType}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{item.category}</TableCell>
                            <TableCell className="text-muted-foreground">{item.location.name}</TableCell>
                            <TableCell>
                              <Badge variant={item.status === 'active' ? 'secondary' : item.status === 'matched' ? 'default' : 'outline'}>
                                {item.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {item.itemType === 'lost' ? item.dateLost.toLocaleDateString() : item.dateFound.toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* MATCHES TAB */}
            <TabsContent value="matches" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Match Management</CardTitle>
                  <CardDescription>Monitor AI-generated matches and confidence scores</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-6">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Match ID</TableHead>
                          <TableHead>Confidence</TableHead>
                          <TableHead>Breakdown</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMatches.map((match) => {
                          const lostItem = mockLostItems.find((i) => i.id === match.lostItemId);
                          const foundItem = mockFoundItems.find((i) => i.id === match.foundItemId);
                          return (
                            <TableRow key={match.id}>
                              <TableCell>
                                <p className="font-medium text-sm">{match.id}</p>
                                <p className="text-xs text-muted-foreground">{lostItem?.title} ↔ {foundItem?.title}</p>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm font-bold">{Math.round(match.confidenceScore * 100)}%</div>
                                <div className="w-16 bg-muted rounded-full h-1.5 mt-1">
                                  <div className="bg-accent h-1.5 rounded-full" style={{ width: `${match.confidenceScore * 100}%` }} />
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1 text-xs">
                                  {[
                                    ['Image', match.breakdown.imageSimilarity],
                                    ['Text', match.breakdown.textSimilarity],
                                    ['Location', match.breakdown.locationProximity],
                                    ['Time', match.breakdown.timeProximity],
                                  ].map(([label, val]) => (
                                    <div key={label as string} className="flex justify-between">
                                      <span className="text-muted-foreground">{label}:</span>
                                      <span className="font-medium">{Math.round((val as number) * 100)}%</span>
                                    </div>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={match.status === 'confirmed' ? 'default' : match.status === 'rejected' ? 'destructive' : 'secondary'}>
                                  {match.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">{match.createdAt.toLocaleString()}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  Email notifications are automatically sent when match confidence exceeds 80%. {stats.highConfidenceMatches} high-confidence matches have been generated.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
