import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Home, Search, Upload, Zap, Shield, User, LogOut, Moon, Sun, X, Github, Twitter, Linkedin, Sparkles } from 'lucide-react';
import { ROUTE_PATHS } from '@/lib/index';
import { useAuth } from '@/hooks/useAuth';
import { NotificationBell } from '@/components/NotificationBell';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface LayoutProps { children: React.ReactNode; }

export function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Persist preference in localStorage; default to dark
    const saved = localStorage.getItem('finback-theme');
    return saved ? saved === 'dark' : true;
  });
  const [scrolled, setScrolled] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const { user, isAuthenticated, signOut, isAdmin } = useAuth();

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || '';
  const avatarInitial = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        const h = headerRef.current.offsetHeight;
        setHeaderHeight(h);
        document.documentElement.style.setProperty('--header-height', `${h}px`);
      }
    };
    updateHeight();
    const ro = new ResizeObserver(updateHeight);
    if (headerRef.current) ro.observe(headerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('finback-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

  const navigationItems = [
    { to: ROUTE_PATHS.HOME, label: 'Home', icon: Home },
    { to: ROUTE_PATHS.BROWSE, label: 'Browse', icon: Search },
    { to: ROUTE_PATHS.SUBMIT, label: 'Submit Item', icon: Upload },
    ...(isAuthenticated ? [{ to: ROUTE_PATHS.DASHBOARD, label: 'Dashboard', icon: Zap }] : []),
    ...(isAuthenticated ? [{ to: ROUTE_PATHS.MATCHES, label: 'Matches', icon: Zap, badge: 'New' }] : []),
    ...(isAdmin() ? [{ to: ROUTE_PATHS.ADMIN, label: 'Admin', icon: Shield }] : []),
  ] as Array<{ to: string; label: string; icon: any; badge?: string }>;

  const [bannerVisible, setBannerVisible] = useState(() => localStorage.getItem('finback-banner') !== 'hidden');
  const hideBanner = () => { setBannerVisible(false); localStorage.setItem('finback-banner','hidden'); };

  return (
    <div className={isDarkMode ? 'finback-dark' : 'finback-light'} style={{ minHeight:'100vh' }}>
      {/* Global animated deep-space background */}
      {isDarkMode && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#08080f]">
          {/* Animated Stars / Particles */}
          <div className="absolute inset-0 opacity-40">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={`star-${i}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, Math.random() * 0.5 + 0.3, 0],
                  scale: [0, Math.random() + 0.5, 0],
                  x: Math.random() * 200 - 100,
                  y: Math.random() * -300 - 100
                }}
                transition={{
                  duration: Math.random() * 10 + 10,
                  repeat: Infinity,
                  delay: Math.random() * 10,
                  ease: 'linear'
                }}
                style={{
                  position: 'absolute',
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: Math.random() * 3 + 1,
                  height: Math.random() * 3 + 1,
                  backgroundColor: ['#a78bfa', '#60a5fa', '#fff'][i % 3],
                  borderRadius: '50%',
                  boxShadow: `0 0 ${Math.random() * 10 + 5}px ${['#a78bfa', '#60a5fa', '#fff'][i % 3]}`
                }}
              />
            ))}
          </div>

          {/* Deep Space Orbs */}
          <motion.div animate={{ scale:[1, 1.25, 1], x:[0, 80, -40, 0], y:[0, -60, 40, 0] }} transition={{ duration:25, repeat:Infinity, ease:'easeInOut' }}
            style={{ position:'absolute', width:'60vw', height:'60vw', borderRadius:'50%', background:'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 60%)', top:'-20%', left:'-10%', filter:'blur(80px)', mixBlendMode:'screen' }} />
          
          <motion.div animate={{ scale:[1, 1.15, 0.9, 1], x:[0, -100, 50, 0], y:[0, 70, -30, 0] }} transition={{ duration:32, repeat:Infinity, ease:'easeInOut', delay:2 }}
            style={{ position:'absolute', width:'50vw', height:'50vw', borderRadius:'50%', background:'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 60%)', bottom:'-15%', right:'-10%', filter:'blur(80px)', mixBlendMode:'screen' }} />
            
          <motion.div animate={{ scale:[0.9, 1.2, 0.9], x:[0, 60, -60, 0], y:[0, 80, -80, 0] }} transition={{ duration:28, repeat:Infinity, ease:'easeInOut', delay:5 }}
            style={{ position:'absolute', width:'45vw', height:'45vw', borderRadius:'50%', background:'radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 60%)', top:'30%', left:'30%', filter:'blur(90px)', mixBlendMode:'screen' }} />
            
          <motion.div animate={{ scale:[1, 1.3, 1], opacity:[0.3, 0.7, 0.3] }} transition={{ duration:15, repeat:Infinity, ease:'easeInOut' }}
            style={{ position:'absolute', width:'100vw', height:'2px', background:'linear-gradient(90deg, transparent, rgba(167,139,250,0.15), transparent)', top:'60%', left:0, transformOrigin:'left', rotate:'-15deg' }} />
        </div>
      )}

      {/* ── Announcement Banner ── */}
      <AnimatePresence>
        {bannerVisible && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.3 }}
            style={{ background:'linear-gradient(90deg,rgba(124,58,237,0.9),rgba(79,70,229,0.9))', position:'relative', zIndex:60, overflow:'hidden' }}>
            <motion.div animate={{ x:['-100%','200%'] }} transition={{ duration:4, repeat:Infinity, repeatDelay:3 }}
              style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)', pointerEvents:'none' }} />
            <div style={{ maxWidth:1200, margin:'0 auto', padding:'9px 48px', display:'flex', alignItems:'center', justifyContent:'center', gap:10, position:'relative' }}>
              <motion.div animate={{ rotate:[0,15,-10,15,0] }} transition={{ duration:3, repeat:Infinity, repeatDelay:2 }}>
                <Sparkles style={{ width:13, height:13, color:'#e9d5ff' }} />
              </motion.div>
              <span style={{ fontSize:12, color:'#e9d5ff', fontWeight:500, textAlign:'center' }}>
                🎉 <strong>FinBack AI v2.0</strong> is live — now powered by <strong>GPT-4o</strong> with 94% match accuracy.
                <NavLink to="/auth" style={{ color:'#c4b5fd', marginLeft:8, textDecoration:'underline', fontWeight:600 }}>Try it free →</NavLink>
              </span>
              <button onClick={hideBanner} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'transparent', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer', padding:4 }}>
                <X style={{ width:14, height:14 }} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header ref={headerRef} style={{
        position:'fixed', top:0, left:0, right:0, zIndex:50,
        background: isDarkMode
          ? (scrolled ? 'rgba(8,8,15,0.94)' : 'rgba(8,8,15,0.5)')
          : (scrolled ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.7)'),
        backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)',
        borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(124,58,237,0.12)',
        transition:'background 0.3s, border-color 0.3s',
        boxShadow: scrolled ? (isDarkMode ? '0 1px 40px rgba(0,0,0,0.4)' : '0 1px 20px rgba(124,58,237,0.08)') : 'none',
      }}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <NavLink to={ROUTE_PATHS.HOME} className="flex items-center gap-2.5">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  style={{ width:38, height:38, borderRadius:12, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 20px rgba(124,58,237,0.4)' }}>
                  <img src="/logo.png" alt="FinBack AI" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                </motion.div>
                <span style={{ fontSize:18, fontWeight:700, background:'linear-gradient(135deg,#a78bfa,#60a5fa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                  FinBack AI
                </span>
              </NavLink>

              {/* Desktop nav */}
              <nav className="hidden md:flex items-center gap-1">
                {navigationItems.map((item) => (
                  <NavLink key={item.to} to={item.to}
                    className={({ isActive }) => isActive ? '' : ''}
                    style={({ isActive }) => ({
                      display:'flex', alignItems:'center', gap:6, padding:'7px 14px',
                      borderRadius:10, fontSize:13, fontWeight:500, transition:'all 0.2s',
                      background: isActive ? 'rgba(124,58,237,0.15)' : 'transparent',
                      color: isActive ? '#7c3aed' : (isDarkMode ? 'rgba(255,255,255,0.55)' : 'rgba(30,27,75,0.65)'),
                      border: isActive ? '1px solid rgba(124,58,237,0.3)' : '1px solid transparent',
                    })}>
                    <item.icon className="h-4 w-4" />
                    {item.label}
                    {item.badge && (
                      <span style={{ fontSize:9, fontWeight:700, padding:'1px 6px', borderRadius:20, background:'linear-gradient(135deg,#7c3aed,#4f46e5)', color:'#e9d5ff', letterSpacing:'0.04em', textTransform:'uppercase' }}>{item.badge}</span>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Dark mode toggle */}
              <button onClick={() => setIsDarkMode(!isDarkMode)}
                style={{ width:36, height:36, borderRadius:10, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.6)', cursor:'pointer' }}>
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              {/* Notification Bell — authenticated only */}
              <NotificationBell />

              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#7c3aed,#4f46e5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'#fff', cursor:'pointer', border:'2px solid rgba(167,139,250,0.3)', boxShadow:'0 0 15px rgba(124,58,237,0.3)' }}>
                      {avatarInitial}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56" style={{ background:'rgba(15,12,41,0.95)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.1)' }}>
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium text-white">{displayName}</p>
                        <p className="text-xs" style={{ color:'rgba(255,255,255,0.4)' }}>{displayEmail}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator style={{ background:'rgba(255,255,255,0.08)' }} />
                    <DropdownMenuItem asChild>
                      <NavLink to={ROUTE_PATHS.DASHBOARD} className="flex items-center gap-2 cursor-pointer" style={{ color:'rgba(255,255,255,0.7)' }}>
                        <User className="h-4 w-4" />Dashboard
                      </NavLink>
                    </DropdownMenuItem>
                    {isAdmin() && (
                      <DropdownMenuItem asChild>
                        <NavLink to={ROUTE_PATHS.ADMIN} className="flex items-center gap-2 cursor-pointer" style={{ color:'rgba(255,255,255,0.7)' }}>
                          <Shield className="h-4 w-4" />Admin Panel
                        </NavLink>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator style={{ background:'rgba(255,255,255,0.08)' }} />
                    <DropdownMenuItem onClick={() => signOut()} className="flex items-center gap-2 cursor-pointer" style={{ color:'#f87171' }}>
                      <LogOut className="h-4 w-4" />Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <NavLink to={ROUTE_PATHS.AUTH}
                  style={{ padding:'8px 18px', borderRadius:10, background:'linear-gradient(135deg,rgba(124,58,237,0.5),rgba(79,70,229,0.5))', border:'1px solid rgba(124,58,237,0.4)', color:'#e9d5ff', fontSize:13, fontWeight:500, textDecoration:'none' }}
                  className="hidden md:flex items-center">
                  Sign In
                </NavLink>
              )}

              {/* Mobile menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <button style={{ width:36, height:36, borderRadius:10, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.6)', cursor:'pointer' }}>
                    <Menu className="h-5 w-5" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px]" style={{ background:'rgba(15,12,41,0.98)', backdropFilter:'blur(30px)', border:'1px solid rgba(255,255,255,0.1)' }}>
                  <nav className="flex flex-col gap-2 mt-8">
                    {navigationItems.map((item) => (
                      <NavLink key={item.to} to={item.to}
                        style={({ isActive }) => ({
                          display:'flex', alignItems:'center', gap:10, padding:'11px 16px',
                          borderRadius:12, fontSize:14, fontWeight:500,
                          background: isActive ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
                          color: isActive ? '#a78bfa' : 'rgba(255,255,255,0.6)',
                          border: isActive ? '1px solid rgba(124,58,237,0.3)' : '1px solid rgba(255,255,255,0.06)',
                          textDecoration:'none',
                        })}>
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </NavLink>
                    ))}
                    {!isAuthenticated && (
                      <NavLink to={ROUTE_PATHS.AUTH} style={{ marginTop:8, padding:'11px 16px', borderRadius:12, background:'linear-gradient(135deg,rgba(124,58,237,0.4),rgba(79,70,229,0.4))', border:'1px solid rgba(124,58,237,0.3)', color:'#e9d5ff', fontSize:14, fontWeight:500, textAlign:'center', textDecoration:'none', display:'block' }}>
                        Sign In
                      </NavLink>
                    )}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ paddingTop: headerHeight, position:'relative', zIndex:1 }}>
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer style={{ borderTop:'1px solid rgba(255,255,255,0.07)', background:'rgba(5,4,15,0.95)', backdropFilter:'blur(20px)', position:'relative', zIndex:1 }}>
        {/* Top gradient line */}
        <div style={{ height:1, background:'linear-gradient(90deg,transparent,rgba(124,58,237,0.5),rgba(96,165,250,0.4),rgba(52,211,153,0.3),transparent)' }} />
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'56px 24px 32px' }}>

          {/* Top grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:40, marginBottom:52 }}>

            {/* Brand column */}
            <div style={{ gridColumn:'span 1' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                <div style={{ width:36, height:36, borderRadius:10, overflow:'hidden', boxShadow:'0 0 20px rgba(124,58,237,0.4)' }}>
                  <img src="/logo.png" alt="FinBack AI" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                </div>
                <span style={{ fontSize:18, fontWeight:800, background:'linear-gradient(135deg,#a78bfa,#60a5fa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>FinBack AI</span>
              </div>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.35)', lineHeight:1.75, marginBottom:20, maxWidth:220 }}>
                The AI-powered lost &amp; found platform built for modern campuses. Powered by GPT-4o.
              </p>
              {/* Social links */}
              <div style={{ display:'flex', gap:8 }}>
                {[
                  { icon:Github,   href:'https://github.com/fayiz81/finback-ai', label:'GitHub' },
                  { icon:Twitter,  href:'#', label:'Twitter' },
                  { icon:Linkedin, href:'#', label:'LinkedIn' },
                ].map(({ icon:Icon, href, label }) => (
                  <motion.a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    whileHover={{ scale:1.1, y:-2 }} whileTap={{ scale:0.95 }}
                    style={{ width:34, height:34, borderRadius:9, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.45)', textDecoration:'none', transition:'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color='#a78bfa')}
                    onMouseLeave={e => (e.currentTarget.style.color='rgba(255,255,255,0.45)')}>
                    <Icon style={{ width:15, height:15 }} />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Nav columns */}
            {[
              { title:'Product', links:[{label:'Browse Items',to:ROUTE_PATHS.BROWSE},{label:'Submit Item',to:ROUTE_PATHS.SUBMIT},{label:'AI Matches',to:ROUTE_PATHS.MATCHES},{label:'Dashboard',to:ROUTE_PATHS.DASHBOARD}] },
              { title:'Company', links:[{label:'About',to:'#'},{label:'Blog',to:'#'},{label:'Careers',to:'#'},{label:'Press Kit',to:'#'}] },
              { title:'Legal', links:[{label:'Privacy Policy',to:'#'},{label:'Terms of Service',to:'#'},{label:'Cookie Policy',to:'#'},{label:'GDPR',to:'#'}] },
            ].map((col) => (
              <div key={col.title}>
                <h3 style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:18 }}>{col.title}</h3>
                <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:11 }}>
                  {col.links.map(l => (
                    <li key={l.label}>
                      <NavLink to={l.to} style={{ fontSize:13, color:'rgba(255,255,255,0.35)', textDecoration:'none', transition:'color 0.15s', display:'flex', alignItems:'center', gap:5 }}
                        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color='rgba(167,139,250,0.8)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color='rgba(255,255,255,0.35)'; }}>
                        {l.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div style={{ paddingTop:24, borderTop:'1px solid rgba(255,255,255,0.06)', display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:12 }}>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.2)' }}>
              © 2026 FinBack AI. All rights reserved. Built with ⚡ for campus communities.
            </p>
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <span style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 12px', borderRadius:20, background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.15)', fontSize:11, color:'#34d399', fontWeight:500 }}>
                <motion.span animate={{ opacity:[1,0.3,1] }} transition={{ duration:1.5, repeat:Infinity }}
                  style={{ width:5, height:5, borderRadius:'50%', background:'#34d399', display:'inline-block' }} />
                All systems operational
              </span>
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.2)' }}>v2.0.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
