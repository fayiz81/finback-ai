import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, TrendingUp, Package, CheckCircle, AlertCircle, ArrowRight, Sparkles, MapPin, Calendar, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useItems } from '@/hooks/useItems';
import { ROUTE_PATHS } from '@/lib/index';
import { AIMatchingEngine } from '@/components/AIMatchingEngine';

const glass = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 20,
} as React.CSSProperties;

function ItemCard({ item }: { item: any }) {
  const isLost = item.type === 'lost';
  return (
    <div style={{ ...glass, overflow:'hidden', borderRadius:16 }}>
      <div style={{ height:140, background:'rgba(255,255,255,0.03)', position:'relative' }}>
        {item.image_url ? (
          <img src={item.image_url} alt={item.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        ) : (
          <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <ImageIcon style={{ width:32, height:32, color:'rgba(255,255,255,0.1)' }} />
          </div>
        )}
        <span style={{
          position:'absolute', top:8, right:8, padding:'3px 9px', borderRadius:20, fontSize:10, fontWeight:600,
          background: isLost ? 'rgba(239,68,68,0.2)' : 'rgba(52,211,153,0.2)',
          color: isLost ? '#f87171' : '#34d399',
          border: `1px solid ${isLost ? 'rgba(239,68,68,0.3)' : 'rgba(52,211,153,0.3)'}`,
          backdropFilter:'blur(10px)',
        }}>{item.type}</span>
      </div>
      <div style={{ padding:14 }}>
        <p style={{ fontSize:14, fontWeight:600, color:'#fff', marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.title}</p>
        <span style={{ display:'inline-block', padding:'2px 7px', borderRadius:6, fontSize:10, background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.4)', border:'1px solid rgba(255,255,255,0.08)', marginBottom:8 }}>{item.category}</span>
        {item.location_name && (
          <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'rgba(255,255,255,0.3)' }}>
            <MapPin style={{ width:10, height:10 }} />{item.location_name}
          </div>
        )}
        <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:3 }}>
          <Calendar style={{ width:10, height:10 }} />
          {isLost ? 'Lost' : 'Found'} on {new Date(item.date_lost || item.date_found || item.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { lostItems, foundItems, matches, getUserItems, isProcessingMatch } = useItems();
  const [activeTab, setActiveTab] = useState('overview');

  const displayName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User';
  const userItems = getUserItems(user?.id || '');
  const userLostItems = userItems.lostItems;
  const userFoundItems = userItems.foundItems;
  const userMatches = matches.filter(m =>
    userLostItems.some(i => i.id === m.lostItemId) || userFoundItems.some(i => i.id === m.foundItemId)
  );
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
    <div style={{ minHeight:'100vh', padding:'32px 16px' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>

        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:32 }}>
          <h1 style={{ fontSize:32, fontWeight:700, color:'#fff', marginBottom:6 }}>Welcome back, {displayName}</h1>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:15 }}>Your AI-powered lost and found dashboard</p>
        </motion.div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14, marginBottom:24 }}>
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.title} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.08 }}
                style={{ background:s.bg, border:`1px solid ${s.border}`, borderRadius:18, padding:'20px 22px', backdropFilter:'blur(20px)' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                  <p style={{ fontSize:12, color:'rgba(255,255,255,0.45)', margin:0 }}>{s.title}</p>
                  <div style={{ width:32, height:32, borderRadius:10, background:`${s.bg}`, border:`1px solid ${s.border}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Icon style={{ width:16, height:16, color:s.color }} />
                  </div>
                </div>
                <p style={{ fontSize:30, fontWeight:700, color:s.color, margin:0 }}>{s.value}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Quick actions */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:12, marginBottom:28 }}>
          {quickActions.map((a, i) => {
            const Icon = a.icon;
            return (
              <motion.div key={a.title} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3+i*0.08 }}>
                <Link to={a.href} style={{ textDecoration:'none', display:'block' }}>
                  <div style={{ background:a.bg, border:`1px solid ${a.border}`, borderRadius:18, padding:20, cursor:'pointer', transition:'all 0.2s', backdropFilter:'blur(20px)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform='translateY(-2px)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform='translateY(0)'; }}>
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
                      <div>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                          <Icon style={{ width:18, height:18, color:a.color }} />
                          <p style={{ fontSize:14, fontWeight:600, color:'#fff', margin:0 }}>{a.title}</p>
                        </div>
                        <p style={{ fontSize:12, color:'rgba(255,255,255,0.4)', margin:0 }}>{a.description}</p>
                      </div>
                      <ArrowRight style={{ width:16, height:16, color:a.color, flexShrink:0, marginTop:2 }} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:4, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:4, marginBottom:20, width:'fit-content' }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                padding:'9px 20px', borderRadius:10, fontSize:13, fontWeight:500, cursor:'pointer', transition:'all 0.2s',
                background: activeTab === tab ? 'rgba(124,58,237,0.25)' : 'transparent',
                color: activeTab === tab ? '#a78bfa' : 'rgba(255,255,255,0.4)',
                border: activeTab === tab ? '1px solid rgba(124,58,237,0.3)' : '1px solid transparent',
                textTransform:'capitalize',
              }}>
              {tab === 'matches' ? 'AI Matches' : tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}>
            <div style={{ ...glass, padding:24 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
                <Sparkles style={{ width:18, height:18, color:'#a78bfa' }} />
                <h2 style={{ fontSize:16, fontWeight:600, color:'rgba(255,255,255,0.8)', margin:0 }}>Recent AI Matches</h2>
              </div>
              {userMatches.length > 0 ? (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {userMatches.slice(0,3).map(match => (
                    <div key={match.id} style={{ padding:14, borderRadius:14, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <div style={{ fontSize:24, fontWeight:700, color: match.confidenceScore >= 0.8 ? '#34d399' : match.confidenceScore >= 0.6 ? '#fbbf24' : 'rgba(255,255,255,0.5)' }}>
                          {Math.round(match.confidenceScore * 100)}%
                        </div>
                        <span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:'rgba(124,58,237,0.15)', color:'#a78bfa', border:'1px solid rgba(124,58,237,0.2)' }}>
                          {new Date(match.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {userMatches.length > 3 && (
                    <Link to={ROUTE_PATHS.MATCHES} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'11px', borderRadius:12, background:'rgba(124,58,237,0.1)', border:'1px solid rgba(124,58,237,0.2)', color:'#a78bfa', fontSize:13, fontWeight:500, textDecoration:'none' }}>
                      View All Matches <ArrowRight style={{ width:14, height:14 }} />
                    </Link>
                  )}
                </div>
              ) : (
                <div style={{ textAlign:'center', padding:'48px 0' }}>
                  <Sparkles style={{ width:40, height:40, color:'rgba(255,255,255,0.1)', margin:'0 auto 12px' }} />
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

        {activeTab === 'items' && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ display:'flex', flexDirection:'column', gap:20 }}>
            {[
              { title:'Lost Items', desc:'Items you\'ve reported as lost', items:userLostItems, emptyIcon:Package, emptyMsg:'No lost items reported yet' },
              { title:'Found Items', desc:'Items you\'ve reported as found', items:userFoundItems, emptyIcon:CheckCircle, emptyMsg:'No found items reported yet' },
            ].map(section => {
              const EmptyIcon = section.emptyIcon;
              return (
                <div key={section.title} style={{ ...glass, padding:24 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
                    <div>
                      <h2 style={{ fontSize:16, fontWeight:600, color:'rgba(255,255,255,0.8)', margin:0 }}>{section.title}</h2>
                      <p style={{ fontSize:12, color:'rgba(255,255,255,0.35)', margin:'4px 0 0' }}>{section.desc}</p>
                    </div>
                    <span style={{ padding:'3px 10px', borderRadius:20, fontSize:12, background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.4)', border:'1px solid rgba(255,255,255,0.08)' }}>{section.items.length}</span>
                  </div>
                  {section.items.length > 0 ? (
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12 }}>
                      {section.items.slice(0,6).map(item => <ItemCard key={item.id} item={item} />)}
                    </div>
                  ) : (
                    <div style={{ textAlign:'center', padding:'40px 0' }}>
                      <EmptyIcon style={{ width:36, height:36, color:'rgba(255,255,255,0.1)', margin:'0 auto 10px' }} />
                      <p style={{ color:'rgba(255,255,255,0.3)', fontSize:13 }}>{section.emptyMsg}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </motion.div>
        )}

        {activeTab === 'matches' && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}>
            <div style={{ ...glass, padding:24 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <Sparkles style={{ width:18, height:18, color:'#a78bfa' }} />
                  <h2 style={{ fontSize:16, fontWeight:600, color:'rgba(255,255,255,0.8)', margin:0 }}>All AI Matches</h2>
                </div>
                <span style={{ padding:'3px 10px', borderRadius:20, fontSize:12, background:'rgba(124,58,237,0.1)', color:'#a78bfa', border:'1px solid rgba(124,58,237,0.2)' }}>{userMatches.length}</span>
              </div>
              {userMatches.length > 0 ? (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {userMatches.map(match => (
                    <div key={match.id} style={{ padding:16, borderRadius:14, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                        <div style={{ fontSize:26, fontWeight:700, color: match.confidenceScore >= 0.8 ? '#34d399' : match.confidenceScore >= 0.6 ? '#fbbf24' : '#f87171', minWidth:56 }}>
                          {Math.round(match.confidenceScore * 100)}%
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ height:4, background:'rgba(255,255,255,0.06)', borderRadius:2, overflow:'hidden' }}>
                            <div style={{ height:'100%', borderRadius:2, width:`${match.confidenceScore*100}%`, background: match.confidenceScore >= 0.8 ? '#34d399' : match.confidenceScore >= 0.6 ? '#fbbf24' : '#f87171', transition:'width 0.8s ease' }} />
                          </div>
                        </div>
                        <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>{new Date(match.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign:'center', padding:'48px 0' }}>
                  <Sparkles style={{ width:40, height:40, color:'rgba(255,255,255,0.1)', margin:'0 auto 12px' }} />
                  <p style={{ color:'rgba(255,255,255,0.35)', fontSize:14, marginBottom:16 }}>No matches found yet.</p>
                  <Link to={ROUTE_PATHS.SUBMIT} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'10px 20px', borderRadius:12, background:'linear-gradient(135deg,rgba(124,58,237,0.4),rgba(79,70,229,0.4))', border:'1px solid rgba(124,58,237,0.3)', color:'#e9d5ff', fontSize:13, fontWeight:500, textDecoration:'none' }}>
                    <Plus style={{ width:14, height:14 }} /> Submit Item
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
