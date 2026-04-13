import { cn } from "@/lib/utils";

interface CyberCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: "cyan" | "green" | "purple";
}

const CyberCard = ({ children, className, glowColor = "cyan" }: CyberCardProps) => {
  const glowClasses = {
    cyan: "border-neon-cyan/30 border-glow-cyan",
    green: "border-primary/30 border-glow-green",
    purple: "border-accent/30 glow-purple",
  };

  return (
    <div
      className={cn(
        "relative bg-card/80 backdrop-blur-sm border rounded-lg p-6",
        glowClasses[glowColor],
        className
      )}
    >
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-neon-cyan/60" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-neon-cyan/60" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-neon-cyan/60" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-neon-cyan/60" />
      {children}
    </div>
  );
};

export default CyberCard;
