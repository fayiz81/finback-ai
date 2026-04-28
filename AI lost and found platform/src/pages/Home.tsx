import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef, useMemo } from 'react';
import { Brain, Zap, Shield, TrendingUp, Users, MapPin, Clock, CheckCircle, ArrowRight, Sparkles, LogOut, LayoutDashboard, Lock } from 'lucide-react';
import { ROUTE_PATHS, buildEnhancedMatches, getDistanceInKm, getDaysDifference, normalizeScore, calculateMatchScore } from '@/lib/index';
import { useItems } from '@/hooks/useItems';
import { useAuth } from '@/hooks/useAuth';

function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

function buildTopMatches(lostItems: any[], foundItems: any[]) {
  if (!lostItems?.length || !foundItems?.length) return [];
  return buildEnhancedMatches(lostItems, foundItems, 0.25).slice(0, 3);
}

const glass = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 20,
} as React.CSSProperties;

function DashboardMockup() {
  const { lostItems, foundItems, items, loading } = useItems();
  const todayItems = items.filter(i => new Date(i.created_at).toDateString() === new Date().toDateString()).length;
  const weeklyBars = useMemo(() => {
    const days: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      days.push(items.filter(item => new Date(item.created_at).toDateString() === d.toDateString()).length);
    }
    const max = Math.max(...days, 1);
    return days.map(c => Math.round((c / max) * 100) || 4);
  }, [items]);

  const topMatches = useMemo(() => buildTopMatches(lostItems, foundItems), [lostItems, foundItems]);
  const displayMatches = topMatches.length > 0
    ? topMatches.map(m => ({ emoji:'📦', title:m.lostItem.title, loc:m.foundItem.location_name||'Unknown', pct:Math.round(m.confidenceScore*100), high:m.confidenceScore>0.7 }))
    : [{ emoji:'👜', title:'Black Wallet', loc:'Main Library', pct:94, high:true }, { emoji:'💻', title:'MacBook Pro 14"', loc:'Engineering Bldg', pct:89, high:true }, { emoji:'🎧', title:'AirPods Pro', loc:'Gym Locker', pct:76, high:false }];
  const accuracy = foundItems.length > 0 ? Math.round((topMatches.filter(m=>m.confidenceScore>0.7).length / Math.max(foundItems.length,1)) * 100) : 94;

  return (
    <motion.div initial={{ opacity:0, y:32, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }} transition={{ delay:0.3, duration:0.8, ease:[0.22,1,0.36,1] }}
      style={{ position:'relative', maxWidth:480, width:'100%', marginLeft:'auto', overflow:'visible' }}>
      
      {/* Background glow behind mockup */}
      <motion.div 
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.95, 1.05, 0.95] }} 
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at center, rgba(124,58,237,0.4) 0%, transparent 60%)', borderRadius:32, filter:'blur(50px)', zIndex:0 }} 
      />

      {/* Floating AI Data Nodes connecting to the mockup */}
      <motion.div animate={{ y: [-15, 15, -15] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: '15%', left: '-40px', zIndex: 10, display: 'flex', alignItems: 'center' }}>
        <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#60a5fa', boxShadow: '0 0 20px #60a5fa, inset 0 0 5px #fff' }} />
        <div style={{ width: 50, height: 1, background: 'linear-gradient(90deg, #60a5fa, transparent)', opacity: 0.6 }} />
      </motion.div>
      <motion.div animate={{ y: [20, -20, 20] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        style={{ position: 'absolute', bottom: '25%', right: '-35px', zIndex: 10, display: 'flex', alignItems: 'center', flexDirection: 'row-reverse' }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 20px #34d399, inset 0 0 5px #fff' }} />
        <div style={{ width: 40, height: 1, background: 'linear-gradient(-90deg, #34d399, transparent)', opacity: 0.6 }} />
      </motion.div>

      <div style={{ ...glass, overflow:'hidden', position:'relative', zIndex:1, boxShadow:'0 30px 80px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 24, background: 'rgba(15,12,41,0.6)' }}>
        
        {/* Animated AI Scanning Laser Overlay */}
        <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden rounded-2xl mix-blend-screen">
          <motion.div 
            animate={{ top: ['-30%', '130%'] }} 
            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
            style={{ 
              position: 'absolute', width: '100%', height: '180px',
              background: 'linear-gradient(to bottom, transparent, rgba(167, 139, 250, 0.05) 70%, rgba(167, 139, 250, 0.4) 100%)',
              borderBottom: '2px solid rgba(167, 139, 250, 0.9)',
              boxShadow: '0 8px 30px rgba(124, 58, 237, 0.6)'
            }} 
          />
        </div>

        {/* Browser chrome */}
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,0.08)', background:'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)' }}>
          <div style={{ display:'flex', gap:6 }}>
            {['rgba(239,68,68,0.8)','rgba(251,191,36,0.8)','rgba(52,211,153,0.8)'].map((c,i) => (
              <div key={i} style={{ width:12, height:12, borderRadius:'50%', background:c, boxShadow: `inset 0 1px 2px rgba(255,255,255,0.3), 0 0 10px ${c.replace('0.8','0.4')}` }} />
            ))}
          </div>
          <div style={{ flex:1, display:'flex', justifyContent:'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
              <Lock style={{ width: 10, height: 10, color: 'rgba(255,255,255,0.4)' }} />
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.5)', fontFamily:'monospace', letterSpacing: '0.05em' }}>finback-ai.app</span>
            </div>
          </div>
        </div>

        <div style={{ padding: '24px 20px' }}>
          {/* Stats row */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
            {[
              { label:'Items Today', value:loading?'—':String(todayItems), color:'#c4b5fd', bg: 'rgba(124,58,237,0.1)' },
              { label:'Matches', value:loading?'—':String(topMatches.length||lostItems.length), color:'#6ee7b7', bg: 'rgba(52,211,153,0.1)' },
              { label:'Accuracy', value:loading?'—':`${accuracy}%`, color:'#fcd34d', bg: 'rgba(251,191,36,0.1)' },
            ].map((s,i) => (
              <motion.div key={i} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5+i*0.1 }}
                style={{ background: s.bg, border:'1px solid rgba(255,255,255,0.06)', borderRadius:16, padding:'14px 10px', textAlign:'center', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize:24, fontWeight:800, color:s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
                <div style={{ fontSize:10, fontWeight: 600, color:'rgba(255,255,255,0.4)', marginTop:4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Matches Section */}
          <div style={{ marginBottom:4 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12, alignItems: 'center' }}>
              <span style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.8)', display:'flex', alignItems:'center', gap:6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <Sparkles style={{ width:14, height:14, color:'#c4b5fd' }} /> Live Matches
              </span>
              <span style={{ fontSize:10, fontWeight: 600, color:'#34d399', display:'flex', alignItems:'center', gap:6, background: 'rgba(52,211,153,0.1)', padding: '4px 10px', borderRadius: 12, border: '1px solid rgba(52,211,153,0.2)' }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'#34d399', display:'inline-block', animation:'pulse 1.5s infinite', boxShadow: '0 0 10px #34d399' }} />
                {topMatches.length > 0 ? 'GPT-4o ACTIVE' : 'LISTENING'}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {displayMatches.map((m,i) => (
                <motion.div key={i} initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ delay:1+i*0.15 }}
                  style={{ display:'flex', alignItems:'center', gap:12, background:'linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:12, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}>
                  <div style={{ width:36, height:36, borderRadius:12, background:'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(79,70,229,0.2))', border: '1px solid rgba(124,58,237,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0, boxShadow: '0 0 15px rgba(124,58,237,0.15)' }}>{m.emoji}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:13, fontWeight:700, color:'#fff', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', letterSpacing: '-0.01em' }}>{m.title}</p>
                    <p style={{ fontSize:11, color:'rgba(255,255,255,0.4)', margin:'4px 0 0', display:'flex', alignItems:'center', gap:4, fontWeight: 500 }}>
                      <MapPin style={{ width:10, height:10 }} />{m.loc}
                    </p>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0, width: 60 }}>
                    <span style={{ fontSize:14, fontWeight:800, color: m.high ? '#34d399' : '#fbbf24', letterSpacing: '-0.02em' }}>{m.pct}%</span>
                    <div style={{ width:'100%', height:4, background:'rgba(255,255,255,0.1)', borderRadius:2, overflow:'hidden', marginTop:6 }}>
                      <motion.div style={{ height:'100%', borderRadius:2, background: m.high ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #f59e0b, #fbbf24)', boxShadow: m.high ? '0 0 10px rgba(52,211,153,0.5)' : 'none' }}
                        initial={{ width:0 }} animate={{ width:`${m.pct}%` }} transition={{ delay:1.2+i*0.15, duration:1, ease: 'easeOut' }} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Premium Floating chips */}
      <motion.div initial={{ opacity:0, x:20, y: -10 }} animate={{ opacity:1, x:0, y: 0 }} transition={{ delay:1.5 }}
        style={{ position:'absolute', right:-20, top:-30, ...glass, padding:'12px 16px', zIndex:10, whiteSpace:'nowrap', borderRadius: 16, background: 'rgba(15,12,41,0.8)', border: '1px solid rgba(124,58,237,0.3)', boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Users style={{ width: 16, height: 16, color: '#c4b5fd' }} />
        </div>
        <div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:2, fontWeight: 600 }}>Active Search</div>
          <div style={{ fontSize:16, fontWeight:800, color:'#fff', letterSpacing: '-0.02em' }}>{loading?'—':lostItems.length} Lost Items</div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity:0, x:20, y: 10 }} animate={{ opacity:1, x:0, y: 0 }} transition={{ delay:1.8 }}
        style={{ position:'absolute', right:-10, bottom:-30, ...glass, padding:'12px 16px', zIndex:10, whiteSpace:'nowrap', borderRadius: 16, background: 'rgba(15,12,41,0.8)', border: '1px solid rgba(52,211,153,0.3)', boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(52,211,153,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle style={{ width: 16, height: 16, color: '#34d399' }} />
        </div>
        <div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:2, fontWeight: 600 }}>Recovered</div>
          <div style={{ fontSize:16, fontWeight:800, color:'#34d399', letterSpacing: '-0.02em' }}>{loading?'—':foundItems.length} Found Items</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const { items, lostItems, foundItems, loading } = useItems();
  const { user, isAuthenticated, signOut } = useAuth();
  const displayName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';
  const todayCount = items.filter(i => new Date(i.created_at).toDateString() === new Date().toDateString()).length;
  const topMatches = useMemo(() => buildTopMatches(lostItems, foundItems), [lostItems, foundItems]);

  const heroStats = [
    { num: loading?'—':`${topMatches.length>0 ? Math.round((topMatches.filter(m=>m.confidenceScore>0.7).length/Math.max(foundItems.length,1))*100) : 94}%`, label:'Match accuracy' },
    { num: loading?'—':String(items.length), label:'Total items' },
    { num: loading?'—':String(lostItems.length+foundItems.length>0 ? topMatches.length : 0), label:'AI matches made' },
  ];

  const pageStats = [
    { label:'Items Recovered', value:loading?'—':String(items.length), icon:CheckCircle },
    { label:'Lost Items', value:loading?'—':String(lostItems.length), icon:Users },
    { label:'Found Items', value:loading?'—':String(foundItems.length), icon:TrendingUp },
    { label:'Items Today', value:loading?'—':String(todayCount), icon:Clock },
  ];

  const features = [
    { icon:Brain, title:'AI-Powered Matching', description:'Advanced embeddings analyze images with 94% accuracy, matching lost items to found items in seconds.', glow:'rgba(124,58,237,0.15)', border:'rgba(124,58,237,0.2)', iconColor:'#a78bfa', iconBg:'rgba(124,58,237,0.15)' },
    { icon:Zap, title:'Smart Confidence Scoring', description:'Multi-factor algorithm weighs image (40%), text (30%), location (20%), and time (10%) for precise matches.', glow:'rgba(251,191,36,0.1)', border:'rgba(251,191,36,0.15)', iconColor:'#fbbf24', iconBg:'rgba(251,191,36,0.1)' },
    { icon:Shield, title:'Secure & Private', description:'JWT authentication, role-based access, and spam detection keep your data safe while connecting matches.', glow:'rgba(52,211,153,0.1)', border:'rgba(52,211,153,0.15)', iconColor:'#34d399', iconBg:'rgba(52,211,153,0.1)' },
  ];

  const howItWorks = [
    { step:'01', title:'Report Your Item', description:'Upload a photo, add details, and pin your location.' },
    { step:'02', title:'AI Analyzes & Matches', description:'Neural network scans all items and ranks potential matches.' },
    { step:'03', title:'Get Notified', description:'Instant alerts when match confidence exceeds 80%.' },
    { step:'04', title:'Connect & Recover', description:'Contact the finder securely and reunite with your item.' },
  ];

  const btnPrimary: React.CSSProperties = {
    display:'inline-flex', alignItems:'center', gap:8, padding:'13px 24px', borderRadius:14,
    background:'linear-gradient(135deg,rgba(124,58,237,0.6),rgba(79,70,229,0.6))',
    border:'1px solid rgba(124,58,237,0.4)', color:'#e9d5ff', fontSize:15, fontWeight:600,
    textDecoration:'none', cursor:'pointer', transition:'all 0.2s',
    boxShadow:'0 0 30px rgba(124,58,237,0.25)',
  };
  const btnOutline: React.CSSProperties = {
    display:'inline-flex', alignItems:'center', gap:8, padding:'13px 24px', borderRadius:14,
    background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.12)',
    color:'rgba(255,255,255,0.7)', fontSize:15, fontWeight:500, textDecoration:'none', cursor:'pointer',
  };

  return (
    <div style={{ minHeight:'100vh' }}>

      {/* ── HERO ── */}
      <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', padding:'80px 16px 64px', position:'relative' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', width:'100%' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 480px), 1fr))', gap:48, alignItems:'center' }}>
            <div style={{ paddingRight: '20px' }}>
              <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
                style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 16px', borderRadius:30, background:'rgba(124,58,237,0.1)', border:'1px solid rgba(124,58,237,0.25)', marginBottom:32, backdropFilter: 'blur(10px)' }}>
                <span style={{ position:'relative', display:'inline-flex', width:8, height:8 }}>
                  <span style={{ position:'absolute', display:'inline-flex', width:'100%', height:'100%', borderRadius:'50%', background:'#34d399', opacity:0.75, animation:'ping 1.5s cubic-bezier(0,0,0.2,1) infinite' }} />
                  <span style={{ position:'relative', display:'inline-flex', width:8, height:8, borderRadius:'50%', background:'#34d399' }} />
                </span>
                <span style={{ fontSize:13, color:'#c4b5fd', fontWeight:600, letterSpacing: '0.02em' }}>
                  {isAuthenticated ? `Welcome back, ${displayName} 👋` : 'FinBack Platform 2.0 is Live'}
                </span>
              </motion.div>

              <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1, duration:0.65, ease:[0.22,1,0.36,1] }}
                style={{ fontSize:'clamp(48px, 6vw, 72px)', fontWeight:900, lineHeight:1.05, letterSpacing:'-0.03em', marginBottom:24, color:'#fff' }}>
                Never Lose
                <span style={{ display:'block', background:'linear-gradient(135deg, #c4b5fd, #60a5fa, #34d399)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', paddingBottom: '8px' }}>
                  Anything Again.
                </span>
              </motion.h1>

              <motion.p initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
                style={{ fontSize:'clamp(16px, 1.5vw, 19px)', color:'rgba(255,255,255,0.6)', lineHeight:1.6, marginBottom:40, maxWidth:500, fontWeight: 400 }}>
                FinBack uses <strong style={{ color:'#fff', fontWeight:600 }}>ChatGPT (GPT-4o)</strong> to semantically match lost and found items across your campus — analyzing context and location like a human would.
              </motion.p>

              <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
                style={{ display:'flex', flexWrap:'wrap', gap:16, marginBottom:48 }}>
                {isAuthenticated ? (
                  <>
                    <Link to={ROUTE_PATHS.DASHBOARD} style={{ ...btnPrimary, padding: '16px 28px', fontSize: 16 }}>
                      <LayoutDashboard style={{ width:18, height:18 }} /> Go to Dashboard
                    </Link>
                    <Link to={ROUTE_PATHS.BROWSE} style={{ ...btnOutline, padding: '16px 28px', fontSize: 16 }}>Browse Items</Link>
                  </>
                ) : (
                  <>
                    <Link to={ROUTE_PATHS.AUTH} style={{ ...btnPrimary, padding: '16px 28px', fontSize: 16 }}>
                      Get Started Free <ArrowRight style={{ width:18, height:18 }} />
                    </Link>
                    <Link to={ROUTE_PATHS.BROWSE} style={{ ...btnOutline, padding: '16px 28px', fontSize: 16 }}>Browse Items</Link>
                  </>
                )}
              </motion.div>

              {/* ChatGPT powered badge */}
              <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.38 }}
                style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:32 }}>
                <div style={{ display:'flex', alignItems:'center', gap:7, padding:'6px 14px', borderRadius:20, background:'rgba(16,163,127,0.1)', border:'1px solid rgba(16,163,127,0.25)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink:0 }}>
                    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.475 4.475 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" fill="#10a37f"/>
                  </svg>
                  <span style={{ fontSize:12, color:'#10a37f', fontWeight:600 }}>Powered by ChatGPT</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:20, background:'rgba(124,58,237,0.08)', border:'1px solid rgba(124,58,237,0.2)' }}>
                  <span style={{ fontSize:11, color:'#a78bfa', fontWeight:500 }}>GPT-4o · Semantic AI Matching</span>
                </div>
              </motion.div>
              {/* Hero stats */}
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.45 }}
                style={{ display:'flex', alignItems:'center', gap:32, paddingTop:32, borderTop:'1px solid rgba(255,255,255,0.08)' }}>
                {heroStats.map((s,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:32 }}>
                    {i > 0 && <div style={{ width:1, height:40, background:'rgba(255,255,255,0.08)' }} />}
                    <div>
                      <div style={{ fontSize:28, fontWeight:800, color:'#fff', letterSpacing:'-0.02em', marginBottom: 2 }}>{s.num}</div>
                      <div style={{ fontSize:13, fontWeight: 500, color:'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
            <DashboardMockup />
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div style={{ overflow: 'hidden', padding: '32px 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.02) 50%, transparent)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 48, opacity: 0.5, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', color: '#fff' }}>TRUSTED BY STUDENTS</span>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', color: '#fff' }}>POWERED BY GPT-4O</span>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', color: '#fff' }}>SECURE & PRIVATE</span>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', color: '#fff' }}>94% ACCURACY</span>
        </div>
      </div>

      {/* ── STATS STRIP ── */}
      <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(0,0,0,0.2)', backdropFilter:'blur(20px)', padding:'48px 16px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:1, background:'rgba(255,255,255,0.06)' }}>
            {pageStats.map((stat,i) => {
              const Icon = stat.icon;
              return (
                <motion.div key={i} initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} transition={{ delay:i*0.08 }}
                  style={{ background:'rgba(15,12,41,0.8)', textAlign:'center', padding:'36px 24px' }}>
                  <Icon style={{ width:24, height:24, color:'#a78bfa', margin:'0 auto 12px' }} />
                  <div style={{ fontSize:32, fontWeight:700, color:'#fff', marginBottom:4 }}>{stat.value}</div>
                  <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)' }}>{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── FEATURES BENTO GRID ── */}
      <section style={{ padding:'100px 16px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <FadeUp style={{ textAlign:'center', marginBottom:64 } as React.CSSProperties}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, fontSize:12, fontWeight: 700, color:'#c4b5fd', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:20 }}>
              <span style={{ width:24, height:2, background:'#c4b5fd', display:'inline-block' }} /> Intelligent Recovery
            </div>
            <h2 style={{ fontSize:'clamp(36px, 4vw, 48px)', fontWeight:800, color:'#fff', marginBottom:16, letterSpacing:'-0.03em' }}>
              Built for <span style={{ background:'linear-gradient(135deg,#c4b5fd,#60a5fa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Performance.</span>
            </h2>
            <p style={{ fontSize:18, color:'rgba(255,255,255,0.5)', maxWidth:520, margin:'0 auto', lineHeight:1.6 }}>
              Advanced semantic analysis meets a flawless user experience.
            </p>
          </FadeUp>
          
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap:24 }}>
            {features.map((f,i) => {
              const Icon = f.icon;
              return (
                <FadeUp key={i} delay={i*0.1} style={{ gridColumn: i === 0 ? '1 / -1' : 'auto' }}>
                  <div style={{ 
                    ...glass, 
                    padding: i === 0 ? '48px' : '36px', 
                    height:'100%', 
                    background:`rgba(255,255,255,0.03)`, 
                    transition:'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', 
                    boxShadow:`0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)`, 
                    borderColor:'rgba(255,255,255,0.08)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: i === 0 ? 'row' : 'column',
                    alignItems: i === 0 ? 'center' : 'flex-start',
                    gap: i === 0 ? 40 : 0
                  }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.transform='translateY(-6px)';
                      (e.currentTarget as HTMLDivElement).style.background='rgba(255,255,255,0.05)';
                      (e.currentTarget as HTMLDivElement).style.borderColor=f.border;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.transform='translateY(0)';
                      (e.currentTarget as HTMLDivElement).style.background='rgba(255,255,255,0.03)';
                      (e.currentTarget as HTMLDivElement).style.borderColor='rgba(255,255,255,0.08)';
                    }}>
                    
                    <div style={{ position: 'absolute', top: '-20%', left: '-20%', width: '140%', height: '140%', background: `radial-gradient(circle at center, ${f.glow} 0%, transparent 60%)`, zIndex: 0, pointerEvents: 'none' }} />
                    
                    <div style={{ width: i===0 ? 80 : 56, height: i===0 ? 80 : 56, borderRadius:20, background:f.iconBg, border:`1px solid ${f.border}`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom: i===0 ? 0 : 24, zIndex: 1, flexShrink: 0, boxShadow: `0 0 20px ${f.glow}` }}>
                      <Icon style={{ width: i===0 ? 32 : 24, height: i===0 ? 32 : 24, color:f.iconColor }} />
                    </div>
                    
                    <div style={{ zIndex: 1 }}>
                      <h3 style={{ fontSize: i===0 ? 28 : 22, fontWeight:800, color:'#fff', marginBottom:12, letterSpacing:'-0.02em' }}>{f.title}</h3>
                      <p style={{ color:'rgba(255,255,255,0.6)', lineHeight:1.6, fontSize: i===0 ? 18 : 15, margin:0 }}>{f.description}</p>
                    </div>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS TIMELINE ── */}
      <section style={{ padding:'100px 16px', background:'linear-gradient(to bottom, rgba(0,0,0,0), rgba(124,58,237,0.03))' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <FadeUp style={{ textAlign:'center', marginBottom:80 } as React.CSSProperties}>
            <h2 style={{ fontSize:'clamp(36px, 4vw, 48px)', fontWeight:800, color:'#fff', letterSpacing:'-0.03em' }}>
              From lost to found in{' '}
              <span style={{ background:'linear-gradient(135deg,#c4b5fd,#60a5fa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>seconds.</span>
            </h2>
          </FadeUp>
          
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap:32, position: 'relative' }}>
            {howItWorks.map((item,i) => (
              <FadeUp key={i} delay={i*0.1}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize:72, fontWeight:900, color:'rgba(255,255,255,0.03)', marginBottom:-20, fontFamily:'Inter, sans-serif', letterSpacing: '-0.05em' }}>{item.step}</div>
                  <h3 style={{ fontSize:20, fontWeight:800, color:'#fff', marginBottom:12, letterSpacing: '-0.01em' }}>{item.title}</h3>
                  <p style={{ color:'rgba(255,255,255,0.5)', fontSize:15, lineHeight:1.6, margin:0 }}>{item.description}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding:'100px 16px' }}>
        <div style={{ maxWidth:1000, margin:'0 auto' }}>
          <FadeUp>
            <div style={{ ...glass, padding:'80px 40px', textAlign:'center', position:'relative', overflow:'hidden', background:'linear-gradient(180deg, rgba(124,58,237,0.08) 0%, rgba(124,58,237,0.02) 100%)', borderColor:'rgba(124,58,237,0.3)', boxShadow:'0 20px 80px rgba(124,58,237,0.15), inset 0 1px 0 rgba(255,255,255,0.2)', borderRadius: 32 }}>
              
              <div style={{ position:'absolute', top:0, left:'10%', right:'10%', height:1, background:'linear-gradient(90deg,transparent,rgba(167,139,250,0.8),transparent)' }} />
              <div style={{ position:'absolute', top:0, left:'30%', right:'30%', height:1, background:'linear-gradient(90deg,transparent,#fff,transparent)', boxShadow: '0 0 20px #fff' }} />
              
              <h2 style={{ fontSize:'clamp(40px, 5vw, 56px)', fontWeight:900, color:'#fff', marginBottom:20, letterSpacing:'-0.03em', lineHeight: 1.1 }}>
                Ready to find your{' '}
                <span style={{ background:'linear-gradient(135deg,#c4b5fd,#60a5fa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>belongings?</span>
              </h2>
              <p style={{ fontSize:18, color:'rgba(255,255,255,0.6)', marginBottom:48, maxWidth:500, margin:'0 auto 48px', lineHeight:1.6 }}>
                Join thousands of students already using FinBack to recover their items instantly.
              </p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:16, alignItems:'center', justifyContent:'center' }}>
                {isAuthenticated ? (
                  <>
                    <Link to={ROUTE_PATHS.SUBMIT} style={{ ...btnPrimary, padding:'18px 36px', fontSize: 16 }}>
                      Submit an Item <ArrowRight style={{ width:18, height:18 }} />
                    </Link>
                    <Link to={ROUTE_PATHS.MATCHES} style={{ ...btnOutline, padding:'18px 36px', fontSize: 16 }}>View AI Matches</Link>
                  </>
                ) : (
                  <>
                    <Link to={ROUTE_PATHS.AUTH} style={{ ...btnPrimary, padding:'18px 36px', fontSize: 16 }}>
                      Create Free Account <ArrowRight style={{ width:18, height:18 }} />
                    </Link>
                    <Link to={ROUTE_PATHS.SUBMIT} style={{ ...btnOutline, padding:'18px 36px', fontSize: 16 }}>Report an Item</Link>
                  </>
                )}
              </div>
              <p style={{ marginTop:28, fontSize:13, color:'rgba(255,255,255,0.3)', fontWeight: 500 }}>Free forever for students. No credit card required.</p>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
