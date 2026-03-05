import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Zap, Shield, TrendingUp, Users, MapPin, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ROUTE_PATHS } from '@/lib/index';
import { IMAGES } from '@/assets/images';
import { springPresets, fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';

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
      description: 'Advanced ResNet50 embeddings analyze images with 94% accuracy, matching lost items to found items in seconds.',
      image: IMAGES.AI_TECH_2,
    },
    {
      icon: Zap,
      title: 'Smart Confidence Scoring',
      description: 'Multi-factor algorithm weighs image similarity (40%), text (30%), location (20%), and time (10%) for precise matches.',
      image: IMAGES.CAMPUS_4,
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'JWT authentication, role-based access, and spam detection keep your data safe while connecting you with matches.',
      image: IMAGES.HERO_BG_5,
    },
  ];

  const howItWorks = [
    { step: '01', title: 'Report Your Item', description: 'Upload a photo, add details, and mark the location where you lost or found it.' },
    { step: '02', title: 'AI Analyzes & Matches', description: 'Our neural network scans thousands of items to find potential matches in real-time.' },
    { step: '03', title: 'Get Notified', description: 'Receive instant email alerts when match confidence exceeds 80%.' },
    { step: '04', title: 'Connect & Recover', description: 'Contact the finder/owner securely through our platform and reunite with your item.' },
  ];

  return (
    <div className="min-h-screen">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="hero-background">
          <img
            src={IMAGES.HERO_BG_5}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="hero-overlay" />
        
        <div className="relative z-10 container mx-auto px-4 py-24">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springPresets.gentle}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...springPresets.snappy, delay: 0.1 }}
            >
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Lost & Found</span>
            </motion.div>

            <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-6">
              Never Lose
              <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Anything Again
              </span>
            </h1>

            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              FinBack AI uses advanced neural networks to match lost and found items across your campus. 
              Smart, fast, and built for college students.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link to={ROUTE_PATHS.AUTH}>Get Started Free</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                <Link to={ROUTE_PATHS.BROWSE}>Browse Items</Link>
              </Button>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full" />
          </div>
        </motion.div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  variants={staggerItem}
                  className="text-center"
                >
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <Icon className="w-8 h-8 text-primary mx-auto mb-4" />
                    <div className="text-4xl font-bold mb-2">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={springPresets.gentle}
          >
            <h2 className="text-5xl font-bold mb-4">Powered by AI, Built for Students</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Advanced technology meets intuitive design to reunite you with your belongings
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div key={index} variants={staggerItem}>
                  <Card className="overflow-hidden h-full hover:shadow-xl transition-all duration-300 group">
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={feature.image}
                        alt={feature.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={springPresets.gentle}
          >
            <h2 className="text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Four simple steps to recover your lost items
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {howItWorks.map((item, index) => (
              <motion.div
                key={index}
                variants={staggerItem}
                className="relative"
              >
                <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                  <div className="text-6xl font-bold text-primary/10 mb-4">{item.step}</div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </Card>
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary to-transparent" />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent" />
            <div className="relative z-10 p-12 md:p-16 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={springPresets.gentle}
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Ready to Find Your Lost Items?
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join thousands of students already using FinBack AI to recover their belongings
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="text-lg px-8 py-6">
                    <Link to={ROUTE_PATHS.AUTH}>Create Free Account</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                    <Link to={ROUTE_PATHS.SUBMIT}>Report an Item</Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
