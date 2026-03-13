import { useState, useTransition, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginForm, RegisterForm } from '@/components/Forms';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Shield, Zap, GraduationCap } from 'lucide-react';

// Lazy-loaded tab content — avoids mounting both forms at once
const FEATURES = [
  {
    icon: Zap,
    title: 'Instant AI Matching',
    desc: 'ResNet50-powered engine finds matches with 80%+ confidence in seconds.',
    delay: 0.3,
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    desc: 'JWT authentication and role-based access keeps your data safe.',
    delay: 0.4,
  },
  {
    icon: GraduationCap,
    title: 'Campus-Ready',
    desc: 'Built for college environments with dedicated admin and student roles.',
    delay: 0.5,
  },
];

export default function Auth() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  // useTransition prevents the tab switch from blocking the main thread
  const [, startTransition] = useTransition();

  const handleTabChange = useCallback((val: string) => {
    startTransition(() => setActiveTab(val as 'login' | 'register'));
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background">
      {/* Ambient blobs — CSS only, zero JS cost */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-primary/6 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-6xl mx-auto"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* ── Left copy panel ─────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8"
            >
              <div className="space-y-5">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, delay: 0.15 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
                >
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">AI-Powered Matching</span>
                </motion.div>

                <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                  Welcome to
                  <span className="block text-primary mt-2">FinBack AI</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                  The smartest lost and found platform for college campuses.
                  Powered by advanced AI matching and intelligent algorithms.
                </p>
              </div>

              <div className="space-y-5">
                {FEATURES.map(({ icon: Icon, title, desc, delay }) => (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base mb-1">{title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* ── Right auth card ─────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <Card className="border-border/40 shadow-2xl shadow-black/30 bg-card/80 backdrop-blur-xl ring-1 ring-primary/10">
                <CardHeader className="space-y-1 pb-4">
                  <CardTitle className="text-2xl font-bold">Get Started</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    Sign in to your account or create a new one to start finding your lost items.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50">
                      <TabsTrigger
                        value="login"
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
                      >
                        Login
                      </TabsTrigger>
                      <TabsTrigger
                        value="register"
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
                      >
                        Register
                      </TabsTrigger>
                    </TabsList>

                    {/*
                      Render only the active form — avoids double-mounting
                      both LoginForm and RegisterForm simultaneously.
                      AnimatePresence handles the crossfade.
                    */}
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                      >
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
                </CardContent>
              </Card>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.55 }}
                className="mt-5 text-center text-xs text-muted-foreground"
              >
                By continuing, you agree to our{' '}
                <span className="underline underline-offset-2 cursor-pointer hover:text-foreground transition-colors">Terms of Service</span>
                {' '}and{' '}
                <span className="underline underline-offset-2 cursor-pointer hover:text-foreground transition-colors">Privacy Policy</span>
              </motion.p>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
