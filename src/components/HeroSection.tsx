import { motion } from "framer-motion";
import { Play, Sparkles, Heart, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export const HeroSection = () => {
  const [userCountDisplay, setUserCountDisplay] = useState<string>("—");
  useEffect(() => {
    const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:5000";
    const fetchCount = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/user-count`);
        const data = await res.json();
        const count = Number(data?.count || 0);
        const display = count > 100 ? `${Math.floor(count / 100) * 100}+` : String(count);
        setUserCountDisplay(display);
      } catch {
        setUserCountDisplay("100+");
      }
    };
    fetchCount();
  }, []);
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating hearts */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-[10%] text-blush-deep/30"
        >
          <Heart className="w-12 h-12 fill-current" />
        </motion.div>
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute top-1/3 right-[15%] text-gold/30"
        >
          <Music2 className="w-10 h-10" />
        </motion.div>
        <motion.div
          animate={{ y: [0, -25, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/3 left-[20%] text-blush/50"
        >
          <Sparkles className="w-8 h-8" />
        </motion.div>

        {/* Gradient orbs */}
        <div className="absolute top-20 right-[20%] w-72 h-72 bg-blush/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-[10%] w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/30 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-secondary/80 backdrop-blur-sm rounded-full px-4 py-2 mb-8"
          >
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="text-sm text-muted-foreground font-medium">
              Custom Songs & Web Pages for Every Occasion
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6"
          >
            Amplify Your{" "}
            <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blush-deep via-accent to-gold">
                Special Moments
              </span>
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, delay: 0.8 }}
                className="absolute bottom-2 left-0 h-1 bg-gradient-to-r from-blush-deep/50 to-gold/50 rounded-full"
              />
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-balance"
          >
            The ultimate personalized gift: a beautiful custom webpage and an original
            song written just for them. Perfect for birthdays, anniversaries, and
            Valentine's Day.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              variant="hero"
              size="xl"
              onClick={() => scrollToSection("#pricing")}
              className="group"
            >
              Create Their Story
              <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="xl"
              onClick={() => scrollToSection("#how-it-works")}
              className="group"
            >
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              See How It Works
            </Button>
          </motion.div>

          {/* Trust Badge: dynamic customers count centered */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 flex items-center justify-center gap-3 text-muted-foreground"
          >
            <div className="flex -space-x-2">
              {['S', 'M', 'A', 'J'].map((letter, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-blush-deep to-gold border-2 border-background shadow-sm flex items-center justify-center"
                >
                  <span className="text-xs font-bold text-white uppercase">{letter}</span>
                </div>
              ))}
            </div>
            <span className="text-sm">{userCountDisplay} customers</span>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1.5"
        >
          <div className="w-1.5 h-2.5 rounded-full bg-muted-foreground/50" />
        </motion.div>
      </motion.div>
    </section>
  );
};
