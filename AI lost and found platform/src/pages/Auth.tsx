import { useState, useTransition, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { LoginForm, RegisterForm } from '@/components/Forms';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Shield, Zap, GraduationCap, Brain, Lock, ArrowRight } from 'lucide-react';

// ── Floating particle ──────────────────────────────────────────────────────────
function Particle({ x, y, size, duration, delay, color }: {
  x: number; y: number; size: number; duration: number; delay: number; color: string;
}) {
  return (
    <motion.div
      style={{
        position: 'absolute', left: `${x}%`, top: `${y}%`,
        width: size, height: size, borderRadius: '50%',
        background: color, filter: 'blur(1px)',
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 0.6, 0.3, 0.7, 0],
        scale: [0, 1, 0.8, 1.2, 0],
        y: [0, -30, -60, -40, -80],
        x: [0, 10, -5, 15, 0],
      }}
      transition={{ duration, delay, repeat: Infinity, repeatDelay: Math.random() * 3, ease: 'easeInOut' }}
    />
  );
}

// ── Magnetic card tilt ─────────────────────────────────────────────────────────
function MagneticCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-100, 100], [4, -4]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-4, 4]), { stiffness: 300, damping: 30 });

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };
  const handleLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div ref={ref} onMouseMove={handleMouse} onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformPerspective: 1000, transformStyle: 'preserve-3d' }}>
      {children}
    </motion.div>
  );
}

// ── Animated typing text ───────────────────────────────────────────────────────
const WORDS = ['lost items.', 'wallets.', 'laptops.', 'AirPods.', 'belongings.'];
function TypingWord() {
  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = WORDS[idx];
    let timeout: ReturnType<typeof setTimeout>;
    if (!deleting && displayed.length < word.length) {
      timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 80);
    } else if (!deleting && displayed.length === word.length) {
      timeout = setTimeout(() => setDeleting(true), 1800);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 45);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setIdx((i) => (i + 1) % WORDS.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, deleting, idx]);

  return (
    <span style={{ background: 'linear-gradient(135deg, #a78bfa, #60a5fa, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
      {displayed}
      <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}
        style={{ WebkitTextFillColor: '#a78bfa', marginLeft: 1 }}>|</motion.span>
    </span>
  );
}

// ── Animated stat counter ──────────────────────────────────────────────────────
function AnimatedStat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05, y: -2 }}
      style={{
        padding: '12px 20px', borderRadius: 14,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        textAlign: 'center', cursor: 'default',
      }}>
      <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: 'monospace', letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</div>
    </motion.div>
  );
}

const FEATURES = [
  { icon: Brain, title: 'ChatGPT Matching', desc: 'GPT-4o semantically understands item descriptions for precise matches.', color: '#a78bfa', bg: 'rgba(124,58,237,0.12)', delay: 0.4 },
  { icon: Shield, title: 'Secure & Private', desc: 'JWT auth and role-based access keeps your data protected.', color: '#34d399', bg: 'rgba(52,211,153,0.1)', delay: 0.5 },
  { icon: GraduationCap, title: 'Campus-Ready', desc: 'Built for colleges with dedicated admin and student workflows.', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', delay: 0.6 },
];

// ── Particles config ───────────────────────────────────────────────────────────
const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 2,
  duration: Math.random() * 6 + 5,
  delay: Math.random() * 4,
  color: ['rgba(167,139,250,0.5)', 'rgba(96,165,250,0.5)', 'rgba(52,211,153,0.4)', 'rgba(251,191,36,0.35)'][Math.floor(Math.random() * 4)],
}));

// ── Grid lines background ──────────────────────────────────────────────────────
function GridLines() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <svg width="100%" height="100%" style={{ opacity: 0.04 }}>
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}

