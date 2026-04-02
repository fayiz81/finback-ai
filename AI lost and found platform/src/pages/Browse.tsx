import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Grid3x3, List, MapPin, Calendar, Package } from 'lucide-react';
import { ITEM_CATEGORIES } from '@/lib/index';
import { useItems } from '@/hooks/useItems';

type ViewMode = 'grid' | 'list';
type SortOption = 'recent' | 'oldest' | 'category';

const glass = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 20,
} as React.CSSProperties;

const glassStrong = {
  background: 'rgba(255,255,255,0.09)',
  backdropFilter: 'blur(30px)',
  WebkitBackdropFilter: 'blur(30px)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 16,
} as React.CSSProperties;

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
      const matchSearch = !searchQuery ||
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = category === 'all' || item.category === category;
      return matchSearch && matchCategory;
    });
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return (a.category || '').localeCompare(b.category || '');
    });
    return filtered;
  }, [activeTab, lostItems, foundItems, searchQuery, category, sortBy]);

  return (
    <div style={{ minHeight:'100vh', padding:'32px 16px' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>

        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:32 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
            <div style={{ width:44, height:44, borderRadius:14, background:'rgba(124,58,237,0.2)', border:'1px solid rgba(124,58,237,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Search style={{ width:20, height:20, color:'#a78bfa' }} />
            </div>
            <h1 style={{ fontSize:32, fontWeight:700, color:'#fff', margin:0 }}>Browse Items</h1>
          </div>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:15, margin:0 }}>Search through lost and found items</p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }} style={{ marginBottom:24 }}>
          <div style={{ display:'flex', gap:12, marginBottom:14, flexWrap:'wrap' }}>
            {/* Search bar */}
            <div style={{ flex:1, minWidth:240, position:'relative' }}>
              <Search style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', width:16, height:16, color:'rgba(255,255,255,0.3)' }} />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by title, description, or location..."
                style={{ ...glassStrong, width:'100%', padding:'12px 14px 12px 42px', fontSize:14, color:'rgba(255,255,255,0.8)', outline:'none', boxSizing:'border-box' }}
              />
            </div>
            {/* Category */}
            <select value={category} onChange={e => setCategory(e.target.value)}
              style={{ ...glassStrong, padding:'12px 16px', fontSize:13, color:'rgba(255,255,255,0.7)', outline:'none', minWidth:160 }}>
              <option value="all" style={{ background:'#1a0533' }}>All Categories</option>
              {ITEM_CATEGORIES.map(cat => <option key={cat} value={cat} style={{ background:'#1a0533' }}>{cat}</option>)}
            </select>
          </div>

          {/* Tabs + sort + view */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
            {/* Lost / Found tabs */}
            <div style={{ display:'flex', gap:6, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:4 }}>
              {(['lost','found'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{
                    padding:'8px 16px', borderRadius:10, fontSize:13, fontWeight:500, cursor:'pointer', transition:'all 0.2s',
                    background: activeTab === tab ? (tab==='lost' ? 'rgba(239,68,68,0.2)' : 'rgba(52,211,153,0.2)') : 'transparent',
                    color: activeTab === tab ? (tab==='lost' ? '#f87171' : '#34d399') : 'rgba(255,255,255,0.4)',
                    border: activeTab === tab ? `1px solid ${tab==='lost' ? 'rgba(239,68,68,0.3)' : 'rgba(52,211,153,0.3)'}` : '1px solid transparent',
                  }}>
                  {tab === 'lost' ? 'Lost' : 'Found'} Items
                  <span style={{ marginLeft:8, padding:'1px 7px', borderRadius:20, fontSize:11, background:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)' }}>
                    {tab === 'lost' ? lostItems.length : foundItems.length}
                  </span>
                </button>
              ))}
            </div>

            <div style={{ display:'flex', gap:8 }}>
              {/* Sort */}
              <select value={sortBy} onChange={e => setSortBy(e.target.value as SortOption)}
                style={{ ...glassStrong, padding:'8px 14px', fontSize:12, color:'rgba(255,255,255,0.6)', outline:'none', borderRadius:10 }}>
                <option value="recent" style={{ background:'#1a0533' }}>Most Recent</option>
                <option value="oldest" style={{ background:'#1a0533' }}>Oldest First</option>
                <option value="category" style={{ background:'#1a0533' }}>By Category</option>
              </select>
              {/* View toggle */}
              <div style={{ display:'flex', gap:4, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:3 }}>
                {([['grid', Grid3x3], ['list', List]] as const).map(([mode, Icon]) => (
                  <button key={mode} onClick={() => setViewMode(mode as ViewMode)}
                    style={{ padding:'6px 10px', borderRadius:8, cursor:'pointer', transition:'all 0.2s', background: viewMode === mode ? 'rgba(124,58,237,0.25)' : 'transparent', color: viewMode === mode ? '#a78bfa' : 'rgba(255,255,255,0.4)', border:'none' }}>
                    <Icon style={{ width:15, height:15 }} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Items grid */}
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:'80px 0' }}>
            <div style={{ width:40, height:40, border:'3px solid rgba(124,58,237,0.3)', borderTopColor:'#7c3aed', borderRadius:'50', animation:'spin 0.8s linear infinite' }} />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {currentItems.length === 0 ? (
              <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                style={{ textAlign:'center', padding:'80px 0' }}>
                <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                  <Filter style={{ width:28, height:28, color:'rgba(255,255,255,0.2)' }} />
                </div>
                <h3 style={{ fontSize:18, fontWeight:600, color:'rgba(255,255,255,0.7)', marginBottom:8 }}>No items found</h3>
                <p style={{ color:'rgba(255,255,255,0.35)', fontSize:14 }}>Try adjusting your filters or search query</p>
              </motion.div>
            ) : (
              <motion.div key="items" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                style={{ display:'grid', gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr', gap:16 }}>
                {currentItems.map((item, index) => (
                  <motion.div key={item.id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: index * 0.04 }}>
                    <div style={{ ...glass, overflow:'hidden', transition:'all 0.3s', cursor:'pointer' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(255,255,255,0.2)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(255,255,255,0.1)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}>
                      {/* Image */}
                      <div style={{ position:'relative', height: viewMode === 'grid' ? 200 : 120, background:'rgba(255,255,255,0.04)', overflow:'hidden', ...(viewMode === 'list' ? { width:120, height:120, flexShrink:0 } : {}) }}>
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        ) : (
                          <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <Package style={{ width:36, height:36, color:'rgba(255,255,255,0.1)' }} />
                          </div>
                        )}
                        <span style={{
                          position:'absolute', top:10, right:10, padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600,
                          background: item.type === 'lost' ? 'rgba(239,68,68,0.2)' : 'rgba(52,211,153,0.2)',
                          color: item.type === 'lost' ? '#f87171' : '#34d399',
                          border: `1px solid ${item.type === 'lost' ? 'rgba(239,68,68,0.3)' : 'rgba(52,211,153,0.3)'}`,
                          backdropFilter:'blur(10px)',
                        }}>
                          {item.type}
                        </span>
                      </div>
                      {/* Content */}
                      <div style={{ padding:16 }}>
                        <h3 style={{ fontSize:15, fontWeight:600, color:'#fff', marginBottom:6, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.title}</h3>
                        <span style={{ display:'inline-block', padding:'2px 8px', borderRadius:6, fontSize:11, background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.45)', border:'1px solid rgba(255,255,255,0.08)', marginBottom:10 }}>
                          {item.category}
                        </span>
                        <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', lineHeight:1.5, marginBottom:10, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{item.description}</p>
                        <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                          {item.location_name && (
                            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'rgba(255,255,255,0.35)' }}>
                              <MapPin style={{ width:12, height:12, color:'#7c3aed', flexShrink:0 }} />
                              <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.location_name}</span>
                            </div>
                          )}
                          <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'rgba(255,255,255,0.35)' }}>
                            <Calendar style={{ width:12, height:12, color:'#7c3aed', flexShrink:0 }} />
                            <span>{new Date(item.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {currentItems.length > 0 && (
          <div style={{ marginTop:32, textAlign:'center', fontSize:13, color:'rgba(255,255,255,0.3)' }}>
            Showing {currentItems.length} of {activeTab === 'lost' ? lostItems.length : foundItems.length} items
          </div>
        )}
      </div>
    </div>
  );
}
