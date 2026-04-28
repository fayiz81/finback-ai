import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, XCircle, ArrowRight, Mail, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Status = 'loading' | 'success' | 'error';

// Small floating orb
function Orb({ x, y, size, color, delay }: { x: number; y: number; size: number; color: string; delay: number }) {
  return (
    <motion.div
      animate={{ y: [0, -24, 0], opacity: [0.4, 0.7, 0.4], scale: [1, 1.1, 1] }}
      transition={{ duration: 5 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
      style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: size, height: size, borderRadius: '50%', background: color, filter: 'blur(1px)', pointerEvents: 'none' }}
    />
  );
}

const ORBS = [
  { x: 15, y: 20, size: 6, color: 'rgba(167,139,250,0.6)', delay: 0 },
  { x: 80, y: 15, size: 4, color: 'rgba(96,165,250,0.5)', delay: 1.2 },
  { x: 70, y: 75, size: 7, color: 'rgba(52,211,153,0.5)', delay: 0.6 },
  { x: 25, y: 80, size: 5, color: 'rgba(251,191,36,0.4)', delay: 2 },
  { x: 90, y: 50, size: 4, color: 'rgba(167,139,250,0.5)', delay: 1.5 },
  { x: 10, y: 55, size: 5, color: 'rgba(52,211,153,0.4)', delay: 0.3 },
];

