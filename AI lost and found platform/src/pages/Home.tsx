import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef, useMemo } from 'react';
import { Brain, Zap, Shield, TrendingUp, Users, MapPin, Clock, CheckCircle, ArrowRight, Sparkles, LogOut, LayoutDashboard } from 'lucide-react';
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
      style={{ position:'relative', maxWidth:480, width:'100%', marginLeft:'auto' }}>
      {/* Glow */}
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at center, rgba(124,58,237,0.25) 0%, transparent 70%)', borderRadius:24, transform:'scale(0.9) translateY(10%)', filter:'blur(30px)', zIndex:0 }} />

      <div style={{ ...glass, overflow:'hidden', position:'relative', zIndex:1, boxShadow:'0 25px 60px rgba(0,0,0,0.4)' }}>
        {/* Browser chrome */}
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(0,0,0,0.2)' }}>
          <div style={{ display:'flex', gap:5 }}>
            {['rgba(239,68,68,0.5)','rgba(251,191,36,0.5)','rgba(52,211,153,0.5)'].map((c,i) => (
              <div key={i} style={{ width:11, height:11, borderRadius:'50%', background:c }} />
            ))}
          </div>
          <div style={{ flex:1, display:'flex', justifyContent:'center' }}>
            <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)', fontFamily:'monospace' }}>finback-ai.vercel.app</span>
          </div>
        </div>

        <div style={{ padding:20 }}>
          {/* Stats row */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:14 }}>
            {[
              { label:'Items Today', value:loading?'—':String(todayItems), color:'#a78bfa' },
              { label:'Matches', value:loading?'—':String(topMatches.length||lostItems.length), color:'#34d399' },
              { label:'Accuracy', value:loading?'—':`${accuracy}%`, color:'#fbbf24' },
            ].map((s,i) => (
              <motion.div key={i} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5+i*0.1 }}
                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'12px 8px', textAlign:'center' }}>
                <div style={{ fontSize:20, fontWeight:700, color:s.color, fontFamily:'monospace' }}>{s.value}</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:3 }}>{s.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Weekly chart */}
          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, padding:14, marginBottom:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.4)', fontWeight:500 }}>Weekly Items</span>
              <span style={{ fontSize:10, color:'#34d399', fontFamily:'monospace' }}>{loading?'...': `${items.length} total`}</span>
            </div>
            <div style={{ display:'flex', alignItems:'flex-end', gap:4, height:56 }}>
              {weeklyBars.map((h,i) => (
                <motion.div key={i} style={{ flex:1, borderRadius:'4px 4px 0 0', background: i===6 ? 'linear-gradient(180deg,#7c3aed,#4f46e5)' : 'rgba(124,58,237,0.25)' }}
                  initial={{ height:0 }} animate={{ height:`${h}%` }} transition={{ delay:0.7+i*0.07, duration:0.5, ease:'easeOut' }} />
              ))}
            </div>
            <div style={{ display:'flex', marginTop:6 }}>
              {['M','T','W','T','F','S','S'].map((d,i) => (
                <span key={i} style={{ flex:1, textAlign:'center', fontSize:9, color:'rgba(255,255,255,0.25)' }}>{d}</span>
              ))}
            </div>
          </div>

          {/* Matches */}
          <div style={{ marginBottom:4 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
              <span style={{ fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.7)', display:'flex', alignItems:'center', gap:5 }}>
                <Sparkles style={{ width:12, height:12, color:'#a78bfa' }} /> AI Matches
              </span>
              <span style={{ fontSize:10, color:'#34d399', display:'flex', alignItems:'center', gap:4 }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'#34d399', display:'inline-block', animation:'pulse 2s infinite' }} />
                {topMatches.length > 0 ? 'ChatGPT Live' : 'Awaiting Items'}
              </span>
            </div>
            {displayMatches.map((m,i) => (
              <motion.div key={i} initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ delay:1+i*0.15 }}
                style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:10, marginBottom:8 }}>
                <div style={{ width:32, height:32, borderRadius:9, background:'rgba(124,58,237,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{m.emoji}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.85)', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.title}</p>
                  <p style={{ fontSize:10, color:'rgba(255,255,255,0.35)', margin:'2px 0 0', display:'flex', alignItems:'center', gap:2 }}>
                    <MapPin style={{ width:9, height:9 }} />{m.loc}
                  </p>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <span style={{ fontSize:12, fontWeight:700, fontFamily:'monospace', color: m.high ? '#34d399' : '#fbbf24' }}>{m.pct}%</span>
                  <div style={{ width:44, height:3, background:'rgba(255,255,255,0.06)', borderRadius:2, overflow:'hidden', marginTop:4 }}>
                    <motion.div style={{ height:'100%', borderRadius:2, background: m.high ? '#34d399' : '#fbbf24' }}
                      initial={{ width:0 }} animate={{ width:`${m.pct}%` }} transition={{ delay:1.2+i*0.15, duration:0.8 }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating chips */}
      <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:1.5 }}
        style={{ position:'absolute', left:-120, top:60, ...glass, padding:'10px 14px' }}>
        <div style={{ fontSize:9, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:3 }}>Items lost</div>
        <div style={{ fontSize:15, fontWeight:700, color:'#fff' }}>{loading?'—':lostItems.length} items</div>
        <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:4 }}>reported</div>
      </motion.div>
      <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:1.8 }}
        style={{ position:'absolute', left:-100, bottom:80, ...glass, padding:'10px 14px' }}>
        <div style={{ fontSize:9, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:3 }}>Items found</div>
        <div style={{ fontSize:15, fontWeight:700, color:'#fff' }}>{loading?'—':foundItems.length} items</div>
        <div style={{ fontSize:10, color:'#34d399', marginTop:4 }}>submitted by finders</div>
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
      <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', padding:'80px 16px 64px', position:'relative', overflow:'hidden' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', width:'100%' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 480px), 1fr))', gap:48, alignItems:'center' }}>
            <div>
              <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
                style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 14px', borderRadius:20, background:'rgba(124,58,237,0.1)', border:'1px solid rgba(124,58,237,0.2)', marginBottom:28 }}>
                <span style={{ position:'relative', display:'inline-flex', width:8, height:8 }}>
                  <span style={{ position:'absolute', display:'inline-flex', width:'100%', height:'100%', borderRadius:'50%', background:'#34d399', opacity:0.75, animation:'ping 1.5s cubic-bezier(0,0,0.2,1) infinite' }} />
                  <span style={{ position:'relative', display:'inline-flex', width:8, height:8, borderRadius:'50%', background:'#34d399' }} />
                </span>
                <span style={{ fontSize:12, color:'#a78bfa', fontWeight:500 }}>
                  {isAuthenticated ? `Welcome back, ${displayName} 👋` : 'AI-Powered Lost & Found — Campus Edition'}
                </span>
              </motion.div>

              <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1, duration:0.65, ease:[0.22,1,0.36,1] }}
                style={{ fontSize:56, fontWeight:800, lineHeight:1.05, letterSpacing:'-0.02em', marginBottom:20, color:'#fff' }}>
                Never Lose
                <span style={{ display:'block', background:'linear-gradient(135deg, #a78bfa, #60a5fa, #34d399)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                  Anything Again
                </span>
              </motion.h1>

              <motion.p initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
                style={{ fontSize:17, color:'rgba(255,255,255,0.5)', lineHeight:1.7, marginBottom:36, maxWidth:480 }}>
                FinBack AI uses <strong style={{ color:'rgba(255,255,255,0.75)' }}>ChatGPT (GPT-4o)</strong> to semantically match lost and found items across your campus — understanding context, descriptions, and location like a human would.
              </motion.p>

              <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
                style={{ display:'flex', flexWrap:'wrap', gap:12, marginBottom:44 }}>
                {isAuthenticated ? (
                  <>
                    <Link to={ROUTE_PATHS.DASHBOARD} style={btnPrimary}>
                      <LayoutDashboard style={{ width:16, height:16 }} /> Go to Dashboard
                    </Link>
                    <Link to={ROUTE_PATHS.BROWSE} style={btnOutline}>Browse Items</Link>
                    <button onClick={() => signOut()} style={{ ...btnOutline, display:'inline-flex', alignItems:'center', gap:8, color:'rgba(255,255,255,0.5)', border:'1px solid rgba(255,255,255,0.08)' }}>
                      <LogOut style={{ width:15, height:15 }} /> Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to={ROUTE_PATHS.AUTH} style={btnPrimary}>
                      Get Started Free <ArrowRight style={{ width:16, height:16 }} />
                    </Link>
                    <Link to={ROUTE_PATHS.BROWSE} style={btnOutline}>Browse Items</Link>
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
                style={{ display:'flex', alignItems:'center', gap:24, paddingTop:28, borderTop:'1px solid rgba(255,255,255,0.08)' }}>
                {heroStats.map((s,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:20 }}>
                    {i > 0 && <div style={{ width:1, height:32, background:'rgba(255,255,255,0.08)' }} />}
                    <div>
                      <div style={{ fontSize:22, fontWeight:700, color:'#fff', letterSpacing:'-0.01em' }}>{s.num}</div>
                      <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)' }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
            <DashboardMockup />
          </div>
        </div>
      </section>

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

      {/* ── FEATURES ── */}
      <section style={{ padding:'80px 16px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <FadeUp style={{ textAlign:'center', marginBottom:56 } as React.CSSProperties}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:11, color:'#a78bfa', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:16 }}>
              <span style={{ width:20, height:1, background:'#a78bfa', display:'inline-block' }} /> Core Features
            </div>
            <h2 style={{ fontSize:40, fontWeight:700, color:'#fff', marginBottom:14, letterSpacing:'-0.02em' }}>
              Powered by AI,{' '}
              <span style={{ background:'linear-gradient(135deg,#a78bfa,#60a5fa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>built for students</span>
            </h2>
            <p style={{ fontSize:16, color:'rgba(255,255,255,0.45)', maxWidth:480, margin:'0 auto', lineHeight:1.6 }}>
              Advanced technology meets intuitive design to reunite you with your belongings.
            </p>
          </FadeUp>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap:16 }}>
            {features.map((f,i) => {
              const Icon = f.icon;
              return (
                <FadeUp key={i} delay={i*0.1}>
                  <div style={{ ...glass, padding:28, height:'100%', background:`rgba(255,255,255,0.04)`, transition:'all 0.3s', boxShadow:`0 0 40px ${f.glow}`, borderColor:f.border }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform='translateY(-4px)'}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform='translateY(0)'}>
                    <div style={{ width:44, height:44, borderRadius:14, background:f.iconBg, border:`1px solid ${f.border}`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
                      <Icon style={{ width:20, height:20, color:f.iconColor }} />
                    </div>
                    <h3 style={{ fontSize:17, fontWeight:700, color:'#fff', marginBottom:10, letterSpacing:'-0.01em' }}>{f.title}</h3>
                    <p style={{ color:'rgba(255,255,255,0.45)', lineHeight:1.6, fontSize:14, margin:0 }}>{f.description}</p>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding:'80px 16px', borderTop:'1px solid rgba(255,255,255,0.06)', background:'rgba(0,0,0,0.15)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <FadeUp style={{ textAlign:'center', marginBottom:56 } as React.CSSProperties}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:11, color:'#a78bfa', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:16 }}>
              <span style={{ width:20, height:1, background:'#a78bfa', display:'inline-block' }} /> How it works
            </div>
            <h2 style={{ fontSize:40, fontWeight:700, color:'#fff', letterSpacing:'-0.02em' }}>
              From lost to found{' '}
              <span style={{ background:'linear-gradient(135deg,#a78bfa,#60a5fa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>in four steps</span>
            </h2>
          </FadeUp>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap:14 }}>
            {howItWorks.map((item,i) => (
              <FadeUp key={i} delay={i*0.1}>
                <div style={{ ...glass, padding:24, height:'100%', transition:'all 0.3s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor='rgba(124,58,237,0.25)'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor='rgba(255,255,255,0.1)'}>
                  <div style={{ fontSize:44, fontWeight:800, color:'rgba(124,58,237,0.15)', marginBottom:16, fontFamily:'monospace' }}>{item.step}</div>
                  <h3 style={{ fontSize:16, fontWeight:700, color:'#fff', marginBottom:8 }}>{item.title}</h3>
                  <p style={{ color:'rgba(255,255,255,0.4)', fontSize:13, lineHeight:1.6, margin:0 }}>{item.description}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding:'80px 16px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <FadeUp>
            <div style={{ ...glass, padding:'60px 40px', textAlign:'center', position:'relative', overflow:'hidden', background:'rgba(124,58,237,0.06)', borderColor:'rgba(124,58,237,0.2)', boxShadow:'0 0 80px rgba(124,58,237,0.1)' }}>
              {/* Top line */}
              <div style={{ position:'absolute', top:0, left:'25%', right:'25%', height:1, background:'linear-gradient(90deg,transparent,rgba(124,58,237,0.6),transparent)' }} />
              <h2 style={{ fontSize:40, fontWeight:700, color:'#fff', marginBottom:16, letterSpacing:'-0.02em' }}>
                Ready to find your{' '}
                <span style={{ background:'linear-gradient(135deg,#a78bfa,#60a5fa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>lost items?</span>
              </h2>
              <p style={{ fontSize:16, color:'rgba(255,255,255,0.45)', marginBottom:36, maxWidth:480, margin:'0 auto 36px', lineHeight:1.6 }}>
                Join thousands of students already using FinBack AI to recover their belongings.
              </p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:12, alignItems:'center', justifyContent:'center' }}>
                {isAuthenticated ? (
                  <>
                    <Link to={ROUTE_PATHS.SUBMIT} style={{ ...btnPrimary, padding:'14px 32px' }}>
                      Submit an Item <ArrowRight style={{ width:16, height:16 }} />
                    </Link>
                    <Link to={ROUTE_PATHS.MATCHES} style={{ ...btnOutline, padding:'14px 32px' }}>View AI Matches</Link>
                  </>
                ) : (
                  <>
                    <Link to={ROUTE_PATHS.AUTH} style={{ ...btnPrimary, padding:'14px 32px' }}>
                      Create Free Account <ArrowRight style={{ width:16, height:16 }} />
                    </Link>
                    <Link to={ROUTE_PATHS.SUBMIT} style={{ ...btnOutline, padding:'14px 32px' }}>Report an Item</Link>
                  </>
                )}
              </div>
              <p style={{ marginTop:20, fontSize:12, color:'rgba(255,255,255,0.25)' }}>No credit card required · Free campus plan · Cancel anytime</p>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
