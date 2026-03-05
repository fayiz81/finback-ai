import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { mockUsers, mockLostItems, mockFoundItems, mockMatches } from '@/data/index';
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
  Users,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  BarChart3,
  Activity,
  Shield,
  Clock,
  MapPin,
  Mail,
} from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/index';

export default function AdminDashboard() {
  const { isAdmin, isLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const stats = useMemo(() => {
    const totalUsers = mockUsers.length;
    const totalLostItems = mockLostItems.length;
    const totalFoundItems = mockFoundItems.length;
    const totalMatches = mockMatches.length;
    const activeMatches = mockMatches.filter((m) => m.status === 'pending').length;
    const confirmedMatches = mockMatches.filter((m) => m.status === 'confirmed').length;
    const highConfidenceMatches = mockMatches.filter((m) => m.confidenceScore > 0.8).length;
    const spamReports = 0;

    const recentActivity = [
      ...mockLostItems.map((item) => ({
        type: 'lost',
        item,
        timestamp: item.createdAt,
      })),
      ...mockFoundItems.map((item) => ({
        type: 'found',
        item,
        timestamp: item.createdAt,
      })),
      ...mockMatches.map((match) => ({
        type: 'match',
        match,
        timestamp: match.createdAt,
      })),
    ]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    return {
      totalUsers,
      totalLostItems,
      totalFoundItems,
      totalMatches,
      activeMatches,
      confirmedMatches,
      highConfidenceMatches,
      spamReports,
      recentActivity,
    };
  }, []);

  const filteredUsers = useMemo(() => {
    return mockUsers.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [searchQuery]);

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
    return mockMatches.filter((match) => {
      const matchesStatus = filterStatus === 'all' || match.status === filterStatus;
      return matchesStatus;
    });
  }, [filterStatus]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin()) {
    return <Navigate to={ROUTE_PATHS.HOME} replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-4 py-8 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Platform oversight and management tools
              </p>
            </div>
            <Badge variant="secondary" className="px-4 py-2">
              <Shield className="w-4 h-4 mr-2" />
              Administrator
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="w-4 h-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Active platform members
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-accent/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                  <Package className="w-4 h-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {stats.totalLostItems + stats.totalFoundItems}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.totalLostItems} lost, {stats.totalFoundItems} found
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-chart-3/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">AI Matches</CardTitle>
                  <TrendingUp className="w-4 h-4 text-chart-3" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalMatches}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.highConfidenceMatches} high confidence ({'>'}80%)
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-destructive/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Spam Reports</CardTitle>
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.spamReports}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Pending review
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">
                <BarChart3 className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="w-4 h-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="items">
                <Package className="w-4 h-4 mr-2" />
                Items
              </TabsTrigger>
              <TabsTrigger value="matches">
                <Activity className="w-4 h-4 mr-2" />
                Matches
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Analytics</CardTitle>
                  <CardDescription>
                    Real-time system statistics and performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Match Success Rate</span>
                        <span className="text-sm text-muted-foreground">
                          {Math.round((stats.confirmedMatches / stats.totalMatches) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-chart-3 h-2 rounded-full"
                          style={{
                            width: `${(stats.confirmedMatches / stats.totalMatches) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Active Matches</span>
                        <span className="text-sm text-muted-foreground">
                          {stats.activeMatches}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-accent h-2 rounded-full"
                          style={{
                            width: `${(stats.activeMatches / stats.totalMatches) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Platform Health</span>
                        <span className="text-sm text-chart-3">Excellent</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-chart-3 h-2 rounded-full" style={{ width: '95%' }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest platform events and user actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex-shrink-0">
                          {activity.type === 'lost' && (
                            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                              <AlertTriangle className="w-5 h-5 text-destructive" />
                            </div>
                          )}
                          {activity.type === 'found' && (
                            <div className="w-10 h-10 rounded-full bg-chart-3/10 flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-chart-3" />
                            </div>
                          )}
                          {activity.type === 'match' && (
                            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                              <Activity className="w-5 h-5 text-accent" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            {activity.type === 'lost' && 'item' in activity && `Lost Item: ${activity.item.title}`}
                            {activity.type === 'found' && 'item' in activity && `Found Item: ${activity.item.title}`}
                            {activity.type === 'match' && 'match' in activity &&
                              `AI Match Generated (${Math.round(activity.match.confidenceScore * 100)}% confidence)`}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {activity.timestamp.toLocaleString()}
                            </span>
                            {(activity.type === 'lost' || activity.type === 'found') && 'item' in activity && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {activity.item.location.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Manage platform users and access control
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <img
                                  src={user.avatar}
                                  alt={user.name}
                                  className="w-8 h-8 rounded-full"
                                />
                                <span className="font-medium">{user.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {user.email}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={user.role === USER_ROLES.ADMIN ? 'default' : 'secondary'}
                              >
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {user.createdAt.toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="items" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Item Management</CardTitle>
                  <CardDescription>
                    Monitor and manage lost and found items
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="matched">Matched</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {ITEM_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
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
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.imageUrl}
                                  alt={item.title}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                                <div>
                                  <p className="font-medium">{item.title}</p>
                                  <p className="text-xs text-muted-foreground line-clamp-1">
                                    {item.description}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={item.itemType === 'lost' ? 'destructive' : 'default'}
                              >
                                {item.itemType}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {item.category}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {item.location.name}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  item.status === 'active'
                                    ? 'secondary'
                                    : item.status === 'matched'
                                    ? 'default'
                                    : 'outline'
                                }
                              >
                                {item.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {item.itemType === 'lost'
                                ? item.dateLost.toLocaleDateString()
                                : item.dateFound.toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                Review
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="matches" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Match Management</CardTitle>
                  <CardDescription>
                    Monitor AI-generated matches and confidence scores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-6">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
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
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMatches.map((match) => {
                          const lostItem = mockLostItems.find((i) => i.id === match.lostItemId);
                          const foundItem = mockFoundItems.find(
                            (i) => i.id === match.foundItemId
                          );

                          return (
                            <TableRow key={match.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium text-sm">{match.id}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {lostItem?.title} ↔ {foundItem?.title}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="w-16">
                                    <div className="text-sm font-bold">
                                      {Math.round(match.confidenceScore * 100)}%
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                                      <div
                                        className="bg-accent h-1.5 rounded-full"
                                        style={{
                                          width: `${match.confidenceScore * 100}%`,
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1 text-xs">
                                  <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Image:</span>
                                    <span className="font-medium">
                                      {Math.round(match.breakdown.imageSimilarity * 100)}%
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Text:</span>
                                    <span className="font-medium">
                                      {Math.round(match.breakdown.textSimilarity * 100)}%
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Location:</span>
                                    <span className="font-medium">
                                      {Math.round(match.breakdown.locationProximity * 100)}%
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Time:</span>
                                    <span className="font-medium">
                                      {Math.round(match.breakdown.timeProximity * 100)}%
                                    </span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    match.status === 'confirmed'
                                      ? 'default'
                                      : match.status === 'rejected'
                                      ? 'destructive'
                                      : 'secondary'
                                  }
                                >
                                  {match.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {match.createdAt.toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm">
                                  Details
                                </Button>
                              </TableCell>
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
                  Email notifications are automatically sent when match confidence exceeds 80%.
                  {stats.highConfidenceMatches} high-confidence matches have been generated.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
