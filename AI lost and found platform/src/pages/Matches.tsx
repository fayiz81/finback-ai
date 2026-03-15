import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useItems } from '@/hooks/useItems';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Sparkles, TrendingUp, Clock, CheckCircle2, MapPin, Calendar,
  Search, Image as ImageIcon, Brain, Zap, Shield, ChevronDown,
  ChevronUp, Eye, Tag, Palette, Building2, Ruler, ArrowRight,
} from 'lucide-react';
import { buildEnhancedMatches, type EnhancedMatch } from '@/lib/index';

const spring = { type: 'spring' as const, stiffness: 280, damping: 32 };

// ── Confidence ring ─────────────────────────────────────────────────────────
function ConfidenceRing({ score, size = 72 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * score;
  const isHigh = score >= 0.7;
  const isMed = score >= 0.45;
  const color = isHigh ? '#34d399' : isMed ? '#fbbf24' : '#f87171';

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth={6} className="text-white/5" />
        <motion.circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={6} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ - dash}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span style={{ color, fontSize: size * 0.22, fontWeight: 700, fontFamily: 'monospace', lineHeight: 1 }}>
          {Math.round(score * 100)}%
        </span>
      </div>
    </div>
  );
}

// ── Signal pill ─────────────────────────────────────────────────────────────
function SignalPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
      <Sparkles className="w-2.5 h-2.5" />{label}
    </span>
  );
}

// ── Score bar ───────────────────────────────────────────────────────────────
function ScoreBar({ label, icon, value, color }: { label: string; icon: React.ReactNode; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">{icon}{label}</span>
        <span className="text-[10px] font-mono font-semibold">{Math.round(value * 100)}%</span>
      </div>
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <motion.div className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }} animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }} />
      </div>
    </div>
  );
}

