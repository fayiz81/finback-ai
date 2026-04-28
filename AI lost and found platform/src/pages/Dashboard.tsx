import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, TrendingUp, Package, CheckCircle, AlertCircle, ArrowRight, Sparkles, MapPin, Calendar, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useItems } from '@/hooks/useItems';
import { ROUTE_PATHS } from '@/lib/index';
import { AIMatchingEngine } from '@/components/AIMatchingEngine';

const glass: React.CSSProperties = { background:'rgba(255,255,255,0.05)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:20 };

function ItemCard({ item, index }: { item: any; index: number }) {
  const isLost = item.type === 'lost';
  return (
    <motion.div initial={{ opacity:0, y:16, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }} transition={{ delay:index*0.06, duration:0.4, ease:[0.22,1,0.36,1] }}
      whileHover={{ y:-3, transition:{ duration:0.2 } }}>
      <div style={{ ...glass, overflow:'hidden', borderRadius:16, transition:'border-color 0.2s, box-shadow 0.2s' }}
        onMouseEnter={e => { const el=e.currentTarget as HTMLDivElement; el.style.borderColor=isLost?'rgba(239,68,68,0.25)':'rgba(52,211,153,0.25)'; el.style.boxShadow=isLost?'0 8px 24px rgba(239,68,68,0.08)':'0 8px 24px rgba(52,211,153,0.08)'; }}
        onMouseLeave={e => { const el=e.currentTarget as HTMLDivElement; el.style.borderColor='rgba(255,255,255,0.09)'; el.style.boxShadow='none'; }}>
        <div style={{ height:130, background:'rgba(255,255,255,0.03)', position:'relative', overflow:'hidden' }}>
          {item.image_url
            ? <img src={item.image_url} alt={item.title} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.4s' }} onMouseEnter={e=>(e.currentTarget.style.transform='scale(1.06)')} onMouseLeave={e=>(e.currentTarget.style.transform='scale(1)')} />
            : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}><ImageIcon style={{ width:28, height:28, color:'rgba(255,255,255,0.08)' }} /></div>}
          <span style={{ position:'absolute', top:8, right:8, padding:'3px 9px', borderRadius:20, fontSize:10, fontWeight:700, background:isLost?'rgba(239,68,68,0.25)':'rgba(52,211,153,0.25)', color:isLost?'#f87171':'#34d399', border:`1px solid ${isLost?'rgba(239,68,68,0.4)':'rgba(52,211,153,0.4)'}`, backdropFilter:'blur(10px)' }}>
            {item.type}
          </span>
        </div>
        <div style={{ padding:13 }}>
          <p style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.title}</p>
          <span style={{ display:'inline-block', padding:'2px 7px', borderRadius:6, fontSize:10, background:'rgba(124,58,237,0.1)', color:'#a78bfa', border:'1px solid rgba(124,58,237,0.2)', marginBottom:7 }}>{item.category}</span>
          {item.location_name && <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'rgba(255,255,255,0.3)' }}><MapPin style={{ width:9, height:9 }} />{item.location_name}</div>}
          <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:3 }}>
            <Calendar style={{ width:9, height:9 }} />{isLost?'Lost':'Found'} on {new Date(item.date_lost||item.date_found||item.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { lostItems, foundItems, matches, getUserItems, isProcessingMatch, refetch } = useItems();
  const [activeTab, setActiveTab] = useState('overview');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // ── 30-second polling fallback ─────────────────────────────────────────────
  // If Supabase Realtime WebSocket drops, this ensures data stays fresh.
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
      setLastUpdated(new Date());
    }, 30_000);
    return () => clearInterval(interval);
  }, [refetch]);

  const displayName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User';
  const userItems = getUserItems(user?.id || '');
  const userLostItems = userItems.lostItems;
  const userFoundItems = userItems.foundItems;
  const userMatches = matches.filter(m => userLostItems.some(i => i.id === m.lostItemId) || userFoundItems.some(i => i.id === m.foundItemId));
  const highConfidenceMatches = userMatches.filter(m => m.confidenceScore > 0.8);

  const stats = [
    { title:'Lost Items', value:userLostItems.length, icon:Package, color:'#f87171', bg:'rgba(239,68,68,0.1)', border:'rgba(239,68,68,0.2)' },
    { title:'Found Items', value:userFoundItems.length, icon:CheckCircle, color:'#34d399', bg:'rgba(52,211,153,0.1)', border:'rgba(52,211,153,0.2)' },
    { title:'AI Matches', value:userMatches.length, icon:Sparkles, color:'#a78bfa', bg:'rgba(124,58,237,0.1)', border:'rgba(124,58,237,0.2)' },
    { title:'High Confidence', value:highConfidenceMatches.length, icon:TrendingUp, color:'#60a5fa', bg:'rgba(37,99,235,0.1)', border:'rgba(37,99,235,0.2)' },
  ];

  const quickActions = [
    { title:'Report Lost Item', description:'Upload details and let AI find matches', icon:AlertCircle, href:ROUTE_PATHS.SUBMIT, color:'#f87171', bg:'rgba(239,68,68,0.08)', border:'rgba(239,68,68,0.15)' },
    { title:'Report Found Item', description:'Help someone recover their belongings', icon:CheckCircle, href:ROUTE_PATHS.SUBMIT, color:'#34d399', bg:'rgba(52,211,153,0.08)', border:'rgba(52,211,153,0.15)' },
    { title:'Browse Items', description:'Search through lost and found items', icon:Search, href:ROUTE_PATHS.BROWSE, color:'#a78bfa', bg:'rgba(124,58,237,0.08)', border:'rgba(124,58,237,0.15)' },
  ];

  const tabs = ['overview','items','matches'];

  return (
    <div style={{ minHeight:'100vh', padding:'32px 16px', position:'relative' }}>
      {/* Ambient blobs */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }}>
        <motion.div animate={{ scale:[1,1.12,1] }} transition={{ duration:16, repeat:Infinity, ease:'easeInOut' }}
          style={{ position:'absolute', top:'-10%', right:'-5%', width:550, height:550, borderRadius:'50%', background:'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', filter:'blur(50px)' }} />
        <motion.div animate={{ scale:[1,0.88,1], x:[0,-20,0] }} transition={{ duration:20, repeat:Infinity, ease:'easeInOut', delay:5 }}
          style={{ position:'absolute', bottom:'-5%', left:'-5%', width:450, height:450, borderRadius:'50%', background:'radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%)', filter:'blur(50px)' }} />
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', position:'relative', zIndex:1 }}>
        {/* Header */}
        <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, ease:[0.22,1,0.36,1] }} style={{ marginBottom:32 }}>
          <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.1 }}
            style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 14px', borderRadius:20, background:'rgba(124,58,237,0.1)', border:'1px solid rgba(124,58,237,0.2)', marginBottom:14 }}>
            <motion.div animate={{ rotate:[0,15,-10,15,0] }} transition={{ duration:3, repeat:Infinity, repeatDelay:2 }}>
              <Sparkles style={{ width:13, height:13, color:'#a78bfa' }} />
            </motion.div>
            <span style={{ fontSize:12, color:'#a78bfa', fontWeight:500 }}>AI Dashboard</span>
          </motion.div>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <div>
              <h1 style={{ fontSize:36, fontWeight:800, color:'#fff', marginBottom:6, letterSpacing:'-0.02em' }}>
                Welcome back, <span style={{ background:'linear-gradient(135deg,#a78bfa,#60a5fa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{displayName}</span> 👋
              </h1>
              <p style={{ color:'rgba(255,255,255,0.4)', fontSize:15 }}>Your AI-powered lost and found dashboard</p>
            </div>
            {/* Live indicator + manual refresh */}
            <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 12px', borderRadius:20, background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.2)' }}>
                <motion.span animate={{ opacity:[1,0.3,1] }} transition={{ duration:1.5, repeat:Infinity }}
                  style={{ width:6, height:6, borderRadius:'50%', background:'#34d399', display:'inline-block' }} />
                <span style={{ fontSize:11, color:'#34d399', fontWeight:600 }}>LIVE</span>
              </div>
              <motion.button whileHover={{ scale:1.05, rotate:180 }} whileTap={{ scale:0.95 }}
                transition={{ rotate:{ duration:0.4 } }}
                onClick={() => { refetch(); setLastUpdated(new Date()); }}
                style={{ width:32, height:32, borderRadius:10, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.5)', cursor:'pointer' }}>
                <RefreshCw style={{ width:13, height:13 }} />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14, marginBottom:24 }}>
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.title} initial={{ opacity:0, y:20, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }} transition={{ delay:i*0.08, duration:0.5, ease:[0.22,1,0.36,1] }}
                whileHover={{ y:-3, scale:1.02, transition:{ duration:0.2 } }}>
                <div style={{ background:s.bg, border:`1px solid ${s.border}`, borderRadius:18, padding:'20px 22px', backdropFilter:'blur(20px)', transition:'box-shadow 0.25s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow=`0 8px 28px ${s.bg.replace('0.1','0.2')}`}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow='none'}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                    <p style={{ fontSize:12, color:'rgba(255,255,255,0.45)', margin:0 }}>{s.title}</p>
                    <motion.div whileHover={{ rotate:15, scale:1.1 }} style={{ width:32, height:32, borderRadius:10, background:s.bg, border:`1px solid ${s.border}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Icon style={{ width:16, height:16, color:s.color }} />
                    </motion.div>
                  </div>
                  <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3+i*0.08 }}
                    style={{ fontSize:32, fontWeight:800, color:s.color, margin:0, fontFamily:'monospace', letterSpacing:'-0.02em' }}>{s.value}</motion.p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick actions */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:12, marginBottom:28 }}>
          {quickActions.map((a, i) => {
            const Icon = a.icon;
            return (
              <motion.div key={a.title} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.32+i*0.08, duration:0.45, ease:[0.22,1,0.36,1] }}
                whileHover={{ y:-3, transition:{ duration:0.2 } }}>
                <Link to={a.href} style={{ textDecoration:'none', display:'block' }}>
                  <div style={{ background:a.bg, border:`1px solid ${a.border}`, borderRadius:18, padding:18, cursor:'pointer', transition:'all 0.2s', backdropFilter:'blur(20px)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow=`0 8px 24px ${a.bg.replace('0.08','0.15')}`}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow='none'}>
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
                      <div>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                          <Icon style={{ width:18, height:18, color:a.color }} />
                          <p style={{ fontSize:14, fontWeight:600, color:'#fff', margin:0 }}>{a.title}</p>
                        </div>
                        <p style={{ fontSize:12, color:'rgba(255,255,255,0.4)', margin:0 }}>{a.description}</p>
                      </div>
                      <motion.div whileHover={{ x:3 }}><ArrowRight style={{ width:16, height:16, color:a.color, flexShrink:0, marginTop:2 }} /></motion.div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Tabs */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.45 }}
          style={{ display:'flex', gap:4, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:4, marginBottom:20, width:'fit-content' }}>
          {tabs.map(tab => (
            <motion.button key={tab} onClick={() => setActiveTab(tab)} whileTap={{ scale:0.96 }}
              style={{ padding:'9px 20px', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.2s', background:activeTab===tab?'rgba(124,58,237,0.25)':'transparent', color:activeTab===tab?'#a78bfa':'rgba(255,255,255,0.4)', border:activeTab===tab?'1px solid rgba(124,58,237,0.3)':'1px solid transparent', textTransform:'capitalize' }}>
              {tab==='matches'?'AI Matches':tab}
            </motion.button>
          ))}
        </motion.div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab==='overview' && (
            <motion.div key="overview" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} transition={{ duration:0.25 }}>
              <div style={{ ...glass, padding:24 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
                  <motion.div animate={{ rotate:[0,360] }} transition={{ duration:10, repeat:Infinity, ease:'linear' }}>
                    <Sparkles style={{ width:18, height:18, color:'#a78bfa' }} />
                  </motion.div>
                  <h2 style={{ fontSize:16, fontWeight:700, color:'rgba(255,255,255,0.8)', margin:0 }}>Recent AI Matches</h2>
                </div>
                {userMatches.length>0 ? (
                  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    {userMatches.slice(0,3).map((match,i) => (
                      <motion.div key={match.id} initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.08 }}
                        style={{ padding:14, borderRadius:14, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                          <div style={{ fontSize:24, fontWeight:800, color:match.confidenceScore>=0.8?'#34d399':match.confidenceScore>=0.6?'#fbbf24':'rgba(255,255,255,0.5)', fontFamily:'monospace' }}>
                            {Math.round(match.confidenceScore*100)}%
                          </div>
                          <div style={{ flex:1, margin:'0 16px' }}>
                            <div style={{ height:4, background:'rgba(255,255,255,0.05)', borderRadius:2, overflow:'hidden' }}>
                              <motion.div initial={{ width:0 }} animate={{ width:`${match.confidenceScore*100}%` }} transition={{ delay:0.3+i*0.1, duration:0.8 }}
                                style={{ height:'100%', borderRadius:2, background:match.confidenceScore>=0.8?'#34d399':match.confidenceScore>=0.6?'#fbbf24':'#f87171' }} />
                            </div>
                          </div>
                          <span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:'rgba(124,58,237,0.15)', color:'#a78bfa', border:'1px solid rgba(124,58,237,0.2)' }}>
                            {new Date(match.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                    {userMatches.length>3 && (
                      <Link to={ROUTE_PATHS.MATCHES} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'11px', borderRadius:12, background:'rgba(124,58,237,0.1)', border:'1px solid rgba(124,58,237,0.2)', color:'#a78bfa', fontSize:13, fontWeight:500, textDecoration:'none' }}>
                        View All Matches <ArrowRight style={{ width:14, height:14 }} />
                      </Link>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign:'center', padding:'48px 0' }}>
                    <motion.div animate={{ y:[0,-8,0] }} transition={{ duration:3, repeat:Infinity, ease:'easeInOut' }}>
                      <Sparkles style={{ width:40, height:40, color:'rgba(255,255,255,0.1)', margin:'0 auto 12px' }} />
                    </motion.div>
                    <p style={{ color:'rgba(255,255,255,0.35)', fontSize:14, marginBottom:16 }}>No matches yet. Submit an item to start finding matches!</p>
                    <Link to={ROUTE_PATHS.SUBMIT} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'10px 20px', borderRadius:12, background:'linear-gradient(135deg,rgba(124,58,237,0.4),rgba(79,70,229,0.4))', border:'1px solid rgba(124,58,237,0.3)', color:'#e9d5ff', fontSize:13, fontWeight:500, textDecoration:'none' }}>
                      <Plus style={{ width:14, height:14 }} /> Submit Item
                    </Link>
                  </div>
                )}
              </div>
              {isProcessingMatch && (
                <div style={{ ...glass, padding:24, marginTop:16 }}>
                  <h2 style={{ fontSize:16, fontWeight:600, color:'rgba(255,255,255,0.8)', marginBottom:12 }}>AI Processing</h2>
                  <AIMatchingEngine isProcessing={isProcessingMatch} matches={[]} />
                </div>
              )}
            </motion.div>
          )}

          {activeTab==='items' && (
            <motion.div key="items" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} transition={{ duration:0.25 }}
              style={{ display:'flex', flexDirection:'column', gap:20 }}>
              {[
                { title:'Lost Items', desc:"Items you've reported as lost", items:userLostItems, emptyIcon:Package, emptyMsg:'No lost items reported yet' },
                { title:'Found Items', desc:"Items you've reported as found", items:userFoundItems, emptyIcon:CheckCircle, emptyMsg:'No found items reported yet' },
              ].map(section => {
                const EmptyIcon = section.emptyIcon;
                return (
                  <div key={section.title} style={{ ...glass, padding:24 }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
                      <div>
                        <h2 style={{ fontSize:16, fontWeight:700, color:'rgba(255,255,255,0.8)', margin:0 }}>{section.title}</h2>
                        <p style={{ fontSize:12, color:'rgba(255,255,255,0.35)', margin:'4px 0 0' }}>{section.desc}</p>
                      </div>
                      <span style={{ padding:'3px 10px', borderRadius:20, fontSize:12, background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.4)', border:'1px solid rgba(255,255,255,0.08)' }}>{section.items.length}</span>
                    </div>
                    {section.items.length>0 ? (
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12 }}>
                        {section.items.slice(0,6).map((item,i) => <ItemCard key={item.id} item={item} index={i} />)}
                      </div>
                    ) : (
                      <div style={{ textAlign:'center', padding:'40px 0' }}>
                        <motion.div animate={{ y:[0,-6,0] }} transition={{ duration:3, repeat:Infinity }}>
                          <EmptyIcon style={{ width:36, height:36, color:'rgba(255,255,255,0.1)', margin:'0 auto 10px' }} />
                        </motion.div>
                        <p style={{ color:'rgba(255,255,255,0.3)', fontSize:13 }}>{section.emptyMsg}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </motion.div>
          )}

          {activeTab==='matches' && (
            <motion.div key="matches" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} transition={{ duration:0.25 }}>
              <div style={{ ...glass, padding:24 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <Sparkles style={{ width:18, height:18, color:'#a78bfa' }} />
                    <h2 style={{ fontSize:16, fontWeight:700, color:'rgba(255,255,255,0.8)', margin:0 }}>All AI Matches</h2>
                  </div>
                  <span style={{ padding:'3px 10px', borderRadius:20, fontSize:12, background:'rgba(124,58,237,0.1)', color:'#a78bfa', border:'1px solid rgba(124,58,237,0.2)' }}>{userMatches.length}</span>
                </div>
                {userMatches.length>0 ? (
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {userMatches.map((match,i) => (
                      <motion.div key={match.id} initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.06 }}
                        style={{ padding:16, borderRadius:14, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                          <div style={{ fontSize:26, fontWeight:800, color:match.confidenceScore>=0.8?'#34d399':match.confidenceScore>=0.6?'#fbbf24':'#f87171', minWidth:56, fontFamily:'monospace' }}>
                            {Math.round(match.confidenceScore*100)}%
                          </div>
                          <div style={{ flex:1 }}>
                            <div style={{ height:4, background:'rgba(255,255,255,0.06)', borderRadius:2, overflow:'hidden' }}>
                              <motion.div initial={{ width:0 }} animate={{ width:`${match.confidenceScore*100}%` }} transition={{ delay:0.2+i*0.05, duration:0.8 }}
                                style={{ height:'100%', borderRadius:2, background:match.confidenceScore>=0.8?'#34d399':match.confidenceScore>=0.6?'#fbbf24':'#f87171' }} />
                            </div>
                          </div>
                          <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>{new Date(match.createdAt).toLocaleDateString()}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign:'center', padding:'48px 0' }}>
                    <motion.div animate={{ y:[0,-8,0] }} transition={{ duration:3, repeat:Infinity }}>
                      <Sparkles style={{ width:40, height:40, color:'rgba(255,255,255,0.1)', margin:'0 auto 12px' }} />
                    </motion.div>
                    <p style={{ color:'rgba(255,255,255,0.35)', fontSize:14, marginBottom:16 }}>No matches found yet.</p>
                    <Link to={ROUTE_PATHS.SUBMIT} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'10px 20px', borderRadius:12, background:'linear-gradient(135deg,rgba(124,58,237,0.4),rgba(79,70,229,0.4))', border:'1px solid rgba(124,58,237,0.3)', color:'#e9d5ff', fontSize:13, fontWeight:500, textDecoration:'none' }}>
                      <Plus style={{ width:14, height:14 }} /> Submit Item
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
