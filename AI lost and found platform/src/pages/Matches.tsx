import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useItems } from '@/hooks/useItems';
import { AIMatchingEngine } from '@/components/AIMatchingEngine';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Sparkles, TrendingUp, Clock, CheckCircle2, MapPin, Calendar, Filter, Search, Image as ImageIcon } from 'lucide-react';
import { calculateMatchScore, getDistanceInKm, getDaysDifference, normalizeScore } from '@/lib/index';

const spring = { type: 'spring' as const, stiffness: 300, damping: 35 };

// ── Build matches from real lost + found items ──────────────────────────────
function buildMatches(lostItems: any[], foundItems: any[]) {
  const results: any[] = [];

  for (const lost of lostItems) {
    for (const found of foundItems) {
      // Text similarity: category match + keyword overlap
      const sameCategory = lost.category === found.category ? 0.8 : 0.2;
      const lostWords = (lost.title + ' ' + lost.description).toLowerCase().split(/\s+/);
      const foundWords = (found.title + ' ' + found.description).toLowerCase().split(/\s+/);
      const shared = lostWords.filter((w) => w.length > 3 && foundWords.includes(w)).length;
      const textSim = Math.min(1, sameCategory * 0.5 + (shared / Math.max(lostWords.length, 1)) * 0.5);

      // Location proximity
      const locationProx = normalizeScore(
        getDistanceInKm(
          lost.location_lat || 0,
          lost.location_lng || 0,
          found.location_lat || 0,
          found.location_lng || 0
        ),
        10 // 10km max range
      );

      // Time proximity
      const lostDate = new Date(lost.date_lost || lost.created_at);
      const foundDate = new Date(found.date_found || found.created_at);
      const timeProx = normalizeScore(getDaysDifference(lostDate, foundDate), 30);

      // Image similarity: 0.5 baseline (no real vision here), boosted by category
      const imageSim = sameCategory === 0.8 ? 0.65 : 0.3;

      const score = calculateMatchScore(imageSim, textSim, locationProx, timeProx);

      // Only surface matches above 30% confidence
      if (score >= 0.3) {
        results.push({
          id: `${lost.id}-${found.id}`,
          lostItem: lost,
          foundItem: found,
          confidenceScore: score,
          breakdown: {
            imageSimilarity: imageSim,
            textSimilarity: textSim,
            locationProximity: locationProx,
            timeProximity: timeProx,
          },
          status: 'pending',
          createdAt: new Date(),
        });
      }
    }
  }

  // Sort by confidence descending
  return results.sort((a, b) => b.confidenceScore - a.confidenceScore);
}

