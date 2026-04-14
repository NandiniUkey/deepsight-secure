import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CyberBackground from "@/components/CyberBackground";
import CyberCard from "@/components/CyberCard";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Shield, Eye, EyeOff } from "lucide-react";

const DEMO_EMAIL = "demo@deepfakesentinel.io";
const DEMO_PASSWORD = "DemoSentinel#2026!";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Access granted");
      navigate("/dashboard");
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    try {
      // Try sign in first
      let { error } = await supabase.auth.signInWithPassword({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
      if (error) {
        // Create demo account (auto-confirm is enabled)
        const { error: signUpError } = await supabase.auth.signUp({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
        if (signUpError && !signUpError.message.includes("already registered")) {
          throw signUpError;
        }
        // Wait briefly for account to be ready
        await new Promise(r => setTimeout(r, 1000));
        const res = await supabase.auth.signInWithPassword({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
        if (res.error) throw res.error;
      }
      toast.success("Demo access granted");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Demo login failed");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <CyberBackground />
      <CyberCard className="w-full max-w-md" glowColor="green">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-primary/40 glow-green mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-heading tracking-wider text-foreground text-glow-green">
            DEEPFAKE SENTINEL
          </h1>
          <p className="text-muted-foreground mt-2 text-sm tracking-wide">
            AUTHENTICATE TO ACCESS DETECTION SYSTEM
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs tracking-widest uppercase text-muted-foreground">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-secondary/50 border-border focus:border-primary focus:glow-green"
              placeholder="operator@sentinel.io"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs tracking-widest uppercase text-muted-foreground">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
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
          <Button type="submit" variant="neon" className="w-full" disabled={loading}>
            {loading ? "AUTHENTICATING..." : "LOGIN"}
          </Button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <Separator className="flex-1 bg-border/50" />
          <span className="text-xs text-muted-foreground tracking-widest">OR</span>
          <Separator className="flex-1 bg-border/50" />
        </div>

        <Button
          variant="neon-outline"
          className="w-full"
          onClick={handleDemoLogin}
          disabled={demoLoading}
        >
          {demoLoading ? "ACCESSING DEMO..." : "USE DEMO ACCOUNT"}
        </Button>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          No account?{" "}
          <Link to="/register" className="text-primary hover:text-glow-green transition-all">
            Register here
          </Link>
        </p>
      </CyberCard>
    </div>
  );
};

export default Login;
