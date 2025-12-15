import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Gift, Heart, Sparkles } from "lucide-react";

type GiftListItem = {
  _id: string;
  templateId: string;
  createdAt: string;
  memory?: string | null;
  plan?: string | null;
  assignedAt?: string;
  expiresAt?: string | null;
  accessEnabled?: boolean;
  permanentlyDeleted?: boolean;
  deletedAt?: string | null;
};

const getStatus = (g: GiftListItem) => {
  if (g.permanentlyDeleted) return "Deleted";
  if (g.accessEnabled === false) return "Expired";
  if (g.expiresAt) {
    const exp = new Date(g.expiresAt);
    if (Date.now() > exp.getTime()) return "Expired";
  }
  return "Active";
};

const templateLabel = (id: string) => {
  switch (id) {
    case "minimalist-love":
      return "Minimalist Love";
    case "grand-anniversary":
      return "Grand Anniversary";
    case "birthday-celebration":
      return "Birthday Celebration";
    default:
      return id;
  }
};

const formatOccasion = (occasion: string | null) => {
  if (!occasion) return null;
  switch (occasion.toLowerCase()) {
    case "birthday":
      return "Birthday";
    case "anniversary":
      return "Anniversary";
    case "valentines":
      return "Valentine's Day";
    default:
      return occasion;
  }
};

