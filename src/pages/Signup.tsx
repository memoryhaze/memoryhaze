import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Mail, Lock, User, Loader2, ShieldCheck, Eye, EyeOff, Heart, Music } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Signup = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000';
            const response = await fetch(`${API_BASE}/api/auth/send-otp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("OTP Sent!", {
                    description: "Please check your email for the verification code.",
                });
                setStep(2);
            } else {
                toast.error("Failed to send OTP", {
                    description: data.msg || "Please try again.",
                });
            }
        } catch (error) {
            toast.error("Error", {
                description: "Something went wrong. Please try again later.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifySignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000';
            const response = await fetch(`${API_BASE}/api/auth/verify-signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, otp, name, password }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Account created!", {
                    description: "Welcome to MemoryHaze!",
                });
                login(data.token);
                navigate("/");
            } else {
                toast.error("Verification failed", {
                    description: data.msg || "Invalid OTP or details. Please try again.",
                });
            }
        } catch (error) {
            toast.error("Error", {
                description: "Something went wrong. Please try again later.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Decorative Elements */}
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
                        {[1,2,3].map((i) => (
                            <span key={i} className={`inline-block w-2.5 h-2.5 rounded-full ${step >= i ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
                        ))}
                    </div>
                    {step === 1 ? (
                        <form onSubmit={handleSendOTP} className="space-y-6" autoComplete="on">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Email Address
                                </label>
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

                            <Button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending OTP...
                                    </>
                                ) : (
                                    <>
                                        <Mail className="mr-2 h-4 w-4" />
                                        Send Verification Code
                                    </>
                                )}
                            </Button>

                            <div className="text-center text-sm">
                                <span className="text-muted-foreground">Already have an account? </span>
                                <Link to="/login" className="font-medium text-primary hover:underline">
                                    Sign in
                                </Link>
                            </div>
                        </form>
                    ) : step === 2 ? (
                        <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="space-y-6" autoComplete="on">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Verification Code</label>
                                <div className="relative">
                                    <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input type="text" placeholder="Enter 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="pl-9 bg-white/50 text-center tracking-widest text-lg font-semibold" maxLength={6} required />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                </Button>
                                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">Next</Button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifySignup} className="space-y-6" autoComplete="on">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className="pl-9 bg-white/50" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input type={showPassword ? "text" : "password"} placeholder="" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9 pr-9 bg-white/50" name="new-password" autoComplete="new-password" required />
                                    <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-2.5 text-muted-foreground" aria-label={showPassword ? "Hide password" : "Show password"}>
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300" disabled={isLoading}>
                                {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating Account...</>) : ("Create Account")}
                            </Button>
                            <Button type="button" variant="ghost" className="w-full" onClick={() => setStep(2)}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Signup;
