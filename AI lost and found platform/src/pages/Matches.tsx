import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useItems } from '@/hooks/useItems';
import { MatchResult } from '@/lib/index';
import { MatchCard } from '@/components/ItemCards';
import { AIMatchingEngine, ConfidenceBreakdown } from '@/components/AIMatchingEngine';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Sparkles, TrendingUp, Clock, CheckCircle2, XCircle, Mail, Filter, Search } from 'lucide-react';

const springPresets = {
  gentle: { type: 'spring' as const, stiffness: 300, damping: 35 },
  snappy: { type: 'spring' as const, stiffness: 400, damping: 30 },
};

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -24 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function Matches() {
  const { matches, isProcessingMatch, updateMatchStatus } = useItems();
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('confidence');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMatches = useMemo(() => {
    let filtered = [...matches];

    if (filterStatus !== 'all') {
      filtered = filtered.filter((match) => match.status === filterStatus);
    }

    if (searchQuery) {
      filtered = filtered.filter((match) =>
        match.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === 'confidence') {
        return b.confidenceScore - a.confidenceScore;
      } else if (sortBy === 'date') {
        return b.createdAt.getTime() - a.createdAt.getTime();
      }
      return 0;
    });

    return filtered;
  }, [matches, filterStatus, sortBy, searchQuery]);

  const stats = useMemo(() => {
    const total = matches.length;
    const highConfidence = matches.filter((m) => m.confidenceScore > 0.8).length;
    const pending = matches.filter((m) => m.status === 'pending').length;
    const confirmed = matches.filter((m) => m.status === 'confirmed').length;

    return { total, highConfidence, pending, confirmed };
  }, [matches]);

  const handleContact = (match: MatchResult) => {
    updateMatchStatus(match.id, 'contacted');
    setSelectedMatch(match);
  };

  const handleConfirm = (matchId: string) => {
    updateMatchStatus(matchId, 'confirmed');
  };

  const handleReject = (matchId: string) => {
    updateMatchStatus(matchId, 'rejected');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-4 py-12">
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          transition={springPresets.gentle}
          className="max-w-7xl mx-auto"
        >
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">AI Matches</h1>
                <p className="text-muted-foreground mt-1">
                  Smart matching powered by advanced AI algorithms
                </p>
              </div>
            </div>
          </div>

          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
          >
            <motion.div variants={staggerItem}>
              <Card className="border-border/50 shadow-lg shadow-primary/5">
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Total Matches
                  </CardDescription>
                  <CardTitle className="text-3xl font-bold">{stats.total}</CardTitle>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Card className="border-border/50 shadow-lg shadow-accent/5">
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    High Confidence
                  </CardDescription>
                  <CardTitle className="text-3xl font-bold text-accent">
                    {stats.highConfidence}
                  </CardTitle>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Card className="border-border/50 shadow-lg shadow-primary/5">
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Pending
                  </CardDescription>
                  <CardTitle className="text-3xl font-bold">{stats.pending}</CardTitle>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Card className="border-border/50 shadow-lg shadow-primary/5">
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Confirmed
                  </CardDescription>
                  <CardTitle className="text-3xl font-bold text-primary">
                    {stats.confirmed}
                  </CardTitle>
                </CardHeader>
              </Card>
            </motion.div>
          </motion.div>

          <AIMatchingEngine isProcessing={isProcessingMatch} matches={filteredMatches} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springPresets.gentle, delay: 0.2 }}
            className="mt-12"
          >
            <Card className="border-border/50 shadow-xl shadow-primary/5">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl">Match Results</CardTitle>
                    <CardDescription className="mt-1">
                      Review and manage your AI-generated matches
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 md:flex-initial md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search matches..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-[140px]">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confidence">By Confidence</SelectItem>
                        <SelectItem value="date">By Date</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger value="all">All Matches</TabsTrigger>
                    <TabsTrigger value="high">High Confidence</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-6">
                    <AnimatePresence mode="popLayout">
                      {filteredMatches.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-center py-12"
                        >
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                            <Sparkles className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2">No matches found</h3>
                          <p className="text-muted-foreground">
                            Try adjusting your filters or submit more items
                          </p>
                        </motion.div>
                      ) : (
                        filteredMatches.map((match, index) => (
                          <motion.div
                            key={match.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ ...springPresets.gentle, delay: index * 0.05 }}
                          >
                            <Card className="border-border/50 hover:border-primary/50 transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-primary/10">
                              <CardContent className="p-6">
                                <div className="flex flex-col lg:flex-row gap-6">
                                  <div className="flex-1">
                                    <MatchCard match={match} onContact={() => handleContact(match)} />
                                  </div>
                                  <div className="lg:w-80">
                                    <ConfidenceBreakdown match={match} />
                                    <div className="mt-6 flex flex-wrap gap-3">
                                      {match.status === 'pending' && (
                                        <>
                                          <Button
                                            onClick={() => handleContact(match)}
                                            className="flex-1"
                                          >
                                            <Mail className="w-4 h-4 mr-2" />
                                            Contact
                                          </Button>
                                          <Button
                                            variant="outline"
                                            onClick={() => handleReject(match.id)}
                                            className="flex-1"
                                          >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Dismiss
                                          </Button>
                                        </>
                                      )}
                                      {match.status === 'contacted' && (
                                        <>
                                          <Button
                                            onClick={() => handleConfirm(match.id)}
                                            className="flex-1"
                                          >
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                            Confirm Match
                                          </Button>
                                          <Button
                                            variant="outline"
                                            onClick={() => handleReject(match.id)}
                                            className="flex-1"
                                          >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Not a Match
                                          </Button>
                                        </>
                                      )}
                                      {match.status === 'confirmed' && (
                                        <Badge className="w-full justify-center py-2 bg-primary/10 text-primary border-primary/20">
                                          <CheckCircle2 className="w-4 h-4 mr-2" />
                                          Match Confirmed
                                        </Badge>
                                      )}
                                      {match.status === 'rejected' && (
                                        <Badge
                                          variant="outline"
                                          className="w-full justify-center py-2 text-muted-foreground"
                                        >
                                          <XCircle className="w-4 h-4 mr-2" />
                                          Dismissed
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </TabsContent>

                  <TabsContent value="high" className="space-y-6">
                    <AnimatePresence mode="popLayout">
                      {filteredMatches
                        .filter((m) => m.confidenceScore > 0.8)
                        .map((match, index) => (
                          <motion.div
                            key={match.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ ...springPresets.gentle, delay: index * 0.05 }}
                          >
                            <Card className="border-accent/50 shadow-lg shadow-accent/10">
                              <CardContent className="p-6">
                                <div className="flex flex-col lg:flex-row gap-6">
                                  <div className="flex-1">
                                    <MatchCard match={match} onContact={() => handleContact(match)} />
                                  </div>
                                  <div className="lg:w-80">
                                    <ConfidenceBreakdown match={match} />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                    </AnimatePresence>
                  </TabsContent>

                  <TabsContent value="pending" className="space-y-6">
                    <AnimatePresence mode="popLayout">
                      {filteredMatches
                        .filter((m) => m.status === 'pending')
                        .map((match, index) => (
                          <motion.div
                            key={match.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ ...springPresets.gentle, delay: index * 0.05 }}
                          >
                            <Card className="border-border/50">
                              <CardContent className="p-6">
                                <div className="flex flex-col lg:flex-row gap-6">
                                  <div className="flex-1">
                                    <MatchCard match={match} onContact={() => handleContact(match)} />
                                  </div>
                                  <div className="lg:w-80">
                                    <ConfidenceBreakdown match={match} />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                    </AnimatePresence>
                  </TabsContent>

                  <TabsContent value="history" className="space-y-6">
                    <AnimatePresence mode="popLayout">
                      {filteredMatches
                        .filter((m) => m.status === 'confirmed' || m.status === 'rejected')
                        .map((match, index) => (
                          <motion.div
                            key={match.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ ...springPresets.gentle, delay: index * 0.05 }}
                          >
                            <Card className="border-border/50 opacity-75">
                              <CardContent className="p-6">
                                <div className="flex flex-col lg:flex-row gap-6">
                                  <div className="flex-1">
                                    <MatchCard match={match} />
                                  </div>
                                  <div className="lg:w-80">
                                    <ConfidenceBreakdown match={match} />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                    </AnimatePresence>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
