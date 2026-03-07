import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginForm, RegisterForm } from '@/components/Forms';
import { IMAGES } from '@/assets/images';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Shield, Zap, GraduationCap } from 'lucide-react';

export default function Auth() {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background">
      {/* Background image */}
      <div className="absolute inset-0 z-0 opacity-20">
        <img
          src={IMAGES.AI_TECH_3}
          alt="AI Technology Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/80" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-6xl mx-auto"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left panel */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8"
            >
              <div className="space-y-5">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
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
                  The smartest lost and found platform for college campuses. Powered by advanced AI image matching and intelligent algorithms.
                </p>
              </div>

              <div className="space-y-5">
                {[
                  {
                    icon: <Zap className="w-5 h-5 text-primary" />,
                    bg: "bg-primary/10",
                    title: "Instant AI Matching",
                    desc: "Our ResNet50-powered engine analyzes images and finds matches with 80%+ confidence scores in seconds.",
                    delay: 0.3,
                  },
                  {
                    icon: <Shield className="w-5 h-5 text-primary" />,
                    bg: "bg-primary/10",
                    title: "Secure & Private",
                    desc: "Your data is protected with JWT authentication and role-based access control.",
                    delay: 0.4,
                  },
                  {
                    icon: <GraduationCap className="w-5 h-5 text-primary" />,
                    bg: "bg-primary/10",
                    title: "Campus-Ready",
                    desc: "Built for college environments with dedicated admin and student roles.",
                    delay: 0.5,
                  },
                ].map((item) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: item.delay, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-start gap-4"
                  >
                    <div className={`w-10 h-10 rounded-xl ${item.bg} border border-primary/15 flex items-center justify-center flex-shrink-0`}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-base mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right panel — Card */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <Card className="border-border/40 shadow-2xl shadow-black/30 bg-card/80 backdrop-blur-xl ring-1 ring-primary/10">
                <CardHeader className="space-y-1 pb-4">
                  <CardTitle className="text-2xl font-bold">Get Started</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    Sign in to your account or create a new one to start finding your lost items.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50">
                      <TabsTrigger
                        value="login"
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200"
                      >
                        Login
                      </TabsTrigger>
                      <TabsTrigger
                        value="register"
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200"
                      >
                        Register
                      </TabsTrigger>
                    </TabsList>

                    <AnimatePresence mode="wait">
                      {activeTab === 'login' ? (
                        <motion.div
                          key="login"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                        >
                          <TabsContent value="login" className="space-y-4 mt-0" forceMount>
                            <LoginForm />
                          </TabsContent>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="register"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                        >
                          <TabsContent value="register" className="space-y-4 mt-0" forceMount>
                            <RegisterForm />
                          </TabsContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Tabs>
                </CardContent>
              </Card>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-5 text-center"
              >
                <p className="text-xs text-muted-foreground">
                  By continuing, you agree to our{' '}
                  <span className="underline underline-offset-2 cursor-pointer hover:text-foreground transition-colors">Terms of Service</span>
                  {' '}and{' '}
                  <span className="underline underline-offset-2 cursor-pointer hover:text-foreground transition-colors">Privacy Policy</span>
                </p>
              </motion.div>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
