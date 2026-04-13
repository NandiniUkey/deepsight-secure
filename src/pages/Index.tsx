import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CyberBackground from "@/components/CyberBackground";
import { Shield, ScanSearch, Zap, Lock } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <CyberBackground />

      {/* Header */}
      <header className="border-b border-border/30 bg-card/30 backdrop-blur-sm">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-heading text-lg tracking-wider text-foreground text-glow-green">
              DEEPFAKE SENTINEL
            </span>
          </div>
          <div className="flex gap-2">
            <Link to="/login">
              <Button variant="neon-outline" size="sm">LOGIN</Button>
            </Link>
            <Link to="/register">
              <Button variant="neon" size="sm">REGISTER</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center">
        <div className="container text-center space-y-8 py-20">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-2 border-primary/40 glow-green animate-pulse-glow">
            <ScanSearch className="w-12 h-12 text-primary" />
          </div>

          <h1 className="text-4xl md:text-6xl font-heading tracking-wider text-foreground text-glow-cyan animate-flicker leading-tight">
            DEEPFAKE<br />
            <span className="text-primary text-glow-green">SENTINEL</span>
          </h1>

          <p className="text-muted-foreground max-w-lg mx-auto text-lg tracking-wide">
            Advanced AI-powered deepfake detection system. Analyze images and videos
            for manipulation with military-grade precision.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register">
              <Button variant="neon" size="lg">
                GET STARTED
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="neon-outline" size="lg">
                ACCESS CONSOLE
              </Button>
            </Link>
          </div>

          {/* Feature cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-3xl mx-auto">
            {[
              { icon: ScanSearch, title: "AI DETECTION", desc: "Advanced neural analysis for deepfake artifacts" },
              { icon: Zap, title: "REAL-TIME", desc: "Instant analysis of uploaded or linked media" },
              { icon: Lock, title: "SECURE", desc: "End-to-end encrypted analysis pipeline" },
            ].map((f, i) => (
              <div key={i} className="border border-border/50 rounded-lg p-6 bg-card/30 backdrop-blur-sm hover:border-primary/30 transition-all group">
                <f.icon className="w-8 h-8 text-neon-cyan mb-3 group-hover:text-primary transition-colors" />
                <h3 className="font-heading text-xs tracking-widest text-foreground mb-2">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
