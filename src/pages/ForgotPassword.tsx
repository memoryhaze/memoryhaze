import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Heart, Music, Mail, ShieldCheck, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

const ForgotPassword = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:5000";

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to send OTP");
      toast.success("OTP Sent", { description: "Please check your email." });
      setStep(2);
    } catch (err: any) {
      toast.error("Error", { description: err?.message || "Failed to send OTP" });
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Invalid OTP");
      toast.success("OTP Verified");
      setStep(3);
    } catch (err: any) {
      toast.error("Error", { description: err?.message || "Invalid OTP" });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to reset password");
      toast.success("Password reset successful");
      setStep(1);
      setOtp("");
      setPassword("");
      setConfirm("");
    } catch (err: any) {
      toast.error("Error", { description: err?.message || "Failed to reset password" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blush/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-white/50 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-soft">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="relative">
              <Heart className="w-6 h-6 text-blush-deep" />
              <Music className="w-3 h-3 text-gold absolute -bottom-1 -right-1" />
            </div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">MemoryHaze</h2>
          </div>

          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map((i) => (
              <span key={i} className={`inline-block w-2.5 h-2.5 rounded-full ${step >= i ? "bg-primary" : "bg-muted-foreground/40"}`} />
            ))}
          </div>

          {step === 1 && (
            <form onSubmit={sendOtp} className="space-y-6" autoComplete="on">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 bg-white/50"
                    name="email"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending OTP...</>) : ("Send OTP")}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={verifyOtp} className="space-y-6" autoComplete="on">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Verification Code</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="pl-9 bg-white/50 text-center tracking-widest text-lg font-semibold"
                    maxLength={6}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={loading}>
                  {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</>) : ("Verify")}
                </Button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={resetPassword} className="space-y-6" autoComplete="on">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPass ? "text" : "password"}
                    placeholder=""
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-9 bg-white/50"
                    name="new-password"
                    autoComplete="new-password"
                    required
                  />
                  <button type="button" onClick={() => setShowPass((s) => !s)} className="absolute right-3 top-2.5 text-muted-foreground" aria-label={showPass ? "Hide password" : "Show password"}>
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showConfirm ? "text" : "password"}
                    placeholder=""
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="pl-9 pr-9 bg-white/50"
                    name="new-password"
                    autoComplete="new-password"
                    required
                  />
                  <button type="button" onClick={() => setShowConfirm((s) => !s)} className="absolute right-3 top-2.5 text-muted-foreground" aria-label={showConfirm ? "Hide password" : "Show password"}>
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Resetting...</>) : ("Reset Password")}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setStep(2)}>
                Back
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