export default function EmailConfirmed() {
  const [status, setStatus] = useState<Status>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const tokenHash = searchParams.get('token_hash');
        const type = searchParams.get('type');

        if (tokenHash && type === 'email') {
          const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'email' });
          if (error) throw error;
          setStatus('success');
          setTimeout(() => navigate('/auth'), 3000);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email_confirmed_at) {
          setStatus('success');
          setTimeout(() => navigate('/auth'), 3000);
          return;
        }

        const hash = window.location.hash;
        if (hash.includes('access_token')) {
          setStatus('success');
          setTimeout(() => navigate('/auth'), 3000);
          return;
        }

        throw new Error('No confirmation token found.');
      } catch (err: any) {
        setStatus('error');
        setErrorMsg(err.message || 'Confirmation failed. The link may have expired.');
      }
    };

    confirmEmail();
  }, [navigate, searchParams]);

  // Progress bar for redirect countdown
  useEffect(() => {
    if (status !== 'success') return;
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min((elapsed / 3000) * 100, 100));
    }, 50);
    return () => clearInterval(timer);
  }, [status]);

  return (
    <div style={{
      minHeight: '100vh', width: '100%', display: 'flex', alignItems: 'center',
      justifyContent: 'center', position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(135deg, #09090f 0%, #0d0a1a 60%, #090912 100%)',
    }}>

      {/* Morphing blobs */}
      <motion.div
        animate={{ scale: [1, 1.2, 0.9, 1.1, 1], x: [0, 40, -20, 30, 0], y: [0, -30, 40, -10, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: '-15%', left: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(109,40,217,0.16) 0%, transparent 65%)', filter: 'blur(40px)', pointerEvents: 'none' }}
      />
      <motion.div
        animate={{ scale: [1, 0.88, 1.15, 0.95, 1], x: [0, -30, 20, -10, 0], y: [0, 30, -20, 15, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(5,150,105,0.12) 0%, transparent 65%)', filter: 'blur(40px)', pointerEvents: 'none' }}
      />

      {/* Grid */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.03 }}>
        <svg width="100%" height="100%">
          <defs><pattern id="g" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#g)" />
        </svg>
      </div>

      {/* Floating orbs */}
      {ORBS.map((o, i) => <Orb key={i} {...o} />)}

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 440, margin: '0 24px' }}>

        {/* Glow behind card */}
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3.5, repeat: Infinity }}
          style={{ position: 'absolute', inset: -24, borderRadius: 36, background: status === 'success' ? 'radial-gradient(ellipse, rgba(52,211,153,0.15) 0%, transparent 70%)' : status === 'error' ? 'radial-gradient(ellipse, rgba(239,68,68,0.12) 0%, transparent 70%)' : 'radial-gradient(ellipse, rgba(124,58,237,0.15) 0%, transparent 70%)', filter: 'blur(20px)', pointerEvents: 'none' }}
        />

        {/* Animated shimmer border */}
        <motion.div
          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute', inset: -1.5, borderRadius: 26, zIndex: 0, pointerEvents: 'none',
            background: status === 'success'
              ? 'linear-gradient(90deg, rgba(52,211,153,0.4), rgba(96,165,250,0.4), rgba(52,211,153,0.4))'
              : 'linear-gradient(90deg, rgba(124,58,237,0.4), rgba(96,165,250,0.4), rgba(124,58,237,0.4))',
            backgroundSize: '200% 100%',
          }}
        />

        <div style={{
          position: 'relative', zIndex: 1,
          background: 'rgba(14,14,24,0.92)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
          borderRadius: 24, overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
        }}>

          {/* Top shimmer sweep */}
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4 }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.7), rgba(96,165,250,0.9), rgba(167,139,250,0.7), transparent)', zIndex: 2 }}
          />

          <div style={{ padding: '36px 36px 32px', textAlign: 'center' }}>

            {/* Logo */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, overflow: 'hidden', boxShadow: '0 0 16px rgba(124,58,237,0.4)' }}>
                <img src="/logo.png" alt="FinBack AI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <span style={{ fontSize: 16, fontWeight: 700, background: 'linear-gradient(135deg,#a78bfa,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>FinBack AI</span>
            </motion.div>

            <AnimatePresence mode="wait">

              {/* ── LOADING ── */}
              {status === 'loading' && (
                <motion.div key="loading" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                  <div style={{ position: 'relative', width: 72, height: 72 }}>
                    <motion.div
                      animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                      style={{ width: 72, height: 72, borderRadius: '50%', border: '2px solid rgba(124,58,237,0.15)', borderTopColor: '#a78bfa', position: 'absolute', inset: 0 }}
                    />
                    <motion.div
                      animate={{ rotate: -360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      style={{ width: 52, height: 52, borderRadius: '50%', border: '2px solid rgba(96,165,250,0.15)', borderBottomColor: '#60a5fa', position: 'absolute', top: 10, left: 10 }}
                    />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Mail style={{ width: 20, height: 20, color: '#a78bfa' }} />
                    </div>
                  </div>
                  <div>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: 16, marginBottom: 6 }}>Confirming your email…</p>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>Verifying your token with our servers</p>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.1, 0.8] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                        style={{ width: 7, height: 7, borderRadius: '50%', background: '#a78bfa' }} />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── SUCCESS ── */}
              {status === 'success' && (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.85, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>

                  {/* Icon with pulse rings */}
                  <div style={{ position: 'relative', width: 80, height: 80 }}>
                    {[1, 2, 3].map(i => (
                      <motion.div key={i}
                        animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.5, ease: 'easeOut' }}
                        style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(52,211,153,0.4)' }}
                      />
                    ))}
                    <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}
                      style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(52,211,153,0.12)', border: '2px solid rgba(52,211,153,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle2 style={{ width: 38, height: 38, color: '#34d399' }} />
                    </motion.div>
                  </div>

                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 8, letterSpacing: '-0.02em' }}>Email Confirmed! 🎉</h1>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.6 }}>
                      Your email has been successfully verified.<br />You can now log in to FinBack AI.
                    </p>
                  </motion.div>

                  {/* Progress countdown */}
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 14, background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)' }}>
                    <p style={{ fontSize: 12, color: '#34d399', marginBottom: 10 }}>Redirecting to login in 3 seconds…</p>
                    <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                      <motion.div style={{ height: '100%', borderRadius: 2, background: 'linear-gradient(90deg,#34d399,#60a5fa)', width: `${progress}%`, transition: 'width 0.05s linear' }} />
                    </div>
                  </motion.div>

                  <motion.button
                    onClick={() => navigate('/auth')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                    style={{ width: '100%', padding: '13px', borderRadius: 14, background: 'linear-gradient(135deg,rgba(52,211,153,0.5),rgba(5,150,105,0.5))', border: '1px solid rgba(52,211,153,0.3)', color: '#6ee7b7', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    Continue to Login <ArrowRight style={{ width: 15, height: 15 }} />
                  </motion.button>
                </motion.div>
              )}

              {/* ── ERROR ── */}
              {status === 'error' && (
                <motion.div key="error" initial={{ opacity: 0, scale: 0.85, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>

                  <div style={{ position: 'relative', width: 80, height: 80 }}>
                    <motion.div animate={{ rotate: [0, 5, -5, 5, 0] }} transition={{ duration: 0.5, delay: 0.3, ease: 'easeInOut' }}
                      style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(239,68,68,0.12)', border: '2px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <XCircle style={{ width: 38, height: 38, color: '#f87171' }} />
                    </motion.div>
                  </div>

                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 8, letterSpacing: '-0.02em' }}>Confirmation Failed</h1>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.6 }}>{errorMsg}</p>
                  </motion.div>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 14, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <p style={{ fontSize: 12, color: '#f87171' }}>Try registering again or contact support if this persists.</p>
                  </motion.div>

                  <motion.button
                    onClick={() => navigate('/auth')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    style={{ width: '100%', padding: '13px', borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    Back to Login
                  </motion.button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