export default function Auth() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [, startTransition] = useTransition();

  const handleTabChange = useCallback((val: string) => {
    startTransition(() => setActiveTab(val as 'login' | 'register'));
  }, []);

  return (
    <div style={{
      minHeight: '100vh', width: '100%', display: 'flex', alignItems: 'center',
      justifyContent: 'center', position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(135deg, #09090f 0%, #0d0a1a 50%, #090912 100%)',
    }}>

      {/* ── Grid background ── */}
      <GridLines />

      {/* ── Animated blobs ── */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <motion.div
          animate={{ scale: [1, 1.2, 0.95, 1.1, 1], x: [0, 40, -20, 30, 0], y: [0, -30, 40, -10, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: '-15%', left: '-5%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(109,40,217,0.18) 0%, transparent 65%)', filter: 'blur(40px)' }}
        />
        <motion.div
          animate={{ scale: [1, 0.9, 1.15, 0.95, 1], x: [0, -50, 30, -20, 0], y: [0, 40, -30, 20, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(5,150,105,0.14) 0%, transparent 65%)', filter: 'blur(40px)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.3, 0.85, 1.1, 1], x: [0, 30, -40, 10, 0], y: [0, -20, 50, -30, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
          style={{ position: 'absolute', top: '30%', left: '40%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 65%)', filter: 'blur(50px)' }}
        />
      </div>

      {/* ── Floating particles ── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {PARTICLES.map(p => <Particle key={p.id} {...p} />)}
      </div>

      {/* ── Shimmer scan line ── */}
      <motion.div
        animate={{ y: ['-100vh', '100vh'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear', repeatDelay: 4 }}
        style={{
          position: 'absolute', left: 0, right: 0, height: 2, zIndex: 1, pointerEvents: 'none',
          background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.15), rgba(96,165,250,0.2), rgba(167,139,250,0.15), transparent)',
          filter: 'blur(2px)',
        }}
      />

      {/* ── Main content ── */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 440px), 1fr))', gap: 56, alignItems: 'center' }}>

          {/* ── Left panel ── */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 16px', borderRadius: 20, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', width: 'fit-content' }}>
              <motion.div animate={{ rotate: [0, 15, -10, 15, 0] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}>
                <Sparkles style={{ width: 14, height: 14, color: '#a78bfa' }} />
              </motion.div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#a78bfa', letterSpacing: '0.02em' }}>AI-Powered Lost &amp; Found</span>
            </motion.div>

            {/* Headline */}
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.025em', color: '#fff', marginBottom: 4 }}>
                Recover your
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.025em', minHeight: 68 }}>
                <TypingWord />
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38, duration: 0.6 }}
                style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginTop: 16, maxWidth: 420 }}>
                FinBack AI uses <strong style={{ color: 'rgba(255,255,255,0.75)' }}>ChatGPT (GPT-4o)</strong> to semantically match
                lost and found items across your campus in seconds.
              </motion.p>
            </div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { value: '94%', label: 'Accuracy', color: '#a78bfa' },
                { value: 'GPT-4o', label: 'AI Engine', color: '#34d399' },
                { value: '< 2s', label: 'Match Time', color: '#60a5fa' },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.08 }}>
                  <AnimatedStat {...s} />
                </motion.div>
              ))}
            </motion.div>

            {/* Features */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {FEATURES.map(({ icon: Icon, title, desc, color, bg, delay }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ x: 4, transition: { duration: 0.2 } }}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'default' }}>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    style={{ width: 40, height: 40, borderRadius: 12, background: bg, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
                    {/* Pulse ring */}
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.6 }}
                      style={{ position: 'absolute', inset: -4, borderRadius: 16, border: `1px solid ${color}`, pointerEvents: 'none' }}
                    />
                    <Icon style={{ width: 18, height: 18, color }} />
                  </motion.div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 3 }}>{title}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── Right card ── */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}>
            <MagneticCard>
              {/* Glow behind card */}
              <motion.div
                animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{ position: 'absolute', inset: -20, borderRadius: 32, background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.2) 0%, transparent 70%)', filter: 'blur(20px)', zIndex: 0, pointerEvents: 'none' }}
              />

              {/* Animated shimmer border */}
              <motion.div
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                style={{
                  position: 'absolute', inset: -1.5, borderRadius: 26, zIndex: 0, pointerEvents: 'none',
                  background: 'linear-gradient(90deg, rgba(124,58,237,0.5), rgba(96,165,250,0.5), rgba(52,211,153,0.4), rgba(124,58,237,0.5))',
                  backgroundSize: '200% 100%',
                  WebkitMaskImage: 'radial-gradient(white, white)',
                  maskImage: 'radial-gradient(white, white)',
                }}
              />

              <div style={{
                position: 'relative', zIndex: 1,
                background: 'rgba(14,14,24,0.9)',
                backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
                borderRadius: 24, overflow: 'hidden',
                boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
              }}>
                {/* Top shimmer bar */}
                <motion.div
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 5, ease: 'easeInOut' }}
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.6), rgba(96,165,250,0.8), rgba(167,139,250,0.6), transparent)', zIndex: 2 }}
                />

                <div style={{ padding: '32px 32px 28px' }}>
                  {/* Card header */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    style={{ marginBottom: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(79,70,229,0.3))', border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Lock style={{ width: 16, height: 16, color: '#a78bfa' }} />
                      </motion.div>
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>Welcome back</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>Sign in to your FinBack AI account</div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Tabs */}
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">

                      {/* Custom tab switcher */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 24, padding: 5, background: 'rgba(255,255,255,0.04)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)' }}>
                        {(['login', 'register'] as const).map((tab) => (
                          <motion.button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            whileTap={{ scale: 0.97 }}
                            style={{
                              padding: '9px 0', borderRadius: 10, fontSize: 13, fontWeight: 600,
                              cursor: 'pointer', border: 'none', outline: 'none', transition: 'all 0.2s',
                              background: activeTab === tab
                                ? 'linear-gradient(135deg, rgba(124,58,237,0.7), rgba(79,70,229,0.7))'
                                : 'transparent',
                              color: activeTab === tab ? '#e9d5ff' : 'rgba(255,255,255,0.4)',
                              boxShadow: activeTab === tab ? '0 4px 16px rgba(124,58,237,0.3)' : 'none',
                              textTransform: 'capitalize',
                            }}>
                            {tab === 'login' ? '🔑 Login' : '✨ Register'}
                          </motion.button>
                        ))}
                      </div>

                      <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                          key={activeTab}
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.98 }}
                          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
                          {activeTab === 'login' ? (
                            <TabsContent value="login" className="space-y-4 mt-0" forceMount>
                              <LoginForm />
                            </TabsContent>
                          ) : (
                            <TabsContent value="register" className="space-y-4 mt-0" forceMount>
                              <RegisterForm />
                            </TabsContent>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </Tabs>
                  </motion.div>
                </div>

                {/* Card footer */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  style={{ padding: '14px 32px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.15)' }}>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', textAlign: 'center', lineHeight: 1.6 }}>
                    By continuing, you agree to our{' '}
                    <span style={{ color: 'rgba(167,139,250,0.7)', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}>Terms of Service</span>
                    {' '}and{' '}
                    <span style={{ color: 'rgba(167,139,250,0.7)', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}>Privacy Policy</span>
                  </p>
                </motion.div>
              </div>
            </MagneticCard>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
