import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Home, Search, Upload, Zap, Shield, User, LogOut, Moon, Sun } from 'lucide-react';
import { ROUTE_PATHS } from '@/lib/index';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const { user, isAuthenticated, signOut, isAdmin } = useAuth();

  // Get display name from Supabase user metadata
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || '';
  const avatarInitial = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        setHeaderHeight(height);
        document.documentElement.style.setProperty('--header-height', `${height}px`);
      }
    };
    updateHeight();
    const resizeObserver = new ResizeObserver(updateHeight);
    if (headerRef.current) resizeObserver.observe(headerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navigationItems = [
    { to: ROUTE_PATHS.HOME, label: 'Home', icon: Home },
    { to: ROUTE_PATHS.BROWSE, label: 'Browse', icon: Search },
    { to: ROUTE_PATHS.SUBMIT, label: 'Submit Item', icon: Upload },
    ...(isAuthenticated ? [{ to: ROUTE_PATHS.DASHBOARD, label: 'Dashboard', icon: Zap }] : []),
    ...(isAuthenticated ? [{ to: ROUTE_PATHS.MATCHES, label: 'Matches', icon: Zap }] : []),
    ...(isAdmin() ? [{ to: ROUTE_PATHS.ADMIN, label: 'Admin', icon: Shield }] : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <NavLink to={ROUTE_PATHS.HOME} className="flex items-center gap-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
                    <Zap className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    FinBack AI
                  </span>
                </motion.div>
              </NavLink>

              <nav className="hidden md:flex items-center gap-1">
                {navigationItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon className="h-4 w-4" />
                        {item.label}
                        {isActive && (
                          <motion.div
                            layoutId="activeNav"
                            className="absolute inset-0 rounded-lg bg-primary/10"
                            style={{ zIndex: -1 }}
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setIsDarkMode(!isDarkMode)} className="rounded-lg">
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {avatarInitial}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{displayName}</p>
                        <p className="text-xs text-muted-foreground">{displayEmail}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <NavLink to={ROUTE_PATHS.DASHBOARD} className="flex items-center gap-2 cursor-pointer">
                        <User className="h-4 w-4" />
                        Dashboard
                      </NavLink>
                    </DropdownMenuItem>
                    {isAdmin() && (
                      <DropdownMenuItem asChild>
                        <NavLink to={ROUTE_PATHS.ADMIN} className="flex items-center gap-2 cursor-pointer">
                          <Shield className="h-4 w-4" />
                          Admin Panel
                        </NavLink>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut()}
                      className="flex items-center gap-2 cursor-pointer text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild className="hidden md:flex">
                  <NavLink to={ROUTE_PATHS.AUTH}>Sign In</NavLink>
                </Button>
              )}

              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon" className="rounded-lg">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <nav className="flex flex-col gap-4 mt-8">
                    {navigationItems.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                            isActive
                              ? 'bg-primary text-primary-foreground shadow-md'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          }`
                        }
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </NavLink>
                    ))}
                    {!isAuthenticated && (
                      <Button asChild className="mt-4">
                        <NavLink to={ROUTE_PATHS.AUTH}>Sign In</NavLink>
                      </Button>
                    )}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main style={{ paddingTop: `${headerHeight}px` }} className="min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-border/50 bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                  <Zap className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold">FinBack AI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered smart lost and found platform for colleges. Never lose track of your belongings again.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><NavLink to={ROUTE_PATHS.BROWSE} className="hover:text-foreground transition-colors">Browse Items</NavLink></li>
                <li><NavLink to={ROUTE_PATHS.SUBMIT} className="hover:text-foreground transition-colors">Submit Item</NavLink></li>
                <li><NavLink to={ROUTE_PATHS.MATCHES} className="hover:text-foreground transition-colors">View Matches</NavLink></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Report Issue</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            <p>© 2026 FinBack AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
