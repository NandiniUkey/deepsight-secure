import CyberCard from "./CyberCard";
import { ShieldCheck, ShieldAlert, ShieldQuestion, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface DetectionResponse {
  verdict: "REAL" | "FAKE" | "SUSPICIOUS";
  confidence: number;
  analysis: string;
  indicators: string[];
}

interface Props {
  result: DetectionResponse | null;
  loading: boolean;
}

const DetectionResult = ({ result, loading }: Props) => {
  if (loading) {
    return (
      <CyberCard glowColor="cyan" className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-2 border-neon-cyan/30 rounded-full animate-ping" />
          <div className="absolute inset-2 border-2 border-primary/50 rounded-full animate-spin" />
          <div className="absolute inset-4 border border-accent/40 rounded-full animate-pulse" />
          <Activity className="absolute inset-0 m-auto w-8 h-8 text-neon-cyan animate-pulse-glow" />
        </div>
        <p className="mt-6 font-heading text-sm tracking-widest text-neon-cyan text-glow-cyan animate-pulse">
          ANALYZING MEDIA...
        </p>
        <p className="text-xs text-muted-foreground mt-2">Running deepfake detection algorithms</p>
      </CyberCard>
    );
  }

  if (!result) {
    return (
      <CyberCard glowColor="cyan" className="flex flex-col items-center justify-center min-h-[400px]">
        <ShieldQuestion className="w-16 h-16 text-muted-foreground/30" />
        <p className="mt-4 font-heading text-sm tracking-widest text-muted-foreground">
          AWAITING INPUT
        </p>
        <p className="text-xs text-muted-foreground/60 mt-2 text-center max-w-xs">
          Upload a file or enter a URL, then initiate scan to begin analysis
        </p>
      </CyberCard>
    );
  }

  const verdictConfig = {
    REAL: {
      icon: ShieldCheck,
      color: "text-primary",
      glow: "text-glow-green",
      glowCard: "green" as const,
      label: "AUTHENTIC",
      bgBar: "bg-primary",
    },
    FAKE: {
      icon: ShieldAlert,
      color: "text-neon-red",
      glow: "",
      glowCard: "purple" as const,
      label: "DEEPFAKE DETECTED",
      bgBar: "bg-destructive",
    },
    SUSPICIOUS: {
      icon: ShieldQuestion,
      color: "text-accent",
      glow: "text-glow-purple",
      glowCard: "purple" as const,
      label: "SUSPICIOUS",
      bgBar: "bg-accent",
    },
  };

  const cfg = verdictConfig[result.verdict];
  const Icon = cfg.icon;

  return (
    <CyberCard glowColor={cfg.glowCard} className="space-y-6">
      <h2 className="font-heading text-sm tracking-widest text-neon-cyan text-glow-cyan">
        // ANALYSIS RESULT
      </h2>

      {/* Verdict */}
      <div className="text-center py-4">
        <Icon className={`w-16 h-16 mx-auto ${cfg.color} ${cfg.glow}`} />
        <p className={`mt-4 font-heading text-2xl tracking-widest ${cfg.color} ${cfg.glow}`}>
          {cfg.label}
        </p>
      </div>

      {/* Confidence */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="tracking-widest text-muted-foreground uppercase">Confidence Level</span>
          <span className={`font-heading ${cfg.color}`}>{result.confidence}%</span>
        </div>
        <Progress value={result.confidence} className="h-2 bg-secondary" />
      </div>

      {/* Analysis */}
      <div className="space-y-2">
        <p className="text-xs tracking-widest text-muted-foreground uppercase">Analysis Summary</p>
        <p className="text-sm text-foreground/80 leading-relaxed">{result.analysis}</p>
      </div>

      {/* Indicators */}
      {result.indicators.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs tracking-widest text-muted-foreground uppercase">Detection Indicators</p>
          <ul className="space-y-1">
            {result.indicators.map((ind, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <span className={`mt-1 w-1.5 h-1.5 rounded-full ${cfg.bgBar} shrink-0`} />
                <span className="text-foreground/70">{ind}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </CyberCard>
  );
};

export default DetectionResult;
