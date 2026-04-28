import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Grid3x3, List, MapPin, Calendar, Package } from 'lucide-react';
import { ITEM_CATEGORIES } from '@/lib/index';
import { useItems } from '@/hooks/useItems';

type ViewMode = 'grid' | 'list';
type SortOption = 'recent' | 'oldest' | 'category';

const glass: React.CSSProperties = { background:'rgba(255,255,255,0.05)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:20 };
const glassStrong: React.CSSProperties = { background:'rgba(255,255,255,0.07)', backdropFilter:'blur(30px)', WebkitBackdropFilter:'blur(30px)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:14 };

function SkeletonCard() {
  return (
    <div style={{ ...glass, overflow:'hidden' }}>
      <motion.div animate={{ opacity:[0.3,0.6,0.3] }} transition={{ duration:1.5, repeat:Infinity }}
        style={{ height:180, background:'rgba(255,255,255,0.04)' }} />
      <div style={{ padding:16 }}>
        {[90,60,75].map((w,i) => (
          <motion.div key={i} animate={{ opacity:[0.2,0.5,0.2] }} transition={{ duration:1.5, repeat:Infinity, delay:i*0.15 }}
            style={{ height:i===0?15:9, width:`${w}%`, background:'rgba(255,255,255,0.06)', borderRadius:6, marginBottom:10 }} />
        ))}
      </div>
    </div>
  );
}

export default function Browse() {
  const { items, loading, lostItems, foundItems } = useItems();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeTab, setActiveTab] = useState<'lost'|'found'>('lost');
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  const currentItems = useMemo(() => {
    const base = activeTab === 'lost' ? lostItems : foundItems;
    let filtered = base.filter(item => {
      const matchSearch = !searchQuery || item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || item.description?.toLowerCase().includes(searchQuery.toLowerCase()) || item.location_name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch && (category === 'all' || item.category === category);
    });
    return [...filtered].sort((a,b) => {
      if (sortBy==='recent') return new Date(b.created_at).getTime()-new Date(a.created_at).getTime();
      if (sortBy==='oldest') return new Date(a.created_at).getTime()-new Date(b.created_at).getTime();
      return (a.category||'').localeCompare(b.category||'');
    });
  }, [activeTab, lostItems, foundItems, searchQuery, category, sortBy]);

  return (
    <div style={{ minHeight:'100vh', padding:'32px 16px', position:'relative' }}>
      {/* Ambient blobs */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }}>
        <motion.div animate={{ scale:[1,1.15,1], x:[0,30,0] }} transition={{ duration:20, repeat:Infinity, ease:'easeInOut' }}
          style={{ position:'absolute', top:'5%', right:'-10%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)', filter:'blur(40px)' }} />
        <motion.div animate={{ scale:[1,0.9,1], y:[0,-30,0] }} transition={{ duration:18, repeat:Infinity, ease:'easeInOut', delay:4 }}
          style={{ position:'absolute', bottom:'10%', left:'-5%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%)', filter:'blur(40px)' }} />
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', position:'relative', zIndex:1 }}>
        {/* Header */}
        <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, ease:[0.22,1,0.36,1] }} style={{ marginBottom:32 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:8 }}>
            <motion.div whileHover={{ scale:1.08, rotate:5 }}
              style={{ width:48, height:48, borderRadius:16, background:'rgba(124,58,237,0.15)', border:'1px solid rgba(124,58,237,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Search style={{ width:22, height:22, color:'#a78bfa' }} />
            </motion.div>
            <div>
              <h1 style={{ fontSize:34, fontWeight:800, color:'#fff', margin:0, letterSpacing:'-0.02em' }}>Browse Items</h1>
              <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14, margin:0 }}>Search through all lost and found items</p>
            </div>
          </div>
          <motion.div initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.3 }}
            style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 12px', borderRadius:20, background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.2)', marginTop:10 }}>
            <motion.span animate={{ opacity:[1,0.3,1] }} transition={{ duration:1.5, repeat:Infinity }}
              style={{ width:6, height:6, borderRadius:'50%', background:'#34d399', display:'inline-block' }} />
            <span style={{ fontSize:11, color:'#34d399', fontWeight:500 }}>{items.length} total items · Live</span>
          </motion.div>
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.12, duration:0.5 }} style={{ marginBottom:24 }}>
          <div style={{ display:'flex', gap:12, marginBottom:14, flexWrap:'wrap' }}>
            <div style={{ flex:1, minWidth:240, position:'relative' }}>
              <Search style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', width:16, height:16, color:'rgba(255,255,255,0.3)' }} />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by title, description, or location..."
                onFocus={e => (e.currentTarget.style.borderColor='rgba(124,58,237,0.5)')}
                onBlur={e => (e.currentTarget.style.borderColor='rgba(255,255,255,0.12)')}
                style={{ ...glassStrong, width:'100%', padding:'12px 14px 12px 42px', fontSize:14, color:'rgba(255,255,255,0.8)', outline:'none', boxSizing:'border-box', transition:'border-color 0.2s' }} />
            </div>
            <select value={category} onChange={e => setCategory(e.target.value)}
              style={{ ...glassStrong, padding:'12px 16px', fontSize:13, color:'rgba(255,255,255,0.7)', outline:'none', minWidth:160 }}>
              <option value="all" style={{ background:'#1a0533' }}>All Categories</option>
              {ITEM_CATEGORIES.map(cat => <option key={cat} value={cat} style={{ background:'#1a0533' }}>{cat}</option>)}
            </select>
          </div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
            <div style={{ display:'flex', gap:6, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:4 }}>
              {(['lost','found'] as const).map(tab => (
                <motion.button key={tab} onClick={() => setActiveTab(tab)} whileTap={{ scale:0.96 }}
                  style={{ padding:'8px 18px', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.2s', background:activeTab===tab?(tab==='lost'?'rgba(239,68,68,0.18)':'rgba(52,211,153,0.18)'):'transparent', color:activeTab===tab?(tab==='lost'?'#f87171':'#34d399'):'rgba(255,255,255,0.4)', border:activeTab===tab?`1px solid ${tab==='lost'?'rgba(239,68,68,0.35)':'rgba(52,211,153,0.35)'}`:'1px solid transparent' }}>
                  {tab==='lost'?'🔴':'🟢'} {tab==='lost'?'Lost':'Found'} Items
                  <span style={{ marginLeft:8, padding:'1px 7px', borderRadius:20, fontSize:11, background:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)' }}>
                    {tab==='lost'?lostItems.length:foundItems.length}
                  </span>
                </motion.button>
              ))}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as SortOption)}
                style={{ ...glassStrong, padding:'8px 14px', fontSize:12, color:'rgba(255,255,255,0.6)', outline:'none', borderRadius:10 }}>
                <option value="recent" style={{ background:'#1a0533' }}>Most Recent</option>
                <option value="oldest" style={{ background:'#1a0533' }}>Oldest First</option>
                <option value="category" style={{ background:'#1a0533' }}>By Category</option>
              </select>
              <div style={{ display:'flex', gap:4, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:3 }}>
                {([['grid', Grid3x3],['list', List]] as const).map(([mode, Icon]) => (
                  <motion.button key={mode} onClick={() => setViewMode(mode as ViewMode)} whileTap={{ scale:0.9 }}
                    style={{ padding:'6px 10px', borderRadius:8, cursor:'pointer', transition:'all 0.2s', background:viewMode===mode?'rgba(124,58,237,0.25)':'transparent', color:viewMode===mode?'#a78bfa':'rgba(255,255,255,0.4)', border:'none' }}>
                    <Icon style={{ width:15, height:15 }} />
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Items */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:16 }}>
              {Array.from({ length:6 }).map((_,i) => <SkeletonCard key={i} />)}
            </motion.div>
          ) : currentItems.length === 0 ? (
            <motion.div key="empty" initial={{ opacity:0, scale:0.96 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }} style={{ textAlign:'center', padding:'80px 0' }}>
              <motion.div animate={{ y:[0,-8,0] }} transition={{ duration:3, repeat:Infinity, ease:'easeInOut' }}
                style={{ width:72, height:72, borderRadius:'50%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
                <Filter style={{ width:28, height:28, color:'rgba(255,255,255,0.18)' }} />
              </motion.div>
              <h3 style={{ fontSize:20, fontWeight:700, color:'rgba(255,255,255,0.7)', marginBottom:8 }}>No items found</h3>
              <p style={{ color:'rgba(255,255,255,0.35)', fontSize:14 }}>Try adjusting your filters or search query</p>
            </motion.div>
          ) : (
            <motion.div key={`items-${activeTab}-${viewMode}`} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              style={{ display:'grid', gridTemplateColumns:viewMode==='grid'?'repeat(auto-fill, minmax(280px, 1fr))':'1fr', gap:16 }}>
              {currentItems.map((item, index) => {
                const isLost = item.type === 'lost';
                return (
                  <motion.div key={item.id} initial={{ opacity:0, y:22, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
                    transition={{ delay:index*0.04, duration:0.45, ease:[0.22,1,0.36,1] }}
                    whileHover={{ y:-4, transition:{ duration:0.2 } }}>
                    <div style={{ ...glass, overflow:'hidden', cursor:'pointer', display:viewMode==='list'?'flex':'block', transition:'border-color 0.25s, box-shadow 0.25s' }}
                      onMouseEnter={e => { const el=e.currentTarget as HTMLDivElement; el.style.borderColor=isLost?'rgba(239,68,68,0.3)':'rgba(52,211,153,0.3)'; el.style.boxShadow=isLost?'0 8px 32px rgba(239,68,68,0.1)':'0 8px 32px rgba(52,211,153,0.1)'; }}
                      onMouseLeave={e => { const el=e.currentTarget as HTMLDivElement; el.style.borderColor='rgba(255,255,255,0.09)'; el.style.boxShadow='none'; }}>
                      <div style={{ position:'relative', overflow:'hidden', background:'rgba(255,255,255,0.03)', height:viewMode==='grid'?188:'auto', width:viewMode==='list'?120:'100%', flexShrink:viewMode==='list'?0:undefined, minHeight:viewMode==='list'?110:undefined }}>
                        {item.image_url
                          ? <img src={item.image_url} alt={item.title} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.4s ease' }}
                              onMouseEnter={e => (e.currentTarget.style.transform='scale(1.06)')} onMouseLeave={e => (e.currentTarget.style.transform='scale(1)')} />
                          : <div style={{ width:'100%', height:'100%', minHeight:110, display:'flex', alignItems:'center', justifyContent:'center' }}><Package style={{ width:32, height:32, color:'rgba(255,255,255,0.08)' }} /></div>}
                        <span style={{ position:'absolute', top:10, right:10, padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:isLost?'rgba(239,68,68,0.25)':'rgba(52,211,153,0.25)', color:isLost?'#f87171':'#34d399', border:`1px solid ${isLost?'rgba(239,68,68,0.4)':'rgba(52,211,153,0.4)'}`, backdropFilter:'blur(10px)' }}>
                          {item.type}
                        </span>
                      </div>
                      <div style={{ padding:'14px 16px', flex:1 }}>
                        <h3 style={{ fontSize:15, fontWeight:700, color:'#fff', marginBottom:6, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.title}</h3>
                        <span style={{ display:'inline-block', padding:'2px 8px', borderRadius:6, fontSize:11, background:'rgba(124,58,237,0.1)', color:'#a78bfa', border:'1px solid rgba(124,58,237,0.2)', marginBottom:8 }}>{item.category}</span>
                        <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', lineHeight:1.5, marginBottom:10, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{item.description}</p>
                        <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                          {item.location_name && <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'rgba(255,255,255,0.35)' }}><MapPin style={{ width:11, height:11, color:'#7c3aed', flexShrink:0 }} /><span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.location_name}</span></div>}
                          <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'rgba(255,255,255,0.35)' }}><Calendar style={{ width:11, height:11, color:'#7c3aed', flexShrink:0 }} /><span>{new Date(item.created_at).toLocaleDateString()}</span></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {currentItems.length > 0 && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
            style={{ marginTop:36, textAlign:'center', fontSize:13, color:'rgba(255,255,255,0.25)' }}>
            Showing <strong style={{ color:'rgba(255,255,255,0.5)' }}>{currentItems.length}</strong> of {activeTab==='lost'?lostItems.length:foundItems.length} items
          </motion.div>
        )}
      </div>
    </div>
  );
}