// ── Match card ───────────────────────────────────────────────────────────────
function MatchRow({ match }: { match: any }) {
  const { lostItem, foundItem, confidenceScore, breakdown } = match;
  const pct = Math.round(confidenceScore * 100);
  const isHigh = confidenceScore > 0.7;

  return (
    <Card className="border-border/50 hover:border-primary/30 transition-all duration-200">
      <CardContent className="p-5">
        <div className="flex flex-col lg:flex-row gap-5">

          {/* Lost item */}
          <div className="flex-1 space-y-2">
            <Badge variant="outline" className="text-red-400 border-red-400/30 bg-red-400/10 text-xs">Lost</Badge>
            <div className="flex gap-3 items-start">
              {lostItem.image_url ? (
                <img src={lostItem.image_url} alt={lostItem.title} className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-border" />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <div>
                <p className="font-semibold text-sm">{lostItem.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{lostItem.description}</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {lostItem.location_name || 'Unknown location'}
                </div>
              </div>
            </div>
          </div>

          {/* Confidence score */}
          <div className="flex flex-col items-center justify-center px-4 gap-2">
            <div className={`text-2xl font-bold font-mono ${isHigh ? 'text-emerald-400' : 'text-amber-400'}`}>
              {pct}%
            </div>
            <div className="text-xs text-muted-foreground">match</div>
            {/* Mini breakdown */}
            <div className="w-24 space-y-1">
              {[
                { label: '🖼️', val: breakdown.imageSimilarity },
                { label: '📝', val: breakdown.textSimilarity },
                { label: '📍', val: breakdown.locationProximity },
                { label: '🕐', val: breakdown.timeProximity },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span className="text-[10px] w-4">{b.label}</span>
                  <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isHigh ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${Math.round(b.val * 100)}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground w-6">{Math.round(b.val * 100)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Found item */}
          <div className="flex-1 space-y-2">
            <Badge variant="outline" className="text-emerald-400 border-emerald-400/30 bg-emerald-400/10 text-xs">Found</Badge>
            <div className="flex gap-3 items-start">
              {foundItem.image_url ? (
                <img src={foundItem.image_url} alt={foundItem.title} className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-border" />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <div>
                <p className="font-semibold text-sm">{foundItem.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{foundItem.description}</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {foundItem.location_name || 'Unknown location'}
                </div>
                <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {new Date(foundItem.date_found || foundItem.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Matches() {
  const { lostItems, foundItems, isProcessingMatch, loading } = useItems();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('confidence');
  const [searchQuery, setSearchQuery] = useState('');

  const allMatches = useMemo(() => buildMatches(lostItems, foundItems), [lostItems, foundItems]);

  const filteredMatches = useMemo(() => {
    let list = [...allMatches];

    if (searchQuery) {
      list = list.filter((m) =>
        m.lostItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.foundItem.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortBy === 'confidence') {
      list.sort((a, b) => b.confidenceScore - a.confidenceScore);
    } else {
      list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    return list;
  }, [allMatches, searchQuery, sortBy]);

  const stats = useMemo(() => ({
    total: allMatches.length,
    highConfidence: allMatches.filter((m) => m.confidenceScore > 0.7).length,
    pending: allMatches.length,
    confirmed: 0,
  }), [allMatches]);

  // Convert to MatchResult shape for AIMatchingEngine component
  const matchResultShape = filteredMatches.map((m) => ({
    id: m.id,
    lostItemId: m.lostItem.id,
    foundItemId: m.foundItem.id,
    confidenceScore: m.confidenceScore,
    breakdown: m.breakdown,
    status: 'pending' as const,
    createdAt: m.createdAt,
  }));

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-4 py-12">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">AI Matches</h1>
                <p className="text-muted-foreground mt-1">Smart matching powered by advanced AI algorithms</p>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { label: 'Total Matches', value: stats.total, icon: TrendingUp },
              { label: 'High Confidence', value: stats.highConfidence, icon: Sparkles, highlight: true },
              { label: 'Pending', value: stats.pending, icon: Clock },
              { label: 'Confirmed', value: stats.confirmed, icon: CheckCircle2 },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: i * 0.07 }}>
                <Card className="border-border/50">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardDescription className="flex items-center gap-2 text-xs">
                      <s.icon className="w-3.5 h-3.5" /> {s.label}
                    </CardDescription>
                    <CardTitle className={`text-3xl font-bold ${s.highlight ? 'text-primary' : ''}`}>{s.value}</CardTitle>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* AI Engine status */}
          <div className="mb-8">
            <AIMatchingEngine isProcessing={loading || isProcessingMatch} matches={matchResultShape} />
          </div>

          {/* Results */}
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">Match Results</CardTitle>
                  <CardDescription className="mt-1">Review and manage your AI-generated matches</CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative w-56">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search matches..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                  </div>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confidence">By Confidence</SelectItem>
                      <SelectItem value="date">By Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <div className="text-center py-12 text-muted-foreground">Loading matches...</div>
                ) : filteredMatches.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                      <Sparkles className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No matches found yet</h3>
                    <p className="text-muted-foreground text-sm">Submit lost and found items to start AI matching</p>
                  </motion.div>
                ) : (
                  filteredMatches.map((match, index) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ ...spring, delay: index * 0.04 }}
                    >
                      <MatchRow match={match} />
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
