import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, SlidersHorizontal, Grid3x3, List, Sparkles } from 'lucide-react';
import { ITEM_CATEGORIES } from '@/lib/index';
import { useItems } from '@/hooks/useItems';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MapPin, Calendar, Package } from 'lucide-react';

type ViewMode = 'grid' | 'list';
type SortOption = 'recent' | 'oldest' | 'category';

export default function Browse() {
  const { items, loading, lostItems, foundItems } = useItems();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeTab, setActiveTab] = useState<'lost' | 'found'>('lost');
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  const currentItems = useMemo(() => {
    const base = activeTab === 'lost' ? lostItems : foundItems;

    let filtered = base.filter(item => {
      const matchSearch =
        !searchQuery ||
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = category === 'all' || item.category === category;
      return matchSearch && matchCategory;
    });

    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === 'category') return (a.category || '').localeCompare(b.category || '');
      return 0;
    });

    return filtered;
  }, [activeTab, lostItems, foundItems, searchQuery, category, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-4 py-8 md:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-7xl mx-auto">

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-primary/10">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight">Browse Items</h1>
            </div>
            <p className="text-muted-foreground text-lg">Search through lost and found items</p>
          </div>

          {/* Search & Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by title, description, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[180px] h-12">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {ITEM_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'lost' | 'found')}>
                <TabsList>
                  <TabsTrigger value="lost" className="gap-2">
                    Lost Items <Badge variant="secondary">{lostItems.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="found" className="gap-2">
                    Found Items <Badge variant="secondary">{foundItems.length}</Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="category">By Category</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-1 border rounded-lg p-1">
                  <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('grid')}>
                    <Grid3x3 className="w-4 h-4" />
                  </Button>
                  <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('list')}>
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {currentItems.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <Filter className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No items found</h3>
                  <p className="text-muted-foreground">Try adjusting your filters or search query</p>
                </motion.div>
              ) : (
                <motion.div
                  key="items"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}
                >
                  {currentItems.map((item, index) => (
                    <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
                      <Card className="overflow-hidden border-border/50 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.01]">
                        <div className="relative h-48 overflow-hidden bg-muted">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-12 h-12 text-muted-foreground/30" />
                            </div>
                          )}
                          <div className="absolute top-3 right-3">
                            <Badge className={item.type === 'lost' ? 'bg-destructive/80 text-white' : 'bg-emerald-500/80 text-white'}>
                              {item.type}
                            </Badge>
                          </div>
                          <div className="absolute top-3 left-3">
                            <Badge variant="secondary" className="text-xs">{item.status}</Badge>
                          </div>
                        </div>
                        <CardHeader className="pb-2">
                          <h3 className="font-semibold text-lg line-clamp-1">{item.title}</h3>
                          <Badge variant="outline" className="w-fit text-xs">{item.category}</Badge>
                        </CardHeader>
                        <CardContent className="space-y-2 pb-4">
                          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                          {item.location_name && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <MapPin className="w-3.5 h-3.5 text-primary" />
                              <span className="line-clamp-1">{item.location_name}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            <span>{new Date(item.created_at).toLocaleDateString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {currentItems.length > 0 && (
            <div className="mt-8 text-center text-sm text-muted-foreground">
              Showing {currentItems.length} of {activeTab === 'lost' ? lostItems.length : foundItems.length} items
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
