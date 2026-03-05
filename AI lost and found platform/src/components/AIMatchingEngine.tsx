import { motion, AnimatePresence } from "framer-motion";
import { Brain, Zap, MapPin, Clock, Image, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { MatchResult } from "@/lib/index";

interface AIMatchingEngineProps {
  isProcessing: boolean;
  matches: MatchResult[];
}

interface ConfidenceBreakdownProps {
  match: MatchResult;
}

export function AIMatchingEngine({ isProcessing, matches }: AIMatchingEngineProps) {
  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 border-primary/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <Brain className="w-8 h-8 text-primary" />
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="absolute inset-0 bg-primary/20 rounded-full blur-md"
              />
            )}
          </AnimatePresence>
        </div>
        <div>
          <h3 className="text-xl font-semibold">AI Matching Engine</h3>
          <p className="text-sm text-muted-foreground">
            {isProcessing ? "Processing matches..." : `${matches.length} matches found`}
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isProcessing ? (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <ProcessingStage stage="Analyzing images" progress={40} icon={Image} />
            <ProcessingStage stage="Comparing descriptions" progress={30} icon={FileText} />
            <ProcessingStage stage="Calculating location proximity" progress={20} icon={MapPin} />
            <ProcessingStage stage="Evaluating time factors" progress={10} icon={Clock} />
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            {matches.length > 0 ? (
              matches.slice(0, 3).map((match, index) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Match #{index + 1}</p>
                      <p className="text-xs text-muted-foreground">
                        Confidence: {(match.confidenceScore * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={match.confidenceScore > 0.8 ? "default" : "secondary"}
                    className="font-mono"
                  >
                    {(match.confidenceScore * 100).toFixed(0)}%
                  </Badge>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No matches found yet</p>
                <p className="text-xs mt-1">Submit items to start AI matching</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function ProcessingStage({
  stage,
  progress,
  icon: Icon,
}: {
  stage: string;
  progress: number;
  icon: React.ElementType;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{stage}</span>
        </div>
        <span className="text-xs text-muted-foreground font-mono">{progress}%</span>
      </div>
      <div className="relative">
        <Progress value={progress} className="h-2" />
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ["-100%", "200%"] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        />
      </div>
    </div>
  );
}

export function ConfidenceBreakdown({ match }: ConfidenceBreakdownProps) {
  const breakdown = [
    {
      label: "Image Similarity",
      value: match.breakdown.imageSimilarity,
      weight: 40,
      icon: Image,
      color: "from-primary to-primary/70",
    },
    {
      label: "Text Similarity",
      value: match.breakdown.textSimilarity,
      weight: 30,
      icon: FileText,
      color: "from-accent to-accent/70",
    },
    {
      label: "Location Proximity",
      value: match.breakdown.locationProximity,
      weight: 20,
      icon: MapPin,
      color: "from-chart-3 to-chart-3/70",
    },
    {
      label: "Time Proximity",
      value: match.breakdown.timeProximity,
      weight: 10,
      icon: Clock,
      color: "from-chart-4 to-chart-4/70",
    },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Confidence Breakdown</h3>
      </div>

      <div className="space-y-6">
        {breakdown.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <item.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{item.label}</span>
                <Badge variant="outline" className="text-xs font-mono">
                  {item.weight}%
                </Badge>
              </div>
              <span className="text-sm font-semibold font-mono">
                {(item.value * 100).toFixed(1)}%
              </span>
            </div>

            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.value * 100}%` }}
                transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                className={`h-full bg-gradient-to-r ${item.color} rounded-full relative`}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "linear",
                    delay: index * 0.2,
                  }}
                />
              </motion.div>
            </div>

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Contribution: {((item.value * item.weight) / 100).toFixed(1)}%</span>
              <span>Weight: {item.weight}%</span>
            </div>
          </motion.div>
        ))}

        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Overall Confidence</span>
            <div className="flex items-center gap-2">
              <Badge
                variant={match.confidenceScore > 0.8 ? "default" : "secondary"}
                className="text-base font-mono px-3 py-1"
              >
                {(match.confidenceScore * 100).toFixed(1)}%
              </Badge>
              {match.confidenceScore > 0.8 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </motion.div>
              )}
            </div>
          </div>

          {match.confidenceScore > 0.8 && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-muted-foreground mt-2"
            >
              High confidence match - Email notification sent
            </motion.p>
          )}
        </div>
      </div>
    </Card>
  );
}
