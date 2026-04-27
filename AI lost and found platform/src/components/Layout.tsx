import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Home, Search, Upload, Zap, Shield, User, LogOut, Moon, Sun } from 'lucide-react';
import { ROUTE_PATHS } from '@/lib/index';
import { useAuth } from '@/hooks/useAuth';
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
    ...(isAuthenticated ? [{ to: ROUTE_PATHS.MATCHES, label: 'Matches', icon: Zap }] : []),
    ...(isAdmin() ? [{ to: ROUTE_PATHS.ADMIN, label: 'Admin', icon: Shield }] : []),
  ];

  return (
    <div className={isDarkMode ? 'finback-dark' : 'finback-light'} style={{ minHeight:'100vh' }}>
      {/* Global ambient blobs — dark mode only */}
      {isDarkMode && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle, rgba(109,40,217,0.2) 0%, transparent 70%)', top:-200, left:-100 }} />
          <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(5,150,105,0.15) 0%, transparent 70%)', bottom:-100, right:-100 }} />
          <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)', top:'50%', left:'50%', transform:'translate(-50%,-50%)' }} />
        </div>
      )}

      {/* Header */}
      <header ref={headerRef} style={{
        position:'fixed', top:0, left:0, right:0, zIndex:50,
        background: scrolled
          ? (isDarkMode ? 'rgba(15,12,41,0.88)' : 'rgba(255,255,255,0.88)')
          : (isDarkMode ? 'rgba(15,12,41,0.5)' : 'rgba(255,255,255,0.5)'),
        backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
        borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
        transition:'background 0.3s',
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
                      background: isActive ? 'rgba(124,58,237,0.25)' : 'transparent',
                      color: isActive ? '#a78bfa' : 'rgba(255,255,255,0.55)',
                      border: isActive ? '1px solid rgba(124,58,237,0.3)' : '1px solid transparent',
                    })}>
                    <item.icon className="h-4 w-4" />
                    {item.label}
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
                  style={{ padding:'8px 18px', borderRadius:10, background:'linear-gradient(135deg,rgba(124,58,237,0.5),rgba(79,70,229,0.5))', border:'1px solid rgba(124,58,237,0.4)', color:'#e9d5ff', fontSize:13, fontWeight:500, textDecoration:'none', display:'none' }}
                  className="md:flex items-center">
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
      <footer style={{
        borderTop: isDarkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
        background: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.6)',
        backdropFilter:'blur(20px)', position:'relative', zIndex:1
      }}>
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div style={{ width:32, height:32, borderRadius:8, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 12px rgba(124,58,237,0.3)' }}>
                  <img src="/logo.png" alt="FinBack AI" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                </div>
                <span style={{ fontSize:16, fontWeight:700, color:'#fff' }}>FinBack AI</span>
              </div>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', lineHeight:1.6 }}>
                AI-powered smart lost and found platform for colleges. Never lose track of your belongings again.
              </p>
            </div>
            {[
              { title:'Platform', links:[{label:'Browse Items',to:ROUTE_PATHS.BROWSE},{label:'Submit Item',to:ROUTE_PATHS.SUBMIT},{label:'View Matches',to:ROUTE_PATHS.MATCHES}] },
              { title:'Company', links:[{label:'About Us',to:'#'},{label:'Contact',to:'#'},{label:'Privacy Policy',to:'#'}] },
              { title:'Support', links:[{label:'Help Center',to:'#'},{label:'Terms of Service',to:'#'},{label:'Report Issue',to:'#'}] },
            ].map((col) => (
              <div key={col.title}>
                <h3 style={{ fontWeight:600, color:'rgba(255,255,255,0.7)', marginBottom:16, fontSize:14 }}>{col.title}</h3>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <NavLink to={l.to} style={{ fontSize:13, color:'rgba(255,255,255,0.35)', textDecoration:'none' }}
                        onMouseEnter={e => (e.currentTarget.style.color='rgba(255,255,255,0.7)') }
                        onMouseLeave={e => (e.currentTarget.style.color='rgba(255,255,255,0.35)')}>
                        {l.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ marginTop:48, paddingTop:24, borderTop:'1px solid rgba(255,255,255,0.06)', textAlign:'center', fontSize:12, color:'rgba(255,255,255,0.25)' }}>
            © 2026 FinBack AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
