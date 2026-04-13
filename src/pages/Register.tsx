import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CyberBackground from "@/components/CyberBackground";
import CyberCard from "@/components/CyberCard";
import { toast } from "sonner";
import { UserPlus, Eye, EyeOff } from "lucide-react";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Registration complete. Check your email to verify.");
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <CyberBackground />
      <CyberCard className="w-full max-w-md" glowColor="purple">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-accent/40 glow-purple mb-4">
            <UserPlus className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-2xl font-heading tracking-wider text-foreground text-glow-purple">
            CREATE ACCOUNT
          </h1>
          <p className="text-muted-foreground mt-2 text-sm tracking-wide">
            REGISTER TO ACCESS DETECTION SYSTEM
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs tracking-widest uppercase text-muted-foreground">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-secondary/50 border-border focus:border-accent"
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
                className="bg-secondary/50 border-border focus:border-accent pr-10"
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
            <Label htmlFor="confirm" className="text-xs tracking-widest uppercase text-muted-foreground">
              Confirm Password
            </Label>
            <Input
              id="confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-secondary/50 border-border focus:border-accent"
              placeholder="••••••••"
              required
            />
          </div>
          <Button type="submit" variant="neon-purple" className="w-full" disabled={loading}>
            {loading ? "REGISTERING..." : "CREATE ACCOUNT"}
          </Button>
        </form>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-accent hover:text-glow-purple transition-all">
            Login here
          </Link>
        </p>
      </CyberCard>
    </div>
  );
};

export default Register;
