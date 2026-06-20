import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/providers/trpc";
import isroLogo from "@/assets/isro_logo.svg";

export function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      navigate("/");
    },
    onError: (err) => {
      setErrorMsg(err.message || "Invalid username or password.");
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!username || !password) {
      setErrorMsg("Please fill in both username and password.");
      return;
    }
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-surface-primary border border-border rounded-xl p-8 shadow-xl">
          <div className="flex items-center justify-center gap-3 mb-8">
            <img src={isroLogo} className="w-10 h-10 object-contain" alt="ISRO Logo" />
            <h1 className="text-2xl font-bold text-text-primary" style={{ fontFamily: "var(--font-heading)" }}>SITE MANAGER</h1>
          </div>
          <p className="text-center text-text-secondary text-sm mb-8">Infrastructure Management Platform</p>

          {errorMsg && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-lg border border-destructive/20 mb-6">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm text-text-secondary">Username</label>
              <Input
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-surface-secondary border-border text-text-primary placeholder:text-text-muted h-11"
                disabled={loginMutation.isPending}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-text-secondary">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-surface-secondary border-border text-text-primary placeholder:text-text-muted h-11 pr-10"
                  disabled={loginMutation.isPending}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                  disabled={loginMutation.isPending}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-11 bg-accent hover:bg-accent-hover text-white font-medium mt-2 flex items-center justify-center gap-2"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>NetBox Community v4.2.6</span>
              <span>Site Manager v1.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
