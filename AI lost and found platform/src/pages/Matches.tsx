import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useItems } from '@/hooks/useItems';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Sparkles, TrendingUp, Clock, CheckCircle2, MapPin, Calendar,
  Search, Image as ImageIcon, Brain, Palette, ChevronDown,
  ChevronUp, Eye, Tag, Building2, Ruler, ArrowRight,
} from 'lucide-react';
import { buildEnhancedMatches, type EnhancedMatch } from '@/lib/index';

const spring = { type: 'spring' as const, stiffness: 280, damping: 32 };

const glass = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 20,
} as React.CSSProperties;

// ── Confidence ring ──────────────────────────────────────────────────────────
function ConfidenceRing({ score, size = 72 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * score;
  const isHigh = score >= 0.7;
  const isMed = score >= 0.45;
  const color = isHigh ? '#34d399' : isMed ? '#fbbf24' : '#f87171';

  return (
    <div style={{ position:'relative', flexShrink:0, width:size, height:size }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
        <motion.circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={6} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ - dash}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span style={{ color, fontSize:size*0.22, fontWeight:700, fontFamily:'monospace', lineHeight:1 }}>
          {Math.round(score * 100)}%
        </span>
      </div>
    </div>
  );
}

// ── Signal pill ──────────────────────────────────────────────────────────────
function SignalPill({ label }: { label: string }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 9px', borderRadius:20, fontSize:10, fontWeight:500, background:'rgba(124,58,237,0.12)', color:'#a78bfa', border:'1px solid rgba(124,58,237,0.2)' }}>
      <Sparkles style={{ width:9, height:9 }} />{label}
    </span>
  );
}

// ── Score bar ────────────────────────────────────────────────────────────────
function ScoreBar({ label, icon, value, color }: { label: string; icon: React.ReactNode; value: number; color: string }) {
  return (
    <div style={{ marginBottom:2 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:5 }}>
        <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'rgba(255,255,255,0.4)' }}>{icon}{label}</span>
        <span style={{ fontSize:11, fontFamily:'monospace', fontWeight:600, color:'rgba(255,255,255,0.7)' }}>{Math.round(value * 100)}%</span>
      </div>
      <div style={{ height:4, background:'rgba(255,255,255,0.06)', borderRadius:2, overflow:'hidden' }}>
        <motion.div style={{ height:'100%', borderRadius:2, background:color }}
          initial={{ width:0 }} animate={{ width:`${value * 100}%` }}
          transition={{ duration:0.8, ease:'easeOut', delay:0.2 }} />
      </div>
    </div>
  );
}

