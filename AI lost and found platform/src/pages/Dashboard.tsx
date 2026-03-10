import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, Search, TrendingUp, Package, CheckCircle,
  AlertCircle, ArrowRight, Sparkles,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useItems } from '@/hooks/useItems';
import { ROUTE_PATHS } from '@/lib/index';
import { LostItemCard, FoundItemCard, MatchCard } from '@/components/ItemCards';
import { AIMatchingEngine } from '@/components/AIMatchingEngine';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Dashboard() {
  const { user } = useAuth();
  const { lostItems, foundItems, matches, getUserItems, isProcessingMatch } = useItems();
  const [activeTab, setActiveTab] = useState('overview');

  // Fix: use Supabase user_metadata for name
  const displayName = user?.user_metadata?.full_name?.split(' ')[0]
    || user?.email?.split('@')[0]
    || 'User';

  const userItems = getUserItems(user?.id || '');
  const userLostItems = userItems.lostItems;
  const userFoundItems = userItems.foundItems;

  const userMatches = matches.filter(
    (match) =>
      userLostItems.some((item) => item.id === match.lostItemId) ||
      userFoundItems.some((item) => item.id === match.foundItemId)
  );

  const highConfidenceMatches = userMatches.filter((match) => match.confidenceScore > 0.8);
  const recentMatches = userMatches.slice(0, 3);

  const stats = [
    { title: 'Lost Items', value: userLostItems.length, icon: Package, color: 'text-destructive', bgColor: 'bg-destructive/10' },
    { title: 'Found Items', value: userFoundItems.length, icon: CheckCircle, color: 'text-accent', bgColor: 'bg-accent/10' },
    { title: 'AI Matches', value: userMatches.length, icon: Sparkles, color: 'text-primary', bgColor: 'bg-primary/10' },
    { title: 'High Confidence', value: highConfidenceMatches.length, icon: TrendingUp, color: 'text-chart-3', bgColor: 'bg-chart-3/10' },
  ];

  const quickActions = [
    { title: 'Report Lost Item', description: 'Upload details and let AI find matches', icon: AlertCircle, href: ROUTE_PATHS.SUBMIT, color: 'bg-destructive/10 text-destructive hover:bg-destructive/20' },
    { title: 'Report Found Item', description: 'Help someone recover their belongings', icon: CheckCircle, href: ROUTE_PATHS.SUBMIT, color: 'bg-accent/10 text-accent hover:bg-accent/20' },
    { title: 'Browse Items', description: 'Search through lost and found items', icon: Search, href: ROUTE_PATHS.BROWSE, color: 'bg-primary/10 text-primary hover:bg-primary/20' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-4 py-8 md:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              Welcome back, {displayName}
            </h1>
            <p className="text-muted-foreground text-lg">Your AI-powered lost and found dashboard</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                <Card className="border-border/50 hover:border-border transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                        <p className="text-3xl font-bold">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {quickActions.map((action, index) => (
              <motion.div key={action.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}>
                <Link to={action.href}>
                  <Card className={`border-border/50 hover:border-border transition-all duration-200 cursor-pointer group ${action.color}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <action.icon className="h-5 w-5" />
                            <h3 className="font-semibold">{action.title}</h3>
                          </div>
                          <p className="text-sm opacity-80">{action.description}</p>
                        </div>
                        <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="items">My Items</TabsTrigger>
              <TabsTrigger value="matches">AI Matches</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Recent AI Matches
                    </CardTitle>
                    <CardDescription>Latest matches found by our AI matching engine</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentMatches.length > 0 ? (
                      <div className="space-y-4">
                        {recentMatches.map((match) => <MatchCard key={match.id} match={match} />)}
                        {userMatches.length > 3 && (
                          <Link to={ROUTE_PATHS.MATCHES}>
                            <Button variant="outline" className="w-full">
                              View All Matches <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">No matches yet. Submit an item to start finding matches!</p>
                        <Link to={ROUTE_PATHS.SUBMIT}>
                          <Button><Plus className="mr-2 h-4 w-4" />Submit Item</Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {isProcessingMatch && (
                  <Card>
                    <CardHeader>
                      <CardTitle>AI Processing</CardTitle>
                      <CardDescription>Our AI is analyzing your items for potential matches</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AIMatchingEngine isProcessing={isProcessingMatch} matches={[]} />
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </TabsContent>

            <TabsContent value="items" className="space-y-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Lost Items</CardTitle>
                        <CardDescription>Items you've reported as lost</CardDescription>
                      </div>
                      <Badge variant="secondary">{userLostItems.length}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {userLostItems.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {userLostItems.slice(0, 6).map((item) => <LostItemCard key={item.id} item={item} />)}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No lost items reported yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Found Items</CardTitle>
                        <CardDescription>Items you've reported as found</CardDescription>
                      </div>
                      <Badge variant="secondary">{userFoundItems.length}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {userFoundItems.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {userFoundItems.slice(0, 6).map((item) => <FoundItemCard key={item.id} item={item} />)}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No found items reported yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="matches" className="space-y-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          All AI Matches
                        </CardTitle>
                        <CardDescription>Potential matches found by our AI system</CardDescription>
                      </div>
                      <Badge variant="secondary">{userMatches.length}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {userMatches.length > 0 ? (
                      <div className="space-y-4">
                        {userMatches.map((match) => <MatchCard key={match.id} match={match} />)}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">No matches found yet. Submit items to get AI-powered matches!</p>
                        <Link to={ROUTE_PATHS.SUBMIT}>
                          <Button><Plus className="mr-2 h-4 w-4" />Submit Item</Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
