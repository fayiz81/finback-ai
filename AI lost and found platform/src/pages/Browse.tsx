import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, SlidersHorizontal, Grid3x3, List, Sparkles } from 'lucide-react';
import { LostItem, FoundItem, ITEM_CATEGORIES } from '@/lib/index';
import { useItems } from '@/hooks/useItems';
import { LostItemCard, FoundItemCard } from '@/components/ItemCards';
import { FilterForm } from '@/components/Forms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';

type ViewMode = 'grid' | 'list';
type SortOption = 'recent' | 'oldest' | 'category';

interface FilterState {
  category: string;
  searchQuery: string;
  sortBy: SortOption;
  maxDistance?: number;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export default function Browse() {
  const { lostItems, foundItems, filterItems, isProcessingMatch } = useItems();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeTab, setActiveTab] = useState<'lost' | 'found'>('lost');
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    searchQuery: '',
    sortBy: 'recent',
  });
  const [showFilters, setShowFilters] = useState(false);

  const currentItems = useMemo(() => {
    const items = activeTab === 'lost' ? lostItems : foundItems;
    let filtered = filterItems(items, {
      category: filters.category === 'all' ? undefined : filters.category,
      searchQuery: filters.searchQuery,
      maxDistance: filters.maxDistance,
      dateRange: filters.dateRange,
    });

    switch (filters.sortBy) {
      case 'recent':
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        break;
      case 'category':
        filtered.sort((a, b) => a.category.localeCompare(b.category));
        break;
    }

    return filtered;
  }, [activeTab, lostItems, foundItems, filters, filterItems]);

  const handleFilterChange = (newFilters: any) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setShowFilters(false);
  };

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFilters((prev) => ({ ...prev, category: value }));
  };

  const handleSortChange = (value: SortOption) => {
    setFilters((prev) => ({ ...prev, sortBy: value }));
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.category !== 'all') count++;
    if (filters.searchQuery) count++;
    if (filters.maxDistance) count++;
    if (filters.dateRange) count++;
    return count;
  }, [filters]);

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-4 py-8 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-primary/10">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight">Browse Items</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Search through lost and found items with AI-powered smart matching
            </p>
          </div>

          <div className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by title, description, or location..."
                  value={filters.searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>

              <div className="flex gap-2">
                <Select value={filters.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-[180px] h-12">
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

                <Sheet open={showFilters} onOpenChange={setShowFilters}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="h-12 gap-2">
                      <SlidersHorizontal className="w-4 h-4" />
                      Filters
                      {activeFiltersCount > 0 && (
                        <Badge variant="secondary" className="ml-1">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Advanced Filters</SheetTitle>
                      <SheetDescription>
                        Refine your search with additional filters
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterForm onFilter={handleFilterChange} />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'lost' | 'found')}>
                <TabsList>
                  <TabsTrigger value="lost" className="gap-2">
                    Lost Items
                    <Badge variant="secondary">{lostItems.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="found" className="gap-2">
                    Found Items
                    <Badge variant="secondary">{foundItems.length}</Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-2">
                <Select value={filters.sortBy} onValueChange={(v) => handleSortChange(v as SortOption)}>
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
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {isProcessingMatch && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3"
            >
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              <p className="text-sm font-medium">AI is analyzing matches in real-time...</p>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {currentItems.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <Filter className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No items found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search query
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="items"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                {currentItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {activeTab === 'lost' ? (
                      <LostItemCard item={item as LostItem} />
                    ) : (
                      <FoundItemCard item={item as FoundItem} />
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {currentItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 text-center text-sm text-muted-foreground"
            >
              Showing {currentItems.length} of {activeTab === 'lost' ? lostItems.length : foundItems.length} items
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