// ── Match card ───────────────────────────────────────────────────────────────
function MatchCard({ match, index }: { match: EnhancedMatch; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const { lostItem, foundItem, confidenceScore, breakdown } = match;
  const isHigh = confidenceScore >= 0.7;
  const isMed = confidenceScore >= 0.45;

  const accentColor = isHigh ? '#34d399' : isMed ? '#fbbf24' : '#f87171';
  const accentBg = isHigh ? 'rgba(52,211,153,0.06)' : isMed ? 'rgba(251,191,36,0.06)' : 'rgba(239,68,68,0.06)';
  const accentBorder = isHigh ? 'rgba(52,211,153,0.2)' : isMed ? 'rgba(251,191,36,0.2)' : 'rgba(239,68,68,0.2)';
  const stripGradient = isHigh ? 'linear-gradient(90deg,#34d399,#059669)'
    : isMed ? 'linear-gradient(90deg,#fbbf24,#d97706)'
    : 'linear-gradient(90deg,rgba(239,68,68,0.6),rgba(220,38,38,0.4))';

  const confidenceLabel = breakdown.confidence === 'high' ? 'High Match'
    : breakdown.confidence === 'medium' ? 'Possible Match' : 'Weak Match';

  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ ...spring, delay:index*0.06 }}>
      <div style={{ background:accentBg, border:`1px solid ${accentBorder}`, borderRadius:20, overflow:'hidden', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', transition:'border-color 0.3s' }}>
        {/* Top stripe */}
        <div style={{ height:2, background:stripGradient }} />

        <div style={{ padding:20 }}>
          {/* Header */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:12, fontWeight:600, padding:'4px 12px', borderRadius:20, background:accentBg, color:accentColor, border:`1px solid ${accentBorder}` }}>
                {confidenceLabel}
              </span>
              <span style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>Match #{index + 1}</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ display:'flex', flexWrap:'wrap', gap:5, maxWidth:240, justifyContent:'flex-end' }}>
                {breakdown.signals.slice(0, 2).map((s, i) => <SignalPill key={i} label={s} />)}
              </div>
              <button onClick={() => setExpanded(!expanded)}
                style={{ width:28, height:28, borderRadius:8, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.4)', cursor:'pointer' }}>
                {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>
          </div>

          {/* Match layout */}
          <div style={{ display:'flex', flexDirection:'column', gap:12, alignItems:'center' }} className="lg:flex-row">
            {/* Lost item */}
            <div style={{ flex:1, width:'100%' }}>
              <div style={{ display:'flex', gap:12, alignItems:'flex-start', padding:14, borderRadius:14, background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.12)' }}>
                <div style={{ width:52, height:52, borderRadius:12, overflow:'hidden', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', flexShrink:0 }}>
                  {lostItem.image_url
                    ? <img src={lostItem.image_url} alt={lostItem.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}><ImageIcon style={{ width:18, height:18, color:'rgba(255,255,255,0.15)' }} /></div>}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <span style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#f87171' }}>Lost</span>
                  <p style={{ fontSize:13, fontWeight:600, color:'#fff', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{lostItem.title}</p>
                  <p style={{ fontSize:11, color:'rgba(255,255,255,0.4)', lineHeight:1.4, marginTop:3, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{lostItem.description}</p>
                  <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:6, fontSize:10, color:'rgba(255,255,255,0.3)' }}>
                    <MapPin style={{ width:9, height:9, flexShrink:0 }} />
                    <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{lostItem.location_name || `${lostItem.location_lat?.toFixed(4)}, ${lostItem.location_lng?.toFixed(4)}`}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Score center */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, flexShrink:0, padding:'0 8px' }}>
              <ConfidenceRing score={confidenceScore} />
              <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:9, color:'rgba(255,255,255,0.3)' }}>
                <ArrowRight style={{ width:10, height:10 }} /><span>match</span>
              </div>
            </div>

            {/* Found item */}
            <div style={{ flex:1, width:'100%' }}>
              <div style={{ display:'flex', gap:12, alignItems:'flex-start', padding:14, borderRadius:14, background:'rgba(52,211,153,0.06)', border:'1px solid rgba(52,211,153,0.12)' }}>
                <div style={{ width:52, height:52, borderRadius:12, overflow:'hidden', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', flexShrink:0 }}>
                  {foundItem.image_url
                    ? <img src={foundItem.image_url} alt={foundItem.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}><ImageIcon style={{ width:18, height:18, color:'rgba(255,255,255,0.15)' }} /></div>}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <span style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#34d399' }}>Found</span>
                  <p style={{ fontSize:13, fontWeight:600, color:'#fff', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{foundItem.title}</p>
                  <p style={{ fontSize:11, color:'rgba(255,255,255,0.4)', lineHeight:1.4, marginTop:3, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{foundItem.description}</p>
                  <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:6, fontSize:10, color:'rgba(255,255,255,0.3)' }}>
                    <MapPin style={{ width:9, height:9, flexShrink:0 }} />
                    <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{foundItem.location_name || `${foundItem.location_lat?.toFixed(4)}, ${foundItem.location_lng?.toFixed(4)}`}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:10, color:'rgba(255,255,255,0.3)', marginTop:3 }}>
                    <Calendar style={{ width:9, height:9 }} />
                    {new Date(foundItem.date_found || foundItem.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Expanded breakdown */}
          <AnimatePresence>
            {expanded && (
              <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.25 }} style={{ overflow:'hidden' }}>
                <div style={{ marginTop:18, paddingTop:18, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>AI Signal Breakdown</p>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px 24px' }}>
                    <ScoreBar label="Visual Similarity" icon={<Eye size={10} />} value={breakdown.imageSimilarity} color="#3b82f6" />
                    <ScoreBar label="Text / Description" icon={<Brain size={10} />} value={breakdown.textSimilarity} color="#8b5cf6" />
                    <ScoreBar label="Color Match" icon={<Palette size={10} />} value={breakdown.colorMatch} color="#f43f5e" />
                    <ScoreBar label="Brand / Make" icon={<Building2 size={10} />} value={breakdown.brandMatch} color="#f59e0b" />
                    <ScoreBar label="Physical Desc" icon={<Ruler size={10} />} value={breakdown.physicalDescMatch} color="#14b8a6" />
                    <ScoreBar label="Category" icon={<Tag size={10} />} value={breakdown.categorySimilarity} color="#6366f1" />
                    <ScoreBar label="Location Proximity" icon={<MapPin size={10} />} value={breakdown.locationProximity} color="#10b981" />
                    <ScoreBar label="Time Proximity" icon={<Clock size={10} />} value={breakdown.timeProximity} color="#f97316" />
                  </div>
                  {breakdown.signals.length > 0 && (
                    <div style={{ marginTop:14 }}>
                      <p style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginBottom:8 }}>Detected signals:</p>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                        {breakdown.signals.map((s, i) => <SignalPill key={i} label={s} />)}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
    <div style={{ minHeight:'100vh', padding:'32px 16px' }}>
      <div style={{ maxWidth:900, margin:'0 auto' }}>

        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={spring} style={{ marginBottom:32 }}>
          <div style={{ display:'flex', alignItems:'flex-start', gap:16 }}>
            <div style={{ padding:14, borderRadius:18, background:'rgba(124,58,237,0.12)', border:'1px solid rgba(124,58,237,0.2)', backdropFilter:'blur(20px)' }}>
              <Brain style={{ width:28, height:28, color:'#a78bfa' }} />
            </div>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                <h1 style={{ fontSize:32, fontWeight:700, color:'#fff', margin:0, letterSpacing:'-0.02em' }}>AI Matches</h1>
                <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:11, padding:'4px 11px', borderRadius:20, background:'rgba(52,211,153,0.1)', color:'#34d399', border:'1px solid rgba(52,211,153,0.2)' }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:'#34d399', display:'inline-block' }} />
                  Live Engine
                </span>
              </div>
              <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14, margin:0 }}>
                Multi-signal AI using NLP, color detection, brand recognition, geo-proximity & time analysis
              </p>
            </div>
          </div>
        </motion.div>

        {/* Engine info cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
          {[
            { icon:Brain, label:'NLP Engine', desc:'TF-IDF weighted token matching', color:'#8b5cf6', bg:'rgba(139,92,246,0.08)', border:'rgba(139,92,246,0.15)' },
            { icon:Palette, label:'Visual Analysis', desc:'Color + brand + physical desc', color:'#f43f5e', bg:'rgba(244,63,94,0.08)', border:'rgba(244,63,94,0.15)' },
            { icon:MapPin, label:'Geo Intelligence', desc:'Adaptive radius by item type', color:'#34d399', bg:'rgba(52,211,153,0.08)', border:'rgba(52,211,153,0.15)' },
          ].map((e, i) => {
            const Icon = e.icon;
            return (
              <motion.div key={i} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ ...spring, delay:i*0.08 }}
                style={{ background:e.bg, border:`1px solid ${e.border}`, borderRadius:14, padding:14, backdropFilter:'blur(20px)' }}>
                <Icon style={{ width:16, height:16, color:e.color, marginBottom:8 }} />
                <p style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.8)', margin:'0 0 3px' }}>{e.label}</p>
                <p style={{ fontSize:11, color:'rgba(255,255,255,0.35)', margin:0 }}>{e.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:20 }}>
          {[
            { label:'Total Matches', value:stats.total, icon:TrendingUp, color:'' },
            { label:'High Confidence', value:stats.high, icon:Sparkles, color:'#34d399' },
            { label:'Possible Matches', value:stats.medium, icon:Clock, color:'#fbbf24' },
            { label:'Avg Score', value:`${stats.avgScore}%`, icon:CheckCircle2, color:'#a78bfa' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={i} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ ...spring, delay:i*0.06 }}
                style={{ ...glass, padding:16 }}>
                <Icon style={{ width:16, height:16, color:s.color||'rgba(255,255,255,0.3)', marginBottom:10 }} />
                <div style={{ fontSize:24, fontWeight:700, fontFamily:'monospace', color:s.color||'#fff', marginBottom:3 }}>{s.value}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)' }}>{s.label}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Filters */}
        <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:10, marginBottom:20 }}>
          <div style={{ position:'relative', flex:1, minWidth:200 }}>
            <Search style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', width:15, height:15, color:'rgba(255,255,255,0.3)' }} />
            <input
              placeholder="Search by item name or signal..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width:'100%', padding:'10px 14px 10px 36px', borderRadius:12, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.8)', fontSize:13, outline:'none', boxSizing:'border-box', backdropFilter:'blur(20px)' }}
            />
          </div>
          <div style={{ display:'flex', gap:5, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:3 }}>
            {(['all','high','medium','low'] as const).map(f => (
              <button key={f} onClick={() => setFilterConf(f)}
                style={{
                  padding:'7px 14px', borderRadius:9, fontSize:12, fontWeight:500, cursor:'pointer', transition:'all 0.2s', textTransform:'capitalize',
                  background: filterConf === f ? 'rgba(124,58,237,0.25)' : 'transparent',
                  color: filterConf === f ? '#a78bfa' : 'rgba(255,255,255,0.4)',
                  border: filterConf === f ? '1px solid rgba(124,58,237,0.3)' : '1px solid transparent',
                }}>
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            style={{ padding:'10px 14px', borderRadius:12, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.7)', fontSize:13, outline:'none', backdropFilter:'blur(20px)' }}>
            <option value="confidence" style={{ background:'#1a0533' }}>By Confidence</option>
            <option value="date" style={{ background:'#1a0533' }}>By Date</option>
          </select>
        </div>

        {/* Results */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <AnimatePresence mode="popLayout">
            {loading ? (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ textAlign:'center', padding:'64px 0' }}>
                <div style={{ display:'inline-flex', alignItems:'center', gap:12, color:'rgba(255,255,255,0.4)', fontSize:14 }}>
                  <div style={{ width:18, height:18, border:'2px solid rgba(124,58,237,0.4)', borderTopColor:'#7c3aed', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                  Running AI matching engine…
                </div>
              </motion.div>
            ) : filteredMatches.length === 0 ? (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                style={{ textAlign:'center', padding:'64px 0', borderRadius:20, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width:60, height:60, borderRadius:'50%', background:'rgba(255,255,255,0.04)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                  <Sparkles style={{ width:24, height:24, color:'rgba(255,255,255,0.15)' }} />
                </div>
                <h3 style={{ fontSize:17, fontWeight:600, color:'rgba(255,255,255,0.6)', marginBottom:8 }}>No matches found</h3>
                <p style={{ color:'rgba(255,255,255,0.3)', fontSize:13 }}>
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
