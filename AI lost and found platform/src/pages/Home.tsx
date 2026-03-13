import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Brain, Zap, Shield, TrendingUp, Users, MapPin, Clock, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ROUTE_PATHS } from '@/lib/index';
import { springPresets, staggerContainer, staggerItem } from '@/lib/motion';

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

// ── Live dashboard mockup ─────────────────────────────────────────────────────
function DashboardMockup() {
  const bars = [65, 82, 54, 90, 73, 94, 78];
  const matches = [
    { title: 'Black Wallet', loc: 'Main Library', pct: 94, high: true },
    { title: 'MacBook Pro 14"', loc: 'Engineering Bldg', pct: 89, high: true },
    { title: 'AirPods Pro', loc: 'Gym Locker', pct: 76, high: false },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-lg mx-auto lg:mx-0"
    >
      {/* Glow */}
      <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-3xl scale-90 -z-10" />

      {/* Main card */}
      <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-amber-500/60" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
          </div>
          <div className="flex-1 flex justify-center">
            <span className="text-xs text-muted-foreground font-mono">finback-ai.vercel.app</span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Top stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Items Today', value: '47', color: 'text-primary' },
              { label: 'Matches', value: '12', color: 'text-emerald-400' },
              { label: 'Accuracy', value: '94%', color: 'text-amber-400' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="bg-muted/40 border border-border/50 rounded-xl p-3 text-center">
                <div className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{s.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Chart */}
          <div className="bg-muted/30 border border-border/40 rounded-xl p-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground">Weekly Matches</span>
              <span className="text-[10px] text-emerald-400 font-mono">↑ 18%</span>
            </div>
            <div className="flex items-end gap-1.5 h-16">
              {bars.map((h, i) => (
                <motion.div key={i} className="flex-1 rounded-t-sm"
                  style={{ background: i === 5 ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.3)' }}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: 0.7 + i * 0.07, duration: 0.5, ease: 'easeOut' }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-1.5">
              {['M','T','W','T','F','S','S'].map((d, i) => (
                <span key={i} className="flex-1 text-center text-[9px] text-muted-foreground">{d}</span>
              ))}
            </div>
          </div>

          {/* AI Matches list */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-primary" /> AI Matches
              </span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />Live
              </span>
            </div>
            {matches.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + i * 0.15 }}
                className="flex items-center gap-2.5 bg-muted/40 border border-border/40 rounded-xl p-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm flex-shrink-0">
                  {i === 0 ? '👜' : i === 1 ? '💻' : '🎧'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{m.title}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <MapPin className="w-2.5 h-2.5" />{m.loc}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-xs font-bold font-mono ${m.high ? 'text-emerald-400' : 'text-amber-400'}`}>{m.pct}%</span>
                  <div className="w-12 h-1 bg-muted rounded-full overflow-hidden mt-1">
                    <motion.div className={`h-full rounded-full ${m.high ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      initial={{ width: 0 }} animate={{ width: `${m.pct}%` }}
                      transition={{ delay: 1.2 + i * 0.15, duration: 0.8 }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating chips */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5 }}
        className="absolute -left-14 top-16 bg-card border border-border/60 rounded-xl px-3 py-2 shadow-xl hidden lg:block">
        <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Match found</p>
        <p className="text-base font-bold">🎯 94%</p>
        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />Wallet · Library
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.8 }}
        className="absolute -left-10 bottom-20 bg-card border border-border/60 rounded-xl px-3 py-2 shadow-xl hidden lg:block">
        <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Resolved today</p>
        <p className="text-base font-bold">47 items</p>
        <p className="text-[10px] text-emerald-400">↑ 12 from yesterday</p>
      </motion.div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const stats = [
    { label: 'Items Recovered', value: '2,847', icon: CheckCircle },
    { label: 'Active Users', value: '12,500+', icon: Users },
    { label: 'Match Accuracy', value: '94%', icon: TrendingUp },
    { label: 'Avg Response Time', value: '< 2hrs', icon: Clock },
  ];

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Matching',
      description: 'Advanced embeddings analyze images with 94% accuracy, matching lost items to found items in seconds.',
      accent: 'from-primary/20 to-primary/5',
      iconBg: 'bg-primary/10 text-primary',
    },
    {
      icon: Zap,
      title: 'Smart Confidence Scoring',
      description: 'Multi-factor algorithm weighs image (40%), text (30%), location (20%), and time (10%) for precise matches.',
      accent: 'from-amber-500/20 to-amber-500/5',
      iconBg: 'bg-amber-500/10 text-amber-400',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'JWT authentication, role-based access, and spam detection keep your data safe while connecting matches.',
      accent: 'from-emerald-500/20 to-emerald-500/5',
      iconBg: 'bg-emerald-500/10 text-emerald-400',
    },
  ];

  const howItWorks = [
    { step: '01', title: 'Report Your Item', description: 'Upload a photo, add details, and pin your location.' },
    { step: '02', title: 'AI Analyzes & Matches', description: 'Neural network scans all items and ranks potential matches.' },
    { step: '03', title: 'Get Notified', description: 'Instant alerts when match confidence exceeds 80%.' },
    { step: '04', title: 'Connect & Recover', description: 'Contact the finder securely and reunite with your item.' },
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
        {/* Ambient blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-20 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[100px] animate-pulse" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-accent/6 blur-[100px] animate-pulse [animation-delay:3s]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left copy */}
            <div>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                AI-Powered Lost & Found — Campus Edition
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight mb-6">
                Never Lose
                <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Anything Again
                </span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-lg font-light">
                FinBack AI uses advanced neural networks to match lost and found items across your campus.
                Smart, fast, and built for college students.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }} className="flex flex-wrap gap-3 mb-12">
                <Button asChild size="lg" className="gap-2 shadow-lg shadow-primary/20 text-base px-6">
                  <Link to={ROUTE_PATHS.AUTH}>Get Started Free <ArrowRight className="w-4 h-4" /></Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base px-6">
                  <Link to={ROUTE_PATHS.BROWSE}>Browse Items</Link>
                </Button>
              </motion.div>

              {/* Mini stats */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
                className="flex items-center gap-6 pt-8 border-t border-border/50">
                {[
                  { num: '94%', label: 'Match accuracy' },
                  { num: '<2hr', label: 'Avg match time' },
                  { num: '2.8K+', label: 'Items reunited' },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-5">
                    {i > 0 && <div className="w-px h-8 bg-border" />}
                    <div>
                      <div className="text-xl font-bold tracking-tight">{s.num}</div>
                      <div className="text-xs text-muted-foreground">{s.label}</div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right — Dashboard mockup */}
            <DashboardMockup />
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <div className="border-y border-border/50 bg-card/30 py-14">
        <div className="container mx-auto px-4">
          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border/30"
            variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div key={i} variants={staggerItem} className="bg-background text-center py-8 px-6">
                  <Icon className="w-6 h-6 text-primary mx-auto mb-3" />
                  <div className="text-3xl font-bold tracking-tight mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section className="py-28">
        <div className="container mx-auto px-4">
          <FadeUp className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-primary uppercase tracking-widest mb-5">
              <span className="w-5 h-px bg-primary" /> Core Features
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Powered by AI,{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                built for students
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto font-light">
              Advanced technology meets intuitive design to reunite you with your belongings.
            </p>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <FadeUp key={i} delay={i * 0.1}>
                  <Card className={`p-7 h-full border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${f.accent}`}>
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${f.iconBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 tracking-tight">{f.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm font-light">{f.description}</p>
                  </Card>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-28 border-t border-border/50 bg-muted/20">
        <div className="container mx-auto px-4">
          <FadeUp className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-primary uppercase tracking-widest mb-5">
              <span className="w-5 h-px bg-primary" /> How it works
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              From lost to found{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                in four steps
              </span>
            </h2>
          </FadeUp>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item, i) => (
              <FadeUp key={i} delay={i * 0.1} className="relative">
                <Card className="p-6 h-full hover:shadow-lg hover:border-primary/30 transition-all duration-300 border-border/50">
                  <div className="text-5xl font-bold text-primary/10 mb-4 font-mono">{item.step}</div>
                  <h3 className="text-lg font-bold mb-2 tracking-tight">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed font-light">{item.description}</p>
                </Card>
                {i < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-gradient-to-r from-primary/50 to-transparent z-10" />
                )}
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28">
        <div className="container mx-auto px-4">
          <FadeUp>
            <Card className="relative overflow-hidden border-primary/20">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-accent/4 to-transparent" />
              <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
              <div className="relative z-10 p-12 md:p-16 text-center">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">
                  Ready to find your{' '}
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    lost items?
                  </span>
                </h2>
                <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto font-light">
                  Join thousands of students already using FinBack AI to recover their belongings.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="text-base px-8 shadow-lg shadow-primary/20 gap-2">
                    <Link to={ROUTE_PATHS.AUTH}>Create Free Account <ArrowRight className="w-4 h-4" /></Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="text-base px-8">
                    <Link to={ROUTE_PATHS.SUBMIT}>Report an Item</Link>
                  </Button>
                </div>
                <p className="mt-6 text-xs text-muted-foreground">No credit card required · Free campus plan · Cancel anytime</p>
              </div>
            </Card>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
