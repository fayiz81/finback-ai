import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Status = 'loading' | 'success' | 'error';

export default function EmailConfirmed() {
  const [status, setStatus] = useState<Status>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Supabase sends token_hash + type in the URL after email confirmation
        const tokenHash = searchParams.get('token_hash');
        const type = searchParams.get('type');

        if (tokenHash && type === 'email') {
          const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'email' });
          if (error) throw error;
          setStatus('success');
          // Auto-redirect to login after 3 seconds
          setTimeout(() => navigate('/auth'), 3000);
          return;
        }

        // Fallback: check if user is already confirmed via session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email_confirmed_at) {
          setStatus('success');
          setTimeout(() => navigate('/auth'), 3000);
          return;
        }

        // Check hash fragment (older Supabase flow)
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

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-primary/6 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm p-10 text-center space-y-6">

          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <span className="text-primary text-lg">⚡</span>
            </div>
            <span className="font-bold text-lg tracking-tight">FinBack AI</span>
          </div>

          {/* Status icon */}
          {status === 'loading' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <p className="text-muted-foreground text-sm">Confirming your email...</p>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="flex flex-col items-center gap-4"
            >
              {/* Animated checkmark ring */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-emerald-400/40"
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
                />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-white">Email Confirmed!</h1>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Your email has been successfully verified.<br />
                  You can now log in to FinBack AI.
                </p>
              </div>

              <div className="w-full rounded-xl bg-emerald-500/8 border border-emerald-500/15 px-4 py-3">
                <p className="text-xs text-emerald-400">
                  Redirecting you to login in 3 seconds...
                </p>
              </div>

              <button
                onClick={() => navigate('/auth')}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Continue to Login →
              </button>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-400" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-white">Confirmation Failed</h1>
                <p className="text-muted-foreground text-sm leading-relaxed">{errorMsg}</p>
              </div>

              <div className="w-full rounded-xl bg-red-500/8 border border-red-500/15 px-4 py-3">
                <p className="text-xs text-red-400">
                  Try registering again or contact support if this persists.
                </p>
              </div>

              <button
                onClick={() => navigate('/auth')}
                className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors"
              >
                Back to Login
              </button>
            </motion.div>
          )}

        </div>
      </motion.div>
    </div>
  );
}