const Gifts = () => {
  const navigate = useNavigate();
  const { token, isAuthenticated, isLoading } = useAuth();
  const [gifts, setGifts] = useState<GiftListItem[]>([]);
  const [isLoadingGifts, setIsLoadingGifts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for auth state to be loaded before checking authentication
    if (isLoading) return;

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const load = async () => {
      setIsLoadingGifts(true);
      setError(null);
      try {
        const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:5000";
        const res = await fetch(`${API_BASE}/api/gifts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data?.error || "Failed to load gifts");
          return;
        }
        setGifts(Array.isArray(data?.gifts) ? data.gifts : []);
      } catch {
        setError("Failed to load gifts");
      } finally {
        setIsLoadingGifts(false);
      }
    };

    load();
  }, [isAuthenticated, isLoading, navigate, token]);

  return (
    <main className="min-h-screen bg-background">
      <Navbar hideMarketingLinks={true} logoAsLinkTo="/" />
      <section className="relative pt-28 pb-12 container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Decorative background elements */}
        <div className="absolute top-20 right-10 w-32 h-32 bg-blush/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 left-10 w-24 h-24 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-display text-3xl sm:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                My Gifts
              </h1>
              {gifts.length > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="px-3 py-1 rounded-full bg-gradient-to-r from-blush/20 to-gold/20 border border-blush/30"
                >
                  <span className="text-sm font-semibold text-foreground">{gifts.length}</span>
                </motion.div>
              )}
            </div>
            {gifts.length > 0 && (
              <p className="text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold" />
                Your personalized gifts created with love
              </p>
            )}
          </div>
        </div>


        {isLoadingGifts ? (
          <div className="text-muted-foreground">Loading…</div>
        ) : error ? (
          <div className="text-destructive">{error}</div>
        ) : gifts.length === 0 ? (
          <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-blush/5 via-background to-gold/5 border border-border">
            {/* Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* Floating hearts */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/4 left-[10%] text-blush-deep/20"
              >
                <Heart className="w-16 h-16 fill-current" />
              </motion.div>
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-1/3 right-[15%] text-gold/20"
              >
                <Gift className="w-14 h-14" />
              </motion.div>
              <motion.div
                animate={{ y: [0, -25, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-1/3 left-[20%] text-blush/30"
              >
                <Sparkles className="w-12 h-12" />
              </motion.div>

              {/* Gradient orbs */}
              <div className="absolute top-20 right-[20%] w-64 h-64 bg-blush/10 rounded-full blur-3xl" />
              <div className="absolute bottom-20 left-[10%] w-80 h-80 bg-gold/5 rounded-full blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center max-w-2xl mx-auto p-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-6"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blush-deep/20 to-gold/20 flex items-center justify-center">
                  <Gift className="w-10 h-10 text-blush-deep" />
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4"
              >
                No Gifts Yet
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto"
              >
                Create unforgettable memories for your loved ones with a personalized gift.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Button
                  variant="hero"
                  size="sm"
                  onClick={() => {
                    navigate("/");
                    setTimeout(() => {
                      const element = document.querySelector("#customize");
                      if (element) {
                        element.scrollIntoView({ behavior: "smooth" });
                      }
                    }, 300);
                  }}
                  className="group"
                >
                  Create a Gift
                  <Heart className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-10 inline-flex items-center gap-2 bg-secondary/50 backdrop-blur-sm rounded-full px-4 py-2"
              >
                <Sparkles className="w-4 h-4 text-gold" />
                <span className="text-sm text-muted-foreground font-medium">
                  Custom Songs & Web Pages for Every Occasion
                </span>
              </motion.div>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gifts.map((g, index) => {
              const status = getStatus(g);
              const canOpen = status === "Active";

              // Calculate time left to expire
              const getTimeLeft = () => {
                if (!g.expiresAt || status !== "Active") return null;

                const now = Date.now();
                const expiryTime = new Date(g.expiresAt).getTime();
                const timeLeft = expiryTime - now;

                if (timeLeft <= 0) return "Expired";

                const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

                if (days > 0) return `${days}d ${hours}h left`;
                if (hours > 0) return `${hours}h ${minutes}m left`;
                return `${minutes}m left`;
              };

              const timeLeft = getTimeLeft();

              // Template-based theme colors and icons
              const getTemplateTheme = (templateId: string) => {
                switch (templateId) {
                  case "minimalist-love":
                    return {
                      iconBg: "bg-blush/20",
                      iconColor: "text-blush-deep",
                      borderColor: "border-blush/30",
                      icon: Heart
                    };
                  case "grand-anniversary":
                    return {
                      iconBg: "bg-gold/20",
                      iconColor: "text-gold",
                      borderColor: "border-gold/30",
                      icon: Sparkles
                    };
                  case "birthday-celebration":
                    return {
                      iconBg: "bg-accent/20",
                      iconColor: "text-accent",
                      borderColor: "border-accent/30",
                      icon: Gift
                    };
                  default:
                    return {
                      iconBg: "bg-secondary/20",
                      iconColor: "text-foreground",
                      borderColor: "border-border",
                      icon: Gift
                    };
                }
              };

              const theme = getTemplateTheme(g.templateId);
              const TemplateIcon = theme.icon;

              return (
                <motion.div
                  key={g._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`group relative overflow-hidden rounded-2xl border ${theme.borderColor} bg-card shadow-soft hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
                >
                  <div className="relative p-6">
                    {/* Header with icon */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-xl ${theme.iconBg} flex items-center justify-center flex-shrink-0`}>
                        <TemplateIcon className={`w-6 h-6 ${theme.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display text-lg font-bold text-foreground mb-1">
                          {templateLabel(g.templateId)}
                        </h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {new Date(g.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 mb-5">
                      {g.memory && (
                        <div className="flex items-center gap-2 text-sm">
                          <Sparkles className="w-4 h-4 text-gold" />
                          <span className="text-muted-foreground">
                            <span className="font-medium text-foreground">Occasion:</span> {formatOccasion(g.memory)}
                          </span>
                        </div>
                      )}
                      {g.plan && (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-4 h-4 rounded-full bg-gold/20 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-gold" />
                          </div>
                          <span className="text-muted-foreground">
                            <span className="font-medium text-foreground">Plan:</span> {g.plan}
                          </span>
                        </div>
                      )}
                      {timeLeft && (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-4 h-4 rounded-full bg-blush/20 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-blush-deep animate-pulse" />
                          </div>
                          <span className="text-muted-foreground">
                            <span className="font-medium text-foreground">Expires:</span> {timeLeft}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <Button
                      variant={canOpen ? "hero" : "outline"}
                      disabled={!canOpen}
                      onClick={() => navigate(`/gifts/${g._id}`)}
                      className="w-full group/btn"
                    >
                      <span>{canOpen ? "Open Gift" : "Unavailable"}</span>
                      {canOpen && (
                        <Heart className="w-4 h-4 ml-2 group-hover/btn:scale-110 transition-transform" />
                      )}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};

export default Gifts;
