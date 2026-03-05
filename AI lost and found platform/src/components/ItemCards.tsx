import { motion } from "framer-motion";
import { MapPin, Calendar, Edit, Mail, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { LostItem, FoundItem, MatchResult } from "@/lib/index";

interface LostItemCardProps {
  item: LostItem;
  onEdit?: () => void;
}

export function LostItemCard({ item, onEdit }: LostItemCardProps) {
  const statusColors = {
    active: "bg-accent/20 text-accent",
    matched: "bg-chart-3/20 text-chart-3",
    resolved: "bg-muted text-muted-foreground",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 35 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="overflow-hidden border-border/50 shadow-lg hover:shadow-xl transition-all duration-200">
        <div className="relative h-48 overflow-hidden">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3">
            <Badge className={statusColors[item.status]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Badge>
          </div>
        </div>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-foreground line-clamp-1">
                {item.title}
              </h3>
              <Badge variant="secondary" className="mt-2">
                {item.category}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {item.description}
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="line-clamp-1">{item.location.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 text-primary" />
              <span>
                Lost on {new Date(item.dateLost).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
        {onEdit && (
          <CardFooter className="pt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="w-full"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Item
            </Button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}

interface FoundItemCardProps {
  item: FoundItem;
  onEdit?: () => void;
}

export function FoundItemCard({ item, onEdit }: FoundItemCardProps) {
  const statusColors = {
    active: "bg-accent/20 text-accent",
    matched: "bg-chart-3/20 text-chart-3",
    resolved: "bg-muted text-muted-foreground",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 35 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="overflow-hidden border-border/50 shadow-lg hover:shadow-xl transition-all duration-200">
        <div className="relative h-48 overflow-hidden">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3">
            <Badge className={statusColors[item.status]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Badge>
          </div>
        </div>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-foreground line-clamp-1">
                {item.title}
              </h3>
              <Badge variant="secondary" className="mt-2">
                {item.category}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {item.description}
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="line-clamp-1">{item.location.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 text-primary" />
              <span>
                Found on {new Date(item.dateFound).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
        {onEdit && (
          <CardFooter className="pt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="w-full"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Item
            </Button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}

interface MatchCardProps {
  match: MatchResult;
  onContact?: () => void;
}

export function MatchCard({ match, onContact }: MatchCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-chart-3";
    if (score >= 0.6) return "text-chart-4";
    return "text-muted-foreground";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 0.8) return "bg-chart-3/10";
    if (score >= 0.6) return "bg-chart-4/10";
    return "bg-muted/50";
  };

  const statusIcons: Record<string, React.ReactNode> = {
    pending: null,
    contacted: <Mail className="w-4 h-4" />,
    confirmed: <CheckCircle className="w-4 h-4" />,
    rejected: <XCircle className="w-4 h-4" />,
  };

  const statusColors = {
    pending: "bg-accent/20 text-accent",
    contacted: "bg-chart-2/20 text-chart-2",
    confirmed: "bg-chart-3/20 text-chart-3",
    rejected: "bg-destructive/20 text-destructive",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 35 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="overflow-hidden border-border/50 shadow-lg hover:shadow-xl transition-all duration-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`px-4 py-2 rounded-full ${getScoreBgColor(
                  match.confidenceScore
                )}`}
              >
                <span
                  className={`text-2xl font-bold ${getScoreColor(
                    match.confidenceScore
                  )}`}
                >
                  {Math.round(match.confidenceScore * 100)}%
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Match Confidence</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(match.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Badge className={statusColors[match.status]}>
              <span className="flex items-center gap-1">
                {statusIcons[match.status]}
                {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
              </span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Image Similarity</span>
                <span className="font-medium">
                  {Math.round(match.breakdown.imageSimilarity * 100)}%
                </span>
              </div>
              <Progress
                value={match.breakdown.imageSimilarity * 100}
                className="h-2"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Text Similarity</span>
                <span className="font-medium">
                  {Math.round(match.breakdown.textSimilarity * 100)}%
                </span>
              </div>
              <Progress
                value={match.breakdown.textSimilarity * 100}
                className="h-2"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Location Proximity</span>
                <span className="font-medium">
                  {Math.round(match.breakdown.locationProximity * 100)}%
                </span>
              </div>
              <Progress
                value={match.breakdown.locationProximity * 100}
                className="h-2"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Time Proximity</span>
                <span className="font-medium">
                  {Math.round(match.breakdown.timeProximity * 100)}%
                </span>
              </div>
              <Progress
                value={match.breakdown.timeProximity * 100}
                className="h-2"
              />
            </div>
          </div>
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Weighted Score: Image (40%) + Text (30%) + Location (20%) + Time
              (10%)
            </p>
          </div>
        </CardContent>
        {onContact && match.status === "pending" && (
          <CardFooter className="pt-0">
            <Button onClick={onContact} className="w-full" size="sm">
              <Mail className="w-4 h-4 mr-2" />
              Contact Owner
            </Button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}
