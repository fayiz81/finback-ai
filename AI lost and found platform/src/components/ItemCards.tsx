import { motion } from "framer-motion";
import { MapPin, Calendar, Edit, Mail, CheckCircle, XCircle, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { MatchResult } from "@/lib/index";

const spring = { type: "spring" as const, stiffness: 300, damping: 35 };

// ── Lost Item Card ────────────────────────────────────────────────────────────
interface LostItemCardProps {
  item: any; // flat Supabase row
  onEdit?: () => void;
}

export function LostItemCard({ item, onEdit }: LostItemCardProps) {
  const statusColors: Record<string, string> = {
    lost:     "bg-red-500/15 text-red-400",
    found:    "bg-emerald-500/15 text-emerald-400",
    matched:  "bg-amber-500/15 text-amber-400",
    resolved: "bg-muted text-muted-foreground",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="overflow-hidden border-border/50 shadow-lg hover:shadow-xl transition-all duration-200">
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-muted">
          {item.image_url ? (
            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute top-3 right-3">
            <Badge className={statusColors[item.status] || statusColors.lost}>
              {(item.status || 'lost').charAt(0).toUpperCase() + (item.status || 'lost').slice(1)}
            </Badge>
          </div>
        </div>

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-foreground line-clamp-1">{item.title}</h3>
              <Badge variant="secondary" className="mt-2">{item.category}</Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
          <div className="space-y-2">
            {/* ✅ Fixed: use flat column location_name */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="line-clamp-1">{item.location_name || 'Location not specified'}</span>
            </div>
            {/* ✅ Fixed: use flat column date_lost */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 text-primary" />
              <span>Lost on {item.date_lost ? new Date(item.date_lost).toLocaleDateString() : new Date(item.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>

        {onEdit && (
          <CardFooter className="pt-0">
            <Button variant="outline" size="sm" onClick={onEdit} className="w-full">
              <Edit className="w-4 h-4 mr-2" />Edit Item
            </Button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}

// ── Found Item Card ───────────────────────────────────────────────────────────
interface FoundItemCardProps {
  item: any; // flat Supabase row
  onEdit?: () => void;
}

export function FoundItemCard({ item, onEdit }: FoundItemCardProps) {
  const statusColors: Record<string, string> = {
    lost:     "bg-red-500/15 text-red-400",
    found:    "bg-emerald-500/15 text-emerald-400",
    matched:  "bg-amber-500/15 text-amber-400",
    resolved: "bg-muted text-muted-foreground",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="overflow-hidden border-border/50 shadow-lg hover:shadow-xl transition-all duration-200">
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-muted">
          {item.image_url ? (
            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute top-3 right-3">
            <Badge className={statusColors[item.status] || statusColors.found}>
              {(item.status || 'found').charAt(0).toUpperCase() + (item.status || 'found').slice(1)}
            </Badge>
          </div>
        </div>

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-foreground line-clamp-1">{item.title}</h3>
              <Badge variant="secondary" className="mt-2">{item.category}</Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
          <div className="space-y-2">
            {/* ✅ Fixed: use flat column location_name */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="line-clamp-1">{item.location_name || 'Location not specified'}</span>
            </div>
            {/* ✅ Fixed: use flat column date_found */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 text-primary" />
              <span>Found on {item.date_found ? new Date(item.date_found).toLocaleDateString() : new Date(item.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>

        {onEdit && (
          <CardFooter className="pt-0">
            <Button variant="outline" size="sm" onClick={onEdit} className="w-full">
              <Edit className="w-4 h-4 mr-2" />Edit Item
            </Button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}

// ── Match Card ────────────────────────────────────────────────────────────────
interface MatchCardProps {
  match: MatchResult;
  onContact?: () => void;
}

export function MatchCard({ match, onContact }: MatchCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-emerald-400";
    if (score >= 0.6) return "text-amber-400";
    return "text-muted-foreground";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 0.8) return "bg-emerald-500/10";
    if (score >= 0.6) return "bg-amber-500/10";
    return "bg-muted/50";
  };

  const statusIcons: Record<string, React.ReactNode> = {
    pending:   null,
    contacted: <Mail className="w-4 h-4" />,
    confirmed: <CheckCircle className="w-4 h-4" />,
    rejected:  <XCircle className="w-4 h-4" />,
  };

  const statusColors: Record<string, string> = {
    pending:   "bg-primary/20 text-primary",
    contacted: "bg-blue-500/20 text-blue-400",
    confirmed: "bg-emerald-500/20 text-emerald-400",
    rejected:  "bg-destructive/20 text-destructive",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={spring}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="overflow-hidden border-border/50 shadow-lg hover:shadow-xl transition-all duration-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`px-4 py-2 rounded-full ${getScoreBgColor(match.confidenceScore)}`}>
                <span className={`text-2xl font-bold ${getScoreColor(match.confidenceScore)}`}>
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
            <Badge className={statusColors[match.status] || statusColors.pending}>
              <span className="flex items-center gap-1">
                {statusIcons[match.status]}
                {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
              </span>
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-3">
            {[
              { label: "Image Similarity",    value: match.breakdown.imageSimilarity },
              { label: "Text Similarity",     value: match.breakdown.textSimilarity },
              { label: "Location Proximity",  value: match.breakdown.locationProximity },
              { label: "Time Proximity",      value: match.breakdown.timeProximity },
            ].map((b) => (
              <div key={b.label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{b.label}</span>
                  <span className="font-medium">{Math.round(b.value * 100)}%</span>
                </div>
                <Progress value={b.value * 100} className="h-2" />
              </div>
            ))}
          </div>
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Weighted Score: Image (40%) + Text (30%) + Location (20%) + Time (10%)
            </p>
          </div>
        </CardContent>

        {onContact && match.status === "pending" && (
          <CardFooter className="pt-0">
            <Button onClick={onContact} className="w-full" size="sm">
              <Mail className="w-4 h-4 mr-2" />Contact Owner
            </Button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}