// ── Match card ──────────────────────────────────────────────────────────────
function MatchCard({ match, index }: { match: EnhancedMatch; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const { lostItem, foundItem, confidenceScore, breakdown } = match;
  const isHigh = confidenceScore >= 0.7;
  const isMed = confidenceScore >= 0.45;

  const ringColor = isHigh ? 'emerald' : isMed ? 'amber' : 'red';
  const borderClass = isHigh ? 'border-emerald-500/25 hover:border-emerald-500/50'
    : isMed ? 'border-amber-500/25 hover:border-amber-500/50'
    : 'border-white/8 hover:border-white/20';

  const confidenceLabel = breakdown.confidence === 'high' ? 'High Match'
    : breakdown.confidence === 'medium' ? 'Possible Match' : 'Weak Match';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: index * 0.06 }}
      className={`rounded-2xl border ${borderClass} bg-white/[0.02] overflow-hidden transition-all duration-300`}
    >
      {/* Top confidence stripe */}
      <div className={`h-0.5 ${isHigh ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
        : isMed ? 'bg-gradient-to-r from-amber-500 to-orange-500'
        : 'bg-gradient-to-r from-red-500/50 to-red-400/50'}`} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
              isHigh ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : isMed ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>{confidenceLabel}</span>
            <span className="text-xs text-muted-foreground">Match #{index + 1}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex flex-wrap gap-1 max-w-xs justify-end">
              {breakdown.signals.slice(0, 2).map((s, i) => <SignalPill key={i} label={s} />)}
            </div>
            <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground transition-colors">
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {/* Main match layout */}
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* Lost item */}
          <div className="flex-1 w-full">
            <div className="flex gap-3 items-start p-3 rounded-xl bg-red-500/5 border border-red-500/10">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/5 border border-white/8 flex-shrink-0">
                {lostItem.image_url
                  ? <img src={lostItem.image_url} alt={lostItem.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-5 h-5 text-white/20" /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-widest text-red-400">Lost</span>
                <p className="font-semibold text-sm leading-tight mt-0.5 truncate">{lostItem.title}</p>
                <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{lostItem.description}</p>
                <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground">
                  <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                  <span className="truncate">{lostItem.location_name || `${lostItem.location_lat?.toFixed(4)}, ${lostItem.location_lng?.toFixed(4)}`}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0 px-2">
            <ConfidenceRing score={confidenceScore} />
            <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
              <ArrowRight className="w-3 h-3" />
              <span>match</span>
            </div>
          </div>

          {/* Found item */}
          <div className="flex-1 w-full">
            <div className="flex gap-3 items-start p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/5 border border-white/8 flex-shrink-0">
                {foundItem.image_url
                  ? <img src={foundItem.image_url} alt={foundItem.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-5 h-5 text-white/20" /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400">Found</span>
                <p className="font-semibold text-sm leading-tight mt-0.5 truncate">{foundItem.title}</p>
                <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{foundItem.description}</p>
                <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground">
                  <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                  <span className="truncate">{foundItem.location_name || `${foundItem.location_lat?.toFixed(4)}, ${foundItem.location_lng?.toFixed(4)}`}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Calendar className="w-2.5 h-2.5" />
                  {new Date(foundItem.date_found || foundItem.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expanded breakdown */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">AI Signal Breakdown</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <ScoreBar label="Visual Similarity" icon={<Eye size={10} />} value={breakdown.imageSimilarity} color="bg-blue-500" />
                  <ScoreBar label="Text / Description" icon={<Brain size={10} />} value={breakdown.textSimilarity} color="bg-violet-500" />
                  <ScoreBar label="Color Match" icon={<Palette size={10} />} value={breakdown.colorMatch} color="bg-rose-500" />
                  <ScoreBar label="Brand / Make" icon={<Building2 size={10} />} value={breakdown.brandMatch} color="bg-amber-500" />
                  <ScoreBar label="Physical Desc" icon={<Ruler size={10} />} value={breakdown.physicalDescMatch} color="bg-teal-500" />
                  <ScoreBar label="Category" icon={<Tag size={10} />} value={breakdown.categorySimilarity} color="bg-indigo-500" />
                  <ScoreBar label="Location Proximity" icon={<MapPin size={10} />} value={breakdown.locationProximity} color="bg-emerald-500" />
                  <ScoreBar label="Time Proximity" icon={<Clock size={10} />} value={breakdown.timeProximity} color="bg-orange-500" />
                </div>
                {breakdown.signals.length > 0 && (
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-2">Detected signals:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {breakdown.signals.map((s, i) => <SignalPill key={i} label={s} />)}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Matches() {
  const { lostItems, foundItems, loading } = useItems();
  const [sortBy, setSortBy] = useState('confidence');
  const [filterConf, setFilterConf] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const allMatches = useMemo(() => buildEnhancedMatches(lostItems, foundItems, 0.2), [lostItems, foundItems]);

  const filteredMatches = useMemo(() => {
    let list = [...allMatches];
    if (searchQuery) list = list.filter(m =>
      m.lostItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.foundItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.breakdown.signals.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    if (filterConf === 'high') list = list.filter(m => m.confidenceScore >= 0.7);
    else if (filterConf === 'medium') list = list.filter(m => m.confidenceScore >= 0.45 && m.confidenceScore < 0.7);
    else if (filterConf === 'low') list = list.filter(m => m.confidenceScore < 0.45);
    if (sortBy === 'confidence') list.sort((a, b) => b.confidenceScore - a.confidenceScore);
    else list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return list;
  }, [allMatches, searchQuery, sortBy, filterConf]);

  const stats = useMemo(() => ({
    total: allMatches.length,
    high: allMatches.filter(m => m.confidenceScore >= 0.7).length,
    medium: allMatches.filter(m => m.confidenceScore >= 0.45 && m.confidenceScore < 0.7).length,
    avgScore: allMatches.length > 0 ? Math.round(allMatches.reduce((s, m) => s + m.confidenceScore, 0) / allMatches.length * 100) : 0,
  }), [allMatches]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-5xl">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="mb-10">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-transparent border border-primary/20">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-4xl font-bold tracking-tight">AI Matches</h1>
                <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  Live Engine
                </span>
              </div>
              <p className="text-muted-foreground">
                Multi-signal AI using NLP, color detection, brand recognition, geo-proximity & time analysis
              </p>
            </div>
          </div>
        </motion.div>

        {/* Engine info cards */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: Brain, label: 'NLP Engine', desc: 'TF-IDF weighted token matching', color: 'text-violet-400', bg: 'bg-violet-500/5 border-violet-500/15' },
            { icon: Palette, label: 'Visual Analysis', desc: 'Color + brand + physical desc', color: 'text-rose-400', bg: 'bg-rose-500/5 border-rose-500/15' },
            { icon: MapPin, label: 'Geo Intelligence', desc: 'Adaptive radius by item type', color: 'text-emerald-400', bg: 'bg-emerald-500/5 border-emerald-500/15' },
          ].map((e, i) => {
            const Icon = e.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: i * 0.08 }}
                className={`rounded-xl border ${e.bg} p-3`}>
                <Icon className={`w-4 h-4 ${e.color} mb-2`} />
                <p className="text-xs font-semibold">{e.label}</p>
                <p className="text-[10px] text-muted-foreground">{e.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Total Matches', value: stats.total, icon: TrendingUp, color: '' },
            { label: 'High Confidence', value: stats.high, icon: Sparkles, color: 'text-emerald-400' },
            { label: 'Possible Matches', value: stats.medium, icon: Clock, color: 'text-amber-400' },
            { label: 'Avg Score', value: `${stats.avgScore}%`, icon: CheckCircle2, color: 'text-primary' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: i * 0.06 }}
                className="rounded-xl border border-border/40 bg-card/30 p-4">
                <Icon className={`w-4 h-4 mb-2 ${s.color || 'text-muted-foreground'}`} />
                <div className={`text-2xl font-bold font-mono mb-0.5 ${s.color}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by item name or signal..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-2">
            {(['all','high','medium','low'] as const).map(f => (
              <button key={f} onClick={() => setFilterConf(f)}
                className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all border ${
                  filterConf === f ? 'bg-primary/15 text-primary border-primary/30' : 'bg-card/30 text-muted-foreground border-border/30 hover:text-foreground'
                }`}>{f === 'all' ? 'All' : `${f.charAt(0).toUpperCase() + f.slice(1)}`}
              </button>
            ))}
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="confidence">By Confidence</SelectItem>
              <SelectItem value="date">By Date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                <div className="inline-flex items-center gap-3 text-muted-foreground">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Running AI matching engine…
                </div>
              </motion.div>
            ) : filteredMatches.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 rounded-2xl border border-border/30 bg-card/20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <Sparkles className="w-7 h-7 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No matches found</h3>
                <p className="text-muted-foreground text-sm">
                  {allMatches.length > 0 ? 'Try adjusting your filters' : 'Submit lost and found items to generate AI matches'}
                </p>
              </motion.div>
            ) : filteredMatches.map((match, i) => (
              <MatchCard key={match.id} match={match} index={i} />
            ))}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
