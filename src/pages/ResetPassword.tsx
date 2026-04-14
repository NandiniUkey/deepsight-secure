import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CyberBackground from "@/components/CyberBackground";
import CyberCard from "@/components/CyberCard";
import { toast } from "sonner";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const hasRecoveryToken = useMemo(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    return hashParams.get("type") === "recovery" || hashParams.has("access_token");
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasRecoveryToken) {
      toast.error("Open this page from the password reset link in your email.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Password updated. You can log in now.");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <CyberBackground />
      <CyberCard className="w-full max-w-md" glowColor="green">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-primary/40 glow-green mb-4">
            <KeyRound className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-heading tracking-wider text-foreground text-glow-green">
            RESET PASSWORD
          </h1>
          <p className="text-muted-foreground mt-2 text-sm tracking-wide">
            CREATE A NEW PASSWORD TO RESTORE ACCESS
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-xs tracking-widest uppercase text-muted-foreground">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-secondary/50 border-border focus:border-primary focus:glow-green pr-10"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-xs tracking-widest uppercase text-muted-foreground">
              Confirm Password
            </Label>
            <Input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-secondary/50 border-border focus:border-primary focus:glow-green"
              placeholder="••••••••"
              required
            />
          </div>

          <Button type="submit" variant="neon" className="w-full" disabled={loading}>
            {loading ? "UPDATING PASSWORD..." : "SAVE NEW PASSWORD"}
          </Button>
        </form>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          Remembered it?{" "}
          <Link to="/login" className="text-primary hover:text-glow-green transition-all">
            Back to login
          </Link>
        </p>
      </CyberCard>
    </div>
  );
};

export default ResetPassword;